/* Cardápio digital: mesa pela URL (?mesa=7), pizza personalizável, Pix, pedido por WhatsApp e acompanhamento. */
(function () {
  "use strict";
  var D = Store.dados();
  var mesa = (new URLSearchParams(location.search).get("mesa") || "").replace(/[^0-9A-Za-z]/g, "").slice(0, 4);
  var CHAVE = "cardapio-qr:" + D.nome + ":" + mesa, CHAVE_PED = CHAVE + ":ultimo";
  var linhas = [];
  try { linhas = JSON.parse(localStorage.getItem(CHAVE)); } catch (e) { linhas = []; }
  if (!Array.isArray(linhas)) linhas = []; // carrinho salvo por versão antiga tinha outro formato
  linhas = linhas.filter(function (l) { return D.itens.some(function (i) { return i.id === l.id; }) && l.qtd > 0; });
  var sel = null; // seleção aberta no montador de pizza

  var $ = function (s) { return document.querySelector(s); };
  var brl = function (v) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); };
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function porId(id) { return D.itens.filter(function (i) { return i.id === Number(id); })[0]; }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(linhas)); } catch (e) {} }
  function tam(id) { return D.tamanhos.filter(function (t) { return t.id === id; })[0]; }
  function borda(id) { return D.bordas.filter(function (b) { return b.id === id; })[0]; }

  /* ---------- preços ---------- */
  function precoBase(i, t) { return Math.round(i.preco * tam(t).fator); }
  function precoUnit(l) {
    var i = porId(l.id);
    if (i.bebida) return i.preco;
    var v = precoBase(i, l.tam);
    if (l.meio) v = Math.max(v, precoBase(porId(l.meio), l.tam));
    return v + borda(l.borda || "").preco;
  }
  function descLinha(l) {
    var i = porId(l.id);
    if (i.bebida) return i.nome;
    var n = l.meio ? "½ " + i.nome + " + ½ " + porId(l.meio).nome : i.nome;
    var ex = [tam(l.tam).nome];
    if (l.borda) ex.push("borda " + borda(l.borda).nome);
    return n + " (" + ex.join(", ") + ")";
  }
  function chave(l) { return [l.id, l.tam || "", l.meio || "", l.borda || ""].join("|"); }
  function totais() {
    var sub = 0, n = 0;
    linhas.forEach(function (l) { sub += precoUnit(l) * l.qtd; n += l.qtd; });
    var taxa = Math.round(sub * D.taxaServico * 100) / 100;
    return { sub: sub, n: n, taxa: taxa, total: sub + taxa };
  }
  function adicionar(l) {
    var k = chave(l), ex = linhas.filter(function (x) { return chave(x) === k; })[0];
    if (ex) ex.qtd += l.qtd; else linhas.push(l);
  }
  function mudarQtd(k, d) {
    linhas.forEach(function (l) { if (chave(l) === k) l.qtd += d; });
    linhas = linhas.filter(function (l) { return l.qtd > 0; });
  }

  /* ---------- tela ---------- */
  function cabecalho() {
    document.title = D.nome + " · Cardápio digital";
    $("#marca").innerHTML = Arte.logo() + "<div><h1>" + esc(D.nome) + "</h1><p>" + esc(D.slogan) + "</p></div>";
    $("#mesa").innerHTML = mesa ? "Mesa <b>" + esc(mesa) + "</b>" : "Pedido para retirada";
    $("#cats-int").innerHTML = D.categorias.map(function (c) { return '<a href="#' + c.id + '" data-cat="' + c.id + '">' + esc(c.nome) + "</a>"; }).join("");
  }
  function cardapio() {
    $("#cardapio").innerHTML = D.categorias.map(function (c) {
      var itens = D.itens.filter(function (i) { return i.cat === c.id; }).map(function (i, n) {
        var acao = i.esgotado ? '<span class="esgotado">Esgotado hoje</span>'
          : i.bebida ? '<span data-ctl="' + i.id + '"></span>'
          : '<button class="btn btn-primario" data-montar="' + i.id + '" aria-label="Escolher ' + esc(i.nome) + '">Escolher</button>';
        return '<article class="item' + (i.esgotado ? " off" : "") + '" data-busca="' + esc((i.nome + " " + i.desc).toLowerCase()) + '" style="--n:' + n + '"><div class="arte">' + (i.bebida ? Arte.bebida() : Arte.pizza(i.cores)) + "</div><div>" +
          "<h3>" + esc(i.nome) + (i.tag ? '<span class="tag">' + esc(i.tag) + "</span>" : "") + "</h3><p>" + esc(i.desc) + "</p>" +
          '<div class="rodape-item"><span class="preco">' + (i.bebida ? "" : "a partir de ") + brl(i.preco) + "</span>" + acao + "</div></div></article>";
      }).join("");
      return '<section class="secao" id="' + c.id + '" aria-labelledby="t-' + c.id + '"><h2 id="t-' + c.id + '">' + esc(c.nome) + '</h2><div class="grade">' + itens + "</div></section>";
    }).join("");
  }
  function controleBebida(id) {
    var l = linhas.filter(function (x) { return x.id === Number(id); })[0], i = porId(id);
    if (!l) return '<button class="btn btn-primario" data-addbebida="' + id + '" aria-label="Adicionar ' + esc(i.nome) + '">Adicionar</button>';
    var k = chave(l);
    return '<span class="qtd" role="group" aria-label="Quantidade de ' + esc(i.nome) + '"><button data-menos="' + k + '" aria-label="Diminuir">−</button><output>' + l.qtd + '</output><button data-mais="' + k + '" aria-label="Aumentar">+</button></span>';
  }
  function atualizar() {
    document.querySelectorAll("[data-ctl]").forEach(function (el) { el.innerHTML = controleBebida(el.dataset.ctl); });
    var t = totais();
    $("#barra-resumo").innerHTML = t.n ? t.n + (t.n === 1 ? " item" : " itens") + "<small>" + brl(t.total) + " com serviço</small>" : "Seu pedido está vazio<small>Escolha algo no cardápio</small>";
    $("#ver-pedido").disabled = !t.n;
    salvar();
    if ($("#painel").open) painel();
  }
  function painel() {
    var t = totais();
    $("#lista").innerHTML = linhas.length ? linhas.map(function (l) {
      var k = chave(l), d = descLinha(l);
      return '<div class="linha"><span class="nome">' + esc(d) + '</span><span class="qtd"><button data-menos="' + esc(k) + '" aria-label="Diminuir ' + esc(d) + '">−</button><output>' + l.qtd +
        '</output><button data-mais="' + esc(k) + '" aria-label="Aumentar ' + esc(d) + '">+</button></span><span class="preco">' + brl(precoUnit(l) * l.qtd) + "</span></div>";
    }).join("") : '<p class="vazio">Nenhum item ainda.</p>';
    $("#totais").innerHTML = "<div><span>Subtotal</span><span>" + brl(t.sub) + "</span></div><div><span>Serviço (" + Math.round(D.taxaServico * 100) + "%)</span><span>" + brl(t.taxa) + '</span></div><div class="total"><span>Total</span><span>' + brl(t.total) + "</span></div>";
    $("#enviar").disabled = !t.n; $("#pix").disabled = !t.n;
    if (!t.n) $("#pix-box").hidden = true;
  }

  /* ---------- montador de pizza ---------- */
  function abrirMontar(id) {
    sel = { id: Number(id), tam: "M", meio: 0, borda: "", qtd: 1 };
    var i = porId(id);
    $("#m-nome").textContent = i.nome;
    $("#m-desc").textContent = i.desc;
    var grupo = D.itens.filter(function (x) { return !x.bebida && x.cat !== "doces" === (i.cat !== "doces") && x.id !== i.id && !x.esgotado; });
    $("#m-meio").innerHTML = '<option value="0">Não, pizza inteira de ' + esc(i.nome) + "</option>" + grupo.map(function (g) { return '<option value="' + g.id + '">½ ' + esc(i.nome) + " + ½ " + esc(g.nome) + "</option>"; }).join("");
    $("#m-tam").innerHTML = D.tamanhos.map(function (t, n) { return '<label class="opc"><input type="radio" name="tam" value="' + t.id + '"' + (n === 0 ? " checked" : "") + "><span>" + esc(t.nome) + " <small>" + esc(t.detalhe) + "</small></span></label>"; }).join("");
    $("#m-borda").innerHTML = D.bordas.map(function (b, n) { return '<label class="opc"><input type="radio" name="borda" value="' + b.id + '"' + (n === 0 ? " checked" : "") + "><span>" + esc(b.nome) + (b.preco ? " <small>+ " + brl(b.preco) + "</small>" : "") + "</span></label>"; }).join("");
    $("#m-qtd").textContent = "1";
    montarTotal();
    $("#montar").showModal();
  }
  function montarTotal() {
    $("#m-add").textContent = "Adicionar · " + brl(precoUnit(sel) * sel.qtd);
  }

  /* ---------- Pix (BR Code estático) ---------- */
  function tlv(id, v) { return id + String(v.length).padStart(2, "0") + v; }
  function crc16(s) {
    var c = 0xFFFF, i, j;
    for (i = 0; i < s.length; i++) { c ^= s.charCodeAt(i) << 8; for (j = 0; j < 8; j++) c = (c & 0x8000) ? ((c << 1) ^ 0x1021) : (c << 1); c &= 0xFFFF; }
    return c.toString(16).toUpperCase().padStart(4, "0");
  }
  function payloadPix(valor) {
    var p = tlv("00", "01") + tlv("26", tlv("00", "br.gov.bcb.pix") + tlv("01", D.pix.chave)) + tlv("52", "0000") + tlv("53", "986") +
      tlv("54", valor.toFixed(2)) + tlv("58", "BR") + tlv("59", D.pix.nome) + tlv("60", D.pix.cidade) + tlv("62", tlv("05", mesa ? "MESA" + mesa : "***")) + "6304";
    return p + crc16(p);
  }
  function mostrarPix() {
    var code = payloadPix(totais().total), q = qrcode(0, "M");
    q.addData(code); q.make();
    $("#pix-qr").innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }).replace("<svg", '<svg role="img" aria-label="QR code Pix"');
    $("#pix-code").value = code;
    $("#pix-box").hidden = false;
  }

  /* ---------- envio e acompanhamento ---------- */
  function whats(msg) { return "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(msg); }
  function enviar() {
    var t = totais(), obs = $("#obs").value.trim(), nome = $("#nome").value.trim();
    var l = ["*Novo pedido · " + D.nome + "*", mesa ? "Mesa: " + mesa : "Retirada no balcão"];
    if (nome) l.push("Cliente: " + nome);
    l.push("");
    var resumo = [];
    linhas.forEach(function (x) { var d = x.qtd + "x " + descLinha(x); l.push(d + " — " + brl(precoUnit(x) * x.qtd)); resumo.push(d); });
    l.push("", "Subtotal: " + brl(t.sub), "Serviço: " + brl(t.taxa), "*Total: " + brl(t.total) + "*");
    if (obs) l.push("", "Obs.: " + obs);
    var p = Store.novoPedido({ mesa: mesa, nome: nome, itens: resumo, total: t.total, obs: obs });
    try { localStorage.setItem(CHAVE_PED, String(p.id)); } catch (e) {}
    linhas = []; salvar(); $("#painel").close(); atualizar(); acompanhar();
    window.open(whats(l.join("\n")), "_blank", "noopener");
  }
  var ROTULO = { novo: "Pedido recebido", preparando: "Na pizzaria, preparando", pronto: "Pronto, já vai à sua mesa", entregue: "Entregue. Bom apetite!" };
  function acompanhar() {
    var id = Number(localStorage.getItem(CHAVE_PED)), p = id && Store.pedido(id), el = $("#acomp");
    if (!p) { el.hidden = true; return; }
    var passo = Store.STATUS.indexOf(p.status);
    el.hidden = false;
    el.innerHTML = "<strong>Pedido nº " + p.id + "</strong><span>" + ROTULO[p.status] + '</span><ol aria-label="Etapas do pedido">' + Store.STATUS.map(function (s, n) { return '<li class="' + (n <= passo ? "ok" : "") + '"' + (n === passo ? ' aria-current="step"' : "") + '><span class="so-leitor">' + s + "</span></li>"; }).join("") + "</ol>";
  }

  /* ---------- eventos ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("button, a"); if (!b) return;
    var d = b.dataset;
    if (d.montar) abrirMontar(d.montar);
    else if (d.addbebida) { adicionar({ id: Number(d.addbebida), qtd: 1 }); atualizar(); }
    else if (d.mais) { mudarQtd(d.mais, 1); atualizar(); }
    else if (d.menos) { mudarQtd(d.menos, -1); atualizar(); }
    else if (b.id === "m-menos") { sel.qtd = Math.max(1, sel.qtd - 1); $("#m-qtd").textContent = sel.qtd; montarTotal(); }
    else if (b.id === "m-mais") { sel.qtd = Math.min(20, sel.qtd + 1); $("#m-qtd").textContent = sel.qtd; montarTotal(); }
    else if (b.id === "m-add") { adicionar({ id: sel.id, tam: sel.tam, meio: sel.meio, borda: sel.borda, qtd: sel.qtd }); $("#montar").close(); atualizar(); }
    else if (b.id === "m-fechar" || b.id === "m-fechar-x") $("#montar").close();
    else if (b.id === "fechar-x") $("#painel").close();
    else if (b.id === "ver-pedido") { $("#painel").showModal(); painel(); }
    else if (b.id === "fechar") $("#painel").close();
    else if (b.id === "enviar") enviar();
    else if (b.id === "pix") mostrarPix();
    else if (b.id === "pix-copiar") {
      var c = $("#pix-code"); c.select();
      (navigator.clipboard ? navigator.clipboard.writeText(c.value) : Promise.reject()).catch(function () { document.execCommand("copy"); });
      b.textContent = "Código copiado ✓"; setTimeout(function () { b.textContent = "Copiar código Pix"; }, 2000);
    }
    else if (b.id === "garcom") window.open(whats("*" + D.nome + "* — " + (mesa ? "Mesa " + mesa : "Cliente") + " chamando o garçom."), "_blank", "noopener");
    else if (b.id === "limpar") { linhas = []; $("#painel").close(); atualizar(); }
  });
  /* toque fora da caixa (no fundo escuro) fecha */
  ["#painel", "#montar"].forEach(function (s) {
    $(s).addEventListener("click", function (e) {
      var r = this.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) this.close();
    });
  });
  document.addEventListener("change", function (e) {
    if (!sel) return;
    if (e.target.name === "tam") sel.tam = e.target.value;
    else if (e.target.name === "borda") sel.borda = e.target.value;
    else if (e.target.id === "m-meio") sel.meio = Number(e.target.value);
    else return;
    montarTotal();
  });
  $("#busca").addEventListener("input", function () {
    var q = this.value.trim().toLowerCase(), alguma = false;
    document.querySelectorAll(".item").forEach(function (el) { var ok = !q || el.dataset.busca.indexOf(q) > -1; el.hidden = !ok; if (ok) alguma = true; });
    document.querySelectorAll(".secao").forEach(function (s) { s.hidden = !s.querySelector(".item:not([hidden])"); });
    $("#sem-resultado").hidden = alguma;
  });

  function observar() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) document.querySelectorAll(".cats a").forEach(function (a) { a.setAttribute("aria-current", a.dataset.cat === en.target.id ? "true" : "false"); }); });
    }, { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll(".secao").forEach(function (s) { io.observe(s); });
  }

  /* o dono mexeu no painel (esgotado, preço): reflete na hora */
  Store.aoMudar(function (o) { if (o === "pedidos") acompanhar(); else location.reload(); });

  cabecalho(); cardapio(); atualizar(); observar(); acompanhar();
})();
