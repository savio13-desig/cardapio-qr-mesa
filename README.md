# Cardápio digital com QR por mesa (amostra novapicks)

Demonstração para vender a pizzarias, bares e restaurantes. HTML, CSS e JavaScript puros, sem build e sem servidor.

## Páginas
- `index.html?mesa=7` — cardápio do cliente: busca, pizza personalizável (tamanho, meio a meio, borda), Pix copia e cola, envio ao WhatsApp e acompanhamento do pedido.
- `painel.html` — painel do dono: fila de pedidos com mudança de estado, preços editáveis e controle de "esgotado".
- `qr.html` — gerador das placas de QR (uma por mesa) para imprimir.
- `apresentacao.html` — proposta comercial para enviar ao cliente (valores de exemplo).

## Adaptar para um novo cliente
Edite `js/dados.js` (nome, slogan, WhatsApp, Pix, taxa, tamanhos, bordas, categorias e itens), as cores em `css/estilo.css` (`:root`) e o logo em `js/arte.js`. Ajuste os planos em `apresentacao.html`.

## Rodar local
```
python -m http.server 8765
```
Abra http://localhost:8765/apresentacao.html

## Limitações desta amostra
- Pedidos e edições do painel ficam no navegador (localStorage, em `js/store.js`). Cliente e painel só se enxergam no mesmo navegador. A versão final troca `store.js` por um banco online e acrescenta login no painel.
- O número de WhatsApp (`5511999999999`) e a chave Pix (`pix@fornonobre.demo`) são fictícios. O código Pix segue o padrão BR Code com CRC válido, mas não foi testado em app de banco.
- Sem fotos reais: as pizzas são ilustrações em SVG. Para um cliente real, usar fotos do próprio cardápio.
- `vendor/qrcode.js`: qrcode-generator 1.4.4 (Kazuhiko Arase, licença MIT).
