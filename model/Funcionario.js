const Funcionarios = require('./FuncionariosTabela');  // Modelo Mongoose
const bcrypt = require('bcrypt');

class Funcionario {
    constructor(nome, turno, senha, CPF, email, telefone, credencial, dataNascimento, permissoes, role) {
        this._nome = nome;
        this._turno = turno;
        this._senha = senha;
        this._CPF = CPF;
        this._email = email;
        this._telefone = telefone;
        this._credencial = credencial;
        this._dataNascimento = dataNascimento;
        this._permissoes = permissoes;
        this._role = role;
    }

    // Getters e Setters
    get nome() { return this._nome; }
    set nome(nome) { this._nome = nome; }

    get turno() { return this._turno; }
    set turno(turno) { this._turno = turno; }

    get senha() { return this._senha; }
    set senha(senha) { this._senha = senha; }

    get CPF() { return this._CPF; }
    set CPF(CPF) { this._CPF = CPF; }

    get email() { return this._email; }
    set email(email) { this._email = email; }

    get telefone() { return this._telefone; }
    set telefone(telefone) { this._telefone = telefone; }

    get credencial() { return this._credencial; }
    set credencial(credencial) { this._credencial = credencial; }

    get dataNascimento() { return this._dataNascimento; }
    set dataNascimento(dataNascimento) { this._dataNascimento = dataNascimento; }

    get permissoes() { return this._permissoes; }
    set permissoes(permissoes) { this._permissoes = permissoes; }

    get role() { return this._role; }
    set role(role) { this._role = role; }

    get idFuncionario() { return this._idFuncionario; }
    set idFuncionario(id) { this._idFuncionario = id; }

    // Hasheia a senha com bcrypt
    async hashSenha(senha) {
        return await bcrypt.hash(senha, 10);
    }

    // Cria um novo funcionário
    async create() {
        try {
            const senhaHasheada = await this.hashSenha(this._senha);

            const funcionario = new Funcionarios({
                nome: this._nome,
                turno: this._turno,
                senha: senhaHasheada,
                CPF: this._CPF,
                email: this._email,
                telefone: this._telefone,
                credencial: this._credencial,
                dataNascimento: this._dataNascimento,
                permissoes: this._permissoes,
                role: this._role,
            });

            await funcionario.save();
            return true;
        } catch (error) {
            console.error('Erro ao criar funcionário:', error);
            return false;
        }
    }

    // Atualiza os dados de um funcionário
    async update() {
        try {
            const senhaHasheada = await this.hashSenha(this._senha);

            const updatedFuncionario = await Funcionarios.findByIdAndUpdate(this._idFuncionario, {
                nome: this._nome,
                turno: this._turno,
                senha: senhaHasheada,
                CPF: this._CPF,
                email: this._email,
                telefone: this._telefone,
                credencial: this._credencial,
                dataNascimento: this._dataNascimento,
                permissoes: this._permissoes,
                role: this._role
            }, { new: true });

            return updatedFuncionario !== null;
        } catch (error) {
            console.error('Erro ao atualizar funcionário:', error);
            return false;
        }
    }

    // Login do funcionário (validação de senha com bcrypt)
    async login() {
        try {
            const funcionario = await Funcionarios.findOne({ credencial: this._credencial });
            if (funcionario) {
                const senhaConfere = await bcrypt.compare(this._senha, funcionario.senha);
                if (senhaConfere) {
                    this._idFuncionario = funcionario._id;
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Erro ao realizar login:', error);
            return false;
        }
    }

    // Deleta um funcionário pelo ID
    async delete() {
        try {
            const result = await Funcionarios.findByIdAndDelete(this._idFuncionario);
            return result !== null;
        } catch (error) {
            console.error('Erro ao excluir funcionário:', error);
            return false;
        }
    }

    // Lista todos os funcionários
    async readAll() {
        try {
            return await Funcionarios.find().sort('nome');
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
            return [];
        }
    }

    // Busca um funcionário por ID
    async readByID(idFuncionario) {
        try {
            const funcionario = await Funcionarios.findById(idFuncionario);
            if (funcionario) {
                this._idFuncionario = funcionario._id;
                return funcionario;
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar funcionário por ID:', error);
            return null;
        }
    }

    // Verifica se já existe funcionário com determinada credencial
    async isFuncionarioByCredencial(credencial) {
        try {
            const count = await Funcionarios.countDocuments({ credencial });
            return count > 0;
        } catch (error) {
            console.error('Erro ao verificar credencial:', error);
            return false;
        }
    }
}

module.exports = Funcionario;