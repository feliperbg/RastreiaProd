const BancoMongoose = require('./model/BancoMongoose');
const Funcionario = require("./model/Funcionario");

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
            console.log('ID do Funcionário:', funcionarioTeste.idFuncionario); // Correção: funcionarioTeste ao invés de funcionario
        } else {
            console.log('Erro ao criar o funcionário.');
        }
    } catch (error) {
        console.error('Erro durante a criação do funcionário:', error);
    }
}

//teste para consultar todos os funcionários
async function consultarFuncionarios() {
    const funcionario = new Funcionario();
    try {
        const funcionarios = await funcionario.readAll();
        console.log('Funcionários encontrados:', funcionarios);
    } catch (error) {
        console.error('Erro ao consultar funcionários:', error);
    }
}

async function consultarFuncionariosPelaCredencial() {
  const funcionario = new Funcionario();
  try {
      const funcionarios = await funcionario.readByID("680ae90f9c0db36cd2e838e9");
      console.log('Funcionários encontrados:', funcionarios);
  } catch (error) {
      console.error('Erro ao consultar funcionários:', error);
  }
}

async function deletarFuncionario() {
  const funcionario = new Funcionario();
  try {
    funcionario.idFuncionario = '67c8e18023889a6fd7cd9de6';
    const deletado = await funcionario.delete();
    console.log('Funcionário deletado:', deletado);
  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);
  }
}

// Executa os testes em sequência
async function main() {
    await criarFuncionario(); // Cria um funcionário
    // await consultarFuncionarios(); // Consulta todos os funcionários
    // await consultarFuncionariosPelaCredencial();
}

main().catch(err => console.error('Erro durante a execução:', err));
