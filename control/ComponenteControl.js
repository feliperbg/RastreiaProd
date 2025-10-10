// Arquivo: control/ComponenteControl.js
const Componente = require('../model/Componente');

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
            return handleErrors(res, error);
        }
    }

    static async readAll(req, res) {
        try {
            const componentes = await Componente.find().sort('nome');
            return res.status(200).json({ status: true, componentes: componentes });
        } catch (error) {
            return handleErrors(res, error);
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
            return handleErrors(res, error);
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
            return handleErrors(res, error);
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
            return handleErrors(res, error);
        }
    }
};