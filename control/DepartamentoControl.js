const Departamento = require('../model/Departamento');

module.exports = class DepartamentoController {
    static async create(req, res) {
        try {
            const { nome, descricao } = req.body;
            const departamento = await Departamento.create({ nome, descricao });
            res.status(201).json(departamento);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar departamento' });
        }
    }

    static async readAll(req, res) {
        try {
            const departamentos = await Departamento.find().sort({ sequencias: 1 });
            if (!departamentos) {
                res.status(404).json({ status: false, msg: 'Nenhum departamento encontrado.' });
            }
           return res.status(200).json({ status: true, departamentos: departamentos });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar departamentos' });
        }
    }

    static async readById(req, res) {
        try {
            const { id } = req.params;
            const departamentos = await Departamento.findById(id);
            if (!departamentos) {
                return res.status(404).json({ status: false, msg: 'Departamento não encontrado.' });
            }
            res.status(200).json(departamentos);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar departamentos' });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { nome, descricao } = req.body;
            const departamento = await Departamento.findByIdAndUpdate(id, { nome, descricao }, { new: true });
            if (!departamento) {
                return res.status(404).json({ error: 'Departamento não encontrado' });
            }
            res.status(200).json(departamento);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar departamento' });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const departamento = await Departamento.findByIdAndDelete(id);
            if (!departamento) {
                return res.status(404).json({ error: 'Departamento não encontrado' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Erro ao deletar departamento' });
        }
    }
};

