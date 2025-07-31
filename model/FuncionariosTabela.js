const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema, model } = mongoose;

const FuncionariosTabela = new Schema({
	nome: { type: String, required: true },
	turno: { type: String, required: true },
	senha: { type: String, required: true },
	CPF: { type: String, required: true },
	email: { type: String, required: true },
	telefone: { type: String, required: true },
	credencial: { type: Number, unique: true },
	dataNascimento: { type: String, required: true },
	permissoes: [{ type: String, required: true }],
	role: { type: String, required: true, default: 'funcionario' },
	imagemFuncionario: { type: String, default: '/imagens/funcionario/default.png' }
});

FuncionariosTabela.plugin(AutoIncrement, { inc_field: 'credencial', start_seq: 1 });

const Funcionarios = model('Funcionarios', FuncionariosTabela);
module.exports = Funcionarios;
