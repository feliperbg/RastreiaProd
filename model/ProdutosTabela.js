const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const produtoTabela = new Schema({
	nome: {
		type: String,
		required: true,
	},
	codigo: { 
		type: String,
		required: true,
		unique: true,
	},
	descricao: { 
		type: String,
		required: true,
	},
	dataEntrada: {
		type: Date,
		required: true,
		default: Date.now,
	},
	validade: {
		type: Date,
		required: true,
	},
	precoMontagem: {
		type: Number,
		required: true,
	},
	precoVenda: {
		type: Number,
		required: true,
	},
	dimensoes: {
		comprimento: {
			type: Number,
			required: true,
		},
        largura: {
			type: Number,
			required: true,
		}, 
		altura: {
			type: Number,
			required: true,
		},       
	},
	quantidade: {
		type: Number,
		required: true,
	},
	etapas: [{
        type: Schema.Types.ObjectId,
        ref: 'etapas',
        required: true,
    }],
});

const Produtos = model('Produtos', produtoTabela); 
module.exports = Produtos; 
