console.log('Iniciando servidor...');
console.log('Arquivo atual:', __filename);
console.log('Diretório atual:', __dirname);

try {
  require('./server-auth.js');
  console.log('Servidor iniciado com sucesso!');
} catch (error) {
  console.error('Erro ao iniciar servidor:', error);
  process.exit(1);
} 