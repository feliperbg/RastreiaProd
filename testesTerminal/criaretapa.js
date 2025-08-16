const BancoMongoose = require('../model/BancoMongoose');
const Etapa = require("../model/Etapa");

// Conecta ao banco de dados MongoDB
const Banco = new BancoMongoose();

//teste para criar um funcionário
async function criarEtapa() {
        const etapa = new Etapa(
            "Montagem", // Nome
            ["Montar peça A", "Montar peça B"], // Sequências
            "Departamento de Montagem", // Departamento responsável
            ["Verificar qualidade", "Testar funcionamento"], // Procedimentos
            ["680f59cf5acf820674137795"], // Componentes de conclusão
            ["680ae90f9c0db36cd2e838e9", "682483e66e0e03bb87aceae8"] // Funcionários responsáveis
    );
    try {
        const criado = await etapa.create();
        if (criado) {
            console.log('Etapa criada com sucesso!');
            console.log('ID da Etapa:', etapa.idEtapa);
            console.log("Descrição da etapa: ", etapa.descricao);
        } else {
            console.log('Erro ao criar a etapa.');
        }
    } catch (error) {
        console.error('Erro durante a criação da etapa:', error);
    }
}
criarEtapa();
