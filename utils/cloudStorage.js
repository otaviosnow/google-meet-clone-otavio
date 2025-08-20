const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// Configuração do Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'callx-saas',
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || null,
  // Para Render, usar credenciais via variável de ambiente
  credentials: process.env.GOOGLE_CLOUD_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS) : null
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET || 'callx-videos';

class CloudStorage {
  constructor() {
    this.bucket = storage.bucket(bucketName);
    this.isConfigured = this.checkConfiguration();
  }

  // Verificar se a configuração está correta
  async checkConfiguration() {
    try {
      if (!process.env.GOOGLE_CLOUD_CREDENTIALS && !process.env.GOOGLE_CLOUD_KEY_FILE) {
        console.log('⚠️ [CLOUD] Google Cloud Storage não configurado - usando armazenamento local');
        return false;
      }

      // Testar conexão com o bucket
      const [exists] = await this.bucket.exists();
      if (!exists) {
        console.log('⚠️ [CLOUD] Bucket não encontrado - usando armazenamento local');
        return false;
      }

      console.log('✅ [CLOUD] Google Cloud Storage configurado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ [CLOUD] Erro na configuração do Google Cloud Storage:', error);
      return false;
    }
  }

  // Upload de arquivo para a nuvem
  async uploadFile(filePath, destination) {
    if (!this.isConfigured) {
      console.log('⚠️ [CLOUD] Cloud Storage não configurado - mantendo arquivo local');
      return {
        success: true,
        url: `/uploads/${path.basename(filePath)}`,
        cloudUrl: null,
        isLocal: true
      };
    }

    try {
      console.log('☁️ [CLOUD] Fazendo upload para Google Cloud Storage:', destination);
      
      const [file] = await this.bucket.upload(filePath, {
        destination: destination,
        metadata: {
          cacheControl: 'public, max-age=31536000', // 1 ano
        },
        public: true // Tornar arquivo público
      });

      const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
      
      console.log('✅ [CLOUD] Upload concluído:', publicUrl);
      
      // Remover arquivo local após upload bem-sucedido
      try {
        fs.unlinkSync(filePath);
        console.log('🗑️ [CLOUD] Arquivo local removido:', filePath);
      } catch (error) {
        console.warn('⚠️ [CLOUD] Erro ao remover arquivo local:', error);
      }

      return {
        success: true,
        url: publicUrl,
        cloudUrl: publicUrl,
        isLocal: false
      };

    } catch (error) {
      console.error('❌ [CLOUD] Erro no upload:', error);
      
      // Em caso de erro, manter arquivo local
      return {
        success: true,
        url: `/uploads/${path.basename(filePath)}`,
        cloudUrl: null,
        isLocal: true,
        error: error.message
      };
    }
  }

  // Deletar arquivo da nuvem
  async deleteFile(destination) {
    if (!this.isConfigured) {
      console.log('⚠️ [CLOUD] Cloud Storage não configurado - arquivo local não será removido');
      return { success: true };
    }

    try {
      console.log('🗑️ [CLOUD] Deletando arquivo da nuvem:', destination);
      
      await this.bucket.file(destination).delete();
      
      console.log('✅ [CLOUD] Arquivo deletado com sucesso');
      return { success: true };

    } catch (error) {
      console.error('❌ [CLOUD] Erro ao deletar arquivo:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar se arquivo existe na nuvem
  async fileExists(destination) {
    if (!this.isConfigured) {
      return false;
    }

    try {
      const [exists] = await this.bucket.file(destination).exists();
      return exists;
    } catch (error) {
      console.error('❌ [CLOUD] Erro ao verificar arquivo:', error);
      return false;
    }
  }

  // Migrar arquivos locais para a nuvem
  async migrateLocalFiles() {
    if (!this.isConfigured) {
      console.log('⚠️ [CLOUD] Cloud Storage não configurado - migração ignorada');
      return;
    }

    try {
      const uploadsDir = './uploads';
      if (!fs.existsSync(uploadsDir)) {
        console.log('📁 [CLOUD] Pasta uploads não existe');
        return;
      }

      const files = fs.readdirSync(uploadsDir);
      console.log(`📁 [CLOUD] Encontrados ${files.length} arquivos para migrar`);

      for (const file of files) {
        if (file.startsWith('.')) continue; // Ignorar arquivos ocultos
        
        const filePath = path.join(uploadsDir, file);
        const destination = `videos/${file}`;
        
        console.log(`☁️ [CLOUD] Migrando: ${file}`);
        await this.uploadFile(filePath, destination);
      }

      console.log('✅ [CLOUD] Migração concluída');

    } catch (error) {
      console.error('❌ [CLOUD] Erro na migração:', error);
    }
  }
}

module.exports = new CloudStorage();
