const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ComponentesTabela = new Schema({
	nome:{
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
		type: String,
		required: true,
	},
	dataValidade: {
		type: String,
		required: true,
	},
	quantidade: {
		type: Number,
		required: true,
	},
	precoPagoLote: {
		type: Number,
		required: true,
	},
	precoUnidade:{
		type: Number,
		required: true,
	}, 
	dimensoes:{
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
	}
});

const Componentes = model('Componentes', ComponentesTabela);
module.exports =  Componentes;