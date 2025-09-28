const mongoose = require('mongoose');
const OrdemProducao = require('../model/OrdemProducao');
const Produto = require('../model/Produto');
const Departamento = require('../model/Departamento');

class ReportControl {
    static async renderPage(req, res) {
        try {
            const [produtos, departamentos] = await Promise.all([
                Produto.find().select('nome').sort({ nome: 1 }),
                Departamento.find().select('nome').sort({ nome: 1 }),
            ]);
            res.render('main/relatorios', { produtos, departamentos });
        } catch (error) {
            console.error("Erro ao carregar página de relatórios:", error);
            res.status(500).send("Erro ao carregar a página.");
        }
    }

    static async getDashboardData(req, res) {
        try {
            const { startDate, endDate, produto } = req.query;

            // --- CORREÇÃO APLICADA AQUI ---
            const filter = {
                'timestampProducao.inicio': { $gte: new Date(startDate) },
                'timestampProducao.fim': { $lte: new Date(endDate) },
                status: 'Concluída'
            };
            
            // Se um produto foi selecionado (e não é "todos")
            if (produto && produto !== 'todos') {
                // Converte a string do ID do produto para um ObjectId real do MongoDB
                filter.produto = new mongoose.Types.ObjectId(produto);
            }
            // --- FIM DA CORREÇÃO ---

            const [kpiResult, oeeEvolution, pareto, productionByProduct] = await Promise.all([
                OrdemProducao.aggregate(ReportControl.buildKpiAggregation(filter)),
                OrdemProducao.aggregate(ReportControl.buildOeeEvolutionAggregation(filter)),
                OrdemProducao.aggregate(ReportControl.buildParetoAggregation(filter)),
                OrdemProducao.aggregate(ReportControl.buildProductionByProductAggregation(filter))
            ]);

            const kpis = kpiResult[0] || {};
            res.json({ kpis, charts: { oeeEvolution, pareto, productionByProduct } });

        } catch (error) {
            console.error("Erro ao buscar dados do dashboard:", error);
            res.status(500).json({ error: 'Erro ao processar dados.' });
        }
    }

    // O restante do arquivo (buildKpiAggregation, etc.) continua o mesmo...
    static buildKpiAggregation(filter) {
        return [
            { $match: filter },
            { $lookup: { from: 'produtos', localField: 'produto', foreignField: '_id', as: 'produtoInfo' } },
            { $unwind: '$produtoInfo' },
            {
                $group: {
                    _id: null,
                    totalProduzido: { $sum: '$quantidade' },
                    totalRefugo: { $sum: '$quantidade_refugo' },
                    tempoTotalMs: { $sum: { $subtract: ['$timestampProducao.fim', '$timestampProducao.inicio'] } },
                    tempoPausasPlanejadasMs: { $sum: { $reduce: { input: "$pausas", initialValue: 0, in: { $add: ["$$value", { $cond: [{ $and: [{ $eq: ["$$this.tipo", "Planejada"] }, "$$this.inicio", "$$this.fim"] }, { $subtract: ["$$this.fim", "$$this.inicio"] }, 0] }] } } } },
                    tempoPausasNaoPlanejadasMs: { $sum: { $reduce: { input: "$pausas", initialValue: 0, in: { $add: ["$$value", { $cond: [{ $and: [{ $eq: ["$$this.tipo", "NaoPlanejada"] }, "$$this.inicio", "$$this.fim"] }, { $subtract: ["$$this.fim", "$$this.inicio"] }, 0] }] } } } },
                    tempoIdealTotalMs: { $sum: { $multiply: ['$quantidade', '$produtoInfo.tempo_ciclo_ideal_segundos', 1000] } }
                }
            },
            {
                $project: {
                    _id: 0, totalProduzido: 1, totalRefugo: 1,
                    tempoPlanejadoProducaoMs: { $subtract: ['$tempoTotalMs', '$tempoPausasPlanejadasMs'] },
                    tempoEfetivoProducaoMs: { $subtract: [{ $subtract: ['$tempoTotalMs', '$tempoPausasPlanejadasMs'] }, '$tempoPausasNaoPlanejadasMs'] },
                    tempoIdealTotalMs: 1
                }
            },
            {
                $project: {
                    totalProduzido: 1, totalRefugo: 1,
                    disponibilidade: { $cond: [{ $lte: ['$tempoPlanejadoProducaoMs', 0] }, 100, { $multiply: [{ $divide: ['$tempoEfetivoProducaoMs', '$tempoPlanejadoProducaoMs'] }, 100] }] },
                    performance: { $cond: [{ $lte: ['$tempoEfetivoProducaoMs', 0] }, 100, { $multiply: [{ $divide: ['$tempoIdealTotalMs', '$tempoEfetivoProducaoMs'] }, 100] }] },
                    qualidade: { $cond: [{ $eq: ['$totalProduzido', 0] }, 100, { $multiply: [{ $divide: [{ $subtract: ['$totalProduzido', '$totalRefugo'] }, '$totalProduzido'] }, 100] }] }
                }
            },
            {
                $project: {
                    totalProduzido: 1, totalRefugo: 1,
                    disponibilidade: { $round: ['$disponibilidade', 2] },
                    performance: { $round: ['$performance', 2] },
                    qualidade: { $round: ['$qualidade', 2] },
                    oee: { $round: [{ $multiply: [{ $divide: ['$disponibilidade', 100] }, { $divide: ['$performance', 100] }, { $divide: ['$qualidade', 100] }, 100] }, 2] }
                }
            }
        ];
    }
    
    static buildOeeEvolutionAggregation(filter) {
        return [
            { $match: filter },
            { $lookup: { from: 'produtos', localField: 'produto', foreignField: '_id', as: 'produtoInfo'}},
            { $unwind: '$produtoInfo' },
            { 
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestampProducao.inicio" } },
                    totalProduzido: { $sum: '$quantidade' }, 
                    totalRefugo: { $sum: '$quantidade_refugo' },
                    tempoTotalMs: { $sum: { $subtract: ['$timestampProducao.fim', '$timestampProducao.inicio'] } },
                    tempoPausasPlanejadasMs: { $sum: { $reduce: { input: "$pausas", initialValue: 0, in: { $add: ["$$value", { $cond: [{ $and: [{ $eq: ["$$this.tipo", "Planejada"] }, "$$this.inicio", "$$this.fim"] }, { $subtract: ["$$this.fim", "$$this.inicio"] }, 0] }] } } } },
                    tempoPausasNaoPlanejadasMs: { $sum: { $reduce: { input: "$pausas", initialValue: 0, in: { $add: ["$$value", { $cond: [{ $and: [{ $eq: ["$$this.tipo", "NaoPlanejada"] }, "$$this.inicio", "$$this.fim"] }, { $subtract: ["$$this.fim", "$$this.inicio"] }, 0] }] } } } },
                    tempoIdealTotalMs: { $sum: { $multiply: ['$quantidade', '$produtoInfo.tempo_ciclo_ideal_segundos', 1000] } }
                }
            },
            { 
                $project: {
                    tempoPlanejadoProducaoMs: { $subtract: ['$tempoTotalMs', '$tempoPausasPlanejadasMs'] },
                    tempoEfetivoProducaoMs: { $subtract: [{ $subtract: ['$tempoTotalMs', '$tempoPausasPlanejadasMs'] }, '$tempoPausasNaoPlanejadasMs'] },
                    qualidadeRatio: { $cond: [{ $eq: ['$totalProduzido', 0] }, 1, { $divide: [{ $subtract: ['$totalProduzido', '$totalRefugo'] }, '$totalProduzido'] }] },
                    tempoIdealTotalMs: 1
                }
            },
            { 
                $project: {
                    disponibilidadeRatio: { $cond: [{ $lte: ['$tempoPlanejadoProducaoMs', 0] }, 1, { $divide: ['$tempoEfetivoProducaoMs', '$tempoPlanejadoProducaoMs'] }] },
                    performanceRatio: { $cond: [{ $lte: ['$tempoEfetivoProducaoMs', 0] }, 1, { $divide: ['$tempoIdealTotalMs', '$tempoEfetivoProducaoMs'] }] },
                    qualidadeRatio: 1
                }
            },
            { 
                $project: {
                    oee: { $round: [{ $multiply: ['$disponibilidadeRatio', '$performanceRatio', '$qualidadeRatio', 100] }, 2] }
                }
            },
            { $sort: { _id: 1 } }
        ];
    }

    static buildParetoAggregation(filter) {
        return [
            { $match: filter }, 
            { $unwind: '$pausas' },
            { $match: { 
                'pausas.fim': { $exists: true }, 
                'pausas.tipo': 'NaoPlanejada'
            }},
            { 
                $group: {
                    _id: '$pausas.motivo',
                    totalDurationMinutos: { $sum: { $divide: [{ $subtract: ['$pausas.fim', '$pausas.inicio'] }, 60000] } }
                }
            },
            { $sort: { totalDurationMinutos: -1 } }, 
            { $limit: 7 }
        ];
    }

    static buildProductionByProductAggregation(filter) {
         return [
            { $match: filter },
            { $lookup: { from: 'produtos', localField: 'produto', foreignField: '_id', as: 'produtoInfo' } },
            { $unwind: '$produtoInfo' },
            { $group: { 
                _id: '$produtoInfo.nome', 
                totalProduzido: { $sum: '$quantidade' } 
            }},
            { $sort: { totalProduzido: -1 } }, 
            { $limit: 7 }
        ];
    }
}

module.exports = ReportControl;