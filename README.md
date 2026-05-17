# Exército de Deus — Tema Shopify

Tema Shopify inspirado em livrarias católicas (referência: loja.bibliotecacatolica.com.br).

## Estrutura do tema

```
exercitodedeus/
├── assets/        # CSS, JS, imagens
├── config/        # Configurações do tema (settings_schema.json)
├── layout/        # Layout principal (theme.liquid)
├── locales/       # Traduções (pt-BR, en)
├── sections/      # Seções editáveis (header, footer, hero, etc.)
├── snippets/      # Pedaços reutilizáveis (product-card, icons, etc.)
└── templates/     # Templates de página (index, product, collection)
```

## Como rodar localmente (passo a passo)

### 1. Instalar o Shopify CLI

Você precisa do Node.js 18+ e do Git instalados. Depois, no PowerShell:

```powershell
npm install -g @shopify/cli @shopify/theme
```

Confirme com:

```powershell
shopify version
```

### 2. Criar uma loja de desenvolvimento

1. Crie uma conta gratuita em https://partners.shopify.com
2. No painel Partners → Stores → Add store → **Development store**
3. Anote o domínio da loja (ex: `minha-loja.myshopify.com`)

### 3. Conectar este tema à loja

Dentro da pasta `C:\laragon\www\exercitodedeus`:

```powershell
shopify theme dev --store minha-loja.myshopify.com
```

O CLI vai abrir o navegador com um preview ao vivo. Cada edição que você fizer aparece em tempo real.

### 4. Subir o tema para produção (quando estiver pronto)

```powershell
shopify theme push --store minha-loja.myshopify.com
```

## Paleta de cores (configurável em Tema → Personalizar)

- **Primária** (vermelho borgonha): `#7A1A1A`
- **Secundária** (dourado): `#C9A227`
- **Fundo** (creme): `#FAF7F2`
- **Texto** (marrom escuro): `#2C1810`
- **Acento** (azul marinho): `#1F2D4A`

## Seções incluídas na home

1. Header com busca, conta e carrinho
2. Banner principal (slider configurável)
3. Grade de categorias em destaque
4. Produtos em destaque (mais vendidos / lançamentos)
5. Banner secundário com CTA
6. Coleção em destaque
7. Newsletter
8. Footer com colunas configuráveis e formas de pagamento

## Como editar

Tudo é editável pelo painel da Shopify em **Online Store → Themes → Customize**, sem mexer no código. Mas se quiser alterar o código, os arquivos principais são:

- `assets/base.css` → todos os estilos visuais
- `sections/header.liquid` → topo do site
- `sections/footer.liquid` → rodapé
- `templates/index.json` → ordem das seções na home
