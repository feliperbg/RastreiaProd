const OrdemProducao = require('../model/OrdemProducaoTabela');

module.exports = class PainelControl {
    /**
     * Retorna dados para o Kanban
     */
    async getKanban(req, res, next) {
        try {
            const ordens = await OrdemProducao.find({}, '_id numero produto statusGeral etapas').lean();

            const boards = {
                _todo: { id: '_todo', title: 'A Fazer', item: [] },
                _doing: { id: '_doing', title: 'Em Produção', item: [] },
                _review: { id: '_review', title: 'Inspeção', item: [] },
                _done: { id: '_done', title: 'Finalizado', item: [] }
            };

            ordens.forEach(o => {
                let boardKey = '_todo'; // Padrão
                if (o.statusGeral === 'concluida') {
                    boardKey = '_done';
                } else if (o.statusGeral === 'em_producao') {
                    if ((o.etapas || []).some(e => e.status === 'inspecao')) {
                        boardKey = '_review';
                    } else {
                        boardKey = '_doing';
                    }
                }
                boards[boardKey].item.push({ 
                    id: o._id.toString(), // Adiciona o ID para futuras interações
                    title: `${o.numero} - ${o.produto}` 
                });
            });

            return res.status(200).send({
                status: true,
                boards: Object.values(boards)
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Retorna total de etapas finalizadas por dia
     */
    async getEtapasFinalizadas(req, res, next) {
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
            next(error);
        }
    }

    /**
     * Retorna tempo médio por etapa
     */
    async getTempoEtapas(req, res, next) {
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
            next(error);
        }
    }

    /**
     * Retorna status das ordens (prazo x atrasadas)
     */
    async getStatusOrdens(req, res, next) {
        try {
            const hoje = new Date();
            const total = await OrdemProducao.countDocuments({ statusGeral: { $ne: 'concluida' } });
            const atrasadas = await OrdemProducao.countDocuments({
                dataPrazo: { $exists: true, $lt: hoje },
                statusGeral: { $ne: 'concluida' }
            });
            const noPrazo = total - atrasadas;

            return res.status(200).send({
                status: true,
                statusOrdens: {
                    noPrazo,
                    atrasadas
                }
            });
        } catch (error) {
            next(error);
        }
    }
};
