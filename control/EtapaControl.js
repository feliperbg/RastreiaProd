// Arquivo: control/EtapaControl.js (Corrigido)
const Etapa = require('../model/Etapa');
const Produto = require('../model/Produto');

// Função auxiliar para tratar erros de forma padronizada
function handleErrors(res, error) {
  if (error.name === 'ValidationError') {
    let messages = [];
    for (let field in error.errors) {
      messages.push(error.errors[field].message);
    }
    return res.status(400).json({ status: false, msg: `Erro de validação: ${messages.join(' ')}` });
  } else if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const value = error.keyValue[field];
    if (field === 'sequencias') {
        return res.status(409).json({
            status: false,
            msg: `Erro: O número de sequência '${value}' já está em uso para este produto. Por favor, escolha outro.`
        });
    }
    return res.status(409).json({ status: false, msg: `O campo '${field}' com valor '${value}' já existe.` });
  } else {
    // Erros vindos dos hooks de 'pre' delete cairão aqui
    console.error(error);
    return res.status(409).json({ status: false, msg: error.message }); // 409 Conflict é bom para falhas de integridade
  }
}

module.exports = class EtapaController {

    /**
     * Cria uma nova etapa e a associa a um produto.
     */
    static async create(req, res) {
        try {
            const { produto: produtoId, ...etapaData } = req.body;

            if (!produtoId) {
                return res.status(400).json({ status: false, msg: 'O ID do produto é obrigatório.' });
            }
            
            const novaEtapa = await Etapa.create({ ...etapaData, produto: produtoId });
            return res.status(201).json({ status: true, msg: 'Etapa criada e associada ao produto com sucesso!', etapa: novaEtapa });
        }catch (error) {
            return handleErrors(res, error);
        }
    }

    static async getProximaSequencia(req, res) {
        try {
            const { produtoId } = req.params;
            
            // Encontra a etapa com o maior número de sequência para este produto
            const ultimaEtapa = await Etapa.findOne({ produto: produtoId }).sort({ sequencias: -1 });
            
            // Se houver uma última etapa, a próxima sequência é o número dela + 1. Senão, é 1.
            const proximaSequencia = ultimaEtapa ? ultimaEtapa.sequencias + 1 : 1;
            
            return res.status(200).json({ status: true, proximaSequencia });
        } catch (error) {
            return handleErrors(res, error);
        }
    }

    static async getComponentesUtilizados(req, res) {
        try {
            const { produtoId } = req.params;
            const ObjectId = require('mongoose').Types.ObjectId;

            const resultado = await Etapa.aggregate([
                { $match: { produto: new ObjectId(produtoId) } },
                { $unwind: '$componentesConclusao' },
                {
                    $group: {
                        _id: '$componentesConclusao.componente',
                        quantidadeTotal: { $sum: '$componentesConclusao.quantidade' }
                    }
                }
            ]);

            const componentesUtilizados = resultado.reduce((acc, item) => {
                acc[item._id.toString()] = item.quantidadeTotal;
                return acc;
            }, {});

            return res.status(200).json({ status: true, componentesUtilizados });
        } catch (error) {
            return handleErrors(res, error);
        }
    }

    /**
     * Lista todas as etapas de todos os produtos.
     */
    static async readAll(req, res) {
        try {
            const etapas = await Etapa.find().populate('produto', 'nome');
            return res.status(200).json({ status: true, etapas });
        } catch (error) {
            return handleErrors(res, error);
        }
    }

    /**
     * Lista todas as etapas de um produto específico.
     */
    static async readByProduto(req, res) {
        try {
            const { produtoId } = req.params;
            const etapas = await Etapa.find({ produto: produtoId })
                .populate('departamentoResponsavel', 'nome')
                .populate({
                    path: 'componentesConclusao.componente',
                    select: 'nome'
                })
                .populate('funcionariosResponsaveis', 'nome')
                .sort('sequencias');
            return res.status(200).json({ status: true, etapas });
        } catch (error) {
            return handleErrors(res, error);
        }
    }

    /**
     * Busca uma única etapa pelo seu ID.
     */
    static async readByID(req, res) {
        try {
            const { id } = req.params;
            const etapa = await Etapa.findById(id)
                .populate({
                    path: 'componentesConclusao.componente',
                    select: 'nome'
                })
                .populate('funcionariosResponsaveis', 'nome')
                .populate('departamentoResponsavel', 'nome');

            if (!etapa) {
                return res.status(404).json({ status: false, msg: 'Etapa não encontrada.' });
            }
            return res.status(200).json({ status: true, etapa });
        } catch (error) {
            return handleErrors(res, error);
        }
    }

    /**
     * Atualiza uma etapa existente.
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const dadosAtualizacao = req.body;

            // Impede que o campo 'produto' seja alterado nesta rota
            delete dadosAtualizacao.produto;

            const etapaAtualizada = await Etapa.findByIdAndUpdate(id, dadosAtualizacao, { new: true, runValidators: true });

            if (!etapaAtualizada) {
                return res.status(404).json({ status: false, msg: 'Etapa não encontrada.' });
            }

            return res.status(200).json({ status: true, msg: 'Etapa atualizada com sucesso!', etapa: etapaAtualizada });
        } catch (error) {
            return handleErrors(res, error);
        }
    }

    /**
     * Deleta uma etapa e a remove da lista do produto associado.
     */
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const etapaDeletada = await Etapa.findOneAndDelete({ _id: id });

            if (!etapaDeletada) {
                return res.status(404).json({ status: false, msg: 'Etapa não encontrada.' });
            }
            return res.status(200).json({ status: true, msg: 'Etapa removida com sucesso!' });
        } catch (error) {
            return handleErrors(res, error);
        }
    }
}