const Produto = require('../model/Produto'); // Sua classe com o método create()
const BancoMongoose = require('../model/BancoMongoose');

Banco = new BancoMongoose;

let idCriado = null;

async function testarCreateProduto() {
    const produto = new Produto(
        null,  // O MongoDB vai gerar automaticamente o ID se for null
        'Mouse Gamer X7',
        'MGX7',
        'Mouse ergonômico com 7 botões e luz RGB',
        new Date('2025-04-01'),
        new Date('2026-04-01'),
        ['680f59cf5acf820674137795'],  // Referência para o componente
        50,
        2500,
        { comprimento: 20, largura: 10, altura: 5 },
        100,
        ['Montagem', 'Teste de Qualidade']
    );

    const sucesso = await produto.create();

    if (sucesso) {
        console.log("✅ Produto criado com sucesso!");
        console.log("🆔 ID do Produto:", produto.idProduto);
        idCriado = produto.idProduto;
    } else {
        console.log("❌ Falha ao criar o produto.");
    }
}

testarCreateProduto().catch(err => console.error('Erro durante o teste de criação:', err));
