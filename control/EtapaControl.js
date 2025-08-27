const Etapa = require('../model/Etapa');
const Produto = require('../model/Produto');


module.exports = class EtapaController {
    static async create(req, res) {
        try {
            const novaEtapa = await Etapa.create(req.body);
            return res.status(201).json({
                status: true,
                msg: 'Etapa criada com sucesso!',
                etapa: novaEtapa,
            });
        } catch (error) {
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    static async readAll(req, res) {
        try {
            const etapas = await Etapa.find().sort({ sequencias: 1 });
            return res.status(200).json({ status: true, etapas });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao listar etapas.' });
        }
    }
    
    static async readByID(req, res) {
        try {
            const { id } = req.params;
            const etapa = await Etapa.findById(id)
                .populate('componenteConclusao', 'nome') // Popula o nome do componente
                .populate('funcionariosResponsaveis', 'nome'); // Popula o nome dos funcionários

            if (!etapa) {
                return res.status(404).json({ status: false, msg: 'Etapa não encontrada.' });
            }
            return res.status(200).json({ status: true, etapa });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao buscar etapa.' });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const etapaAtualizada = await Etapa.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true,
            });
            if (!etapaAtualizada) {
                return res.status(404).json({ status: false, msg: 'Etapa não encontrada.' });
            }
            return res.status(200).json({
                status: true,
                msg: 'Etapa atualizada com sucesso!',
                etapa: etapaAtualizada,
            });
        } catch (error) {
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const etapaDeletada = await Etapa.findByIdAndDelete(id);
            if (!etapaDeletada) {
                return res.status(404).json({ status: false, msg: 'Etapa não encontrada.' });
            }
            return res.status(200).json({ status: true, msg: 'Etapa removida com sucesso!' });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao remover etapa.' });
        }
    }

    static async getEtapasPorProdutoAPI(req, res) {
        try {
            const { produtoId } = req.params;
            const etapas = await Etapa.find({ produto: produtoId })
                .populate('departamentoResponsavel', 'nome')
                .populate('componenteConclusao', 'nome')
                .populate('funcionariosResponsaveis', 'nome')
                .sort({ sequencias: 1 });
            
            return res.status(200).json({ status: true, etapas: etapas });
        } catch (error) {
            console.error('Erro na API ao listar etapas por produto:', error);
            return res.status(500).json({ status: false, msg: 'Erro interno ao buscar etapas.' });
        }
    }

     static async listarPorProdutoView(req, res) {
        try {
            const { produtoId } = req.params;
            const produto = await Produto.findById(produtoId).select('nome').lean();
            if (!produto) {
                return res.status(404).render('error', { message: 'Produto não encontrado.' });
            }
            return res.render('main/etapa', { 
                produtoId: produtoId,
                nomeProduto: produto.nome 
            });

        } catch (error) {
            console.error('Erro ao renderizar a página de etapas:', error);
            return res.status(500).render('error', { message: 'Não foi possível carregar a página de etapas.' });
        }
    }
};