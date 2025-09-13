// Arquivo: utils/cleanup.js
const fs = require('fs').promises;
const path = require('path');

// Função para limpar a pasta de uploads temporários
async function cleanTempFolder() {
    // Caminho para a pasta temp
    const tempDir = path.join(__dirname, '..', 'public', 'imagens', 'temp');
    const maxAgeHours = 1; // Apagar arquivos com mais de 1 hora

    try {
        const files = await fs.readdir(tempDir);

        for (const file of files) {
            const filePath = path.join(tempDir, file);
            try {
                const stats = await fs.stat(filePath);
                const now = new Date().getTime();
                const fileTime = new Date(stats.mtime).getTime(); // mtime = data da última modificação
                const ageInHours = (now - fileTime) / (1000 * 60 * 60);

                if (ageInHours > maxAgeHours) {
                    await fs.unlink(filePath);
                    console.log(`[CLEANUP] Arquivo temporário antigo removido: ${file}`);
                }
            } catch (err) {
                console.error(`[CLEANUP] Falha ao processar o arquivo ${file}:`, err);
            }
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            // Se a pasta 'temp' não existe, não há nada a fazer.
            return;
        }
        console.error('[CLEANUP] Erro ao ler o diretório temporário:', err);
    }
}

module.exports = { cleanTempFolder };