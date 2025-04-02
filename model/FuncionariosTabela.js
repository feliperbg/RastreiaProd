const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const FuncionariosTabela = new Schema({
	nome: {
		type: String,
		required: true,
	},
	turno: {
		type: String,
		required: true,
	},
	senha: {
		type: String,
		required: true,
	},
	CPF: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	telefone: {
		type: String,
		required: true,
	},
	credencial: {
		type: String,
		required: true,
	},
	dataNascimento: {
		type: Date,
		required: true,
	},
	permissoes:[{
		type: String, 
		required: true,
	}]
});

const Funcionarios = model('Funcionarios', FuncionariosTabela);
module.exports = Funcionarios;

	