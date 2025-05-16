// Importa a classe de modelo OrdemProducaoClasse
const OrdemProducaoClasse = require('../model/OrdemProducao');

// Exporta a classe controladora de ordens de produção
module.exports = class OrdemProducaoControl {

    // Método para criar uma nova ordem de produção
    async create(request, response) {
        const dados = request.body.OrdemProducao;

        // Cria uma nova instância da classe OrdemProducaoClasse
        const ordem = new OrdemProducaoClasse(
            dados.status,
            dados.produto,
            dados.etapa,
            dados.funcionarioAtivo,
            dados.timestampProducao
        );

        // Chama o método create()
        const isCreated = await ordem.create();

        response.status(200).send({
            cod: 1,
            status: isCreated,
            msg: isCreated ? 'Ordem de produção criada com sucesso!' : 'Erro ao criar ordem de produção'
        });
    }

    // Método para atualizar uma ordem de produção existente
    async update(request, response) {
        const idOrdem = request.params.id;
        const dados = request.body.OrdemProducao;

        const ordem = new OrdemProducaoClasse(
            dados.status,
            dados.produto,
            dados.etapa,
            dados.funcionarioAtivo,
            dados.timestampProducao
        );

        ordem.idOrdem = idOrdem;

        const isUpdated = await ordem.update();

        response.status(200).send({
            cod: 1,
            status: isUpdated,
            msg: isUpdated ? 'Ordem de produção atualizada com sucesso!' : 'Erro ao atualizar ordem de produção'
        });
    }

    // Método para deletar uma ordem de produção
    async delete(request, response) {
        const idOrdem = request.params.id;

        const ordem = new OrdemProducaoClasse();
        ordem.idOrdem = idOrdem;

        const isDeleted = await ordem.delete();

        response.status(200).send({
            cod: 1,
            status: isDeleted,
            msg: isDeleted ? 'Ordem de produção excluída com sucesso!' : 'Erro ao excluir ordem de produção'
        });
    }

    // Método para buscar todas as ordens de produção
    async readAll(request, response) {
        const ordem = new OrdemProducaoClasse();

        const lista = await ordem.readAll();

        response.status(200).send({
            cod: 1,
            status: true,
            msg: 'Consulta de ordens de produção realizada com sucesso!',
            ordens: lista
        });
    }

    // Método para buscar uma ordem de produção pelo ID
    async readByID(request, response) {
        const idOrdem = request.params.id;

        const ordem = new OrdemProducaoClasse();
        const resultado = await ordem.readByID(idOrdem);

        response.status(200).send({
            cod: 1,
            status: !!resultado,
            msg: resultado ? 'Ordem de produção encontrada' : 'Ordem de produção não encontrada',
            ordem: resultado
        });
    }
};
