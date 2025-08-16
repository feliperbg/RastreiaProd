// Arquivo: control/ProdutoControl.js

// Importa o modelo Mongoose refatorado
const Produto = require('../model/Produto');

// Usamos uma classe com métodos estáticos, não precisando instanciar o controller no router
module.exports = class ProdutoController {
  
  static async create(request, response) {
    try {
      // O corpo da requisição já contém os dados validados pelo middleware
      const produtoCriado = await Produto.create(request.body);

      return response.status(201).json({
        status: true,
        msg: 'Produto criado com sucesso!',
        produto: produtoCriado,
      });

    } catch (error) {
      // Erros de validação do Mongoose (ex: código duplicado) serão capturados aqui
      return response.status(400).json({ status: false, msg: error.message });
    }
  }

  static async readAll(request, response) {
    try {
      const produtos = await Produto.find().sort('nome');
      return response.status(200).json({ status: true, produtos });
    } catch (error) {
      return response.status(500).json({ status: false, msg: 'Erro ao listar produtos.' });
    }
  }

  static async readByID(request, response) {
    try {
      const { id } = request.params;
      
      // Usa .populate para carregar os dados dos componentes e etapas, não apenas os IDs
      const produto = await Produto.findById(id)
        .populate('componentesNecessarios.componente', 'nome codigo') // Popula nome e código do componente
        .populate('etapas', 'nome'); // Popula o nome da etapa

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

      // Encontra e atualiza. { new: true } retorna o documento já atualizado.
      const produtoAtualizado = await Produto.findByIdAndUpdate(id, dadosAtualizacao, {
        new: true, // Retorna o documento modificado
        runValidators: true, // Força a execução das validações do schema na atualização
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