// Arquivo: control/PainelControl.js

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
            const [
                produtos,
                componentes,
                ordensPendentes,
                ordensEmAndamento
            ] = await Promise.all([
                Produto.countDocuments(),
                Componente.countDocuments(),
                OrdemProducao.countDocuments({ status: 'Pendente' }),
                OrdemProducao.countDocuments({ status: 'Em Andamento' })
            ]);

            return res.status(200).json({
                status: true,
                data: {
                    produtos,
                    componentes,
                    ordensPendentes,
                    ordensEmAndamento,
                }
            });

        } catch (error) {
            console.error('Erro ao buscar dados para os cards do painel:', error);
            return res.status(500).json({ status: false, msg: 'Erro interno ao buscar dados do painel.' });
        }
    }

    /**
     * Retorna o status das ordens de produção para o gráfico.
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
     * Calcula e retorna o número de ordens concluídas nos últimos 7 dias.
     */
    static async getEtapasFinalizadasChart(req, res) {
        try {
            const labels = [];
            const data = [];
            const today = new Date();
            today.setHours(23, 59, 59, 999);

            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);

                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);

                const count = await OrdemProducao.countDocuments({
                    status: 'Concluída',
                    'timestampProducao.fim': {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                });
                
                labels.push(`${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`);
                data.push(count);
            }

            return res.status(200).json({
                status: true,
                data: {
                    labels: labels,
                    datasets: data
                }
            });

        } catch (error) {
            console.error('Erro ao calcular etapas finalizadas:', error);
            return res.status(500).json({ status: false, msg: 'Erro ao processar dados de etapas.' });
        }
    }

    /**
     * **[FUNÇÃO ADICIONADA]**
     * Calcula o tempo médio (em minutos) gasto em cada etapa usando agregação.
     */
    static async getTempoMedioEtapasChart(req, res) {
        try {
            const aggregationResult = await OrdemProducao.aggregate([
                // Estágio 1: Desconstrói o array 'etapaAtual' para ter um documento por etapa
                { $unwind: '$etapaAtual' },
                
                // Estágio 2: Filtra apenas as etapas que foram concluídas (têm data de início e fim)
                { $match: { 
                    'etapaAtual.dataInicio': { $exists: true, $ne: null },
                    'etapaAtual.dataFim': { $exists: true, $ne: null }
                }},
                
                // Estágio 3: Adiciona um novo campo 'duracaoMs' com a diferença entre as datas
                { $addFields: {
                    "etapaAtual.duracaoMs": { $subtract: ['$etapaAtual.dataFim', '$etapaAtual.dataInicio'] }
                }},
                
                // Estágio 4: Agrupa os documentos pelo ID da etapa e calcula a média das durações
                { $group: {
                    _id: '$etapaAtual.etapa',
                    tempoMedioMs: { $avg: '$etapaAtual.duracaoMs' }
                }},
                
                // Estágio 5: Faz um "join" com a coleção 'etapas' para buscar o nome de cada etapa
                { $lookup: {
                    from: 'etapas', // Nome da coleção de etapas no MongoDB (geralmente plural)
                    localField: '_id',
                    foreignField: '_id',
                    as: 'etapaInfo'
                }},

                // Estágio 6: Formata o resultado final para o frontend
                { $project: {
                    _id: 0,
                    nomeEtapa: { $arrayElemAt: ['$etapaInfo.nome', 0] },
                    // Converte o tempo médio de milissegundos para minutos e arredonda
                    tempoMedioMinutos: { $round: [{ $divide: ['$tempoMedioMs', 60000] }, 2] }
                }}
            ]);

            // Separa os resultados em labels e dados para o gráfico
            const labels = aggregationResult.map(item => item.nomeEtapa);
            const datasets = aggregationResult.map(item => item.tempoMedioMinutos);

            return res.status(200).json({
                status: true,
                data: { labels, datasets }
            });

        } catch (error) {
            console.error('Erro ao calcular tempo médio das etapas:', error);
            return res.status(500).json({ status: false, msg: 'Erro ao processar tempo médio.' });
        }
    }

    /**
     * Retorna as últimas 5 ordens de produção modificadas.
     */
    static async getRecentOrdens(req, res) {
        try {
            const recentOrdens = await OrdemProducao.find()
                .sort({ updatedAt: -1 })
                .limit(5)
                .populate('produto', 'nome codigo');

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