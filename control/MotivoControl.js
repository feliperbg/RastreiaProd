const Motivo = require('../model/Motivo');

module.exports = class MotivoController {
    static async create(req, res) {
        try {
            const novoMotivo = await Motivo.create(req.body);
            return res.status(201).json({
                status: true,
                msg: 'Motivo criado com sucesso!',
                motivo: novoMotivo,
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ status: false, msg: 'Esta descrição de motivo já existe.' });
            }
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    static async readAll(req, res) {
        try {
            const motivos = await Motivo.find({ ativo: true }).sort('descricao');
            return res.status(200).json({ status: true, data: motivos }); 
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao listar motivos.' });
        }
    }

    static async readByTipo(req, res) {
        try {
            const { tipo } = req.params;
            const motivos = await Motivo.find({ tipo: tipo.toUpperCase(), ativo: true }).sort('descricao');
            return res.status(200).json({ status: true, data: motivos }); 
        } catch (error) {
            return res.status(500).json({ status: false, msg: `Erro ao listar motivos do tipo ${tipo}.` });
        }
    }

    static async readByID(req, res) {
        try {
            const { id } = req.params;
            const motivo = await Motivo.findById(id);
            if (!motivo) {
                return res.status(404).json({ status: false, msg: 'Motivo não encontrado.' });
            }
            return res.status(200).json({ status: true, motivo });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao buscar motivo.' });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const motivoAtualizado = await Motivo.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true,
            });
            if (!motivoAtualizado) {
                return res.status(404).json({ status: false, msg: 'Motivo não encontrado.' });
            }
            return res.status(200).json({
                status: true,
                msg: 'Motivo atualizado com sucesso!',
                motivo: motivoAtualizado,
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ status: false, msg: 'Esta descrição de motivo já existe.' });
            }
            return res.status(400).json({ status: false, msg: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            // Em vez de findByIdAndDelete, usando findByIdAndUpdate para "desativar"
            const motivoDesativado = await Motivo.findByIdAndUpdate(
                id, 
                { ativo: false }, 
                { new: true }
            );

            if (!motivoDesativado) {
                return res.status(404).json({ status: false, msg: 'Motivo não encontrado.' });
            }
            return res.status(200).json({ status: true, msg: 'Motivo desativado com sucesso!' });
        } catch (error) {
            return res.status(500).json({ status: false, msg: 'Erro ao desativar motivo.' });
        }
    }
};