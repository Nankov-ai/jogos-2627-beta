// Calendário de jogos Sub-11 2026/27 · VERSÃO DE TESTE (beta)
// Escolhe-se o jogo para que o atleta foi convocado -> abre o Google Calendar já preenchido.
// O evento no calendário cobre: viagem de ida + chegada ao campo (antecedência) + jogo (1 h 30) + viagem de regresso
const JOGO_MIN = 90;
// Equipamento a levar (aparece na descrição do evento do calendário). Para mudar a lista, editar aqui.
const LEVAR = ["equipamento de jogo", "caneleiras", "chuteiras", "garrafa de água", "CC"];
// Dados guardados só neste telemóvel. Prefixo "beta-": nunca tocar nas chaves da versão normal.
const CHAVE = "beta-convocados-v1";     // { idJogo: true }
const CHAVE_DEF = "beta-definicoes-v1"; // viagem e antecedência de cada utilizador
const CHAVE_REG = "beta-registo-v1";    // { idJogo: { golosNos, golosAdv, marcadores, arbitro, titular, equipamento, notas } }
const PADRAO = { configurado: false, modo: "estimativa", fixo: 45, antecedencia: 60, numero: null };

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");
const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const dataDe = (g) => new Date(g.inicio);
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hhmm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const fmtDia = (d) => `${DIAS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}`;

// Fim de semana identificado pelo sábado (domingo recua um dia)
function chaveSemana(d) {
  const s = new Date(d);
  if (s.getDay() === 0) s.setDate(s.getDate() - 1);
  return ymd(s);
}

function lerEstado() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch { return {}; }
}
function gravarEstado(e) {
  try { localStorage.setItem(CHAVE, JSON.stringify(e)); } catch { /* modo privado */ }
}

function lerDefinicoes() {
  try { return { ...PADRAO, ...JSON.parse(localStorage.getItem(CHAVE_DEF)) }; } catch { return { ...PADRAO }; }
}
function gravarDefinicoes(d) {
  try { localStorage.setItem(CHAVE_DEF, JSON.stringify(d)); } catch { /* modo privado */ }
}
let def = lerDefinicoes();

// ---------- Registo do jogo (resultado, marcadores, árbitro, equipamento, notas) ----------
// Marcadores = NÚMEROS DE CAMISOLA (nunca nomes). 0 = auto-golo do adversário (conta para a nossa equipa).
function numero(v, min, max) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null;
}
function limparRegisto(r) {
  if (!r || typeof r !== "object") return null;
  const out = {};
  const nos = numero(r.golosNos, 0, 99), adv = numero(r.golosAdv, 0, 99);
  if (nos !== null) out.golosNos = nos;
  if (adv !== null) out.golosAdv = adv;
  if (Array.isArray(r.marcadores)) {
    const m = r.marcadores.map((x) => numero(x, 0, 99)).filter((x) => x !== null).slice(0, 30);
    if (m.length) out.marcadores = m;
  }
  if (["sim", "nao"].includes(r.arbitro)) out.arbitro = r.arbitro;
  if (["titular", "suplente", "nao-jogou"].includes(r.titular)) out.titular = r.titular;
  if (["azul", "branco"].includes(r.equipamento)) out.equipamento = r.equipamento;
  if (typeof r.notas === "string" && r.notas.trim()) out.notas = r.notas.trim().slice(0, 500);
  return Object.keys(out).length ? out : null;
}
function lerRegisto() {
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE_REG)) || {};
    const out = {};
    for (const [id, r] of Object.entries(bruto)) {
      const l = limparRegisto(r);
      if (l) out[id] = l;
    }
    return out;
  } catch { return {}; }
}
let registo = lerRegisto();
const reg = (g) => registo[g.id] || {};
function guardarReg(g, r) {
  const l = limparRegisto(r);
  if (l) registo[g.id] = l; else delete registo[g.id];
  try { localStorage.setItem(CHAVE_REG, JSON.stringify(registo)); } catch { /* modo privado */ }
}

function agruparMarcadores(m) {
  const c = new Map();
  for (const n of m) c.set(n, (c.get(n) || 0) + 1);
  return [...c].map(([n, k]) => `${n === 0 ? "auto-golo" : "nº " + n}${k > 1 ? " ×" + k : ""}`).join(", ");
}
function resumoRegisto(g) {
  const r = reg(g), p = [];
  if (r.golosNos != null && r.golosAdv != null) {
    const res = r.golosNos > r.golosAdv ? "vitória" : r.golosNos < r.golosAdv ? "derrota" : "empate";
    p.push(`Resultado ${r.golosNos}–${r.golosAdv} (${res})`);
  } else if (r.golosNos != null || r.golosAdv != null) {
    p.push(`Resultado ${r.golosNos ?? "?"}–${r.golosAdv ?? "?"}`);
  }
  if (r.marcadores) p.push("marcadores: " + agruparMarcadores(r.marcadores));
  if (r.arbitro) p.push("árbitro: " + (r.arbitro === "sim" ? "sim" : "não"));
  if (r.titular) p.push({ titular: "titular", suplente: "suplente", "nao-jogou": "não jogou" }[r.titular]);
  if (r.notas) p.push("notas: " + (r.notas.length > 80 ? r.notas.slice(0, 80) + "…" : r.notas));
  return p.join(" · ");
}

const jogos = window.JOGOS.map((g) => ({ ...g, d: dataDe(g) }));
const porSemana = new Map();
for (const g of jogos) {
  const k = chaveSemana(g.d);
  if (!porSemana.has(k)) porSemana.set(k, []);
  porSemana.get(k).push(g);
}
const semanas = [...porSemana.keys()].sort();
let estado = lerEstado();

// ---------- Calendário ----------
const somaMin = (d, m) => new Date(d.getTime() + m * 60000);
// Minutos de viagem (ida; o regresso é igual): estimativa do campo, ou o tempo fixo escolhido
function viagemMin(g) {
  const est = (window.VIAGEM || {})[g.campo];
  if (def.modo === "estimativa" && est != null) return est;
  return def.fixo;
}
const inicioEvento = (g) => somaMin(g.d, -(viagemMin(g) + def.antecedencia));
const fimEvento = (g) => somaMin(g.d, JOGO_MIN + viagemMin(g));
const stamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

function titulo(g) {
  const casa = g.emCasa ? "(casa)" : "(fora)";
  return `Jogo Sub-11 · ${pad(g.d.getHours())}h${pad(g.d.getMinutes())} - Equipa ${g.equipa} vs ${g.adversario} ${casa}`;
}
// "equipamento de jogo (azul), caneleiras, …": a cor escolhida para este jogo fica nas notas do evento
function listaLevar(g) {
  const eq = reg(g).equipamento;
  return LEVAR.map((x) => (x === "equipamento de jogo" && eq ? `${x} (${eq})` : x)).join(", ");
}
function detalhes(g) {
  return `Jogo às ${hhmm(g.d)} · sair às ${hhmm(inicioEvento(g))}, chegar ao campo às ${hhmm(somaMin(g.d, -def.antecedencia))}, ` +
    `fim do jogo às ${hhmm(somaMin(g.d, JOGO_MIN))}\n` +
    `Levar: ${listaLevar(g)}\n` +
    `Liga Sub-11 Futebol 7 · Série ${g.serie} · Jornada ${g.jornada}\nJogo ${g.id}`;
}
function linkGoogle(g) {
  const p = new URLSearchParams({
    action: "TEMPLATE", text: titulo(g), dates: `${stamp(inicioEvento(g))}/${stamp(fimEvento(g))}`,
    ctz: "Europe/Lisbon", location: g.mapa, details: detalhes(g),
  });
  return "https://calendar.google.com/calendar/render?" + p.toString();
}
// "Café perto": pesquisa de cafés com o mapa centrado no campo (coordenadas confirmadas no Google Maps),
// para o campo ficar no centro do mapa. Sem coordenadas, pesquisa pelo nome do campo.
function linkCafe(g) {
  const c = (window.COORDS || {})[g.campo];
  if (c) return `https://www.google.com/maps/search/caf%C3%A9/@${c[0]},${c[1]},17z`;
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("café perto de " + g.mapa);
}
// "Café mais perto": caminho a pé do campo (ponto A, pelo nome) até ao café mais próximo (ponto B).
// Assim o campo fica sempre identificado no mapa e vê-se a distância e o tempo reais.
function linkCafeMaisPerto(g) {
  const c = (window.CAFES || {})[g.campo];
  if (!c) return null;
  return "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(g.mapa) +
    "&destination=" + encodeURIComponent(c.dest || `${c.nome}, ${c.morada}, ${c.loc}`) + "&travelmode=walking";
}
function textoCafe(g) {
  const c = (window.CAFES || {})[g.campo];
  if (!c) return "";
  const dist = c.m < 1000 ? `${c.m} m` : `${(c.m / 1000).toFixed(1).replace(".", ",")} km`;
  return `Café mais perto: ${c.nome} · ≈ ${dist} do campo (em linha reta)`;
}
const linkMapa = (g) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(g.mapa);

// ---------- Interface ----------
function conv(g) { return !!estado[g.id]; }

function textoViagem(g) {
  const est = (window.VIAGEM || {})[g.campo];
  if (def.modo === "estimativa" && est != null) return `Viagem ≈ ${est} min de carro, a partir do ponto de partida do grupo`;
  return `Viagem ${viagemMin(g)} min (tempo definido por si)`;
}

function botaoLink(texto, href, classe) {
  const a = document.createElement("a");
  a.className = classe;
  a.target = "_blank"; a.rel = "noopener noreferrer";
  a.href = href;
  a.textContent = texto;
  return a;
}

function cartao(g) {
  const el = document.createElement("article");
  el.className = `card ${g.equipa === "G" ? "g" : ""} ${conv(g) ? "on" : ""}`;
  el.innerHTML = `
    <div class="topo"><span class="equipa">Equipa ${g.equipa}</span><span class="hora">${hhmm(g.d)}</span></div>
    <p class="vs">Equipa ${g.equipa} ${g.emCasa ? "recebe" : "visita"} ${g.adversario}</p>
    <p class="meta">${fmtDia(g.d)} · Jornada ${g.jornada} · ${g.emCasa ? "Em casa" : "Fora"}</p>
    <p class="meta"><a href="${linkMapa(g)}" target="_blank" rel="noopener noreferrer">${g.campo}</a></p>
    <p class="meta">${textoViagem(g)}</p>
    <p class="meta cafe-info" hidden></p>
    <div class="eq" role="group" aria-label="Equipamento deste jogo"><span class="meta">Equipamento:</span></div>
    <p class="meta resumo-reg" hidden></p>
    <div class="acoes"></div>`;

  // Equipamento azul/branco: toque para escolher, toque outra vez para limpar. Fica nas notas do evento.
  const eq = el.querySelector(".eq");
  for (const [valor, nome] of [["azul", "Azul"], ["branco", "Branco"]]) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = nome;
    b.setAttribute("aria-pressed", String(reg(g).equipamento === valor));
    b.addEventListener("click", () => {
      guardarReg(g, { ...reg(g), equipamento: reg(g).equipamento === valor ? undefined : valor });
      render();
    });
    eq.append(b);
  }

  const infoCafe = textoCafe(g);
  if (infoCafe) {
    const p = el.querySelector(".cafe-info");
    p.hidden = false;
    p.textContent = infoCafe;
  }

  const resumo = resumoRegisto(g);
  if (resumo) {
    const p = el.querySelector(".resumo-reg");
    p.hidden = false;
    p.textContent = resumo;
  }

  const acoes = el.querySelector(".acoes");

  const principal = botaoLink(
    conv(g) ? "✓ Convocado · adicionar de novo" : "Convocado → adicionar ao calendário", linkGoogle(g), "btn main");
  principal.addEventListener("click", (ev) => {
    if (!def.configurado && $("def-form")) { // primeira vez: pedir a viagem e a antecedência antes de agendar
      ev.preventDefault();
      abrirDefinicoes(g);
      return;
    }
    if (precisaPerguntar(g)) { // o convite só abre depois de resolver o conflito do fim de semana e escolher o equipamento
      ev.preventDefault();
      decididoConflito.delete(g.id);
      continuarConvocatoria(g);
      return;
    }
    estado[g.id] = true; gravarEstado(estado);
    setTimeout(render, 0);
  });
  acoes.append(principal);

  // Um só botão de café: o caminho a pé do campo ao café mais próximo (sem dados do café, cai para a pesquisa centrada no campo)
  acoes.append(botaoLink("☕ Café mais perto", linkCafeMaisPerto(g) || linkCafe(g), "btn sec"));

  const registar = document.createElement("button");
  registar.type = "button";
  registar.className = "btn sec";
  registar.textContent = resumo ? "📝 Editar registo" : "📝 Registar jogo";
  registar.addEventListener("click", () => abrirRegisto(g));
  acoes.append(registar);

  if (conv(g)) {
    const rm = document.createElement("button");
    rm.className = "btn sec"; rm.textContent = "Não convocado";
    rm.addEventListener("click", () => { delete estado[g.id]; gravarEstado(estado); render(); });
    acoes.append(rm);
  }
  return el;
}

// Texto "17–18 out" (o domingo pode cair no mês seguinte)
function rotuloSemana(k) {
  const sab = new Date(k + "T12:00"), dom = new Date(sab.getTime() + 86400000);
  const mes = (d) => MESES[d.getMonth()];
  return sab.getMonth() === dom.getMonth()
    ? `${sab.getDate()}–${dom.getDate()} ${mes(sab)}`
    : `${sab.getDate()} ${mes(sab)} – ${dom.getDate()} ${mes(dom)}`;
}

let mostrarAnteriores = false;
// Fim de semana atual: o domingo ainda conta como "esta semana"
const primeiraAtual = (() => {
  const hoje = ymd(new Date(Date.now() - 86400000));
  const i = semanas.findIndex((k) => k >= hoje);
  return i === -1 ? semanas.length : i;
})();

function render() {
  const box = $("jogos");
  box.replaceChildren();
  semanas.forEach((k, i) => {
    if (i < primeiraAtual && !mostrarAnteriores) return;
    const lista = porSemana.get(k);
    const sec = document.createElement("section");
    sec.className = "semana-bloco";
    const h = document.createElement("h2");
    h.textContent = `${rotuloSemana(k)} · ${i === primeiraAtual ? "este fim de semana" : "jornada " + lista[0].jornada}`;
    sec.append(h);
    if (lista.filter(conv).length >= 2) {
      const av = document.createElement("p");
      av.className = "aviso";
      av.textContent = "Atenção: há mais do que um jogo marcado como convocado neste fim de semana.";
      sec.append(av);
    }
    for (const g of lista) sec.append(cartao(g));
    box.append(sec);
  });
  if (!box.children.length) box.innerHTML = '<p class="vazio">Já não há jogos por disputar.</p>';

  const t = $("anteriores");
  t.hidden = primeiraAtual === 0;
  t.textContent = mostrarAnteriores ? "Esconder jogos anteriores" : "Mostrar jogos anteriores";

  const ul = $("convocados");
  ul.replaceChildren();
  const todos = jogos.filter(conv);
  $("resumo").hidden = !todos.length;
  for (const g of todos) {
    const li = document.createElement("li");
    li.textContent = `${fmtDia(g.d)} ${hhmm(g.d)} · Equipa ${g.equipa} · ${g.emCasa ? "vs" : "@"} ${g.adversario}`;
    ul.append(li);
  }
}

$("anteriores").onclick = () => { mostrarAnteriores = !mostrarAnteriores; render(); };
render();

// Só um painel aberto de cada vez (definições, registo, equipamento, exportação)
function esconderPaineis() {
  for (const id of ["definicoes", "registo", "equip", "exportar", "conflito"]) {
    const e = $(id);
    if (e) e.hidden = true;
  }
}

// ---------- Definições (viagem e antecedência) ----------
let jogoPendente = null; // jogo que o utilizador tocou antes de ter definições

function abrirDefinicoes(g) {
  jogoPendente = g || null;
  $("def-modo-est").checked = def.modo === "estimativa";
  $("def-modo-fixo").checked = def.modo === "fixo";
  $("def-fixo").value = def.fixo;
  $("def-antec").value = def.antecedencia;
  $("def-continuar").textContent = g ? "Guardar e adicionar ao calendário" : "Guardar";
  if ($("def-num")) $("def-num").value = def.numero ?? "";
  esconderPaineis();
  $("definicoes").hidden = false;
  $("definicoes").scrollIntoView({ behavior: "smooth", block: "start" });
}

const inteiro = (id, min, max, porOmissao) => {
  const v = Math.round(Number($(id).value));
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : porOmissao;
};

if ($("def-form")) { // tolera uma página guardada em memória sem o painel de definições
  $("abrir-def").onclick = () => abrirDefinicoes(null);
  $("def-cancelar").onclick = () => { jogoPendente = null; $("definicoes").hidden = true; };
  $("def-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    def = {
      configurado: true,
      modo: $("def-modo-fixo").checked ? "fixo" : "estimativa",
      fixo: inteiro("def-fixo", 0, 180, 45),
      antecedencia: inteiro("def-antec", 0, 180, 60),
      numero: $("def-num") ? numero($("def-num").value, 1, 99) : def.numero,
    };
    gravarDefinicoes(def);
    $("definicoes").hidden = true;
    const g = jogoPendente; jogoPendente = null;
    render();
    if (g) { decididoConflito.delete(g.id); continuarConvocatoria(g); }
  });
}

// Marca o jogo como convocado e abre o convite do Google Calendar (já com o equipamento nas notas).
function abrirConvite(g) {
  estado[g.id] = true; gravarEstado(estado);
  window.open(linkGoogle(g), "_blank", "noopener,noreferrer");
}

// ---------- Passos ao tocar em «Convocado»: conflito do fim de semana -> equipamento -> convite ----------
// Outro jogo já convocado no mesmo fim de semana (o jogo que se toca ainda não está convocado)
function conflitoSemana(g) {
  if (conv(g)) return null;
  return (porSemana.get(chaveSemana(g.d)) || []).find((x) => x.id !== g.id && conv(x)) || null;
}
const decididoConflito = new Set(); // jogos para os quais o utilizador já decidiu o conflito neste toque
const precisaPerguntar = (g) => (!!conflitoSemana(g) && !!$("conflito")) || (!reg(g).equipamento && !!$("equip"));

function continuarConvocatoria(g) {
  const outro = conflitoSemana(g);
  if (outro && $("conflito") && !decididoConflito.has(g.id)) { abrirConflito(g, outro); return; }
  if (!reg(g).equipamento && $("equip")) { abrirEquipamento(g); return; }
  abrirConvite(g);
  render();
}

// ---------- Painel «Já tem um jogo neste fim de semana» ----------
let jogoConflito = null, outroConflito = null;

function abrirConflito(g, outro) {
  jogoConflito = g; outroConflito = outro;
  $("conflito-texto").textContent =
    `Já marcou como convocado: Equipa ${outro.equipa} ${outro.emCasa ? "vs" : "@"} ${outro.adversario} (${fmtDia(outro.d)}, ${hhmm(outro.d)}). ` +
    `Este jogo é: Equipa ${g.equipa} ${g.emCasa ? "vs" : "@"} ${g.adversario} (${fmtDia(g.d)}, ${hhmm(g.d)}).`;
  esconderPaineis();
  $("conflito").hidden = false;
  $("conflito").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resolverConflito(substituir) {
  const g = jogoConflito, outro = outroConflito;
  if (!g) return;
  jogoConflito = null; outroConflito = null;
  if (substituir && outro) { delete estado[outro.id]; gravarEstado(estado); }
  decididoConflito.add(g.id);
  $("conflito").hidden = true;
  continuarConvocatoria(g);
  render();
}

if ($("conflito")) {
  $("conflito-subst").onclick = () => resolverConflito(true);
  $("conflito-ambos").onclick = () => resolverConflito(false);
  $("conflito-cancelar").onclick = () => { jogoConflito = null; outroConflito = null; $("conflito").hidden = true; };
}

// ---------- Painel «Equipamento deste jogo» (aparece ao tocar em «Convocado») ----------
let jogoEquip = null;

function abrirEquipamento(g) {
  jogoEquip = g;
  $("equip-jogo").textContent = `Equipa ${g.equipa} ${g.emCasa ? "vs" : "@"} ${g.adversario} · ${fmtDia(g.d)}, ${hhmm(g.d)}`;
  esconderPaineis();
  $("equip").hidden = false;
  $("equip").scrollIntoView({ behavior: "smooth", block: "start" });
}

function escolherEquipamento(valor) {
  const g = jogoEquip;
  if (!g) return;
  jogoEquip = null;
  if (valor) guardarReg(g, { ...reg(g), equipamento: valor });
  $("equip").hidden = true;
  abrirConvite(g);
  render();
}

if ($("equip")) {
  $("equip-azul").onclick = () => escolherEquipamento("azul");
  $("equip-branco").onclick = () => escolherEquipamento("branco");
  $("equip-sem").onclick = () => escolherEquipamento("");
  $("equip-cancelar").onclick = () => { jogoEquip = null; $("equip").hidden = true; };
}

// ---------- Painel «Registar jogo» ----------
let jogoReg = null;      // jogo que está a ser registado
let marcadoresTmp = [];  // marcadores (números de camisola) enquanto o painel está aberto

function desenharMarcadores() {
  const box = $("reg-chips");
  box.replaceChildren();
  marcadoresTmp.forEach((n, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = `${n === 0 ? "auto-golo" : "nº " + n} ✕`;
    b.setAttribute("aria-label", `Remover golo ${n === 0 ? "auto-golo" : "do número " + n}`);
    b.addEventListener("click", () => { marcadoresTmp.splice(i, 1); desenharMarcadores(); });
    box.append(b);
  });
  const nos = numero($("reg-nos").value, 0, 99);
  const aviso = $("reg-aviso");
  aviso.hidden = !(nos !== null && marcadoresTmp.length > nos);
  aviso.textContent = "Indicou mais marcadores do que golos da vossa equipa. Confirme o resultado.";
}

function abrirRegisto(g) {
  jogoReg = g;
  const r = reg(g);
  $("reg-jogo").textContent = `Equipa ${g.equipa} ${g.emCasa ? "vs" : "@"} ${g.adversario} · ${fmtDia(g.d)}, ${hhmm(g.d)}`;
  $("reg-nos").value = r.golosNos ?? "";
  $("reg-adv").value = r.golosAdv ?? "";
  $("reg-arb").value = r.arbitro ?? "";
  $("reg-tit").value = r.titular ?? "";
  $("reg-eq").value = r.equipamento ?? "";
  $("reg-notas").value = r.notas ?? "";
  $("reg-num").value = "";
  marcadoresTmp = [...(r.marcadores ?? [])];
  desenharMarcadores();
  esconderPaineis();
  $("registo").hidden = false;
  $("registo").scrollIntoView({ behavior: "smooth", block: "start" });
}

function juntarMarcador(n) {
  if (n === null) { $("reg-num").focus(); return; }
  if (marcadoresTmp.length >= 30) return;
  marcadoresTmp.push(n);
  $("reg-num").value = "";
  desenharMarcadores();
}

if ($("reg-form")) {
  $("reg-add").onclick = () => juntarMarcador(numero($("reg-num").value, 1, 99));
  $("reg-ag").onclick = () => juntarMarcador(0);
  $("reg-num").addEventListener("keydown", (ev) => { // Enter junta o golo em vez de guardar tudo
    if (ev.key === "Enter") { ev.preventDefault(); juntarMarcador(numero($("reg-num").value, 1, 99)); }
  });
  $("reg-nos").addEventListener("input", desenharMarcadores);
  $("reg-cancelar").onclick = () => { jogoReg = null; $("registo").hidden = true; };
  $("reg-apagar").onclick = () => {
    if (jogoReg) guardarReg(jogoReg, {});
    jogoReg = null;
    $("registo").hidden = true;
    render();
  };
  $("reg-form").addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (!jogoReg) return;
    guardarReg(jogoReg, {
      golosNos: $("reg-nos").value,
      golosAdv: $("reg-adv").value,
      marcadores: marcadoresTmp,
      arbitro: $("reg-arb").value,
      titular: $("reg-tit").value,
      equipamento: $("reg-eq").value,
      notas: $("reg-notas").value,
    });
    jogoReg = null;
    $("registo").hidden = true;
    render();
  });
}

// ---------- Exportar o que foi registado: resumo da época, PDF e cópia de segurança ----------
const idsValidos = new Set(jogos.map((g) => g.id));

function calcularResumo() {
  const r = {
    convocados: jogos.filter(conv).length, comResultado: 0, v: 0, e: 0, d: 0, gm: 0, gs: 0,
    marcadores: new Map(), autogolos: 0, arbSim: 0, arbNao: 0, titular: 0, suplente: 0, naoJogou: 0, golosAtleta: null,
  };
  for (const g of jogos) {
    const x = reg(g);
    if (x.golosNos != null && x.golosAdv != null) {
      r.comResultado++; r.gm += x.golosNos; r.gs += x.golosAdv;
      if (x.golosNos > x.golosAdv) r.v++; else if (x.golosNos < x.golosAdv) r.d++; else r.e++;
    }
    for (const n of x.marcadores ?? []) {
      if (n === 0) r.autogolos++; else r.marcadores.set(n, (r.marcadores.get(n) || 0) + 1);
    }
    if (x.arbitro === "sim") r.arbSim++; else if (x.arbitro === "nao") r.arbNao++;
    if (x.titular === "titular") r.titular++; else if (x.titular === "suplente") r.suplente++; else if (x.titular === "nao-jogou") r.naoJogou++;
  }
  if (def.numero) r.golosAtleta = r.marcadores.get(def.numero) || 0;
  return r;
}

function novo(tag, texto, classe) { // texto sempre via textContent (notas do utilizador nunca como HTML)
  const e = document.createElement(tag);
  if (texto != null) e.textContent = texto;
  if (classe) e.className = classe;
  return e;
}

function desenharRelatorio() {
  const box = $("relatorio");
  box.replaceChildren();
  const r = calcularResumo();
  box.append(novo("h3", "Registo da época 2026/27"));
  box.append(novo("p", `Gerado em ${pad(new Date().getDate())}/${pad(new Date().getMonth() + 1)}/${new Date().getFullYear()} · só com o que foi registado neste telemóvel`, "meta"));
  box.append(novo("h3", "Resumo"));
  const ul = novo("ul");
  const li = (t) => ul.append(novo("li", t));
  li(`Jogos convocados: ${r.convocados}`);
  li(`Jogos com resultado: ${r.comResultado} (${r.v} vitórias, ${r.e} empates, ${r.d} derrotas)`);
  li(`Golos marcados: ${r.gm} · sofridos: ${r.gs}`);
  if (r.marcadores.size || r.autogolos) {
    const partes = [...r.marcadores].sort((a, b) => b[1] - a[1] || a[0] - b[0]).map(([n, k]) => `nº ${n} (${k})`);
    if (r.autogolos) partes.push(`auto-golos do adversário (${r.autogolos})`);
    li("Marcadores: " + partes.join(", "));
  }
  if (r.golosAtleta !== null) li(`Golos do atleta (camisola ${def.numero}): ${r.golosAtleta}`);
  li(`Árbitro: sim em ${r.arbSim} jogos · não em ${r.arbNao}`);
  li(`Atleta: titular ${r.titular} · suplente ${r.suplente} · não jogou ${r.naoJogou}`);
  box.append(ul);

  box.append(novo("h3", "Jogos"));
  const linhas = jogos.filter((g) => conv(g) || Object.keys(reg(g)).length);
  if (!linhas.length) {
    box.append(novo("p", "Ainda não há jogos convocados nem registados.", "meta"));
    return;
  }
  const tab = novo("table");
  const cab = novo("tr");
  for (const c of ["Data", "Jogo", "Resultado", "Marcadores", "Árbitro", "Equip.", "Notas"]) cab.append(novo("th", c));
  const thead = novo("thead"); thead.append(cab); tab.append(thead);
  const tb = novo("tbody");
  for (const g of linhas) {
    const x = reg(g), tr = novo("tr");
    tr.append(novo("td", `${fmtDia(g.d)}, ${hhmm(g.d)}`));
    tr.append(novo("td", `Equipa ${g.equipa} ${g.emCasa ? "vs" : "@"} ${g.adversario}${conv(g) ? "" : " (não convocado)"}`));
    tr.append(novo("td", x.golosNos != null && x.golosAdv != null ? `${x.golosNos}–${x.golosAdv}` : "—"));
    tr.append(novo("td", x.marcadores ? agruparMarcadores(x.marcadores) : "—"));
    tr.append(novo("td", x.arbitro ? (x.arbitro === "sim" ? "sim" : "não") : "—"));
    tr.append(novo("td", x.equipamento ?? "—"));
    tr.append(novo("td", x.notas ?? "—"));
    tb.append(tr);
  }
  tab.append(tb);
  const volta = novo("div", null, "tabela");
  volta.append(tab);
  box.append(volta);
}

function mensagemExp(texto) {
  const m = $("exp-msg");
  m.textContent = texto;
  m.hidden = false;
}

function copiaDados() {
  return { app: "jogos-2627-beta", versao: 1, exportadoEm: new Date().toISOString(), convocados: estado, registo };
}

if ($("exportar")) {
  $("abrir-exp").onclick = () => {
    esconderPaineis();
    $("exp-msg").hidden = true;
    desenharRelatorio();
    $("exportar").hidden = false;
    $("exportar").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $("exp-fechar").onclick = () => { $("exportar").hidden = true; };

  // PDF: a impressão do telemóvel já tem «Guardar como PDF»; o CSS de impressão mostra só o relatório.
  $("exp-pdf").onclick = () => {
    desenharRelatorio();
    const antes = document.title;
    document.title = "Registo-jogos-2026-27";
    window.onafterprint = () => { document.title = antes; window.onafterprint = null; };
    window.print();
  };

  $("exp-ficheiro").onclick = () => {
    try {
      const blob = new Blob([JSON.stringify(copiaDados(), null, 1)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jogos-2627-copia-${ymd(new Date())}.json`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      mensagemExp("Cópia pedida ao telemóvel. Se o ficheiro não aparecer em Transferências, use «Copiar cópia (texto)».");
    } catch {
      mensagemExp("Não foi possível criar o ficheiro. Use «Copiar cópia (texto)».");
    }
  };

  $("exp-copiar").onclick = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(copiaDados()));
      mensagemExp("Cópia copiada. Cole-a numa nota ou mensagem para si e guarde-a.");
    } catch {
      mensagemExp("O telemóvel não deixou copiar. Use «Cópia de segurança (ficheiro)».");
    }
  };

  $("exp-carregar").onclick = () => $("exp-importar").click();
  $("exp-importar").addEventListener("change", () => {
    const f = $("exp-importar").files && $("exp-importar").files[0];
    if (!f) return;
    if (f.size > 500000) { mensagemExp("Ficheiro grande demais para ser uma cópia desta página."); return; }
    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        const d = JSON.parse(String(leitor.result));
        if (!d || typeof d !== "object" || !d.registo || typeof d.registo !== "object") throw new Error("formato");
        let n = 0;
        for (const [id, x] of Object.entries(d.registo)) {
          if (!idsValidos.has(id)) continue;
          const l = limparRegisto(x);
          if (l) { registo[id] = l; n++; }
        }
        for (const [id, v] of Object.entries(d.convocados || {})) if (idsValidos.has(id) && v === true) estado[id] = true;
        try { localStorage.setItem(CHAVE_REG, JSON.stringify(registo)); } catch { /* modo privado */ }
        gravarEstado(estado);
        desenharRelatorio();
        render();
        mensagemExp(`Cópia carregada: ${n} jogos com registo. Os registos do mesmo jogo foram substituídos pelos da cópia.`);
      } catch {
        mensagemExp("Este ficheiro não parece uma cópia desta página.");
      }
      $("exp-importar").value = "";
    };
    leitor.readAsText(f);
  });
}
