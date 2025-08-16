
const Componente = require('../model/Componente'); // Sua classe que implementa os métodos
const BancoMongoose = require('../model/BancoMongoose')

Banco = new BancoMongoose;

// Conexão com o banco de dados (ajuste se estiver usando .env)
// ID salvo para testes de leitura/remoção
let idCriado = null;

// Função para criar um novo componente
async function criarComponente() {
    const componente = new Componente(
        null,
        "Resistor 222Ω",
        "R222",
        "Resistor de 220 ohms para circuitos eletrônicos",
        new Date("2025-04-01"),
        new Date("2025-04-02"),
        1000,
        150.00,
        0.15,
    )

    const criado = await componente.create();
    if (criado) {
        idCriado = componente.idComponente;
        console.log('✅ Componente criado com sucesso!');
        console.log('🆔 ID do Componente:', idCriado);
    } else {
        console.log('❌ Erro ao criar o componente.');
    }
}

// Função para consultar todos os componentes
async function consultarComponentes() {
    const componente = new Componente();
    const componentes = await componente.readAll();
    console.log('📦 Componentes encontrados:', componentes);
}

// Função para consultar componente por ID
async function consultarComponentePeloID() {
    if (!idCriado) {
        console.warn('⚠️ ID não disponível. Crie um componente primeiro.');
        return;
    }

    const componente = new Componente();
    const resultado = await componente.readByID(idCriado);
    console.log('🔍 Componente encontrado:', resultado);
}

// Função para deletar um componente
async function deletarComponente() {
    if (!idCriado) {
        console.warn('⚠️ ID não disponível. Crie um componente primeiro.');
        return;
    }

    const componente = new Componente();
    componente.idComponente = idCriado;
    const deletado = await componente.delete();
    console.log(deletado ? '🗑️ Componente deletado com sucesso!' : '❌ Erro ao deletar componente.');
}

// Executa os testes em sequência
async function main() {
    await criarComponente();
    await consultarComponentes();
    await consultarComponentePeloID();
    //await deletarComponente();
}

main().catch(err => console.error('Erro durante a execução:', err));
