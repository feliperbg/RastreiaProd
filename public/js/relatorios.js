document.addEventListener('DOMContentLoaded', function () {
    const loadingOverlay = document.getElementById('loading-overlay');
    const daterangeInput = $('#daterange');
    const btnApplyFilters = document.getElementById('btn-apply-filters');
    const btnGeneratePdf = document.getElementById('btn-generate-pdf');

    let oeeEvolutionChartInstance, paretoChartInstance, productionChartInstance;

    const chartColors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14'];
    const formatarDataParaGrafico = (isoDateString) => {
        if (!isoDateString) return '';
        const date = new Date(isoDateString);
        return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
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
            type: 'line', data: { labels: data.map(item => formatarDataParaGrafico(item._id)), datasets: [{ label: 'OEE (%)', data: data.map(item => item.oee), borderColor: '#17a2b8', backgroundColor: 'rgba(23, 162, 184, 0.2)', fill: true, tension: 0.3 }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
        });
    }

    function updateParetoChart(data) {
        if (paretoChartInstance) paretoChartInstance.destroy();
        paretoChartInstance = new Chart(document.getElementById('paretoChart'), {
            type: 'bar', data: { labels: data.map(p => p._id || 'Não Classificado'), datasets: [{ label: 'Minutos de Parada', data: data.map(p => p.totalDurationMinutos), backgroundColor: '#ffc107' }] },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }

    function updateProductionChart(data) {
        if (productionChartInstance) productionChartInstance.destroy();
        productionChartInstance = new Chart(document.getElementById('productionChart'), {
            type: 'bar', data: { labels: data.map(p => p._id), datasets: [{ label: 'Total Produzido', data: data.map(p => p.totalProduzido), backgroundColor: chartColors }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }

    function generatePdf() {
        Swal.fire({ title: 'Gerando PDF...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const reportContent = document.getElementById('report-content');
        html2canvas(reportContent, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            const dateRange = daterangeInput.data('daterangepicker');
            const filename = `Relatorio_Producao_${dateRange.startDate.format('YYYY-MM-DD')}_a_${dateRange.endDate.format('YYYY-MM-DD')}.pdf`;
            pdf.save(filename);
            Swal.close();
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