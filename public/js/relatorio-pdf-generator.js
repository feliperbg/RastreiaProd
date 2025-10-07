/**
 * Módulo responsável pela geração de relatórios de desempenho da produção em PDF.
 * Inspirado na estrutura do pdf-generator.js para um visual mais profissional.
 */
window.relatorioPdfGenerator = (function() {

    const { jsPDF } = window.jspdf;

    /**
     * Função auxiliar privada para adicionar cabeçalho com título em cada página do PDF.
     */
    function addHeader(doc, pageNumber, title, subtitle) {
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();

        // Adiciona apenas a partir da segunda página para não sobrescrever o título principal
        if (pageNumber > 1) {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin, 20);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(subtitle, margin, 27);
        }
        
        doc.setLineWidth(0.5);
        doc.line(margin, 32, pageWidth - margin, 32);
    }


    /**
     * Função auxiliar privada para adicionar rodapé com data e número de página.
     * Reutilizada do pdf-generator.js.
     */
    function addFooter(data, doc) {
        const pageCount = doc.internal.getNumberOfPages();
        if (doc.lastAddedPage === data.pageNumber) {
            return; // Evita adicionar rodapé duas vezes
        }
        doc.lastAddedPage = data.pageNumber;

        doc.setFontSize(8);
        doc.setTextColor(150);
        const dataGeracao = new Date().toLocaleString('pt-BR');
        const textoPagina = `Página ${data.pageNumber} de ${pageCount}`;
        const margin = data.settings.margin;

        doc.text(`Gerado em: ${dataGeracao}`, margin.left, doc.internal.pageSize.getHeight() - 7);
        doc.text(textoPagina, doc.internal.pageSize.getWidth() - margin.right, doc.internal.pageSize.getHeight() - 7, { align: 'right' });
    }

    /**
     * Gera um relatório de desempenho completo e profissional em formato PDF (A4).
     * @param {object} reportData - Um objeto contendo todos os dados necessários para o relatório.
     */
    async function gerarRelatorioDesempenho(reportData) {
        
        Swal.fire({
            title: 'Gerando Relatório PDF...',
            text: 'Por favor, aguarde.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const margin = 15;
            const pageWidth = doc.internal.pageSize.getWidth();
            let finalY = 0;

            const mainTitle = 'Relatório de Desempenho da Produção';
            const subtitle = `Período de Análise: ${reportData.periodo}`;

            // --- CABEÇALHO DA PRIMEIRA PÁGINA ---
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(mainTitle, pageWidth / 2, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(subtitle, pageWidth / 2, 28, { align: 'center' });
            finalY = 35;


            // --- SEÇÃO DE KPIs ---
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Indicadores Chave de Desempenho (KPIs)', margin, finalY + 10);
            finalY += 18;

            doc.setFontSize(11);
            const kpiY = finalY;
            doc.setFont('helvetica', 'bold');
            doc.text('OEE Geral:', margin, kpiY);
            doc.text('Disponibilidade:', margin, kpiY + 7);
            
            doc.text('Qualidade:', pageWidth / 2, kpiY);
            doc.text('Performance:', pageWidth / 2, kpiY + 7);

            doc.setFont('helvetica', 'normal');
            doc.text(reportData.kpis.oee, margin + 40, kpiY);
            doc.text(reportData.kpis.disponibilidade, margin + 40, kpiY + 7);

            doc.text(reportData.kpis.qualidade, (pageWidth / 2) + 40, kpiY);
            doc.text(reportData.kpis.performance, (pageWidth / 2) + 40, kpiY + 7);
            finalY += 20;

            
            // --- SEÇÃO DE GRÁFICOS ---
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Análise Gráfica', margin, finalY);
            finalY += 8;

            const addChartToPdf = (title, chartImgData) => {
                if (finalY > 180) { // Verifica se há espaço para o gráfico
                    doc.addPage();
                    finalY = 20;
                    addHeader(doc, doc.internal.getNumberOfPages(), mainTitle, subtitle);
                }
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(title, margin, finalY);
                finalY += 5;

                const chartWidth = pageWidth - (margin * 2);
                const chartHeight = 75; 
                doc.addImage(chartImgData, 'PNG', margin, finalY, chartWidth, chartHeight);
                finalY += chartHeight + 10;
            };

            addChartToPdf('Evolução do OEE', reportData.charts.oeeEvolution);
            addChartToPdf('Principais Causas de Parada (Pareto)', reportData.charts.pareto);
            addChartToPdf('Produção Total por Produto', reportData.charts.productionByProduct);
            

            // --- SEÇÃO DE TABELA DE DADOS ---
            if (reportData.paretoData.body.length > 0) {
                 if (finalY > 220) {
                    doc.addPage();
                    finalY = 20;
                    addHeader(doc, doc.internal.getNumberOfPages(), mainTitle, subtitle);
                }
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Dados - Principais Causas de Parada', margin, finalY);
                finalY += 8;

                doc.autoTable({
                    head: [reportData.paretoData.head],
                    body: reportData.paretoData.body,
                    startY: finalY,
                    theme: 'striped',
                    headStyles: { fillColor: [41, 128, 186] },
                    didDrawPage: (data) => {
                        // Adiciona cabeçalho e rodapé em novas páginas criadas pela tabela
                        addHeader(doc, data.pageNumber, mainTitle, subtitle);
                        addFooter(data, doc);
                    }
                });
                finalY = doc.autoTable.previous.finalY;
            }

            // Adiciona o rodapé em todas as páginas existentes
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                // Evita redesenhar o rodapé se a autotable já o fez
                if (!doc.lastAddedPage || doc.lastAddedPage < i) {
                     addFooter({ 
                        pageNumber: i, 
                        settings: { margin: { left: margin, right: margin } }
                    }, doc);
                }
            }

            window.open(doc.output('bloburl'), '_blank');
            Swal.close();

        } catch (error) {
            console.error('Erro ao gerar relatório PDF:', error);
            Swal.fire('Erro!', `Não foi possível gerar o relatório. Detalhes: ${error.message}`, 'error');
        }
    }

    // Expõe a função pública
    return {
        gerarRelatorioDesempenho
    };

})();