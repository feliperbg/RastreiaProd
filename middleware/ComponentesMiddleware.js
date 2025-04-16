// Importa a classe Componente para utilizar os métodos e verificações
const Componente = require('../model/Componente');

// Exporta a classe ComponenteMiddleware
module.exports = class ComponenteMiddleware {

    // Valida se o nome do componente tem pelo menos 3 caracteres
    async validar_NomeComponente(request, response, next) {
        const nome = request.body.componente?.nome;

        if (!nome || nome.length < 3) {
            return response.status(400).send({
                status: false,
                msg: "O nome do componente deve ter no mínimo 3 letras."
            });
        }

        next();
    }

    // Valida se o código do componente está presente e tem pelo menos 2 caracteres
    async validar_CodigoComponente(request, response, next) {
        const codigo = request.body.componente?.codigo;

        if (!codigo || codigo.length < 2) {
            return response.status(400).send({
                status: false,
                msg: "O código do componente é obrigatório e deve ter no mínimo 2 caracteres."
            });
        }

        next();
    }

    // Verifica se o código do componente já existe no banco de dados
    async isNot_componenteByCodigo(request, response, next) {
        const codigo = request.body.componente?.codigo;

        const objComponente = new Componente();
        objComponente.codigo = codigo;

        const componentes = await objComponente.readAll();
        const existe = componentes.some(c => c.codigo === codigo);

        if (existe) {
            return response.status(400).send({
                status: false,
                msg: "Já existe um componente com esse código."
            });
        }

        next();
    }

    // Verifica se a quantidade é um número válido e positivo
    async validar_Quantidade(request, response, next) {
        const quantidade = request.body.componente?.quantidade;

        if (quantidade === undefined || isNaN(quantidade) || quantidade < 0) {
            return response.status(400).send({
                status: false,
                msg: "Quantidade inválida. Deve ser um número positivo."
            });
        }

        next();
    }

    // Verifica se o preço unitário é um número válido e positivo
    async validar_PrecoUnidade(request, response, next) {
        const precoUnidade = request.body.componente?.precoUnidade;

        if (precoUnidade === undefined || isNaN(precoUnidade) || precoUnidade < 0) {
            return response.status(400).send({
                status: false,
                msg: "Preço por unidade inválido. Deve ser um número positivo."
            });
        }

        next();
    }

    // Valida se a data de entrada é uma data válida
    async validar_DataEntrada(request, response, next) {
        const dataEntrada = new Date(request.body.componente?.dataEntrada);

        if (isNaN(dataEntrada.getTime())) {
            return response.status(400).send({
                status: false,
                msg: "Data de entrada inválida."
            });
        }

        next();
    }
};
