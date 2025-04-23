const Componentes = require('./model/Componentes');  // Caminho correto do modelo de componentes

// Função para criar um novo componente
async function criarComponente() {
    const componente = new Componentes();

    // Definindo atributos do componente
    componente.nome = "Resistor 220Ω";
    componente.codigo = "R220";
    componente.descricao = "Resistor de 220 ohms para circuitos eletrônicos";
    componente.dataEntrada = new Date("2025-04-01");
    componente.validade = new Date("2027-04-01");
    componente.quantidade = 1000;
    componente.precoPagoLote = 150.00;
    componente.precoUnidade = 0.15;
    componente.dimensoes = "2x1x1 cm";

    try {
        const criado = await componente.create();
        if (criado) {
            console.log('Componente criado com sucesso!');
            console.log('ID do Componente:', componente.idComponente);
        } else {
            console.log('Erro ao criar o componente.');
        }
    } catch (error) {
        console.error('Erro durante a criação do componente:', error);
    }
}

// Função para consultar todos os componentes
async function consultarComponentes() {
    const componente = new Componentes();
    try {
        const componentes = await componente.readAll();
        console.log('Componentes encontrados:', componentes);
    } catch (error) {
        console.error('Erro ao consultar componentes:', error);
    }
}

// Função para consultar componente por ID
async function consultarComponentePeloID() {
    const componente = new Componentes();
    try {
        const resultado = await componente.readByID('id_do_componente');  // Substitua pelo ID do componente
        console.log('Componente encontrado:', resultado);
    } catch (error) {
        console.error('Erro ao consultar componente:', error);
    }
}

// Função para deletar um componente
async function deletarComponente() {
    const componente = new Componentes();
    try {
        componente.idComponente = 'id_do_componente';  // Substitua pelo ID do componente a ser excluído
        const deletado = await componente.delete();
        console.log('Componente deletado:', deletado);
    } catch (error) {
        console.error('Erro ao deletar componente:', error);
    }
}

// Executa os testes em sequência
async function main() {
    await criarComponente(); // Cria um componente
    await consultarComponentes(); // Consulta todos os componentes
    await consultarComponentePeloID(); // Consulta um componente pelo ID
    await deletarComponente(); // Deleta um componente
}

main().catch(err => console.error('Erro durante a execução:', err));
