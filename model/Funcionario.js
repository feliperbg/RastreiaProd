// Arquivo: model/Funcionario.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema, model } = mongoose;

const FuncionarioSchema = new Schema({
    nome: {
        type: String,
        required: [true, 'O nome do funcionário é obrigatório.'],
        trim: true,
    },
    turno: {
        type: String,
        trim: true,
    },
    senha: {
        type: String,
        required: [true, 'A senha é obrigatória.'],
        select: false,
    },
    CPF: {
        type: String,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'O e-mail é obrigatório.'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    telefone: {
        type: String,
        trim: true,
    },
    credencial: {
        type: Number,
        unique: true,
        trim: true,
    },
    dataNascimento: {
        type: Date,
    },
    permissoes: [{
        type: String,
        trim: true,
    }],
    role: {
        type: String,
        trim: true,
    },
    imagem: {
        type: String,
        trim: true,
    },
    departamento: {
        type: Schema.Types.ObjectId,
        ref: 'Departamento'
    },
    valor_hora: {
        type: Number,
        required: true,
        default: 15 // Valor padrão, ex: R$15,00
    },
    resetPasswordToken: {
        type: String,
        select: false // Não retorna este campo em queries por padrão
    },
    resetPasswordExpires: {
        type: Date,
        select: false // Não retorna este campo em queries por padrão
    },
}, {
    timestamps: true,
});

FuncionarioSchema.pre('save', async function (next) {

    if (!this.isModified('senha')) {
        return next();
    }
    try {
        this.senha = await bcrypt.hash(this.senha, 10);
        next();
    } catch (error) {
        next(error);
    }
});

FuncionarioSchema.plugin(AutoIncrement, { inc_field: 'credencial' });
const Funcionario = model('Funcionario', FuncionarioSchema);

module.exports = Funcionario;