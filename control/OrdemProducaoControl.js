const OrdemProducao = require('../model/OrdemProducao');
const mongoose = require('mongoose');
const Produto = require('../model/Produto');
// Importe os outros models necessários para o populate no getDetalhesOrdem
const Funcionario = require('../model/Funcionario');
const Motivo = require('../model/Motivo');
const Etapa = require('../model/Etapa');


module.exports = class OrdemProducaoController {
    static async create(req, res) {
        try {
            const { produto, quantidade, dataEntrega } = req.body;
            const criadoPor = req.user;
            const produtoParaOrdem = await Produto.findById(produto).populate('etapas');
            if (!produtoParaOrdem) {
                return res.status(404).json({ status: false, msg: 'Produto não encontrado.' });
            }
            if (!produtoParaOrdem.etapas || produtoParaOrdem.etapas.length === 0) {
                return res.status(400).json({ status: false, msg: 'Não é possível criar uma ordem de produção para um produto sem etapas de montagem definidas.' });
            }

            const hoje = new Date();
            const dataEntregaObj = new Date(dataEntrega);
            const diffTime = dataEntregaObj.getTime() - hoje.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let prioridade;
            if (diffDays <= 3) {
                prioridade = { texto: 'Urgente', cor: '#dc3545' };
            } else if (diffDays <= 7) {
                prioridade = { texto: 'Alta', cor: '#ffc107' };
            } else {
                prioridade = { texto: 'Normal', cor: '#6c757d' };
            }

            const novaOrdem = await OrdemProducao.create({ 
                produto, 
                quantidade, 
                dataEntrega,
                criadoPor,
                prioridade
            });
            
            return res.status(201).json({ status: true, msg: 'Ordem de produção criada!', ordem: novaOrdem });
        } catch (error) {
            console.error("ERRO AO CRIAR ORDEM:", error); 
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    // MÉTODO readAll TOTALMENTE REFEITO - MAIS SIMPLES E CORRETO
    static async readAll(req, res) {
        try {
            const { meuPainel } = req.query;
            const funcionarioId = req.user ? req.user._id : null; // Garante que req.user exista

            if(process.env.NODE_ENV === 'development'){
                // --- CONSOLE LOGS PARA DEPURAÇÃO ---
                console.log('--- DEBUG: Filtro "Minhas Ordens" ---');
                console.log('Parâmetro meuPainel:', meuPainel);
                console.log('Payload do Usuário (req.user):', req.user);
                console.log('ID do Funcionário:', funcionarioId);
                // ------------------------------------
            }

            let query = {};
            if (meuPainel === 'true' && funcionarioId) {
                // Filtra ordens onde o ID do funcionário logado está no array 'funcionarioAtivo.funcionario'
                query = { 'funcionarioAtivo.funcionario': funcionarioId };
            }
            console.log('Query final para o MongoDB:', query);

            let ordens = await OrdemProducao.find(query).populate({
                    path: 'produto',
                    select: 'nome tempo_ciclo_ideal_segundos componentesNecessarios',
                    populate: {
                        path: 'componentesNecessarios.componente',
                        select: 'precoUnidade'
                    }
                })
                .populate('criadoPor', 'nome')
                .populate({
                    path: 'funcionarioAtivo.funcionario',
                    select: 'nome valor_hora'
                })
                .populate({
                    path: 'historicoEtapas',
                    populate: {
                        path: 'etapa',
                        select: 'nome'
                    }
                })
                .exec(); 

            const ordemStatus = {
                'Pendente': 1,
                'Em Andamento': 2,
                'Pausada': 3,
                'Concluída': 4,
                'Cancelada': 5
            };
    
            ordens.sort((a, b) => {
                const ordemA = ordemStatus[a.status] || 99;
                const ordemB = ordemStatus[b.status] || 99;
                return ordemA - ordemB;
            });
            
            // Converte para objetos simples APÓS a população para garantir que os virtuais funcionem
            const ordensObj = ordens.map(ordem => ordem.toObject({ virtuals: true }));

            return res.status(200).json({ status: true, ordens: ordensObj });
            
        } catch (error) {
            console.error("Erro ao listar ordens:", error);
            return res.status(500).json({ status: false, msg: 'Erro ao listar ordens de produção.', error: error.message });
        }
    }
    
    static async readByID(req, res) {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ status: false, msg: 'O ID fornecido não é válido.' });
            }

            const ordem = await OrdemProducao.findById(id)
                .populate({
                    path: 'produto',
                    populate: [
                        {
                            path: 'etapas',
                            populate: [
                                { path: 'funcionariosResponsaveis', select: 'nome _id' }, 
                                { path: 'departamentoResponsavel', select: 'nome' }
                            ]
                        },
                        {
                            path: 'componentesNecessarios.componente',
                            select: 'nome codigo'
                        }
                    ]
                })
                .populate('historicoEtapas.etapa')
                .populate('funcionarioAtivo.funcionario')
                .populate('criadoPor', 'nome')
                .populate('motivoCancelamento', 'descricao') // Populando o motivo do cancelamento
                .populate({
                    path: 'historico_refugo.motivo',
                    select: 'descricao'
                }).populate({
                    path: 'historico_refugo.funcionario', select: 'nome'
                }).populate({
                    path: 'historico_prioridade.funcionario', select: 'nome'
                });

            if (!ordem) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }
            if (!ordem.produto) {
                console.error(`Inconsistência de dados: Ordem de Produção ${id} não possui um produto associado.`);
                return res.status(409).json({
                    status: false,
                    msg: 'Conflito de dados: O produto associado a esta Ordem de Produção não foi encontrado.',
                    ordem 
                });
            }
            const tempoMedioOP = (await this.#getTempoMedioOP(ordem.produto._id)) || 0;
            
            let etapasComTempoMedio = [];
            if (ordem.produto.etapas && Array.isArray(ordem.produto.etapas)) {
                etapasComTempoMedio = await Promise.all(
                    ordem.produto.etapas.map(async (etapa) => {
                        if (!etapa) return null;
                        const tempoMedio = (await this.#getTempoMedioPorEtapa(etapa._id)) || 0;
                        return { ...etapa.toObject(), tempoMedio };
                    })
                );
                etapasComTempoMedio = etapasComTempoMedio.filter(e => e !== null);
            }

            const ordemObj = ordem.toObject();
            ordemObj.produto.etapas = etapasComTempoMedio;
            ordemObj.tempoMedioOP = tempoMedioOP;

            return res.status(200).json({ status: true, ordem: ordemObj });

        } catch (error) {
            console.error(`Erro inesperado ao buscar a ordem de produção ID [${req.params.id}]:`, error);
            return res.status(500).json({
                status: false,
                msg: 'Ocorreu um erro interno no servidor ao processar sua solicitação.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const dadosAtualizacao = req.body;

            const ordemAtualizada = await OrdemProducao.findByIdAndUpdate(id, dadosAtualizacao, { new: true, runValidators: true });

            if (!ordemAtualizada) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }

            return res.status(200).json({ status: true, msg: 'Ordem atualizada!', ordem: ordemAtualizada });
        } catch (error) {
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    /**
     * Atualiza a prioridade de uma Ordem de Produção manualmente.
     */
    static async updatePrioridade(req, res) {
        try {
            const { id } = req.params;
            const { prioridade: prioridadeTexto } = req.body;
            const funcionarioId = req.user._id; // Captura o ID do usuário logado

            if (!prioridadeTexto || !['Urgente', 'Alta', 'Normal'].includes(prioridadeTexto)) {
                return res.status(400).json({ status: false, msg: 'Prioridade inválida.' });
            }

            let novaPrioridade;
            if (prioridadeTexto === 'Urgente') {
                novaPrioridade = { texto: 'Urgente', cor: '#dc3545' };
            } else if (prioridadeTexto === 'Alta') {
                novaPrioridade = { texto: 'Alta', cor: '#ffc107' };
            } else {
                novaPrioridade = { texto: 'Normal', cor: '#6c757d' };
            }

            const ordem = await OrdemProducao.findById(id);
            if (!ordem) return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });

            // Define a nova prioridade atual
            ordem.prioridade = novaPrioridade;

            // Adiciona o registro ao histórico
            ordem.historico_prioridade.push({
                prioridade: novaPrioridade,
                funcionario: funcionarioId,
                data: new Date()
            });

            await ordem.save();

            return res.status(200).json({ status: true, msg: 'Prioridade atualizada com sucesso!', ordem });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao atualizar a prioridade.', error: error.message });
        }
    }

    static async cancelar(req, res) {
        try {
            const { id } = req.params;
            // CORREÇÃO: Pega a propriedade 'motivoCancelamento' diretamente do req.body
            const { motivoCancelamento } = req.body;

            // A verificação agora usa a variável correta
            if (!motivoCancelamento) {
                return res.status(400).json({ status: false, msg: 'O motivo do cancelamento é obrigatório.' });
            }

            const ordemCancelada = await OrdemProducao.findByIdAndUpdate(id, 
                { status: 'Cancelada', motivoCancelamento: motivoCancelamento }, 
                { new: true }
            );

            if (!ordemCancelada) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }

            return res.status(200).json({ status: true, msg: 'Ordem de produção cancelada com sucesso!', ordem: ordemCancelada });

        } catch (error) {
            // Mensagem de erro mais específica para o contexto
            return res.status(500).json({ status: false, msg: 'Erro ao cancelar a ordem de produção.' });
        }
    }

    static async #getTempoMedioPorEtapa(etapaId) {
        try {
            const result = await OrdemProducao.aggregate([
                { $unwind: '$historicoEtapas' },
                { $match: { 'historicoEtapas.etapa': new mongoose.Types.ObjectId(etapaId), 'historicoEtapas.status': 'Concluída' } },
                { $addFields: { "duracaoMs": { $subtract: ['$historicoEtapas.dataFim', '$historicoEtapas.dataInicio'] } } },
                { $group: { _id: null, tempoMedioMs: { $avg: '$duracaoMs' } } }
            ]);
            if (result.length > 0 && result[0].tempoMedioMs) {
                return Math.round(result[0].tempoMedioMs / 60000);
            }
            return null;
        } catch (error) {
            console.error(`Erro ao calcular tempo médio para etapa ${etapaId}:`, error);
            return null;
        }
    }

    static async #getTempoMedioOP(produtoId) {
        try {
            const result = await OrdemProducao.aggregate([
                { 
                    $match: { 
                        'produto': new mongoose.Types.ObjectId(produtoId), 
                        'status': 'Concluída',
                        'timestampProducao.inicio': { $exists: true },
                        'timestampProducao.fim': { $exists: true }
                    }
                },
                { $addFields: { "duracaoMs": { $subtract: ['$timestampProducao.fim', '$timestampProducao.inicio'] } } },
                { $group: { _id: null, tempoMedioMs: { $avg: '$duracaoMs' } } }
            ]);
            
            if (result.length > 0 && result[0].tempoMedioMs) {
                return Math.round(result[0].tempoMedioMs / 60000); 
            }
            
            return null;
        } catch (error) {
            console.error(`Erro ao calcular tempo médio para produto ${produtoId}:`, error);
            return null;
        }
    }

    static async iniciarEtapa(req, res) {
        try {
            const { id, etapaId } = req.params;
            const funcionarioId = req.user._id;

            const ordem = await OrdemProducao.findById(id);
            if (!ordem) return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });

            const etapaExistente = ordem.historicoEtapas.find(e => e.etapa.toString() === etapaId);
            if (etapaExistente) {
                return res.status(400).json({ status: false, msg: 'Esta etapa já foi iniciada.' });
            }

            if (ordem.historicoEtapas.length === 0) {
                ordem.status = 'Em Andamento';
                if (!ordem.timestampProducao) {
                    ordem.timestampProducao = {};
                }
                ordem.timestampProducao.inicio = new Date();
            }

            ordem.historicoEtapas.push({
                etapa: etapaId,
                status: 'Em Andamento',
                dataInicio: new Date()
            });

            ordem.funcionarioAtivo.push({
                funcionario: funcionarioId,
                dataEntrada: new Date()
            });

            await ordem.save();
            return res.status(200).json({ status: true, msg: 'Etapa iniciada com sucesso!', ordem });

        } catch (error) {
            console.error("ERRO DETALHADO AO INICIAR ETAPA:", error);
            return res.status(500).json({ status: false, msg: 'Erro ao iniciar etapa.', error: error.message });
        }
    }

    static async finalizarEtapa(req, res) {
        try {
            const { id, etapaId } = req.params;
            const funcionarioId = req.user._id;

           const ordem = await OrdemProducao.findById(id)
                .populate({
                    path: 'produto',
                    populate: {
                        path: 'etapas',
                     }
                });

            if (!ordem) return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            
            const etapaParaFinalizar = ordem.historicoEtapas.find(e => e.etapa.toString() === etapaId);
            if (!etapaParaFinalizar) {
                return res.status(404).json({ status: false, msg: 'Etapa não encontrada nesta ordem de produção.' });
            }
            if (etapaParaFinalizar.status === 'Concluída') {
                return res.status(400).json({ status: false, msg: 'Esta etapa já foi finalizada.' });
            }
             if (etapaParaFinalizar.status === 'Pausada') {
                return res.status(400).json({ status: false, msg: 'Não é possível finalizar uma etapa pausada. Retome-a primeiro.' });
            }

            etapaParaFinalizar.status = 'Concluída';
            etapaParaFinalizar.dataFim = new Date();

            ordem.funcionarioAtivo = (ordem.funcionarioAtivo || []).filter(
                f => f && f.funcionario && f.funcionario.toString() !== funcionarioId
            );

            const definicaoDeEtapas = ordem.produto.etapas;
            if (definicaoDeEtapas[definicaoDeEtapas.length - 1]._id.toString() === etapaId) {
                ordem.status = 'Concluída';
                if (!ordem.timestampProducao) {
                    ordem.timestampProducao = {};
                }
                ordem.timestampProducao.fim = new Date();
            }

            await ordem.save();
            return res.status(200).json({ status: true, msg: 'Etapa finalizada com sucesso!', ordem });

        } catch (error) {
            console.error("ERRO DETALHADO AO FINALIZAR ETAPA:", error);
            return res.status(500).json({ status: false, msg: 'Erro ao finalizar etapa.', error: error.message });
        }
    }

    static async pausarEtapa(req, res) {
        try {
            const { id, etapaId } = req.params;
            const { motivo, tipo } = req.body;

            if (!motivo || !tipo) {
                return res.status(400).json({ status: false, msg: 'Motivo e tipo da pausa são obrigatórios.' });
            }
            if (!['Planejada', 'NaoPlanejada'].includes(tipo)) {
                return res.status(400).json({ status: false, msg: 'Tipo de pausa inválido.' });
            }

            const ordem = await OrdemProducao.findById(id);
            if (!ordem) return res.status(404).json({ status: false, msg: 'Ordem não encontrada.' });
            if (ordem.status !== 'Em Andamento') return res.status(400).json({ status: false, msg: 'A ordem não está em andamento.' });

            const etapaParaPausar = ordem.historicoEtapas.find(e => e.etapa.toString() === etapaId);
            if (!etapaParaPausar || etapaParaPausar.status !== 'Em Andamento') {
                return res.status(400).json({ status: false, msg: 'Esta etapa não está em andamento.' });
            }

            ordem.pausas.push({ motivo, inicio: new Date(), tipo });
            etapaParaPausar.status = 'Pausada';
            ordem.status = 'Pausada';

            await ordem.save();
            return res.status(200).json({ status: true, msg: 'Etapa pausada com sucesso!', ordem });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao pausar etapa.', error: error.message });
        }
    }

    static async retomarEtapa(req, res) {
        try {
            const { id, etapaId } = req.params;
            const ordem = await OrdemProducao.findById(id);

            if (!ordem) return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });

            const etapaParaRetomar = ordem.historicoEtapas.find(e => e.etapa.toString() === etapaId);
            if (!etapaParaRetomar) return res.status(404).json({ status: false, msg: 'Etapa não encontrada na ordem.' });

            if (etapaParaRetomar.status !== 'Pausada') {
                return res.status(400).json({ status: false, msg: 'A etapa não está pausada.' });
            }
            
            const ultimaPausa = ordem.pausas && ordem.pausas.length > 0 
                ? ordem.pausas.find(p => !p.fim) 
                : null;

            if (ultimaPausa) {
                ultimaPausa.fim = new Date();
            }
            
            etapaParaRetomar.status = 'Em Andamento';
            ordem.status = 'Em Andamento';

            await ordem.save();
            return res.status(200).json({ status: true, msg: 'Etapa retomada com sucesso.', ordem });
        } catch (error) {
            console.error("ERRO AO RETOMAR ETAPA:", error);
            return res.status(500).json({ status: false, msg: 'Erro ao retomar etapa.', error: error.message });
        }
    }
        static async atualizarRefugo(req, res) {
        try {
            const { id } = req.params;
            const { quantidade, motivoId } = req.body;
            const funcionarioId = req.user._id;

            if (typeof quantidade !== 'number' || quantidade <= 0) {
                return res.status(400).json({ status: false, msg: 'A quantidade de refugo deve ser um número maior que zero.' });
            }
            if (!motivoId || !mongoose.Types.ObjectId.isValid(motivoId)) {
                return res.status(400).json({ status: false, msg: 'O motivo do refugo é obrigatório.' });
            }

            const ordem = await OrdemProducao.findById(id);
            if (!ordem) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }

            if (ordem.status === 'Concluída' || ordem.status === 'Cancelada'){
                return res.status(403).json({ status: false, msg: 'Não é possível alterar o refugo de uma ordem finalizada.' });
            }

            const novoTotalRefugo = ordem.quantidade_refugo + quantidade;
            if (novoTotalRefugo > ordem.quantidade) {
                 return res.status(400).json({ status: false, msg: 'A soma dos refugos não pode ser maior que a quantidade total da ordem.' });
            }

            ordem.historico_refugo.push({
                motivo: motivoId,
                quantidade: quantidade,
                funcionario: funcionarioId,
                data: new Date()
            });

            // Atualiza o total de refugo
            ordem.quantidade_refugo = novoTotalRefugo;

            await ordem.save();
            return res.status(200).json({ status: true, msg: 'Refugo atualizado!', ordem });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao atualizar refugo.', error: error.message });
        }
    }
}
