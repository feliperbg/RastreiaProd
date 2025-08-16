// Arquivo: middleware/ProdutoMiddleware.js

module.exports = class ProdutoMiddleware {
  static validateCreate(req, res, next) {
    const { nome, codigo, quantidade, precoMontagem, precoVenda } = req.body;

    if (!nome || !codigo || quantidade == null || precoMontagem == null || precoVenda == null) {
      let camposFaltando = [];
      if (!nome) camposFaltando.push('nome');
      if (!codigo) camposFaltando.push('codigo');
      if (quantidade == null) camposFaltando.push('quantidade');
      if (precoMontagem == null) camposFaltando.push('precoMontagem');
      if (precoVenda == null) camposFaltando.push('precoVenda');

      return res.status(400).json({
        status: false,
        msg: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}.`
      });
    }
    next();
  }
};