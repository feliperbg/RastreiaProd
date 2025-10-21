const OrdemProducao = require('../model/OrdemProducao');
const mongoose = require('mongoose');
const Produto = require('../model/Produto');
const Funcionario = require('../model/Funcionario');
const Motivo = require('../model/Motivo');
const Etapa = require('../model/Etapa');
const Componente = require('../model/Componente');

// --- ADICIONADO: Handler de erros padronizado ---
function handleErrors(res, error, customMsg = 'Ocorreu um erro no servidor.') {
    if (error.name === 'ValidationError') {
        let messages = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({ status: false, msg: `Erro de validação: ${messages.join(' ')}` });
    }
    // Erro customizado (ex: estoque, conflito)
    if (error.name === 'ConflictError') { 
        return res.status(409).json({ status: false, msg: error.message });
    }
    // Erro de permissão
    if (error.name === 'ForbiddenError') { 
        return res.status(403).json({ status: false, msg: error.message });
    }

    console.error("ERRO DETALHADO:", error);
    return res.status(500).json({ status: false, msg: customMsg, error: error.message });
}

module.exports = class OrdemProducaoController {
    
    // Nenhuma alteração necessária
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
            return handleErrors(res, error, 'Erro ao criar ordem de produção.');
        }
    }

    // Nenhuma alteração necessária
    static async readAll(req, res) {
        try {
            const { meuPainel } = req.query;
            const funcionarioId = req.user ? req.user._id : null;
            console.log("meuPainel:", meuPainel, "funcionarioId:", funcionarioId);
            let query = {};
            if (meuPainel === 'true' && funcionarioId) {
                query = { 'criadoPor': funcionarioId };
            }

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
            
            const ordensObj = ordens.map(ordem => ordem.toObject({ virtuals: true }));

            return res.status(200).json({ status: true, ordens: ordensObj });
            
        } catch (error) {
            return handleErrors(res, error, 'Erro ao listar ordens de produção.');
        }
    }
    
    // Nenhuma alteração necessária
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
                .populate('motivoCancelamento', 'descricao')
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
                const err = new Error('Conflito de dados: O produto associado a esta Ordem de Produção não foi encontrado.');
                err.name = 'ConflictError';
                return handleErrors(res, err);
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
            return handleErrors(res, error, 'Erro ao buscar ordem de produção.');
        }
    }

    // Nenhuma alteração necessária (já usa findByIdAndUpdate)
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
            return handleErrors(res, error, 'Erro ao atualizar ordem.');
        }
    }

    // --- Convertido para operação atômica ---
    static async updatePrioridade(req, res) {
        try {
            const { id } = req.params;
            const { prioridade: prioridadeTexto } = req.body;
            const funcionarioId = req.user._id;

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

            const historico = {
                prioridade: novaPrioridade,
                funcionario: funcionarioId,
                data: new Date()
            };

            // Operação atômica: define a nova prioridade e insere no histórico
            const ordemAtualizada = await OrdemProducao.findByIdAndUpdate(
                id,
                { 
                    $set: { prioridade: novaPrioridade },
                    $push: { historico_prioridade: historico }
                },
                { new: true } // Retorna o documento atualizado
            );
            
            if (!ordemAtualizada) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }

            return res.status(200).json({ status: true, msg: 'Prioridade atualizada com sucesso!', ordem: ordemAtualizada });
        } catch (error) {
            return handleErrors(res, error, 'Erro ao atualizar a prioridade.');
        }
    }

    // Nenhuma alteração necessária (já usa findByIdAndUpdate)
    static async cancelar(req, res) {
        try {
            const { id } = req.params;
            const { motivoCancelamento } = req.body;

            if (!motivoCancelamento) {
                return res.status(400).json({ status: false, msg: 'O motivo do cancelamento é obrigatório.' });
            }

            const ordemCancelada = await OrdemProducao.findByIdAndUpdate(id, 
                { status: 'Cancelada', motivoCancelamento: motivoCancelamento }, 
                { new: true, runValidators: true } // Adicionado runValidators
            );

            if (!ordemCancelada) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }

            return res.status(200).json({ status: true, msg: 'Ordem de produção cancelada com sucesso!', ordem: ordemCancelada });

        } catch (error) {
            return handleErrors(res, error, 'Erro ao cancelar a ordem de produção.');
        }
    }

    // Métodos privados (Helpers) - Sem alterações
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

    static async #verificarEstoque(produtoId, quantidadeProducao) {
        const produto = await Produto.findById(produtoId).populate('componentesNecessarios.componente');
        if (!produto) throw new Error('Produto não encontrado para verificação de estoque.');

        const componentesInsuficientes = [];

        for (const item of produto.componentesNecessarios) {
            const componenteDB = item.componente;
            const quantidadeNecessaria = item.quantidade * quantidadeProducao;

            if (!componenteDB || componenteDB.quantidade < quantidadeNecessaria) {
                componentesInsuficientes.push({
                    nome: componenteDB ? componenteDB.nome : 'Componente não encontrado',
                    estoqueAtual: componenteDB ? componenteDB.quantidade : 0,
                    quantidadeNecessaria: quantidadeNecessaria
                });
            }
        }

        return componentesInsuficientes;
    }

    static async iniciarEtapa(req, res) {
        try {
            const { id, etapaId } = req.params;
            const { force } = req.body;
            const funcionarioId = req.user._id;

            // 1. Busca para verificações prévias
            // Seleciona os campos necessários para as validações
            const ordem = await OrdemProducao.findById(id).select('produto quantidade historicoEtapas status');
            if (!ordem) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }

            // 2. Verificações de Status da Ordem e da Etapa
            if (ordem.status === 'Concluída' || ordem.status === 'Cancelada') {
                 return res.status(400).json({ status: false, msg: `Não é possível iniciar etapas. A ordem está ${ordem.status}.` });
            }
            console.log("etapaId:", etapaId);
            console.log("Ordem encontrada:", ordem);
            console.log("ordem.historicoEtapas:", ordem.historicoEtapas);
            const etapaExistente = ordem.historicoEtapas.find(e => e.etapa.toString() === etapaId);
            console.log("etapaExistente:", etapaExistente);

            // Adicionada verificação de 'etapaExistente' para evitar 'TypeError'
            if (!etapaExistente) {
                return res.status(404).json({ status: false, msg: 'Etapa não encontrada no histórico desta ordem.' });
            }
            
            if (etapaExistente.status === 'Em Andamento') {
                return res.status(400).json({ status: false, msg: 'Esta etapa já está em andamento.' });
            }
            if (etapaExistente.status === 'Concluída') {
                return res.status(400).json({ status: false, msg: 'Esta etapa já foi concluída.' });
            }
            // Só podemos iniciar se estiver Pendente (ou Pausada, se for o caso)
            if (etapaExistente.status !== 'Pendente') {
                 return res.status(400).json({ status: false, msg: `Não é possível iniciar uma etapa com status '${etapaExistente.status}'.` });
            }
            
            const nenhumaEtapaIniciada = ordem.historicoEtapas.every(e => e.status === 'Pendente');
            if (nenhumaEtapaIniciada && !force) {
                const componentesInsuficientes = await this.#verificarEstoque(ordem.produto._id, ordem.quantidade);
                if (componentesInsuficientes.length > 0) {
                   return res.status(409).json({ status: 'estoque_insuficiente', msg: 'Estoque insuficiente para iniciar a produção.', componentesInsuficientes});
                }
            }

            // 3. Preparação da atualização atômica
            const novoFuncionarioAtivo = {
                funcionario: funcionarioId,
                dataEntrada: new Date()
            };

            let updatePayload = {
                $set: { 
                    status: 'Em Andamento', // Status global da OP
                    // Usa o identificador 'elem' do arrayFilters para atualizar a etapa correta
                    'historicoEtapas.$[elem].status': 'Em Andamento', 
                    'historicoEtapas.$[elem].dataInicio': new Date()
                },
                $push: { // Adiciona o funcionário à lista de ativos (isso está correto)
                    funcionarioAtivo: novoFuncionarioAtivo 
                }
            };

            // Define o início da produção APENAS se for a primeira etapa
            if (nenhumaEtapaIniciada) {
                updatePayload.$set['timestampProducao.inicio'] = new Date();
            }

            // 4. Execução da atualização atômica
            const result = await OrdemProducao.updateOne(
                { 
                    _id: id,
                    // Condição: A etapa específica deve estar 'Pendente'
                    // Isso previne o "lost update"
                    'historicoEtapas.etapa': etapaId,
                    'historicoEtapas.status': 'Pendente' 
                }, 
                updatePayload,
                {
                    // Define que '[elem]' se refere ao item do array onde a 'etapa' bate com o 'etapaId'
                    arrayFilters: [ 
                        { 'elem.etapa': new mongoose.Types.ObjectId(etapaId) } 
                    ]
                }
            );

            // 5. Verificação de sucesso
            if (result.modifiedCount === 0) {
                // Se nada foi modificado, é porque a condição falhou (ex: outro usuário já iniciou)
                const err = new Error('Conflito: A etapa não pôde ser iniciada (status não era "Pendente"). Tente novamente.');
                err.name = 'ConflictError';
                return handleErrors(res, err);
            }

            const ordemAtualizada = await OrdemProducao.findById(id); // Busca o documento atualizado para retornar
            return res.status(200).json({ status: true, msg: 'Etapa iniciada com sucesso!', ordem: ordemAtualizada });

        } catch (error) {
            return handleErrors(res, error, 'Erro ao iniciar etapa.');
        }
    }

    // --- Adicionada proteção atômica contra estoque negativo ---
    static async #deduzirEstoque(etapaId, quantidadeProducao) {
        const etapa = await Etapa.findById(etapaId).populate('componentesConclusao.componente');
        if (!etapa) {
             throw new Error('Etapa não encontrada para deduzir estoque.');
        }

        for (const item of etapa.componentesConclusao) {
            const quantidadeADeduzir = item.quantidade * quantidadeProducao;

            // Operação atômica condicional
            const updateResult = await Componente.updateOne(
                { 
                    _id: item.componente._id, 
                    quantidade: { $gte: quantidadeADeduzir } // SÓ atualiza SE a quantidade for suficiente
                },
                { 
                    $inc: { quantidade: -quantidadeADeduzir } 
                }
            );

            // Se modifiedCount for 0, a condição (quantidade >= ...) falhou
            if (updateResult.modifiedCount === 0) {
                const err = new Error(`Estoque insuficiente para o componente "${item.componente.nome}" no momento da finalização.`);
                err.name = 'ConflictError'; // Usamos um nome customizado para o handleErrors
                throw err;
            }
        }
    }

    // --- Convertido para operação atômica ---
    static async finalizarEtapa(req, res) {
        try {
            const { id, etapaId } = req.params;
            const funcionarioId = req.user._id;

            // 1. Busca para verificações prévias
            const ordem = await OrdemProducao.findById(id)
                .select('produto quantidade historicoEtapas status')
                .populate({
                    path: 'produto',
                    select: '_id', // Seleciona o ID para a população virtual funcionar
                    populate: { path: 'etapas', select: '_id' } // Popula o campo virtual 'etapas'
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

            // 2. Dedução atômica de estoque (gate)
            // Esta função já é atômica e lança um erro se falhar
            await this.#deduzirEstoque(etapaId, ordem.quantidade);

            // 3. Preparação da atualização atômica de estado
            let updatePayload = {
                $set: { 
                    'historicoEtapas.$.status': 'Concluída',
                    'historicoEtapas.$.dataFim': new Date()
                },
                $pull: { 
                    funcionarioAtivo: { funcionario: new mongoose.Types.ObjectId(funcionarioId) } 
                }
            };

            // Verifica se esta é a última etapa
            const definicaoDeEtapas = ordem.produto.etapas;
            if (definicaoDeEtapas[definicaoDeEtapas.length - 1]._id.toString() === etapaId) {
                updatePayload.$set.status = 'Concluída';
                updatePayload.$set['timestampProducao.fim'] = new Date();
            }

            // 4. Execução da atualização atômica
            const result = await OrdemProducao.updateOne(
                { 
                    _id: id, 
                    historicoEtapas: { $elemMatch: { etapa: etapaId, status: 'Em Andamento' } }
                },
                updatePayload
            );
            
            // 5. Verificação de sucesso
            if (result.modifiedCount === 0) {
                const err = new Error('Conflito: A etapa não estava "Em Andamento". Ação cancelada.');
                err.name = 'ConflictError';
                return handleErrors(res, err);
            }

            const ordemAtualizada = await OrdemProducao.findById(id); // Busca o documento atualizado
            return res.status(200).json({ status: true, msg: 'Etapa finalizada com sucesso!', ordem: ordemAtualizada });

        } catch (error) {
            return handleErrors(res, error, 'Erro ao finalizar etapa.');
        }
    }

    // --- Convertido para operação atômica ---
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

            const novaPausa = { motivo, inicio: new Date(), tipo };

            // Operação atômica: só pausa se a OP e a Etapa estiverem "Em Andamento"
            const result = await OrdemProducao.updateOne(
                {
                    _id: id,
                    status: 'Em Andamento',
                    historicoEtapas: { $elemMatch: { etapa: etapaId, status: 'Em Andamento' } }
                },
                {
                    $set: {
                        status: 'Pausada',
                        'historicoEtapas.$.status': 'Pausada'
                    },
                    $push: { pausas: novaPausa }
                }
            );
            
            if (result.modifiedCount === 0) {
                const err = new Error('Conflito: A ordem ou a etapa não estava "Em Andamento". Ação cancelada.');
                err.name = 'ConflictError';
                return handleErrors(res, err);
            }

            const ordemAtualizada = await OrdemProducao.findById(id);
            return res.status(200).json({ status: true, msg: 'Etapa pausada com sucesso!', ordem: ordemAtualizada });
        } catch (error) {
            return handleErrors(res, error, 'Erro ao pausar etapa.');
        }
    }

    // --- Convertido para operação atômica ---
    static async retomarEtapa(req, res) {
        try {
            const { id, etapaId } = req.params;

            // Operação atômica: só retoma se a OP e a Etapa estiverem "Pausada"
            // Usa "arrayFilters" para atualizar DOIS arrays diferentes (historicoEtapas e pausas)
            const result = await OrdemProducao.updateOne(
                {
                    _id: id,
                    status: 'Pausada',
                    historicoEtapas: { $elemMatch: { etapa: etapaId, status: 'Pausada' } }
                },
                {
                    $set: {
                        status: 'Em Andamento',
                        'historicoEtapas.$[etapa].status': 'Em Andamento', // $[etapa]
                        'pausas.$[pausa].fim': new Date()                 // $[pausa]
                    }
                },
                {
                    arrayFilters: [
                        { 'etapa.etapa': new mongoose.Types.ObjectId(etapaId) }, // Define o filtro para [etapa]
                        { 'pausa.fim': { $exists: false } }                      // Define o filtro para [pausa] (a última pausa aberta)
                    ]
                }
            );
            
            if (result.modifiedCount === 0) {
                const err = new Error('Conflito: A ordem ou a etapa não estava "Pausada". Ação cancelada.');
                err.name = 'ConflictError';
                return handleErrors(res, err);
            }
            
            const ordemAtualizada = await OrdemProducao.findById(id);
            return res.status(200).json({ status: true, msg: 'Etapa retomada com sucesso.', ordem: ordemAtualizada });
        } catch (error) {
            return handleErrors(res, error, 'Erro ao retomar etapa.');
        }
    }
    
    // --- Convertido para operação atômica e com reversão (rollback) ---
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

            const novoHistorico = {
                _id: new mongoose.Types.ObjectId(), // Gera um ID para podermos revertê-lo se necessário
                motivo: motivoId,
                quantidade: quantidade,
                funcionario: funcionarioId,
                data: new Date()
            };

            // 1. Execução da atualização atômica
            const ordemAtualizada = await OrdemProducao.findByIdAndUpdate(
                id,
                {
                    $push: { historico_refugo: novoHistorico },
                    $inc: { quantidade_refugo: quantidade }
                },
                { new: true } // Retorna o documento *após* a atualização
            );

            if (!ordemAtualizada) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }

            // 2. Validação Pós-Atualização
            if (ordemAtualizada.status === 'Concluída' || ordemAtualizada.status === 'Cancelada'){
                // 3a. Reversão (Rollback)
                await OrdemProducao.findByIdAndUpdate(id, {
                    $pull: { historico_refugo: { _id: novoHistorico._id } },
                    $inc: { quantidade_refugo: -quantidade }
                });
                const err = new Error('Não é possível alterar o refugo de uma ordem finalizada.');
                err.name = 'ForbiddenError';
                return handleErrors(res, err);
            }

            if (ordemAtualizada.quantidade_refugo > ordemAtualizada.quantidade) {
                 // 3b. Reversão (Rollback)
                 await OrdemProducao.findByIdAndUpdate(id, {
                    $pull: { historico_refugo: { _id: novoHistorico._id } },
                    $inc: { quantidade_refugo: -quantidade }
                });
                const err = new Error('A soma dos refugos não pode ser maior que a quantidade total da ordem.');
                err.name = 'ConflictError';
                return handleErrors(res, err);
            }

            return res.status(200).json({ status: true, msg: 'Refugo atualizado!', ordem: ordemAtualizada });
        } catch (error) {
            return handleErrors(res, error, 'Erro ao atualizar refugo.');
        }
    }
}