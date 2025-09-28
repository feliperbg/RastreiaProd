// Arquivo: seed.js (VERSÃO DEFINITIVA)
// Descrição: Script para popular o banco de dados com dados realistas e totalmente inter-relacionados.

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/pt_BR');

// Importe todos os seus models
const Componente = require('./model/Componente');
const Produto = require('./model/Produto');
const Departamento = require('./model/Departamento');
const OrdemProducao = require('./model/OrdemProducao');
const Motivo = require('./model/Motivo');
const Funcionario = require('./model/Funcionario');
const Etapa = require('./model/Etapa');

// --- CONFIGURAÇÃO ---
const MONGO_URI = 'mongodb://localhost:27017/teste';
const NUM_COMPONENTES = 5;
const NUM_FUNCIONARIOS = 5;
const NUM_PRODUTOS = 5;
const NUM_ORDENS_PRODUCAO = 10;

// Função principal assíncrona
const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado ao MongoDB.');

        console.log('🧹 Limpando o banco de dados...');
        await Promise.all([
            Departamento.deleteMany(), Motivo.deleteMany(), Componente.deleteMany(),
            Funcionario.deleteMany(), Produto.deleteMany(), Etapa.deleteMany(), OrdemProducao.deleteMany(),
        ]);
        console.log('🗑️ Banco de dados limpo.');

        // --- GERAÇÃO DE DADOS BASE ---

        console.log('🏢 Gerando Departamentos...');
        const departamentos = await Departamento.insertMany([
            { nome: 'Montagem', descricao: 'Responsável pela montagem dos produtos.' },
            { nome: 'Controle de Qualidade', descricao: 'Garante a qualidade e conformidade.' },
            { nome: 'Logística', descricao: 'Gerencia estoque e expedição.' },
            { nome: 'Manutenção', descricao: 'Manutenção de equipamentos.' },
            { nome: 'Engenharia de Produção', descricao: 'Planejamento e otimização da produção.' },
        ]);
        console.log(`👍 ${departamentos.length} Departamentos criados.`);

        console.log('📋 Gerando Motivos...');
        const motivos = await Motivo.insertMany([
            { descricao: 'Falta de material', tipo: 'PAUSA' }, { descricao: 'Pausa para almoço', tipo: 'PAUSA' },
            { descricao: 'Pedido do cliente cancelado', tipo: 'CANCELAMENTO' }, { descricao: 'Erro na especificação', tipo: 'CANCELAMENTO' },
            { descricao: 'Peça danificada', tipo: 'REFUGO' }, { descricao: 'Falha no teste de qualidade', tipo: 'REFUGO' },
        ]);
        const motivosCancelamento = motivos.filter(m => m.tipo === 'CANCELAMENTO');
        console.log(`👍 ${motivos.length} Motivos criados.`);

        console.log('🔩 Gerando Componentes...');
        const componentes = await Componente.insertMany(
            Array.from({ length: NUM_COMPONENTES }, () => ({
                nome: faker.commerce.productName(),
                codigo: `COMP-${faker.string.alphanumeric(8).toUpperCase()}`,
                descricao: faker.commerce.productDescription(),
                quantidade: faker.number.int({ min: 100, max: 5000 }),
                Lote: faker.string.alphanumeric(10).toUpperCase(),
                precoUnidade: faker.commerce.price({ min: 1, max: 200, dec: 2 }),
            }))
        );
        console.log(`👍 ${componentes.length} Componentes criados.`);

        // --- GERAÇÃO COM RELACIONAMENTOS ---

        console.log('👥 Gerando Funcionários...');
        const funcionariosData = Array.from({ length: NUM_FUNCIONARIOS }, () => ({
            nome: faker.person.fullName(),
            CPF: faker.string.numeric(11),
            email: faker.internet.email({ provider: 'produsys.local' }),
            senha: 'password123',
            departamento: faker.helpers.arrayElement(departamentos)._id,
            valor_hora: faker.number.int({ min: 15, max: 50 }),
            role: faker.helpers.arrayElement(['Operador', 'Supervisor', 'Gerente']),
        }));
        const funcionarios = await Funcionario.create(funcionariosData);
        console.log(`👍 ${funcionarios.length} Funcionários criados.`);
        
        const funcsPorDepto = funcionarios.reduce((acc, func) => {
            const deptoId = func.departamento.toString();
            if (!acc[deptoId]) acc[deptoId] = [];
            acc[deptoId].push(func);
            return acc;
        }, {});
        

        console.log('📦 Gerando Produtos...');
        const produtosData = Array.from({ length: NUM_PRODUTOS }, () => ({
            nome: faker.commerce.productName(),
            codigo: `PROD-${faker.string.alphanumeric(6).toUpperCase()}`,
            descricao: faker.commerce.productAdjective(),
            quantidade: faker.number.int({ min: 50, max: 200 }),
            precoMontagem: faker.commerce.price({ min: 50, max: 300 }),
            precoVenda: faker.commerce.price({ min: 500, max: 3000 }),
            componentesNecessarios: faker.helpers.arrayElements(componentes, { min: 3, max: 8 })
                .map(comp => ({ componente: comp._id, quantidade: faker.number.int({ min: 1, max: 5 }) })),
            tempo_ciclo_ideal_segundos: faker.number.int({ min: 30, max: 300 }),
        }));
        // CORREÇÃO: Usar .create para garantir a validação das referências de componentes
        const produtos = await Produto.create(produtosData);
        console.log(`👍 ${produtos.length} Produtos criados.`);

        console.log('📝 Gerando Etapas de Produção...');
        const etapasPorProduto = new Map();
        for (const produto of produtos) {
            const etapasDoProdutoData = Array.from({ length: faker.number.int({ min: 3, max: 5 }) }, (_, i) => {
                const deptoResponsavel = faker.helpers.arrayElement(departamentos);
                const funcionariosDoDepto = funcsPorDepto[deptoResponsavel._id.toString()] || [];
                return {
                    produto: produto._id,
                    nome: `Etapa ${i + 1} - ${produto.nome.substring(0, 15)}`,
                    sequencias: i + 1,
                    departamentoResponsavel: deptoResponsavel._id,
                    funcionariosResponsaveis: faker.helpers.arrayElements(funcionariosDoDepto, { min: 1, max: 2 }).map(f => f._id),
                };
            });
            const etapasCriadas = await Etapa.insertMany(etapasDoProdutoData);
            etapasPorProduto.set(produto._id.toString(), etapasCriadas);
        }
        console.log(`👍 Etapas para todos os produtos foram criadas.`);

        console.log('🏭 Gerando Ordens de Produção (uma por uma para máxima confiabilidade)...');
        let opsCriadasCount = 0;
        for (let i = 0; i < NUM_ORDENS_PRODUCAO; i++) {
            const produto = faker.helpers.arrayElement(produtos);
            const etapasDoProduto = etapasPorProduto.get(produto._id.toString());

            if (!etapasDoProduto || etapasDoProduto.length === 0) continue;

            const opData = {
                produto: produto._id,
                quantidade: faker.number.int({ min: 20, max: 200 }),
                dataEntrega: faker.date.future({ years: 0.5 }),
                criadoPor: faker.helpers.arrayElement(funcionarios)._id,
                funcionarioAtivo: [{
                    funcionario: faker.helpers.arrayElement(funcionarios)._id,
                    dataEntrada: new Date(),
                }],
            };

            if (i < NUM_ORDENS_PRODUCAO * 0.4) {
                opData.status = 'Concluída';
                opData.quantidade_refugo = faker.number.int({ min: 0, max: Math.floor(opData.quantidade * 0.1) });
                const inicioProducao = faker.date.recent({ days: 30 });
                let timestampAtual = new Date(inicioProducao.getTime());
                opData.historicoEtapas = etapasDoProduto.map(etapa => {
                    const duracaoEtapaMs = faker.number.int({ min: 30, max: 120 }) * 1000 * (opData.quantidade / 20);
                    const dataInicio = new Date(timestampAtual.getTime());
                    const dataFim = new Date(dataInicio.getTime() + duracaoEtapaMs);
                    timestampAtual = new Date(dataFim.getTime() + faker.number.int({ min: 1, max: 5 }) * 60000);
                    return { etapa: etapa._id, status: 'Concluída', dataInicio, dataFim };
                });
                opData.timestampProducao = { inicio: inicioProducao, fim: timestampAtual };
            } else if (i < NUM_ORDENS_PRODUCAO * 0.6) {
                opData.status = 'Em Andamento';
                const inicioProducao = faker.date.recent({ days: 2 });
                opData.timestampProducao = { inicio: inicioProducao };
                opData.historicoEtapas = [{ etapa: etapasDoProduto[0]._id, status: 'Em Andamento', dataInicio: inicioProducao }];
            } else if (i < NUM_ORDENS_PRODUCAO * 0.8) {
                opData.status = 'Cancelada';
                opData.motivoCancelamento = faker.helpers.arrayElement(motivosCancelamento)._id;
            } else {
                opData.status = 'Pendente';
            }
            
            // CORREÇÃO: Criar OPs uma por uma dentro do loop
            await OrdemProducao.create(opData);
            opsCriadasCount++;
        }
        console.log(`👍 ${opsCriadasCount} Ordens de Produção criadas.`);

        console.log('\n🎉 Processo de povoamento concluído com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao popular o banco de dados:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Conexão com o MongoDB fechada.');
    }
};

seedDatabase();