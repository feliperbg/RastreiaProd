const Departamento = require('../model/Departamento');

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
    return res.status(409).json({ status: false, msg: `O campo '${field}' com valor '${value}' já existe.` });
  } else {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Ocorreu um erro interno no servidor.' });
  }
}

module.exports = class DepartamentoController {
    static async create(req, res) {
        try {
            const { nome, descricao } = req.body;
            const departamento = await Departamento.create({ nome, descricao });
            res.status(201).json(departamento);
        } catch (error) {
            return handleErrors(res, error);
        }
    }

    static async readAll(req, res) {
        try {
            const departamentos = await Departamento.find().populate('funcionariosCount etapasCount').sort({ nome: 1 });
            if (!departamentos) {
                return res.status(404).json({ status: false, msg: 'Nenhum departamento encontrado.' });
            }

            return res.status(200).json({ status: true, departamentos: departamentos });

        } catch (error) {
            return handleErrors(res, error);
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
            return handleErrors(res, error);
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { nome, descricao } = req.body;
            const departamento = await Departamento.findByIdAndUpdate(id, { nome, descricao }, { new: true, runValidators: true });
            if (!departamento) {
                return res.status(404).json({ error: 'Departamento não encontrado' });
            }
            res.status(200).json(departamento);
        } catch (error) {
            return handleErrors(res, error);
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
            return handleErrors(res, error);
        }
    }
};
