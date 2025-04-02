const Funcionarios = require('./FuncionariosTabela');  // Modelo Mongoose, importação do modelo de Funcionários
const bcrypt = require('bcrypt');  // Biblioteca bcrypt para hash de senhas

class Funcionario {
    /**
     * Construtor para inicializar os dados de um funcionário.
     * 
     * @param {string} nome - Nome do funcionário.
     * @param {string} turno - Turno de trabalho do funcionário.
     * @param {string} senha - Senha do funcionário, que será hasheada.
     * @param {string} CPF - CPF do funcionário.
     * @param {string} email - E-mail do funcionário.
     * @param {string} telefone - Número de telefone do funcionário.
     * @param {string} credencial - Credencial do funcionário usada para login.
     * @param {Date} dataNascimento - Data de nascimento do funcionário.
     * @param {Array} permissoes - Permissões atribuídas ao funcionário.
     * @param {string} role - Cargo ou função do funcionário.
     */
    constructor(nome, turno, senha, CPF, email, telefone, credencial, dataNascimento, permissoes, role) {
        this._nome = nome;
        this._turno = turno;
        this._senha = hashSenha(senha);
        this._CPF = CPF;
        this._email = email;
        this._telefone = telefone;
        this._credencial = credencial;
        this._dataNascimento = dataNascimento;
        this._permissoes = permissoes;
        this._role = role;
    }
    hashSenha(senha) {
        return bcrypt.hashSync(senha, 10);
    }
    /**
     * Método para criar um novo funcionário no banco de dados.
     * A senha é hasheada antes de ser salva para garantir a segurança.
     * 
     * @returns {boolean} Retorna true se o funcionário foi criado com sucesso, ou false em caso de erro.
     */
    async create() {
        try {
            // Criação do novo documento usando o modelo Mongoose
            const funcionario = new Funcionarios({
                nome: this._nome,
                turno: this._turno,
                senha: this._senha, 
                CPF: this._CPF,
                email: this._email,
                telefone: this._telefone,
                credencial: this._credencial,
                dataNascimento: this._dataNascimento,
                permissoes: this._permissoes,
                role: this._role,
            });

            // Salvando o funcionário no banco de dados
            await funcionario.save();
            return true;  // Retorna true se o funcionário foi criado com sucesso
        } catch (error) {
            console.error('Erro ao criar funcionário:', error);
            return false;  // Retorna false em caso de erro
        }
    }

    /**
     * Método para excluir um funcionário do banco de dados usando seu ID.
     * 
     * @returns {boolean} Retorna true se o funcionário foi excluído com sucesso, ou false se houve erro.
     */
    async delete() {
        try {
            const result = await Funcionarios.findByIdAndDelete(this._idFuncionario);
            return result !== null;  // Retorna true se o funcionário foi excluído
        } catch (error) {
            console.error('Erro ao excluir funcionário:', error);
            return false;  // Retorna false em caso de erro
        }
    }

    /**
     * Método para atualizar os dados de um funcionário no banco de dados.
     * Se a senha for alterada, ela será novamente hasheada.
     * 
     * @returns {boolean} Retorna true se o funcionário foi atualizado com sucesso, ou false em caso de erro.
     */
    async update() {
        try {

            // Atualizando os dados do funcionário
            const updatedFuncionario = await Funcionarios.findByIdAndUpdate(this._idFuncionario, {
                nome: this._nome,
                turno: this._turno,
                senha: this._senha,
                CPF: this._CPF,
                email: this._email,
                telefone: this._telefone,
                credencial: this._credencial,
                dataNascimento: this._dataNascimento,
                permissoes: this._permissoes,
                role: this._role
            }, { new: true });  // Retorna o documento atualizado

            return updatedFuncionario !== null;  // Retorna true se a atualização for bem-sucedida
        } catch (error) {
            console.error('Erro ao atualizar funcionário:', error);
            return false;  // Retorna false em caso de erro
        }
    }

    /**
     * Método para realizar o login de um funcionário.
     * Compara a senha fornecida com a senha armazenada no banco de dados.
     * 
     * @returns {boolean} Retorna true se o login for bem-sucedido, ou false se a credencial ou senha estiverem incorretas.
     */
    async login() {
        try {
            const funcionario = await Funcionarios.findOne({ credencial: this._credencial });
            if (funcionario) {
                // Compara a senha fornecida com a senha hash armazenada no banco
                const senhaValida = await bcrypt.compare(this._senha, funcionario.senha);
                if (senhaValida) {
                    this._idFuncionario = funcionario._id;  // Armazena o ID do funcionário
                    return true;  // Retorna true se a senha for válida
                }
            }
            return false;  // Retorna false se as credenciais forem inválidas
        } catch (error) {
            console.error('Erro ao realizar login:', error);
            return false;  // Retorna false em caso de erro
        }
    }

    /**
     * Método para buscar todos os funcionários cadastrados no banco de dados.
     * Retorna os funcionários ordenados por nome.
     * 
     * @returns {Array} Retorna uma lista de funcionários ou uma lista vazia em caso de erro.
     */
    async readAll() {
        try {
            return await Funcionarios.find().sort('nome');  // Retorna todos os funcionários ordenados por nome
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
            return [];  // Retorna uma lista vazia em caso de erro
        }
    }

    /**
     * Método para buscar um funcionário específico pelo seu ID.
     * 
     * @param {string} idFuncionario - ID do funcionário a ser buscado.
     * @returns {Object|null} Retorna o funcionário encontrado ou null caso não encontre.
     */
    async readByID(idFuncionario) {
        try {
            const funcionario = await Funcionarios.findById(idFuncionario);
            if (funcionario) {
                this._idFuncionario = funcionario._id;  // Armazena o ID do funcionário encontrado
                return funcionario;  // Retorna o funcionário encontrado
            }
            return null;  // Retorna null caso o funcionário não seja encontrado
        } catch (error) {
            console.error('Erro ao buscar funcionário por ID:', error);
            return null;  // Retorna null em caso de erro
        }
    }

    /**
     * Método para verificar se já existe um funcionário com a credencial fornecida.
     * 
     * @param {string} credencial - Credencial do funcionário a ser verificada.
     * @returns {boolean} Retorna true se a credencial já estiver cadastrada, ou false caso contrário.
     */
    async isFuncionarioByCredencial(credencial) {
        try {
            const count = await Funcionarios.countDocuments({ credencial });
            return count > 0;  // Retorna true se a credencial já estiver cadastrada
        } catch (error) {
            console.error('Erro ao verificar credencial:', error);
            return false;  // Retorna false em caso de erro
        }
    }
}

module.exports = Funcionario;  // Exporta a classe para ser utilizada em outras partes do sistema
