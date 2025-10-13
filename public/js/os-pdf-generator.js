// Arquivo: public/js/pdf-generator.js

/**
 * Módulo responsável pela geração de PDFs para Ordens de Produção.
 * Atribui o resultado da IIFE diretamente ao objeto window para torná-lo globalmente acessível.
 */
window.pdfGenerator = (function() {

    /**
     * Função auxiliar privada para adicionar rodapé com data e número de página em cada página do PDF.
     */
    function addFooter(data, doc, force = false) {
        const pageCount = doc.internal.getNumberOfPages();
        // Evita adicionar o rodapé duas vezes na mesma página
        if (doc.lastAddedPage === data.pageNumber && !force) {
            return;
        }
        doc.lastAddedPage = data.pageNumber;

        doc.setFontSize(8);
        doc.setTextColor(150);
        const dataGeracao = new Date().toLocaleString('pt-BR');
        const textoPagina = `Página ${data.pageNumber} de ${pageCount}`;
        doc.text(`Gerado em: ${dataGeracao}`, data.settings.margin.left, doc.internal.pageSize.getHeight() - 7);
        doc.text(textoPagina, doc.internal.pageSize.getWidth() - data.settings.margin.right, doc.internal.pageSize.getHeight() - 7, { align: 'right' });
    }

    /**
     * Gera um relatório completo e profissional da Ordem de Produção em formato PDF (A4).
     * @param {object} ordemProducao - O objeto completo da ordem de produção.
     * @param {object} utils - Um objeto contendo funções utilitárias de formatação.
     */
    async function gerarRelatorioOPCompletoPDF(ordemProducao, utils) {

        if (!ordemProducao) {
            return Swal.fire('Erro', 'Dados da Ordem de Produção não carregados.', 'error');
        }

        Swal.fire({
            title: 'Gerando Relatório PDF...',
            text: 'Por favor, aguarde.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            const text = 'Relatório de Ordem de Produção';
            let finalY = 0;

            // --- GERAÇÃO DO QR CODE ---
            const tempContainer = document.createElement('div');
            new QRCode(tempContainer, { text: window.location.href, width: 128, height: 128 });
            const qrCodeCanvas = tempContainer.querySelector('canvas');
            const qrCodeImage = qrCodeCanvas.toDataURL('image/png');

            // --- CABEÇALHO ---
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(text, margin, 20);
            doc.addImage(qrCodeImage, 'PNG', pageWidth - margin - 30, 15, 30, 30);

            doc.setLineWidth(0.5);
            doc.line(margin, 25, pageWidth - (margin+text.length * 2), 25);

            // --- DETALHES DA OP ---
            finalY = 45;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');

            const opIdCurto = ordemProducao._id.slice(-6).toUpperCase();
            const detalhes = [
                { label: 'OP nº:', value: `#${opIdCurto}` },
                { label: 'Produto:', value: ordemProducao.produto?.nome || 'Não informado' },
                { label: 'Quantidade a Produzir:', value: String(ordemProducao.quantidade || 0) },
                { label: 'Status Atual:', value: ordemProducao.status || 'Não informado' },
                { label: 'Data de Entrega:', value: utils.formatarData(ordemProducao.dataEntrega) || 'Não informada' },
                { label: 'Criado por:', value: ordemProducao.criadoPor?.nome || 'Não informado' },
            ];

            detalhes.forEach(detalhe => {
                doc.setFont('helvetica', 'bold');
                doc.text(detalhe.label, margin, finalY);
                doc.setFont('helvetica', 'normal');
                doc.text(detalhe.value, margin + 45, finalY);
                finalY += 7;
            });

            // --- TABELA DE COMPONENTES ---
            if (ordemProducao.produto.componentesNecessarios?.length > 0) {
                doc.autoTable({
                    head: [['Componente', 'Código', 'Qtde. Necessária']],
                    body: ordemProducao.produto.componentesNecessarios.map(c => [c.componente.nome, c.componente.codigo, c.quantidade]),
                    startY: finalY + 5,
                    theme: 'striped',
                    headStyles: { fillColor: [41, 128, 186] },
                    didDrawPage: (data) => addFooter(data, doc)
                });
                finalY = doc.autoTable.previous.finalY;
            }

            // --- TABELA DE REFUGO ---
            if (ordemProducao.historico_refugo?.length > 0) {
                doc.autoTable({
                    head: [['Quantidade', 'Motivo', 'Lançado por', 'Data']],
                    body: ordemProducao.historico_refugo.map(r => [r.quantidade, r.motivo?.descricao || 'N/A', r.funcionario?.nome || 'N/A', utils.formatarDataHora(r.data)]),
                    startY: finalY + 10,
                    theme: 'striped',
                    headStyles: { fillColor: [41, 128, 186] },
                    didDrawPage: (data) => addFooter(data, doc)
                });
                finalY = doc.autoTable.previous.finalY;
            }

            // --- TABELA DE PAUSAS ---
            if (ordemProducao.pausas?.length > 0) {
                doc.autoTable({
                    head: [['Motivo', 'Tipo', 'Início', 'Duração']],
                    body: ordemProducao.pausas.map(p => [p.motivo, p.tipo === 'NaoPlanejada' ? 'Não Planejada' : p.tipo, utils.formatarDataHora(p.inicio), utils.calcularDuracao(p.inicio, p.fim)]),
                    startY: finalY + 10,
                    theme: 'striped',
                    headStyles: { fillColor: [41, 128, 186] },
                    didDrawPage: (data) => addFooter(data, doc)
                });
            }

            window.open(doc.output('bloburl'), '_blank');
            Swal.close();
        } catch (error) {
            console.error('Erro ao gerar relatório PDF:', error);
            Swal.fire('Erro!', `Não foi possível gerar o relatório. Detalhes: ${error.message}`, 'error');
        }
    }

    /**
     * Gera um PDF simples de uma etiqueta a partir de um elemento HTML.
     * @param {string} modo - O modo de impressão ('etiqueta' ou 'qrcode').
     */
    async function gerarPdfParaImpressao(modo) {
        const { jsPDF } = window.jspdf;
        const elementoOriginal = document.getElementById('printable-label');
        if (!elementoOriginal) {
            return Swal.fire('Erro!', 'Não foi possível encontrar o conteúdo para gerar o PDF.', 'error');
        }

        Swal.fire({ title: 'Gerando PDF...', text: 'Por favor, aguarde.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

        try {
            const canvas = await html2canvas(elementoOriginal, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'l', unit: 'mm', format: [80, 50] }); // Formato de etiqueta padrão
            pdf.addImage(imgData, 'PNG', 0, 0, 80, 50);
            pdf.autoPrint();
            window.open(pdf.output('bloburl'), '_blank');
            Swal.close();
        } catch (error) {
            console.error('Erro ao gerar PDF da etiqueta:', error);
            Swal.fire('Erro!', `Não foi possível gerar o PDF. Detalhes: ${error.message}`, 'error');
        }
    }

    // Expõe as funções públicas que serão usadas externamente
    return {
        gerarRelatorioOPCompletoPDF,
        gerarPdfParaImpressao
    };

})();

