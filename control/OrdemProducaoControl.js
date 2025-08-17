// Arquivo: control/OrdemProducaoControl.js
const OrdemProducao = require('../model/OrdemProducao');
const Produto = require('../model/Produto');


module.exports = class OrdemProducaoController {
    static async create(req, res) {
        console.log("CORPO DA REQUISIÇÃO RECEBIDO:", req.body); // Este log deve funcionar agora

        try {
            const { status, produto, quantidade } = req.body;

            if (status === undefined) { // Verificação mais segura
                return res.status(400).json({ status: false, msg: 'Número de status inválido.' });
            }
            
            // Use a variável 'produto' que agora terá o valor correto
            const novaOrdem = await OrdemProducao.create({ status: status, produto: produto, quantidade });
            
            return res.status(201).json({ status: true, msg: 'Ordem de produção criada!', ordem: novaOrdem });
        } catch (error) {
            console.error("ERRO AO CRIAR ORDEM:", error); // Adicione um log de erro para ver o problema
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    static async readAll(req, res) {
        try {
            const ordens = await OrdemProducao.find()
                .populate('produto', 'nome')
                .populate('etapaAtual', 'nome')
                .sort('-createdAt');
            return res.status(200).json({ status: true, ordens });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao listar ordens de produção.' });
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
     /**
     * ATUALIZADO: Este método agora faz o populate aninhado necessário 
     * para a tela de gestão da OP.
     */
    static async readByID(req, res) {
        try {
            const { id } = req.params;
            const ordem = await OrdemProducao.findById(id)
                .populate({
                    path: 'produto', // 1. Popula o produto
                    populate: {
                        path: 'etapas', // 2. Dentro do produto, popula a definição de suas etapas
                        populate: {
                            path: 'funcionariosResponsaveis' // 3. Dentro de cada etapa, popula os funcionários
                        }
                    }
                })
                .populate('etapaAtual.etapa') // Popula também as etapas que já estão na OP
                .populate('funcionarioAtivo.funcionario'); // Popula o funcionário que está ativo na OP

            if (!ordem) {
                return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });
            }

            return res.status(200).json({ status: true, ordem });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao buscar ordem de produção.', error: error.message });
        }
    }

    /**
     * NOVO: Inicia uma etapa da Ordem de Produção.
     */
    static async iniciarEtapa(req, res) {
        try {
            const { id, etapaId } = req.params;
            const funcionarioId = req.user.id; // Supondo que o JWT Middleware adicione o user ao req

            const ordem = await OrdemProducao.findById(id);
            if (!ordem) return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });

            // Verifica se a etapa já foi iniciada
            const etapaExistente = ordem.etapaAtual.find(e => e.etapa.toString() === etapaId);
            if (etapaExistente) {
                return res.status(400).json({ status: false, msg: 'Esta etapa já foi iniciada.' });
            }

            // Se for a primeira etapa, inicia a produção
            if (ordem.etapaAtual.length === 0) {
                ordem.status = 'Em Andamento';
                ordem.timestampProducao.inicio = new Date();
            }

            // Adiciona a nova etapa e o funcionário ativo
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
            return res.status(500).json({ status: false, msg: 'Erro ao iniciar etapa.', error: error.message });
        }
    }

    /**
     * NOVO: Finaliza uma etapa da Ordem de Produção.
     */
    static async finalizarEtapa(req, res) {
        try {
            const { id, etapaId } = req.params;
            const funcionarioId = req.user.id;

            const ordem = await OrdemProducao.findById(id).populate('produto'); // Popula para saber qual é a última etapa
            if (!ordem) return res.status(404).json({ status: false, msg: 'Ordem de produção não encontrada.' });

            // Encontra a etapa no array da OP para atualizar
            const etapaParaFinalizar = ordem.etapaAtual.find(e => e.etapa.toString() === etapaId);
            if (!etapaParaFinalizar) {
                return res.status(404).json({ status: false, msg: 'Etapa não encontrada nesta ordem de produção.' });
            }
            if (etapaParaFinalizar.status === 'Concluída') {
                return res.status(400).json({ status: false, msg: 'Esta etapa já foi finalizada.' });
            }

            // Atualiza a etapa
            etapaParaFinalizar.status = 'Concluída';
            etapaParaFinalizar.dataFim = new Date();

            // Remove o funcionário do array de ativos
            ordem.funcionarioAtivo = ordem.funcionarioAtivo.filter(
                f => f.funcionario.toString() !== funcionarioId
            );

            // Verifica se esta é a última etapa para concluir a OP
            const definicaoDeEtapas = ordem.produto.etapas;
            if (definicaoDeEtapas[definicaoDeEtapas.length - 1].toString() === etapaId) {
                ordem.status = 'Concluída';
                ordem.timestampProducao.fim = new Date();
            }

            await ordem.save();
            return res.status(200).json({ status: true, msg: 'Etapa finalizada com sucesso!', ordem });

        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao finalizar etapa.', error: error.message });
        }
    }
}