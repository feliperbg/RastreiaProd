// Arquivo: model/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

class BancoMongoose {
  constructor() {
    // Carrega todas as variáveis de ambiente necessárias
    this.user = process.env.DB_USER;
    this.pass = process.env.DB_PASS;
    this.cluster = process.env.DB_CLUSTER;
    this.database = process.env.DB_DATABASE;

    // Constrói a URI de conexão completa
    if(process.env.MONGO_URI_ATLAS){
      this.connectionString = process.env.MONGO_URI;
    }else{
      this.connectionString = `mongodb+srv://${this.user}:${this.pass}@${this.cluster}/${this.database}?retryWrites=true&w=majority`;
    }
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

    // Validação para garantir que as variáveis de ambiente foram carregadas
    if (!this.user || !this.pass || !this.cluster || !this.database) {
      console.error('❌ Erro: Variáveis de ambiente do banco de dados (DB_USER, DB_PASS, DB_CLUSTER, DB_DATABASE) não foram definidas. Verifique seu arquivo .env.');
      process.exit(1);
    }

    try {
      await mongoose.connect(this.connectionString);
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    } catch (err) {
      // Log de erro mais detalhado
      if (err.name === 'MongoAuthenticationError') {
        console.error('❌ Erro de autenticação: Usuário ou senha incorretos. Verifique suas credenciais no arquivo .env.');
      } else {
        console.error('❌ Erro ao conectar com o banco de dados:', err.message);
      }
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