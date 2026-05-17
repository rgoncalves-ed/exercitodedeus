# Comece aqui — passo a passo do zero

Você não precisa saber programar. Siga na ordem:

## 1. Crie sua conta na Shopify (grátis para desenvolver)

1. Abra https://partners.shopify.com em outra aba
2. Clique em **Join now** e crie sua conta
3. No painel à esquerda, clique em **Stores** → **Add store** → **Create development store**
4. Escolha um nome (ex: `exercito-de-deus-dev`) — o domínio vai ficar `exercito-de-deus-dev.myshopify.com`
5. Confirme. Anote o nome do domínio, você vai usar ele já já.

## 2. Instale os programas necessários no Windows

Abra o **PowerShell** (botão Windows → digite "powershell").

### Node.js
```powershell
winget install OpenJS.NodeJS.LTS
```

Feche e reabra o PowerShell. Confirme:
```powershell
node --version
```
Deve mostrar algo como `v20.x.x`.

### Shopify CLI
```powershell
npm install -g @shopify/cli @shopify/theme
```

Confirme:
```powershell
shopify version
```

## 3. Conecte o tema ao Shopify e veja ao vivo

No PowerShell, entre na pasta do tema:
```powershell
cd C:\laragon\www\exercitodedeus
```

Suba o tema como preview:
```powershell
shopify theme dev --store NOME-DA-SUA-LOJA.myshopify.com
```

Troque `NOME-DA-SUA-LOJA` pelo nome real que você criou no passo 1.

Na primeira vez ele vai abrir o navegador pedindo login da sua conta Shopify Partners. Depois disso:

- Vai abrir automaticamente uma **URL de preview**
- Cada vez que você (ou eu) editar um arquivo, ele atualiza **na hora**
- Para parar, aperte `Ctrl + C` no PowerShell

## 4. Personalizar o visual sem mexer no código

1. Abra o admin da sua loja: `https://NOME-DA-SUA-LOJA.myshopify.com/admin`
2. Vá em **Online Store → Themes**
3. No tema "Exército de Deus" clique em **Customize**
4. Lá você pode:
   - Trocar logo
   - Editar banner principal (textos, imagens, cores)
   - Reorganizar seções da home (arrastar e soltar)
   - Mudar cores e fontes em **Theme settings**
   - Adicionar/remover categorias em destaque

## 5. Cadastrar produtos

1. Admin da loja → **Products** → **Add product**
2. Preencha título, descrição, fotos, preço
3. Em **Vendor**, coloque a editora (vai aparecer no card do produto)
4. Em **Collections**, crie coleções tipo "Bíblias", "Espiritualidade", etc.
5. Depois, no Customize do tema, conecte cada **Categoria em destaque** a uma coleção real.

## 6. Subir para produção (publicar)

Quando estiver pronto:
```powershell
shopify theme push --store NOME-DA-SUA-LOJA.myshopify.com
```

Ou no admin: **Themes → Actions → Publish**.

## Estrutura dos arquivos (caso queira editar código)

| Pasta | O que tem |
|-------|-----------|
| `assets/base.css` | Todos os estilos (cores, espaçamentos, layouts) |
| `assets/theme.js` | JavaScript (slider, menu mobile, quantidade) |
| `sections/header.liquid` | Topo do site |
| `sections/footer.liquid` | Rodapé |
| `sections/hero-banner.liquid` | Banner principal da home |
| `sections/categories-grid.liquid` | Grade de categorias |
| `sections/featured-collection.liquid` | Grade de produtos |
| `templates/index.json` | Ordem das seções na home |
| `templates/product.json` | Página de produto |
| `templates/collection.json` | Página de categoria |
| `config/settings_schema.json` | Quais opções aparecem no Customize |

## Se algo der errado

- **"shopify: command not found"** → feche e reabra o PowerShell
- **"Permission denied"** → rode o PowerShell como **administrador**
- **Preview não abre** → confira se digitou o nome da loja correto, com `.myshopify.com`
- **Erro de Liquid no preview** → o próprio CLI mostra o arquivo e linha do erro
