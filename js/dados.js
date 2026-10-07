/* Dados do cliente. Para vender para outra pizzaria, troque só este arquivo. */
window.CARDAPIO = {
  nome: "Forno Nobre",
  slogan: "Pizzaria artesanal · massa de 48 h",
  whatsapp: "5511999999999", // número que recebe os pedidos (DDI+DDD+número)
  taxaServico: 0.1,
  /* Pix de demonstração: troque pela chave real do cliente */
  pix: { chave: "pix@fornonobre.demo", nome: "FORNO NOBRE", cidade: "SAO PAULO" },
  /* preço do tamanho Grande = preço base (Média) × fator, arredondado */
  tamanhos: [
    { id: "M", nome: "Média", detalhe: "6 fatias", fator: 1 },
    { id: "G", nome: "Grande", detalhe: "8 fatias", fator: 1.35 }
  ],
  bordas: [
    { id: "", nome: "Sem borda recheada", preco: 0 },
    { id: "catupiry", nome: "Catupiry", preco: 9 },
    { id: "cheddar", nome: "Cheddar", preco: 9 },
    { id: "chocolate", nome: "Chocolate", preco: 10 }
  ],
  categorias: [
    { id: "tradicionais", nome: "Tradicionais" },
    { id: "especiais", nome: "Especiais" },
    { id: "doces", nome: "Doces" },
    { id: "bebidas", nome: "Bebidas" }
  ],
  /* cores: [massa/molho, queijo, cobertura1, cobertura2] usadas na ilustração */
  itens: [
    { id: 1, cat: "tradicionais", nome: "Margherita", desc: "Molho de tomate italiano, muçarela de búfala, manjericão fresco e azeite.", preco: 54, tag: "Mais pedida", cores: ["#c0392b", "#f4e4b8", "#3f7d3a", "#3f7d3a"] },
    { id: 2, cat: "tradicionais", nome: "Calabresa", desc: "Calabresa artesanal fatiada, cebola roxa, azeitonas e orégano.", preco: 52, cores: ["#c0392b", "#f4e4b8", "#a8321f", "#6b2d5c"] },
    { id: 3, cat: "tradicionais", nome: "Portuguesa", desc: "Presunto, ovos, cebola, ervilha, azeitonas e muçarela.", preco: 58, cores: ["#c0392b", "#f4e4b8", "#e8a0a0", "#e9d36b"] },
    { id: 4, cat: "tradicionais", nome: "Quatro Queijos", desc: "Muçarela, provolone, gorgonzola e parmesão.", preco: 62, cores: ["#d9a441", "#f7e9bd", "#e6c36a", "#8aa0b8"] },
    { id: 5, cat: "especiais", nome: "Burrata & Pesto", desc: "Burrata cremosa, pesto de manjericão, tomate confit e castanhas.", preco: 79, tag: "Chef", cores: ["#d9a441", "#f7f1df", "#6f9a3a", "#c0392b"] },
    { id: 6, cat: "especiais", nome: "Parma & Rúcula", desc: "Presunto de Parma 18 meses, rúcula, lascas de grana padano.", preco: 84, cores: ["#c0392b", "#f4e4b8", "#d98a8a", "#5b8c3a"] },
    { id: 7, cat: "especiais", nome: "Trufada", desc: "Creme de cogumelos, muçarela, funghi e azeite trufado.", preco: 88, tag: "Novidade", cores: ["#7a5a3a", "#f4e4b8", "#8a6b4a", "#4a3626"] },
    { id: 8, cat: "doces", nome: "Chocolate com Morango", desc: "Chocolate belga ao leite, morangos frescos e raspas.", preco: 56, cores: ["#4a2a1a", "#6b3a22", "#d63a4a", "#d63a4a"] },
    { id: 9, cat: "doces", nome: "Banana Canela", desc: "Banana caramelizada, canela, leite condensado e açúcar mascavo.", preco: 50, cores: ["#d9a441", "#f4e4b8", "#e9d36b", "#8a5a2a"] },
    { id: 10, cat: "bebidas", nome: "Refrigerante lata", desc: "Coca-Cola, Guaraná ou Sprite, 350 ml.", preco: 7, bebida: true },
    { id: 11, cat: "bebidas", nome: "Suco natural 400 ml", desc: "Laranja, limão ou maracujá, feito na hora.", preco: 12, bebida: true },
    { id: 12, cat: "bebidas", nome: "Cerveja long neck", desc: "Heineken ou Stella Artois, 330 ml.", preco: 14, bebida: true }
  ]
};
