// Arquivo: control/ProdutoControl.js
const Produto = require('../model/Produto');

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
      return response.status(400).json({ status: false, msg: error.message });
    }
  }

  static async readAll(request, response) {
    try {
      const produtos = await Produto.find().sort('nome').populate('componentesNecessarios.componente').populate('etapas');
      return response.status(200).json({ status: true, produtos });
    } catch (error) {
      return response.status(500).json({ status: false, msg: 'Erro ao listar produtos.' });
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
      return response.status(500).json({ status: false, msg: 'Erro ao buscar produto.' });
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
      return response.status(400).json({ status: false, msg: error.message });
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
      return response.status(500).json({ status: false, msg: 'Erro ao remover produto.' });
    }
  }
};