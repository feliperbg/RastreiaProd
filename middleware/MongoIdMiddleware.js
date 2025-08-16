// Arquivo: middleware/MongoIdMiddleware.js

const mongoose = require('mongoose');

module.exports = class MongoIdMiddleware {
  static validate(req, res, next) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, msg: 'O ID fornecido é inválido.' });
    }
    next();
  }
};