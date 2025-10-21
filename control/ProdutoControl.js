// Arquivo: control/ProdutoControl.js
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
    // Trata erros de chave duplicada (ex: código de produto único)
    const field = Object.keys(error.keyPattern)[0];
    const value = error.keyValue[field];
    return res.status(409).json({ status: false, msg: `O campo '${field}' com valor '${value}' já existe.` });
  } else {
    // Captura erros de integridade referencial dos hooks e outros erros não tratados especificamente
    console.error(error); // Log do erro no servidor para depuração
    return res.status(409).json({ status: false, msg: error.message });
  }
}

module.exports = class ProdutoController {
  static async create(request, response) {
    try {
      const produtoCriado = await Produto.create(request.body);
      return response.status(201).json({
        status: true,
        msg: 'Produto criado com sucesso!',
        produto: produtoCriado,
      });
    } catch (error) {
      return handleErrors(response, error);
    }
  }

  static async readAll(request, response) {
    try {
      const produtos = await Produto.find().sort('nome').populate('componentesNecessarios.componente').populate('etapas');
      return response.status(200).json({ status: true, produtos });
    } catch (error) {
      return handleErrors(response, error);
    }
  }

  static async readByID(request, response) {
    try {
      const { id } = request.params;
      const produto = await Produto.findById(id)
        .populate('componentesNecessarios.componente')
        .populate('etapas', 'nome');
      if (!produto) {
        return response.status(404).json({ status: false, msg: 'Produto não encontrado.' });
      }
      return response.status(200).json({ status: true, produto });
    } catch (error) {
      return handleErrors(response, error);
    }
  }

  static async update(request, response) {
    try {
      const { id } = request.params;
      const dadosAtualizacao = request.body;
      const produtoAtualizado = await Produto.findByIdAndUpdate(id, dadosAtualizacao, {
        new: true,
        runValidators: true,
      });
      if (!produtoAtualizado) {
        return response.status(404).json({ status: false, msg: 'Produto não encontrado.' });
      }
      return response.status(200).json({
        status: true,
        msg: 'Produto atualizado com sucesso!',
        produto: produtoAtualizado,
      });
    } catch (error) {
      return handleErrors(response, error);
    }
  }

  static async delete(request, response) {
    try {
      const { id } = request.params;
      const produtoDeletado = await Produto.findByIdAndDelete(id);
      if (!produtoDeletado) {
        return response.status(404).json({ status: false, msg: 'Produto não encontrado.' });
      }
      return response.status(200).json({ status: true, msg: 'Produto removido com sucesso!' });
    } catch (error) {
      return handleErrors(response, error);
    }
  }
};