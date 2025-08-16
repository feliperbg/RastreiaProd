const BancoMongoose = require('../model/BancoMongoose');
const Funcionario = require("../model/Funcionario");

// Conecta ao banco de dados MongoDB
const Banco = new BancoMongoose();

//teste para criar um funcionário
async function criarFuncionario() {
    const funcionarioTeste = new Funcionario(
        "João Silva", // Nome
        "Manhã", // Turno
        "senha1234", // Senha
        "123.456.789-00", // CPF
        "joao.silva@example.com", // Email
        "(11) 98765-4321", // Telefone
        new Date("1990-01-01"), // Data de nascimento
        ["gerente"], // Permissões
        "Gerente", // Role
    );
    try { 
        const criado = await funcionarioTeste.create();
        if (criado) {
            console.log('Funcionário criado com sucesso!');
            console.log('ID do Funcionário:', funcionarioTeste.idFuncionario); 
            console.log("Credencial do funcioanrio: ", funcionarioTeste.credencial);// Correção: funcionarioTeste ao invés de funcionario
        } else {
            console.log('Erro ao criar o funcionário.');
        }
    } catch (error) {
        console.error('Erro durante a criação do funcionário:', error);
    }
}
criarFuncionario();