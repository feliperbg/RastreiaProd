// Importa a classe de modelo Componente
const Componente = require('../model/Componente');

// Exporta a classe controladora de componentes
module.exports = class ComponenteControl {
    
    // Método para criar um novo componente
    async create(request, response) {
        const dados = request.body.Componente;

        // Cria uma nova instância da classe Componente
        const componente = new Componente(
            dados.nome,
            dados.codigo,
            dados.descricao,
            dados.dataEntrada,
            dados.validade,
            dados.quantidade,
            dados.precoPagoLote,
            dados.precoUnidade,
            dados.dimensoes
        );

        // Chama o método create() da classe modelo
        const isCreated = await componente.create();

        // Retorna a resposta para o cliente
        response.status(200).send({
            cod: 1,
            status: isCreated,
            msg: isCreated ? 'Componente criado com sucesso!' : 'Erro ao criar componente'
        });
    }

    // Método para atualizar um componente existente
    async update(request, response) {
        const idComponente = request.params.id;
        const dados = request.body.Componente;

        // Cria uma nova instância da classe Componente
        const componente = new Componente(
            dados.nome,
            dados.codigo,
            dados.descricao,
            dados.dataEntrada,
            dados.validade,
            dados.quantidade,
            dados.precoPagoLote,
            dados.precoUnidade,
            dados.dimensoes
        );

        componente.idComponente = idComponente; // Define o ID do componente a ser atualizado

        // Chama o método update()
        const isUpdated = await componente.update();

        // Envia a resposta com o resultado
        response.status(200).send({
            cod: 1,
            status: isUpdated,
            msg: isUpdated ? 'Componente atualizado com sucesso!' : 'Erro ao atualizar componente'
        });
    }

    // Método para deletar um componente pelo ID
    async delete(request, response) {
        const idComponente = request.params.id;

        // Cria uma nova instância de Componente
        const componente = new Componente();
        componente.idComponente = idComponente;

        const isDeleted = await componente.delete();

        response.status(200).send({
            cod: 1,
            status: isDeleted,
            msg: isDeleted ? 'Componente excluído com sucesso!' : 'Erro ao excluir componente'
        });
    }

    // Método para buscar todos os componentes
    async readAll(request, response) {
        const componente = new Componente();

        const lista = await componente.readAll();

        response.status(200).send({
            cod: 1,
            status: true,
            msg: 'Consulta de componentes realizada com sucesso!',
            componentes: lista
        });
    }

    // Método para buscar um componente pelo ID
    async readByID(request, response) {
        const idComponente = request.params.id;

        const componente = new Componente();
        const resultado = await componente.readByID(idComponente);

        response.status(200).send({
            cod: 1,
            status: !!resultado,
            msg: resultado ? 'Componente encontrado' : 'Componente não encontrado',
            componente: resultado
        });
    }
}

