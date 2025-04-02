const { MongoClient } = require('mongodb');

class Banco {
    // Propriedades estáticas para armazenar informações de conexão com o banco de dados
    static HOST = '127.0.0.1';
    static PORT = 27017;
    static DB = 'TCC';
    static CONEXAO = null;
    static CLIENTE = null;

    // Método privado para estabelecer uma conexão com o banco de dados
    static async conectar() {
        if (Banco.CONEXAO === null) {
            try {
                Banco.CLIENTE = new MongoClient(`mongodb://${Banco.HOST}:${Banco.PORT}`);
                await Banco.CLIENTE.connect();
                Banco.CONEXAO = Banco.CLIENTE.db(Banco.DB);
                console.log("Conectado ao MongoDB com sucesso!");
            } catch (err) {
                const objResposta = {
                    cod: 1,
                    msg: "Erro ao conectar no banco",
                    erro: err.message
                };
                console.error(JSON.stringify(objResposta));
            }
        }
    }
    // Método público para obter a conexão com o banco de dados
    static async getConexao() {
        if (Banco.CONEXAO === null) {
            await Banco.conectar();
        }
        return Banco.CONEXAO;
    }
}

module.exports = Banco;