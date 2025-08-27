// Arquivo: control/OrdemProducaoControl.js
const OrdemProducao = require('../model/OrdemProducao');
const Produto = require('../model/Produto');


module.exports = class OrdemProducaoController {
    static async create(req, res) {
        try {
            const { status, produto, quantidade } = req.body;

            const novaOrdem = await OrdemProducao.create({ status, produto, quantidade });
            
            return res.status(201).json({ status: true, msg: 'Ordem de produção criada!', ordem: novaOrdem });
        } catch (error) {
            // Erros de validação do Mongoose (ex: campos obrigatórios faltando) serão capturados aqui
            console.error("ERRO AO CRIAR ORDEM:", error); 
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    static async readAll(req, res) {
        try {
            const ordens = await OrdemProducao.find()
                .populate('produto', 'nome') // Popula o nome do produto
                .populate({
                    path: 'etapaAtual.etapa', // Popula o campo 'etapa' dentro do array 'etapaAtual'
                    select: 'nome' // Seleciona apenas o campo 'nome' da etapa
                })
                .populate({
                    path: 'funcionarioAtivo.funcionario', // Popula o campo 'funcionario' dentro do array 'funcionarioAtivo'
                    select: 'nome' // Seleciona apenas o nome do funcionário
                })                                                          
                .sort('-createdAt');
            return res.status(200).json({ status: true, ordens });
        } catch (error) {
            console.error("Erro ao listar ordens:", error); // Adicionado log para debug
            return res.status(500).json({ status: false, msg: 'Erro ao listar ordens de produção.', error: error.message });
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

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const ordemDeletada = await OrdemProducao.findByIdAndDelete(id);

            if (!ordemDeletada) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }

            return res.status(200).json({ status: true, msg: 'Ordem removida!' });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao remover ordem de produção.' });
        }
    }

    static async readByID(req, res) {
        try {
            const { id } = req.params;
            const ordem = await OrdemProducao.findById(id)
                .populate({
                    path: 'produto', // 1. Popula o campo 'produto' da Ordem de Produção
                    populate: [      // 2. DENTRO de 'produto', popula os seguintes campos (em um array):
                        {
                            path: 'etapas', // 2a. Popula o campo 'etapas' do produto
                             populate: [
                                {
                                    path: 'funcionariosResponsaveis', // 3a. Popula os funcionários de cada etapa
                                    select: 'nome'
                                },
                                {
                                    path: 'departamentoResponsavel', // 3b. (NOVO) Popula o departamento de cada etapa
                                    select: 'nome'
                                }
                            ]
                        },
                        {
                            path: 'componentesNecessarios.componente', // 2b. Popula o campo 'componente' dentro do array 'componentesNecessarios' do produto
                            select: 'nome codigo'
                        }
                    ]
                })
                .populate('etapaAtual.etapa') // Popula as etapas que já estão na OP
                .populate('funcionarioAtivo.funcionario'); // Popula o funcionário que está ativo na OP

            if (!ordem) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }

            return res.status(200).json({ status: true, ordem });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao buscar ordem de produção.', error: error.message });
        }
    }

    static async iniciarEtapa(req, res) {
        try {
            const { id, etapaId } = req.params;
            const funcionarioId = req.user._id;

            const ordem = await OrdemProducao.findById(id);
            if (!ordem) return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });

            const etapaExistente = ordem.etapaAtual.find(e => e.etapa.toString() === etapaId);
            if (etapaExistente) {
                return res.status(400).json({ status: false, msg: 'Esta etapa já foi iniciada.' });
            }

            if (ordem.etapaAtual.length === 0) {
                ordem.status = 'Em Andamento';
                if (!ordem.timestampProducao) {
                    ordem.timestampProducao = {};
                }
                ordem.timestampProducao.inicio = new Date();
            }

            ordem.etapaAtual.push({
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

    /**
     * Finaliza uma etapa da Ordem de Produção.
     */
    static async finalizarEtapa(req, res) {
        try {
            const { id, etapaId } = req.params;
            const funcionarioId = req.user._id;

            const ordem = await OrdemProducao.findById(id).populate('produto');
            if (!ordem) return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });

            const etapaParaFinalizar = ordem.etapaAtual.find(e => e.etapa.toString() === etapaId);
            if (!etapaParaFinalizar) {
                return res.status(404).json({ status: false, msg: 'Etapa não encontrada nesta ordem de produção.' });
            }
            if (etapaParaFinalizar.status === 'Concluída') {
                return res.status(400).json({ status: false, msg: 'Esta etapa já foi finalizada.' });
            }

            etapaParaFinalizar.status = 'Concluída';
            etapaParaFinalizar.dataFim = new Date();

            
            ordem.funcionarioAtivo = (ordem.funcionarioAtivo || []).filter(
                f => f && f.funcionario && f.funcionario.toString() !== funcionarioId
            );

            const definicaoDeEtapas = ordem.produto.etapas;
            if (definicaoDeEtapas[definicaoDeEtapas.length - 1].toString() === etapaId) {
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
}