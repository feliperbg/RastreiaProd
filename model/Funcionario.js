/**
 * Classe Funcionario
 * Gerencia operações de CRUD e autenticação para funcionários no sistema.
 */

const Funcionarios = require('./FuncionariosTabela'); // Modelo do Mongoose
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

class Funcionario {
    /**
     * Cria uma instância de Funcionario.
     * @param {String} id - ID do funcionário.
     * @param {String} nome - Nome do funcionário.
     * @param {String} turno - Turno de trabalho.
     * @param {String} senha - Senha do funcionário.
     * @param {String} CPF - CPF do funcionário.
     * @param {String} email - Email do funcionário.
     * @param {String} telefone - Telefone do funcionário.
     * @param {String} credencial - Número da sequence do MongoDB.
     * @param {Date} dataNascimento - Data de nascimento.
     * @param {Array} permissoes - Permissões do funcionário.
     * @param {String} role - Papel/função no sistema.
     * @param {String} imagemFuncionario - Caminho da imagem do funcionário.
     */
    constructor(nome, turno, senha, CPF, email, telefone, dataNascimento, permissoes, role, imagemFuncionario) {
        this._id = null;
        this._nome = nome;
        this._turno = turno;
        this._senha = senha;
        this._CPF = CPF;
        this._email = email;
        this._telefone = telefone;
        this._dataNascimento = dataNascimento;
        this._permissoes = permissoes;
        this._role = role;
        this._imagemFuncionario = imagemFuncionario; // << adicionado
    }
    

    // -------------------
    // Getters e Setters
    // -------------------

    get idFuncionario() { return this._id; } 

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

    get dataNascimento() { return this._dataNascimento; }
    set dataNascimento(dataNascimento) { this._dataNascimento = dataNascimento; }

    get permissoes() { return this._permissoes; }
    set permissoes(permissoes) { this._permissoes = permissoes; }

    get role() { return this._role; }
    set role(role) { this._role = role; }

    // -------------------
    // Métodos principais
    // -------------------

    /**
     * Gera o hash da senha usando bcrypt.
     * @param {String} senha - Senha em texto puro.
     * @returns {Promise<String>} - Senha hasheada.
     */
    async hashSenha(senha) {
        return await bcrypt.hash(senha, 10);
    }

    /**
     * Cria um novo funcionário no banco de dados.
     * Também copia a imagem do funcionário.
     * @returns {Promise<Boolean>} - Retorna true se criado com sucesso.
     */
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
                dataNascimento: this._dataNascimento,
                permissoes: this._permissoes,
                role: this._role,
            });
    
            // Primeiro salva o funcionario para garantir que a 'credencial' seja gerada
            const funcionarioSalvo = await funcionario.save();  
    
            this._id = funcionarioSalvo._id.toString();
            this._credencial = funcionarioSalvo.credencial.toString();
            
    
            const caminhoImagem = path.join(__dirname, '..', 'public', 'imagens', 'funcionario', `${this.idFuncionario}.png`);

            if (this._imagemFuncionario) {
                await fs.promises.copyFile(this._imagemFuncionario, caminhoImagem);
            } else {
                const imagemPadrao = path.join(__dirname, '..', 'public', 'imagens', 'funcionario', 'default.png');
                await fs.promises.copyFile(imagemPadrao, caminhoImagem);
            }

            funcionarioSalvo.imagemFuncionario = `/imagens/funcionario/${this.idFuncionario}.png`;
            await funcionarioSalvo.save();

    
            return true;
        } catch (error) {
            console.error('Erro ao criar funcionário:', error);
            return false;
        }
    }
    

    /**
     * Atualiza os dados de um funcionário no banco.
     * @returns {Promise<Boolean>} - Retorna true se atualizado com sucesso.
     */
    async update() {
        try {
            let updateFields = {
                nome: this._nome,
                turno: this._turno,
                CPF: this._CPF,
                email: this._email,
                telefone: this._telefone,
                credencial: this._credencial,
                dataNascimento: this._dataNascimento,
                permissoes: this._permissoes,
                role: this._role
            };
            Object.keys(updateFields).forEach(key => {
                if (updateFields[key] === undefined || updateFields[key] === '') {
                    delete updateFields[key];
                }
            });

            if (this._senha && this._senha.trim() !== '') {
                const senhaHasheada = await this.hashSenha(this._senha);
                updateFields.senha = senhaHasheada;
            }

            const updatedFuncionario = await Funcionarios.findByIdAndUpdate(
                this._id,
                updateFields,
                { new: true }
            );

            return updatedFuncionario !== null;
        } catch (error) {
            console.error('Erro ao atualizar funcionário:', error);
            return false;
        }
    }

    /**
     * Realiza o login de um funcionário com credencial e senha.
     * @returns {Promise<Boolean>} - Retorna true se login for bem-sucedido.
     */
    async login() {
        try {
            const funcionario = await Funcionarios.findOne({ credencial: this._credencial });
            if (funcionario) {
                const senhaConfere = await bcrypt.compare(this._senha, funcionario.senha);
                if (senhaConfere) {
                    this._id = funcionario._id;
                    this._nome = funcionario.nome;
                    this._role = funcionario.role;
                    this._permissoes = funcionario.permissoes;
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Erro ao realizar login:', error);
            return false;
        }
    }

    /**
     * Deleta um funcionário do banco de dados.
     * @returns {Promise<Boolean>} - Retorna true se excluído com sucesso.
     */
    async delete() {
        try {
            const result = await Funcionarios.findByIdAndDelete(this._id);
            const caminhoImagem = path.join(__dirname, '..', 'public', 'imagens', 'funcionario', `${this._id}.png`);
            await fs.promises.unlink(caminhoImagem).catch(err => {
                if (err.code !== 'ENOENT') { // Se o erro não for "arquivo não encontrado"
                    console.error('Erro ao excluir imagem do funcionário:', err);
                }
            });
            return result;
        } catch (error) {
            console.error('Erro ao excluir funcionário:', error);
            return false;
        }
    }

    /**
     * Retorna todos os funcionários cadastrados, ordenados por nome.
     * @returns {Promise<Array>} - Lista de funcionários.
     */
    async readAll() {
        try {
            return await Funcionarios.find({}, '-senha').sort('nome');
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
            return [];
        }
    }

    /**
     * Busca um funcionário pelo ID.
     * @param {String} idFuncionario - ID do funcionário a ser buscado.
     * @returns {Promise<Object|null>} - Objeto do funcionário ou null.
     */
    async readByID(idFuncionario) {
        try {
            const funcionario = await Funcionarios.findById(idFuncionario);
            if (funcionario) {
                this._id = funcionario._id;
                console.log(funcionario);
                return funcionario;
                
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar funcionário por ID:', error);
            return null;
        }
    }

    /**
     * Verifica se existe funcionário com a credencial informada.
     * @param {String} credencial - Credencial de login.
     * @returns {Promise<Boolean>} - Retorna true se existir.
     */
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
