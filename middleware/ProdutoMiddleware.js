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
  static validateUpdate(req, res, next) {
    const { nome, quantidade, precoMontagem, precoVenda } = req.body;

    // Em uma atualização, podemos validar se os campos enviados não estão vazios
    if (nome === '') {
        return res.status(400).json({ status: false, msg: 'O campo "nome" não pode ser vazio.' });
    }
    // E se os valores numéricos são válidos
    if (quantidade != null && isNaN(Number(quantidade))) {
        return res.status(400).json({ status: false, msg: 'O campo "quantidade" deve ser um número.' });
    }
    if (precoMontagem != null && isNaN(Number(precoMontagem))) {
        return res.status(400).json({ status: false, msg: 'O campo "precoMontagem" deve ser um número.' });
    }
    if (precoVenda != null && isNaN(Number(precoVenda))) {
        return res.status(400).json({ status: false, msg: 'O campo "precoVenda" deve ser um número.' });
    }

    // Se a validação passar, continua para o próximo passo (o controller)
    next();
  }
};