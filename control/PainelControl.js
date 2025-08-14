// controllers/PainelControl.js
const OrdemProducao = require('../model/OrdemProducaoTabela.js');

module.exports = class PainelControl {
    /**
     * Retorna dados para o Kanban
     */
    async getKanban(req, res) {
        try {
            const ordens = await OrdemProducao.find({}, 'numero produto statusGeral etapas').lean();
            console.log('Ordens encontradas:', ordens.length);
            const boards = {
                _todo: { id: '_todo', title: 'A Fazer', item: [] },
                _doing: { id: '_doing', title: 'Em Produção', item: [] },
                _review: { id: '_review', title: 'Inspeção', item: [] },
                _done: { id: '_done', title: 'Finalizado', item: [] }
            };

            ordens.forEach(o => {
                let boardKey = '_todo';
                if (o.statusGeral === 'concluida') {
                    boardKey = '_done';
                } else {
                    const etapaEmProducao = (o.etapas || []).find(e => e.status === 'em_producao');
                    if (etapaEmProducao) {
                        boardKey = '_doing';
                    } else if ((o.etapas || []).some(e => e.status === 'inspecao')) {
                        boardKey = '_review';
                    }
                }
                boards[boardKey].item.push({ title: `${o.numero} - ${o.produto}` });
            });

            return res.status(200).send({
                status: true,
                boards: Object.values(boards)
            });
        } catch (error) {
            console.error('Erro ao buscar dados do kanban:', error);
            return res.status(500).send({
                status: false,
                msg: 'Erro ao buscar dados do kanban'
            });
        }
    }

    /**
     * Retorna total de etapas finalizadas por dia
     */
    async getEtapasFinalizadas(req, res) {
        try {
            const dias = parseInt(req.query.dias || '7', 10);

            const pipeline = [
                { $unwind: '$etapas' },
                { $match: { 'etapas.fim': { $exists: true, $ne: null } } },
                {
                    $project: {
                        fim: '$etapas.fim',
                        dia: { $dateToString: { format: '%Y-%m-%d', date: '$etapas.fim' } }
                    }
                },
                { $group: { _id: '$dia', total: { $sum: 1 } } },
                { $sort: { _id: -1 } },
                { $limit: dias },
                { $sort: { _id: 1 } }
            ];

            const result = await OrdemProducao.aggregate(pipeline);
            const dados = result.map(r => ({ dia: r._id, total: r.total }));

            return res.status(200).send({
                status: true,
                etapasFinalizadas: dados
            });
        } catch (error) {
            console.error('Erro ao calcular etapas finalizadas:', error);
            return res.status(500).send({
                status: false,
                msg: 'Erro ao calcular etapas finalizadas'
            });
        }
    }

    /**
     * Retorna tempo médio por etapa
     */
    async getTempoEtapas(req, res) {
        try {
            const pipeline = [
                { $unwind: '$etapas' },
                { $match: { 'etapas.inicio': { $exists: true }, 'etapas.fim': { $exists: true } } },
                {
                    $project: {
                        nome: '$etapas.nome',
                        duracaoMin: {
                            $divide: [
                                { $subtract: ['$etapas.fim', '$etapas.inicio'] },
                                1000 * 60
                            ]
                        }
                    }
                },
                { $group: { _id: '$nome', tempoMedio: { $avg: '$duracaoMin' }, count: { $sum: 1 } } },
                { $project: { etapa: '$_id', tempoMedio: { $round: ['$tempoMedio', 2] }, count: 1, _id: 0 } },
                { $sort: { tempoMedio: -1 } }
            ];

            const result = await OrdemProducao.aggregate(pipeline);

            return res.status(200).send({
                status: true,
                tempoEtapas: result
            });
        } catch (error) {
            console.error('Erro ao calcular tempo médio por etapa:', error);
            return res.status(500).send({
                status: false,
                msg: 'Erro ao calcular tempo médio por etapa'
            });
        }
    }

    /**
     * Retorna status das ordens (prazo x atrasadas)
     */
    async getStatusOrdens(req, res) {
        try {
            const hoje = new Date();
            const total = await OrdemProducao.countDocuments();
            const atrasadas = await OrdemProducao.countDocuments({
                dataPrazo: { $exists: true, $lt: hoje },
                statusGeral: { $ne: 'concluida' }
            });

            const noPrazoCount = total - atrasadas;
            const noPrazoPct = total === 0 ? 0 : Math.round((noPrazoCount / total) * 100);
            const atrasadasPct = total === 0 ? 0 : Math.round((atrasadas / total) * 100);

            return res.status(200).send({
                status: true,
                noPrazo: noPrazoPct,
                atrasadas: atrasadasPct,
                total,
                atrasadasCount: atrasadas
            });
        } catch (error) {
            console.error('Erro ao calcular status das ordens:', error);
            return res.status(500).send({
                status: false,
                msg: 'Erro ao calcular status das ordens'
            });
        }
    }
};
