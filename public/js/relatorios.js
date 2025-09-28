document.addEventListener('DOMContentLoaded', function () {
    const loadingOverlay = document.getElementById('loading-overlay');
    const daterangeInput = $('#daterange');
    const btnApplyFilters = document.getElementById('btn-apply-filters');
    const btnGeneratePdf = document.getElementById('btn-generate-pdf');
    const kpiModal = document.getElementById('kpiModal');

    let oeeEvolutionChartInstance, paretoChartInstance, productionChartInstance;

    const chartColors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14'];
    const formatarDataParaGrafico = (isoDateString) => {
        if (!isoDateString) return '';
        const date = new Date(isoDateString);
        return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
    };

    // Conteúdo para o modal de explicação dos KPIs
    const kpiExplanations = {
        oee: {
            title: 'OEE (Eficiência Global do Equipamento)',
            description: 'O OEE é o principal indicador de eficiência de uma linha de produção. Ele mede a porcentagem do tempo de fabricação que é verdadeiramente produtiva.',
            formula: 'OEE = Disponibilidade × Performance × Qualidade'
        },
        disponibilidade: {
            title: 'Disponibilidade',
            description: 'Mede a porcentagem do tempo planejado em que a operação esteve realmente produzindo. Paradas não planejadas (como quebras) reduzem a disponibilidade.',
            formula: 'Disponibilidade = (Tempo Efetivo de Produção / Tempo Planejado de Produção) × 100'
        },
        performance: {
            title: 'Performance',
            description: 'Mede a velocidade da produção em comparação com a velocidade ideal. Uma performance abaixo de 100% indica que a produção está mais lenta que o esperado.',
            formula: 'Performance = (Tempo Ideal Total / Tempo Efetivo de Produção) × 100'
        },
        qualidade: {
            title: 'Qualidade',
            description: 'Mede a porcentagem de peças boas produzidas em relação ao total. Peças com refugo impactam diretamente este indicador.',
            formula: 'Qualidade = (Peças Boas / Total de Peças Produzidas) × 100'
        }
    };

    async function updateDashboard() {
        loadingOverlay.classList.remove('d-none');
        const dateRange = daterangeInput.data('daterangepicker');
        const params = new URLSearchParams({
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString(),
            produto: document.getElementById('filter-produto').value,
        });

        try {
            const response = await fetch(`/relatorios/data?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Falha na API');
            const data = await response.json();
            updateKPIs(data.kpis);
            updateOeeEvolutionChart(data.charts.oeeEvolution);
            updateParetoChart(data.charts.pareto);
            updateProductionChart(data.charts.productionByProduct);
        } catch (error) {
            Swal.fire('Erro!', `Não foi possível carregar os dados. Detalhe: ${error.message}`, 'error');
        } finally {
            loadingOverlay.classList.add('d-none');
        }
    }

    function updateKPIs(kpis) {
        document.getElementById('kpi-oee').textContent = `${(kpis.oee || 0).toFixed(2)}%`;
        document.getElementById('kpi-disponibilidade').textContent = `${(kpis.disponibilidade || 0).toFixed(2)}%`;
        document.getElementById('kpi-performance').textContent = `${(kpis.performance || 0).toFixed(2)}%`;
        document.getElementById('kpi-qualidade').textContent = `${(kpis.qualidade || 0).toFixed(2)}%`;
    }

    function updateOeeEvolutionChart(data) {
        if (oeeEvolutionChartInstance) oeeEvolutionChartInstance.destroy();
        oeeEvolutionChartInstance = new Chart(document.getElementById('oeeEvolutionChart'), {
            type: 'line', 
            data: { 
                labels: data.map(item => formatarDataParaGrafico(item._id)), 
                datasets: [{ 
                    label: 'OEE (%)', 
                    data: data.map(item => item.oee), 
                    borderColor: '#17a2b8', 
                    backgroundColor: 'rgba(23, 162, 184, 0.2)', 
                    fill: true, 
                    tension: 0.3 
                }] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        max: 100,
                        ticks: { font: { size: 14 } } // Aumenta a fonte do eixo Y
                    },
                    x: {
                        ticks: { font: { size: 14 } } // Aumenta a fonte do eixo X
                    }
                } 
            }
        });
    }

    function updateParetoChart(data) {
        if (paretoChartInstance) paretoChartInstance.destroy();
        paretoChartInstance = new Chart(document.getElementById('paretoChart'), {
            type: 'bar', 
            data: { 
                labels: data.map(p => p._id || 'Não Classificado'), 
                datasets: [{ 
                    label: 'Minutos de Parada', 
                    data: data.map(p => p.totalDurationMinutos), 
                    backgroundColor: '#ffc107' 
                }] 
            },
            options: { 
                indexAxis: 'y', 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { // Adicionado para aumentar a fonte
                    y: {
                        ticks: { font: { size: 14 } } // Aumenta a fonte do eixo Y (motivos)
                    },
                    x: {
                        ticks: { font: { size: 14 } } // Aumenta a fonte do eixo X (minutos)
                    }
                }
            }
        });
    }

    function updateProductionChart(data) {
        if (productionChartInstance) productionChartInstance.destroy();
        productionChartInstance = new Chart(document.getElementById('productionChart'), {
            type: 'bar', 
            data: { 
                labels: data.map(p => p._id), 
                datasets: [{ 
                    label: 'Total Produzido', 
                    data: data.map(p => p.totalProduzido), 
                    backgroundColor: chartColors 
                }] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { // Adicionado para aumentar a fonte
                    y: {
                        ticks: { font: { size: 14 } } // Aumenta a fonte do eixo Y
                    },
                    x: {
                        ticks: { font: { size: 14 } } // Aumenta a fonte do eixo X
                    }
                }
            }
        });
    }

    // Substitua a sua função generatePdf antiga por esta versão ajustada
    function generatePdf() {
        Swal.fire({ title: 'Gerando Relatório PDF...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            let finalY = 20;

            // === TÍTULO E CABEÇALHO ===
            doc.setFontSize(18);
            doc.text('Relatório de Desempenho da Produção', 105, finalY, { align: 'center' });
            finalY += 10;

            const dateRange = $('#daterange').data('daterangepicker');
            const periodoStr = `Período de Análise: ${dateRange.startDate.format('DD/MM/YYYY')} a ${dateRange.endDate.format('DD/MM/YYYY')}`;
            doc.setFontSize(12);
            doc.text(periodoStr, 105, finalY, { align: 'center' });
            finalY += 15;

            // === INDICADORES (KPIs) ===
            doc.setFontSize(14);
            doc.text('Indicadores Chave de Desempenho (KPIs)', 14, finalY);
            finalY += 8;

            doc.setFontSize(11);
            const oee = document.getElementById('kpi-oee').textContent;
            const disponibilidade = document.getElementById('kpi-disponibilidade').textContent;
            const qualidade = document.getElementById('kpi-qualidade').textContent;
            const performance = document.getElementById('kpi-performance').textContent;

            doc.text(`- OEE Geral: ${oee}`, 16, finalY);
            doc.text(`- Qualidade: ${qualidade}`, 110, finalY);
            finalY += 7;
            doc.text(`- Disponibilidade: ${disponibilidade}`, 16, finalY);
            doc.text(`- Performance: ${performance}`, 110, finalY);
            finalY += 15;

            // === GRÁFICOS ===
            doc.setFontSize(14);
            doc.text('Gráficos de Análise', 14, finalY);
            finalY += 8;

            // Gráfico de Evolução do OEE
            const oeeChartCanvas = document.getElementById('oeeEvolutionChart');
            const oeeChartImg = oeeChartCanvas.toDataURL('image/png', 1.0);
            doc.addImage(oeeChartImg, 'PNG', 14, finalY, 160, 70);
            finalY += 80;

            // Gráfico de Pareto (Causas de Parada)
            const paretoChartCanvas = document.getElementById('paretoChart');
            const paretoChartImg = paretoChartCanvas.toDataURL('image/png', 1.0);
            doc.addImage(paretoChartImg, 'PNG', 14, finalY, 160, 70);
            finalY += 80;

            if (finalY > 220) {
                doc.addPage();
                finalY = 20;
            }

            // --- AJUSTE NO GRÁFICO DE PRODUÇÃO POR PRODUTO ---
            const productionChartCanvas = document.getElementById('productionChart');
            const productionChartImg = productionChartCanvas.toDataURL('image/png', 1.0);

            // Lógica para manter a proporção e evitar distorção
            const chartWidth = 180; // Aumenta a largura para melhor legibilidade
            const chartHeight = chartWidth * (productionChartCanvas.height / productionChartCanvas.width); // Calcula a altura proporcionalmente

            doc.addImage(productionChartImg, 'PNG', 14, finalY, chartWidth, chartHeight);
            finalY += chartHeight + 10; // Adiciona a altura do gráfico + 10mm de margem

            if (finalY > 220) {
                doc.addPage();
                finalY = 20;
            }

            // === TABELA DE DADOS (USANDO AUTOTABLE) ===
            if (paretoChartInstance && paretoChartInstance.data.labels.length > 0) {
                doc.setFontSize(14);
                doc.text('Dados - Principais Causas de Parada', 14, finalY);
                finalY += 8;

                const tableHead = [['Motivo da Parada', 'Duração Total (minutos)']];
                const tableBody = paretoChartInstance.data.labels.map((label, index) => {
                    return [label, paretoChartInstance.data.datasets[0].data[index]];
                });

                doc.autoTable({
                    head: tableHead,
                    body: tableBody,
                    startY: finalY,
                    theme: 'striped',
                    headStyles: { fillColor: [41, 128, 186] }
                });
            }

            // === ABRIR O PDF EM NOVA ABA ===
            window.open(doc.output('bloburl'), '_blank');

            Swal.close();

        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            Swal.fire('Erro!', `Não foi possível gerar o relatório. Detalhe: ${error.message}`, 'error');
        }
    }

    // Adiciona o listener para o modal de KPI
    if (kpiModal) {
        kpiModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const kpiKey = button.getAttribute('data-kpi');
            const explanation = kpiExplanations[kpiKey];

            const modalTitle = kpiModal.querySelector('.modal-title');
            const modalBody = kpiModal.querySelector('.modal-body');

            modalTitle.textContent = explanation.title;
            modalBody.innerHTML = `<p>${explanation.description}</p><hr><p class="mb-0"><strong>Fórmula:</strong></p><code class="d-block bg-light p-2 rounded">${explanation.formula}</code>`;
        });
    }

    daterangeInput.daterangepicker({
        startDate: moment().startOf('month'), endDate: moment().endOf('month'),
        locale: { format: "DD/MM/YYYY", applyLabel: "Aplicar", cancelLabel: "Cancelar", daysOfWeek: ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"], monthNames: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"] },
        ranges: { 'Hoje': [moment(), moment()], 'Ontem': [moment().subtract(1, 'days'), moment().subtract(1, 'days')], 'Últimos 7 Dias': [moment().subtract(6, 'days'), moment()], 'Este Mês': [moment().startOf('month'), moment().endOf('month')], 'Mês Passado': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')] }
    });

    btnApplyFilters.addEventListener('click', updateDashboard);
    btnGeneratePdf.addEventListener('click', generatePdf);
    updateDashboard();
});