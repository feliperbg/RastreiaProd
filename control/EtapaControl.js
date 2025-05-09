const Etapa = require('../model/Etapa'); // Importa a classe do modelo Etapa

class EtapaControl {
    // Criação de uma nova etapa
    async create(req, res) {
        try {
            const { nome, sequencias, departamentoResponsavel, procedimentos, componenteConclusao, funcionariosResponsaveis } = req.body;

            // Cria uma instância do modelo Etapa
            const novaEtapa = new Etapa(null, nome, sequencias, departamentoResponsavel, procedimentos, componenteConclusao, funcionariosResponsaveis);
            
            // Chama o método 'create' do modelo para salvar no banco de dados
            const sucesso = await novaEtapa.create();
            if (sucesso) {
                res.status(201).json({ mensagem: 'Etapa criada com sucesso!', etapa: novaEtapa });
            } else {
                res.status(500).json({ mensagem: 'Erro ao criar etapa' });
            }
        } catch (err) {
            res.status(500).json({ mensagem: 'Erro ao criar etapa', erro: err.message });
        }
    }

    // Retorna todas as etapas
    async readAll(req, res) {
        try {
            const etapaModel = new Etapa();  // Instância do modelo
            const etapas = await etapaModel.readAll();
            res.status(200).json(etapas);
        } catch (err) {
            res.status(500).json({ mensagem: 'Erro ao listar etapas', erro: err.message });
        }
    }

    // Retorna uma etapa específica pelo ID
    async readByID(req, res) {
        try {
            const etapaModel = new Etapa();  // Instância do modelo
            const etapa = await etapaModel.readByID(req.params.id);
            if (!etapa) {
                return res.status(404).json({ mensagem: 'Etapa não encontrada' });
            }
            res.status(200).json(etapa);
        } catch (err) {
            res.status(500).json({ mensagem: 'Erro ao buscar etapa', erro: err.message });
        }
    }

    // Deleta uma etapa pelo ID
    async delete(req, res) {
        try {
            const etapaModel = new Etapa(req.params.id);  // Instância do modelo
            const sucesso = await etapaModel.delete();
            if (!sucesso) {
                return res.status(404).json({ mensagem: 'Etapa não encontrada' });
            }
            res.status(200).json({ mensagem: 'Etapa excluída com sucesso' });
        } catch (err) {
            res.status(500).json({ mensagem: 'Erro ao deletar etapa', erro: err.message });
        }
    }

    // Atualiza os dados de uma etapa
    async update(req, res) {
        try {
            const { nome, sequencias, departamentoResponsavel, procedimentos, componenteConclusao, funcionariosResponsaveis } = req.body;
            const etapaModel = new Etapa(req.params.id, nome, sequencias, departamentoResponsavel, procedimentos, componenteConclusao, funcionariosResponsaveis);  // Instância do modelo

            const sucesso = await etapaModel.update();
            if (!sucesso) {
                return res.status(404).json({ mensagem: 'Etapa não encontrada' });
            }
            res.status(200).json({ mensagem: 'Etapa atualizada com sucesso', etapa: etapaModel });
        } catch (err) {
            res.status(500).json({ mensagem: 'Erro ao atualizar etapa', erro: err.message });
        }
    }
}

module.exports = EtapaControl;
