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
    async function generatePdf() {
        // 1. Coletar todos os dados necessários da página
        const daterange = $('#daterange').data('daterangepicker');
        
        const reportData = {
            periodo: `${daterange.startDate.format('DD/MM/YYYY')} a ${daterange.endDate.format('DD/MM/YYYY')}`,
            kpis: {
                oee: document.getElementById('kpi-oee').textContent,
                disponibilidade: document.getElementById('kpi-disponibilidade').textContent,
                qualidade: document.getElementById('kpi-qualidade').textContent,
                performance: document.getElementById('kpi-performance').textContent,
            },
            charts: {
                oeeEvolution: document.getElementById('oeeEvolutionChart').toDataURL('image/png', 1.0),
                pareto: document.getElementById('paretoChart').toDataURL('image/png', 1.0),
                productionByProduct: document.getElementById('productionChart').toDataURL('image/png', 1.0),
            },
            paretoData: {
                head: ['Motivo da Parada', 'Duração Total (minutos)'],
                body: []
            }
        };

        // Extrai dados da instância do gráfico de Pareto para a tabela
        if (paretoChartInstance && paretoChartInstance.data.labels.length > 0) {
            reportData.paretoData.body = paretoChartInstance.data.labels.map((label, index) => {
                return [label, paretoChartInstance.data.datasets[0].data[index]];
            });
        }

        // 2. Chamar o novo gerador de PDF
        // Garante que o módulo foi carregado
        if (window.relatorioPdfGenerator) {
            await window.relatorioPdfGenerator.gerarRelatorioDesempenho(reportData);
        } else {
            Swal.fire('Erro!', 'O gerador de PDF de relatórios não foi carregado corretamente.', 'error');
            console.error("Módulo relatorioPdfGenerator não encontrado no objeto window.");
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