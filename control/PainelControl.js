// Arquivo: control/PainelControl.js

// Importando os models já refatorados
const OrdemProducao = require('../model/OrdemProducao');
const Etapa = require('../model/Etapa');
const Produto = require('../model/Produto');
const Componente = require('../model/Componente');

module.exports = class PainelController {

    /**
     * Retorna os totais de cada entidade para os cards do dashboard.
     */
    static async getDashboardCards(req, res) {
        try {
            // Promise.all executa todas as contagens em paralelo, mais eficiente
            const [
                produtosCount,
                componentesCount,
                ordensPendentesCount,
                ordensEmAndamentoCount
            ] = await Promise.all([
                Produto.countDocuments(),
                Componente.countDocuments(),
                OrdemProducao.countDocuments({ status: 'Pendente' }),
                OrdemProducao.countDocuments({ status: 'Em Andamento' })
            ]);

            return res.status(200).json({
                status: true,
                data: {
                    produtos: produtosCount,
                    componentes: componentesCount,
                    ordensPendentes: ordensPendentesCount,
                    ordensEmAndamento: ordensEmAndamentoCount,
                }
            });

        } catch (error) {
            console.error('Erro ao buscar dados para os cards do painel:', error);
            return res.status(500).json({ status: false, msg: 'Erro interno ao buscar dados do painel.' });
        }
    }

    /**
     * Retorna o status das ordens de produção (concluídas vs. em andamento/pendentes).
     */
    static async getOrdensStatusChart(req, res) {
        try {
            const [concluidas, pendentes, emAndamento] = await Promise.all([
                OrdemProducao.countDocuments({ status: 'Concluída' }),
                OrdemProducao.countDocuments({ status: 'Pendente' }),
                OrdemProducao.countDocuments({ status: 'Em Andamento' })
            ]);

            return res.status(200).json({
                status: true,
                data: {
                    labels: ['Concluídas', 'Pendentes', 'Em Andamento'],
                    datasets: [concluidas, pendentes, emAndamento]
                }
            });
        } catch (error) {
            console.error('Erro ao buscar dados para o gráfico de status de ordens:', error);
            return res.status(500).json({ status: false, msg: 'Erro ao buscar dados do gráfico.' });
        }
    }

    /**
     * Retorna as últimas 5 ordens de produção modificadas.
     */
    static async getRecentOrdens(req, res) {
        try {
            const recentOrdens = await OrdemProducao.find()
                .sort({ updatedAt: -1 }) // Ordena pela data de modificação mais recente
                .limit(5) // Limita a 5 resultados
                .populate('produto', 'nome codigo'); // Popula com nome e código do produto

            return res.status(200).json({
                status: true,
                data: recentOrdens
            });
        } catch (error) {
            console.error('Erro ao buscar ordens recentes:', error);
            return res.status(500).json({ status: false, msg: 'Erro ao buscar ordens recentes.' });
        }
    }
};