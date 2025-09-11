// Arquivo: model/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

class BancoMongoose {
  constructor() {
    this.server = process.env.DB_SERVER;
    this.database = process.env.DB_DATABASE;
  }

  /**
   * Inicia a conexão com o banco de dados de forma assíncrona.
   * Retorna uma promessa que é resolvida quando a conexão é bem-sucedida.
   */
  async connect() {
    // Evita múltiplas conexões desnecessárias
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Conexão com o banco já existe.');
      return;
    }

    try {
      await mongoose.connect(`mongodb://${this.server}/${this.database}`);
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao conectar com o banco de dados:', err);
      process.exit(1);
    }
  }

  /**
   * Fecha a conexão com o banco de dados. Útil para testes ou shutdown gracioso.
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('🔌 Conexão com o banco de dados fechada.');
    } catch (err) {
      console.error('❌ Erro ao fechar a conexão com o banco:', err);
    }
  }
}
module.exports = new BancoMongoose();