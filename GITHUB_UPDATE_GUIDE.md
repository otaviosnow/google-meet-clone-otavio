# 🔄 Como Substituir Arquivos no GitHub

## 📋 Opções Disponíveis

### **Opção 1: GitHub Web (Recomendado)**

#### Para arquivos individuais:
1. **Acesse** seu repositório no GitHub
2. **Clique** no arquivo que quer substituir (ex: `package.json`)
3. **Clique** no ícone de lápis ✏️ (Edit)
4. **Substitua** o conteúdo
5. **Clique** "Commit changes"

#### Para múltiplos arquivos:
1. **Acesse** seu repositório
2. **Clique** "Add file" → "Upload files"
3. **Arraste** os novos arquivos
4. **GitHub** perguntará se quer substituir
5. **Clique** "Commit changes"

### **Opção 2: GitHub Desktop**

1. **Clone** o repositório localmente
2. **Substitua** os arquivos na pasta
3. **Commit** as mudanças
4. **Push** para o GitHub

### **Opção 3: Deletar e Recriar**

1. **Delete** os arquivos antigos
2. **Upload** os novos arquivos
3. **Commit** as mudanças

## 🎯 Passo a Passo Detalhado

### **Passo 1: Preparar os Arquivos**

Antes de fazer upload, confirme que você tem:

✅ **Arquivos Corretos:**
- `server-render.js` (novo servidor)
- `package.json` (atualizado)
- `render.yaml`
- `.env.example`
- `.gitignore`

❌ **Arquivos que NÃO enviar:**
- `.env` (contém senhas)
- `node_modules/`
- `uploads/`
- `server.js` (antigo)
- `server-demo.js`

### **Passo 2: Fazer Upload no GitHub**

#### **Método A: Upload Individual**

1. **Acesse**: https://github.com/seu-usuario/google-meet-fake-saas
2. **Para cada arquivo**:
   - Clique no arquivo
   - Clique no lápis ✏️
   - Cole o novo conteúdo
   - Clique "Commit changes"

#### **Método B: Upload em Lote**

1. **Acesse** seu repositório
2. **Clique** "Add file" → "Upload files"
3. **Arraste** todos os arquivos corretos
4. **GitHub** perguntará sobre conflitos
5. **Escolha** "Replace" para arquivos existentes
6. **Clique** "Commit changes"

### **Passo 3: Verificar**

Após o upload, verifique se:

- ✅ `server-render.js` está no repositório
- ✅ `package.json` está atualizado
- ❌ `.env` NÃO está no repositório
- ❌ `node_modules/` NÃO está no repositório

## 🚨 Problemas Comuns

### **Problema 1: Arquivo não aparece**
**Solução**: 
- Verifique se o arquivo foi enviado
- Aguarde alguns segundos
- Recarregue a página

### **Problema 2: Conflito de arquivos**
**Solução**:
- GitHub perguntará o que fazer
- Escolha "Replace" para substituir
- Ou "Keep" para manter o antigo

### **Problema 3: Arquivo muito grande**
**Solução**:
- Verifique se `node_modules/` não foi enviado
- Delete se foi enviado acidentalmente
- Use `.gitignore` para evitar

## 📋 Checklist de Verificação

Após o upload, confirme:

- [ ] `server-render.js` está no repositório
- [ ] `package.json` tem "server-render.js"
- [ ] `.env` NÃO está no repositório
- [ ] `node_modules/` NÃO está no repositório
- [ ] Todas as pastas estão enviadas
- [ ] Render detectou as mudanças

## 🔧 Comandos Úteis

### **Para verificar se .env foi enviado acidentalmente:**
```bash
# Se foi enviado, DELETE IMEDIATAMENTE
# E mude a senha do MongoDB Atlas
```

### **Para verificar arquivos no repositório:**
1. Acesse: https://github.com/seu-usuario/google-meet-fake-saas
2. Verifique a lista de arquivos
3. Confirme se os corretos estão lá

## 📞 Suporte

Se tiver problemas:
1. **Delete** arquivos incorretos
2. **Re-upload** arquivos corretos
3. **Verifique** se `.env` não foi enviado
4. **Aguarde** o deploy automático no Render 