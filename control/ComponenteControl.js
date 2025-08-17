// Arquivo: control/ComponenteControl.js
const Componente = require('../model/Componente');

module.exports = class ComponenteController {
    static async create(req, res) {
        try {
            const novoComponente = await Componente.create(req.body);
            return res.status(201).json({
                status: true,
                msg: 'Componente criado com sucesso!',
                componente: novoComponente,
            });
        } catch (error) {
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    static async readAll(req, res) {
        try {
            const componentes = await Componente.find().sort('nome');
            return res.status(200).json({ status: true, componente: componentes });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao listar componentes.' });
        }
    }

    static async readByID(req, res) {
        try {
            const { id } = req.params;
            const componente = await Componente.findById(id);
            if (!componente) {
                return res.status(404).json({ status: false, msg: 'Componente não encontrado.' });
            }
            return res.status(200).json({ status: true, componente });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao buscar componente.' });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const componenteAtualizado = await Componente.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true,
            });
            if (!componenteAtualizado) {
                return res.status(404).json({ status: false, msg: 'Componente não encontrado.' });
            }
            return res.status(200).json({
                status: true,
                msg: 'Componente atualizado com sucesso!',
                componente: componenteAtualizado,
            });
        } catch (error) {
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const componenteDeletado = await Componente.findByIdAndDelete(id);
            if (!componenteDeletado) {
                return res.status(404).json({ status: false, msg: 'Componente não encontrado.' });
            }
            return res.status(200).json({ status: true, msg: 'Componente removido com sucesso!' });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao remover componente.' });
        }
    }
};