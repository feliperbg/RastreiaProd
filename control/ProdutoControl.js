const Produto = require('../model/Produto');

module.exports = class ProdutoControl {
  async create(request, response) {
    try {
      const {
        nome,
        codigo,
        descricao,
        dataEntrada,
        dataValidade,
        componentesNecessarios,
        precoMontagem,
        precoVenda,
        quantidade,
        etapas,
      } = request.body.produto;

      const novoProduto = new Produto(
        nome,
        codigo,
        descricao,
        dataEntrada,
        dataValidade || null,
        componentesNecessarios || [],
        precoMontagem,
        precoVenda,
        quantidade || 1,
        etapas || [],
      );

      const criado = await novoProduto.create();

      if (criado) {
        return response.status(201).json({ status: true, msg: 'Produto criado' });
      } else {
        return response.status(500).json({ status: false, msg: 'Erro ao criar' });
      }
    } catch (error) {
      console.error(error);
      return response.status(500).json({ status: false, msg: 'Erro interno' });
    }
  }

  async readAll(request, response) {
    try {
      const produto = new Produto();
      const produtos = await produto.readAll();
      return response.status(200).json({ status: true, produtos });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ status: false, msg: 'Erro ao listar' });
    }
  }

  async readByID(request, response) {
    try {
      const { id } = request.params;
      const produto = new Produto();
      const encontrado = await produto.readByID(id);

      if (encontrado) {
        return response.status(200).json({ status: true, produto: encontrado });
      } else {
        return response.status(404).json({ status: false, msg: 'Produto não encontrado' });
      }
    } catch (error) {
      console.error(error);
      return response.status(500).json({ status: false, msg: 'Erro ao buscar' });
    }
  }

  async update(request, response) {
    try {
      const { id } = request.params;
      const dadosAtualizacao = request.body;

      if (!id) {
        return response.status(400).json({ status: false, msg: 'ID do produto não fornecido' });
      }

      // Cria instância do produto com dados atualizados
      const produto = new Produto(
        dadosAtualizacao.nome,
        dadosAtualizacao.codigo,
        dadosAtualizacao.descricao,
        dadosAtualizacao.dataEntrada,
        dadosAtualizacao.dataValidade ? dadosAtualizacao.dataValidade : null,
        dadosAtualizacao.componentesNecessarios || [],
        dadosAtualizacao.precoMontagem,
        dadosAtualizacao.precoVenda,
        dadosAtualizacao.quantidade || 1,
        dadosAtualizacao.etapas || []
      );

      produto._idProduto = id;

      const atualizado = await produto.update();

      if (atualizado) {
        return response.status(200).json({ status: true, msg: 'Atualizado com sucesso', produto: produto });
      } else {
        return response.status(404).json({ status: false, msg: 'Produto não encontrado ou erro ao atualizar' });
      }
    } catch (error) {
      console.error(error);
      return response.status(500).json({ status: false, msg: 'Erro interno' });
    }
  }


  async delete(request, response) {
    try {
      const { id } = request.params;
      const produto = new Produto();
      produto._idProduto = id;

      const deletado = await produto.delete();

      if (deletado) {
        return response.status(200).json({ status: true, msg: 'Produto removido' });
      } else {
        return response.status(404).json({ status: false, msg: 'Produto não encontrado' });
      }
    } catch (error) {
      console.error(error);
      return response.status(500).json({ status: false, msg: 'Erro ao remover' });
    }
  }
};