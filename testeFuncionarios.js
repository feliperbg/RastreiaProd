const BancoMongoose = require('./model/BancoMongoose');
const Funcionario = require("./model/Funcionario");

// Conecta ao banco de dados MongoDB
const Banco = new BancoMongoose();

//teste para criar um funcionário
async function criarFuncionario() {
    const funcionario = new Funcionario();

    // Define os atributos do funcionário
    funcionario.nome = "deepseek";
    funcionario.turno = "Manhã";
    funcionario.senha = "senha1234";
    funcionario.CPF = "123.456.789-00";
    funcionario.email = "joao.silva@example.com";
    funcionario.telefone = "(11) 98765-4321";
    funcionario.dataNascimento = new Date("1990-01-01");
    funcionario.permissoes = ["gerente"];
    funcionario.imagemFuncionario = "./public/imagens/funcionarios/me.jpg";

    try {
        const criado = await funcionario.create();
        if (criado) {
            console.log('Funcionário criado com sucesso!');
            console.log('ID do Funcionário:', funcionario.idFuncionario);
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
      const funcionarios = await funcionario.isFuncionarioByCredencial("12345");
      console.log('Funcionários encontrados:', funcionarios);
  } catch (error) {
      console.error('Erro ao consultar funcionários:', error);
  }
}
async function deletarFuncionario(){
  const funcionario = new Funcionario();
  try{
    funcionario.idFuncionario = '67c8e18023889a6fd7cd9de6';
    const deletado = await funcionario.delete();
    console.log('Funcionários deletado:', deletado);
  }catch(error){
    console.error('Erro ao deletar funcionários:', error);
  }
}
// Executa os testes em sequência
async function main() {
    await criarFuncionario(); // Cria um funcionário
   // await consultarFuncionarios(); // Consulta todos os funcionários
    //await consultarFuncionariosPelaCredencial();
}

main().catch(err => console.error('Erro durante a execução:', err));