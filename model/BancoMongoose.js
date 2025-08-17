const mongoose = require('mongoose');

class BancoMongoose {
  constructor() {
    this.server = '127.0.0.1:27017';
    this.database = 'TCC';
    this.connection = null;
  }

  getConexao() {
    mongoose.connect(`mongodb://${this.server}/${this.database}`)
      .then(() => {
        console.log('Conexão com o Banco com sucesso');
        this.connection = mongoose.connection; 
      })
      .catch(err => {
        console.error('Conexão com o Banco não sucedida', err);
      });
  }
}

module.exports = BancoMongoose;