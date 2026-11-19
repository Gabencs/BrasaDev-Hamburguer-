/* Brasa Dev - Sistema de gestão para hamburgueria (versão 1.01)

   Organização do arquivo:
   1. Dados de exemplo e estado do sistema
   2. Regras de negócio (disponibilidade, estoque e taxa de entrega)
   3. Telas: painel, novo pedido, pedidos, cardápio, estoque e clientes
   4. Acesso: cadastro da empresa e login
*/

const $ = s => document.querySelector(s);
const R = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const N = v => v.toLocaleString('pt-BR');
const esc = s =>
  String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ZN = {
  1: { l: 'Zona 1', d: 'até 2 km', t: 5 },
  2: { l: 'Zona 2', d: 'de 2 a 5 km', t: 9 },
  3: { l: 'Zona 3', d: 'de 5 a 8 km', t: 14 },
  0: { l: 'Fora da área', d: 'acima de 8 km', t: null }
};
let S,
  view = 'painel',
  cart = {},
  tipo = 'retirada',
  cli = '',
  cat = 'Todos';

// Dados de exemplo usados no primeiro acesso e no botão "Restaurar dados"
function seed() {
  const d = (h, m) => {
    const x = new Date();
    x.setHours(h, m, 0, 0);
    return x.toISOString();
  };
  /* ---------- Regras de negócio ---------- */
  // Busca um ingrediente pelo id
  const ing = [
    [1, 'Pão brioche', 'un', 60, 20],
    [2, 'Blend bovino 160 g', 'un', 45, 15],
    [3, 'Queijo cheddar (fatia)', 'un', 70, 20],
    [4, 'Bacon', 'g', 40, 500],
    [5, 'Alface', 'g', 800, 200],
    [6, 'Tomate', 'g', 900, 300],
    [7, 'Cebola caramelizada', 'g', 180, 250],
    [8, 'Maionese da casa', 'g', 1900, 500],
    [9, 'Molho barbecue', 'g', 1200, 300],
    [10, 'Batata palito', 'g', 5200, 2000],
    [11, 'Refrigerante lata', 'un', 36, 12]
  ].map(a => ({ id: a[0], nome: a[1], un: a[2], qtd: a[3], min: a[4] }));
  const P = [
    [
      1,
      'Brasa Clássico',
      'Lanche',
      28.9,
      [
        [1, 1],
        [2, 1],
        [3, 1],
        [5, 20],
        [6, 30],
        [8, 20]
      ]
    ],
    [
      2,
      'Brasa Bacon',
      'Lanche',
      34.9,
      [
        [1, 1],
        [2, 1],
        [3, 1],
        [4, 60],
        [9, 25],
        [7, 30]
      ]
    ],
    [
      3,
      'Duplo Cheddar',
      'Lanche',
      39.9,
      [
        [1, 1],
        [2, 2],
        [3, 2],
        [7, 30],
        [8, 20]
      ]
    ],
    [
      4,
      'Batata Brasa',
      'Porção',
      19.9,
      [
        [10, 200],
        [8, 30]
      ]
    ],
    [5, 'Refrigerante lata', 'Bebida', 7, [[11, 1]]]
  ].map(a => ({
    id: a[0],
    nome: a[1],
    cat: a[2],
    preco: a[3],
    ficha: a[4].map(f => ({ i: f[0], q: f[1] }))
  }));
  const o = (id, c, t, tx, h, m, s, it) => ({
    id,
    cli: c,
    tipo: t,
    taxa: tx,
    data: d(h, m),
    status: s,
    itens: it.map(([k, q]) => ({ n: P[k - 1].nome, q, p: P[k - 1].preco })),
    total: it.reduce((a, [k, q]) => a + P[k - 1].preco * q, 0) + tx
  });
  return {
    k: 100,
    n: 1006,
    ing,
    prod: P,
    cli: [
      {
        id: 1,
        nome: 'Marina Souza',
        tel: '(11) 98877-1020',
        end: 'Rua das Acácias, 120',
        bairro: 'Jardim Vitória',
        zona: 1
      },
      {
        id: 2,
        nome: 'Carlos Lima',
        tel: '(11) 97755-3412',
        end: 'Av. Brasil, 845',
        bairro: 'Vila Nova',
        zona: 2
      },
      {
        id: 3,
        nome: 'Paula Mendes',
        tel: '(11) 99120-4488',
        end: 'Estrada Velha, 77',
        bairro: 'Sítio Alto',
        zona: 3
      },
      {
        id: 4,
        nome: 'Rafael Torres',
        tel: '(11) 96600-7821',
        end: 'Rod. Norte, km 12',
        bairro: 'Distrito Industrial',
        zona: 0
      }
    ],
    ped: [
      o(1001, 'Marina Souza', 'entrega', 5, 11, 48, 'Entregue', [
        [1, 2],
        [4, 1],
        [5, 2]
      ]),
      o(1002, 'Balcão', 'retirada', 0, 12, 15, 'Retirado', [
        [3, 1],
        [5, 1]
      ]),
      o(1003, 'Carlos Lima', 'entrega', 9, 12, 40, 'Entregue', [
        [2, 1],
        [1, 1],
        [5, 2]
      ]),
      o(1004, 'Paula Mendes', 'entrega', 14, 13, 5, 'Pronto', [
        [3, 2],
        [4, 1]
      ]),
      o(1005, 'Balcão', 'retirada', 0, 13, 22, 'Em preparo', [
        [1, 1],
        [5, 1]
      ])
    ]
  };
}
function load() {
  try {
    return JSON.parse(localStorage.getItem('brasadev'));
  } catch (e) {
    return null;
  }
}
function save() {
  try {
    localStorage.setItem('brasadev', JSON.stringify(S));
  } catch (e) {}
}
S = load() || seed();
S.mov = S.mov || [];

const ing = id => S.ing.find(x => x.id == id);
// Regra 2: o produto só fica disponível se todos os ingredientes da ficha técnica tiverem estoque
const can = (p, n = 1) => p.ficha.every(f => ing(f.i).qtd >= f.q * n);
const falta = p => p.ficha.filter(f => ing(f.i).qtd < f.q).map(f => ing(f.i).nome);
const stt = i => (i.qtd <= 0 ? ['Zerado', 'bd'] : i.qtd <= i.min ? ['Baixo', 'wn'] : ['Ok', 'ok']);
const flow = p => ['Em preparo', 'Pronto', p.tipo == 'entrega' ? 'Entregue' : 'Retirado'];
const hora = iso => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const isHoje = iso => new Date(iso).toDateString() == new Date().toDateString();
const sbdg = s => `<span class="bdg ${s == 'Em preparo' ? 'wn' : 'ok'}">${s}</span>`;
let tt;
function toast(m) {
  const t = $('#toast');
  t.textContent = m;
  t.classList.add('on');
  clearTimeout(tt);
  tt = setTimeout(() => t.classList.remove('on'), 2800);
}

const TABS = [
  ['painel', 'Painel'],
  ['pdv', 'Novo pedido'],
  ['pedidos', 'Pedidos'],
  ['cardapio', 'Cardápio'],
  ['estoque', 'Estoque'],
  ['clientes', 'Clientes']
];
function go(v) {
  view = v;
  render();
  window.scrollTo(0, 0);
}
function render() {
  $('.brand').innerHTML = `<span class="bl">${logo(20)}</span><span class="bn">${esc(S.emp.nome)}</span>`;
  const alerts = S.ing.filter(i => i.qtd <= i.min).length;
  $('#nav').innerHTML =
    TABS.map(
      ([k, l]) =>
        `<button class="nv ${view == k ? 'on' : ''}" onclick="go('${k}')">${l}${k == 'estoque' && alerts ? `<em>${alerts}</em>` : ''}</button>`
    ).join('') + '<button class="nv out" onclick="logout()">Sair</button>';
  $('#main').innerHTML = V[view]();
  save();
}
function reset() {
  const e = S.emp;
  S = seed();
  S.mov = [];
  S.emp = e;
  cart = {};
  cli = '';
  tipo = 'retirada';
  render();
  toast('Dados de exemplo restaurados');
}

/* ---------- Painel ---------- */
function vPainel() {
  const H = S.ped.filter(p => isHoje(p.data)),
    tot = H.reduce((a, p) => a + p.total, 0),
    top = {};
  H.forEach(p => p.itens.forEach(i => (top[i.n] = (top[i.n] || 0) + i.q)));
  const tp = Object.entries(top)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    mx = tp[0] ? tp[0][1] : 1;
  const low = S.ing.filter(i => i.qtd <= i.min),
    off = S.prod.filter(p => !can(p));
  const dt = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return `<div class="hd"><div><h1>Painel do dia</h1><p>${dt}</p></div><button class="btn pri" onclick="go('pdv')">Novo pedido</button></div>
 <div class="kpis"><div><b>${R(tot)}</b><span>Vendas de hoje</span></div><div><b>${H.length}</b><span>Pedidos</span></div><div><b>${R(H.length ? tot / H.length : 0)}</b><span>Ticket médio</span></div><div><b>${H.filter(p => p.status == 'Em preparo').length}</b><span>Em preparo</span></div></div>
 <div class="g2"><div class="card"><h2>Últimos pedidos</h2>${
   H.length
     ? H.slice()
         .reverse()
         .slice(0, 6)
         .map(
           p =>
             `<div class="row"><div class="grow"><b>#${p.id} ${esc(p.cli)}</b><div class="mut">${hora(p.data)}, ${p.tipo}</div></div>${sbdg(p.status)}<span class="num">${R(p.total)}</span></div>`
         )
         .join('')
     : '<div class="empty">Nenhum pedido hoje.</div>'
 }
 <h2 style="margin-top:22px">Mais vendidos</h2>${tp.length ? tp.map(([n, q]) => `<div class="row"><span class="grow">${esc(n)}</span><div class="bar" style="width:46%"><i style="width:${(q / mx) * 100}%"></i></div><span class="num" style="width:28px;text-align:right">${q}</span></div>`).join('') : '<div class="empty">Sem vendas ainda.</div>'}</div>
 <div class="card"><h2>Atenção no estoque</h2>${low.length ? low.map(i => `<div class="row"><div class="grow"><b>${esc(i.nome)}</b><div class="mut">${N(i.qtd)} ${i.un} (mínimo ${N(i.min)})</div></div><span class="bdg ${stt(i)[1]}">${stt(i)[0]}</span></div>`).join('') : '<div class="empty">Tudo acima do mínimo.</div>'}
 <h2 style="margin-top:22px">Indisponíveis no cardápio</h2>${off.length ? off.map(p => `<div class="row"><div class="grow"><b>${esc(p.nome)}</b><div class="mut">Falta: ${falta(p).map(esc).join(', ')}</div></div><span class="bdg bd">Bloqueado</span></div>`).join('') : '<div class="empty">Todos os itens disponíveis.</div>'}</div></div>`;
}

/* ---------- Imagens dos produtos (ilustrações em SVG) ---------- */
// Procura um ingrediente na ficha técnica pelo nome (ex.: "bacon", "queijo")
const tem = (p, txt) => p.ficha.find(f => ing(f.i) && ing(f.i).nome.toLowerCase().includes(txt));
const qtdDe = (p, txt) => (tem(p, txt) ? tem(p, txt).q : 0);

// O hambúrguer é montado em camadas, de acordo com a ficha técnica do lanche
function burger(p) {
  const alt = { pao: 12, carne: 12, queijo: 8, bacon: 6, cebola: 6, tomate: 7, alface: 8, topo: 26 };
  const carnes = Math.max(1, Math.min(qtdDe(p, 'blend'), 3));
  const fatias = Math.min(qtdDe(p, 'queijo'), 3);
  const camadas = ['pao'];
  for (let i = 0; i < carnes; i++) {
    camadas.push('carne');
    if (i < fatias) camadas.push('queijo');
  }
  if (tem(p, 'bacon')) camadas.push('bacon');
  if (tem(p, 'cebola')) camadas.push('cebola');
  if (tem(p, 'tomate')) camadas.push('tomate');
  if (tem(p, 'alface')) camadas.push('alface');
  camadas.push('topo');

  const total = camadas.reduce((a, k) => a + alt[k], 0);
  const H = Math.max(100, total + 16);
  const desenho = {
    pao: y => `<path d="M16 ${y} h88 v6 q0 6 -6 6 h-76 q-6 0 -6 -6z" fill="#D58A2E"/>`,
    carne: y =>
      `<rect x="12" y="${y}" width="96" height="12" rx="6" fill="#5A3321"/><rect x="22" y="${y + 3}" width="76" height="2" rx="1" fill="#7A4A31"/>`,
    queijo: y => `<path d="M14 ${y} h92 v4 h-14 l-7 8 l-7 -8 h-30 l-7 8 l-7 -8 h-20z" fill="#F7C531"/>`,
    bacon: y =>
      `<rect x="10" y="${y}" width="100" height="6" rx="3" fill="#B53F2B"/><rect x="14" y="${y + 2}" width="92" height="1.8" rx=".9" fill="#E79A7C"/>`,
    cebola: y => `<rect x="16" y="${y}" width="88" height="6" rx="3" fill="#B9772C"/>`,
    tomate: y => `<rect x="14" y="${y}" width="92" height="7" rx="3.5" fill="#D93A2B"/>`,
    alface: y =>
      `<path d="M12 ${y + 2} q6 -8 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 v6 h-96z" fill="#67B03C"/>`,
    topo: y =>
      `<path d="M14 ${y + 26} Q14 ${y} 60 ${y} Q106 ${y} 106 ${y + 26} z" fill="#E09A3A"/>` +
      [
        [38, 9],
        [54, 5],
        [72, 8],
        [46, 16],
        [82, 17]
      ]
        .map(([x, dy]) => `<ellipse cx="${x}" cy="${y + dy}" rx="3.2" ry="1.7" fill="#FFF0CC"/>`)
        .join('')
  };
  let y = H - 6;
  let corpo = '';
  camadas.forEach(k => {
    y -= alt[k];
    corpo += desenho[k](y);
  });
  return `<svg viewBox="0 0 120 ${H}" role="img" aria-label="${esc(p.nome)}"><ellipse cx="60" cy="${H - 3}" rx="46" ry="3" fill="#000" opacity=".12"/>${corpo}</svg>`;
}

const batata = p =>
  `<svg viewBox="0 0 120 100" role="img" aria-label="${esc(p.nome)}"><g fill="#F1BE45"><rect x="36" y="18" width="9" height="46" rx="3" transform="rotate(-8 40 60)"/><rect x="47" y="10" width="9" height="52" rx="3"/><rect x="58" y="16" width="9" height="48" rx="3" transform="rotate(5 62 60)"/><rect x="69" y="8" width="9" height="54" rx="3" transform="rotate(-4 73 60)"/><rect x="79" y="20" width="9" height="44" rx="3" transform="rotate(10 83 60)"/></g><path d="M28 54 h64 l-7 40 h-50z" fill="#D2381C"/><path d="M52 54 h16 l-1.2 40 h-13.6z" fill="#FBE9D0"/></svg>`;

const lata = p =>
  `<svg viewBox="0 0 120 100" role="img" aria-label="${esc(p.nome)}"><rect x="42" y="14" width="36" height="76" rx="8" fill="#C8301C"/><rect x="42" y="14" width="36" height="9" rx="4" fill="#C9CED3"/><rect x="42" y="81" width="36" height="9" rx="4" fill="#C9CED3"/><path d="M42 42 q9 -8 18 0 t18 0 v16 q-9 -8 -18 0 t-18 0z" fill="#fff" opacity=".92"/><rect x="48" y="20" width="4" height="64" rx="2" fill="#fff" opacity=".22"/></svg>`;

// Ilustração usada quando o produto ainda não tem foto
const ilustracao = p => (p.cat === 'Lanche' ? burger(p) : p.cat === 'Porção' ? batata(p) : lata(p));

// Nome do arquivo da foto na pasta imagens/ (ex.: "Brasa Clássico" vira brasa-classico.jpg)
const slug = nome =>
  nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Ordem de busca: foto enviada pelo sistema, arquivo da pasta imagens/ e, por último, a ilustração
function foto(p) {
  if (p.img) return `<img src="${p.img}" alt="${esc(p.nome)}">`;
  return `<img src="imagens/${slug(p.nome)}.jpg" alt="${esc(p.nome)}" onerror="fotoFalhou(this, ${p.id})">`;
}

function fotoFalhou(img, id) {
  const p = S.prod.find(x => x.id == id);
  if (p) img.outerHTML = ilustracao(p);
}

// Envio de foto pelo botão "Foto" do cardápio (a imagem é reduzida e salva no navegador)
let fotoId = null;

function trocarFoto(id) {
  fotoId = id;
  $('#pf').value = '';
  $('#pf').click();
}

function salvarFoto(inp) {
  const arquivo = inp.files[0];
  if (!arquivo) return;
  const leitor = new FileReader();
  leitor.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 480 / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * k);
      c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      S.prod.find(x => x.id == fotoId).img = c.toDataURL('image/jpeg', 0.85);
      render();
      toast('Foto atualizada');
    };
    im.onerror = () => toast('Não foi possível ler a imagem');
    im.src = leitor.result;
  };
  leitor.readAsDataURL(arquivo);
}

/* ---------- Novo pedido ---------- */
function add(id) {
  const p = S.prod.find(x => x.id == id);
  if (!can(p, (cart[id] || 0) + 1)) return toast('Estoque insuficiente para mais uma unidade');
  cart[id] = (cart[id] || 0) + 1;
  render();
}
function dec(id) {
  cart[id] = (cart[id] || 0) - 1;
  if (cart[id] <= 0) delete cart[id];
  render();
}
const setTipo = t => {
    tipo = t;
    render();
  },
  setCli = v => {
    cli = v;
    render();
  },
  setCat = c => {
    cat = c;
    render();
  };
function vPdv() {
  const L = S.prod.filter(p => cat == 'Todos' || p.cat == cat);
  const it = Object.entries(cart).map(([k, q]) => ({ p: S.prod.find(x => x.id == k), q }));
  const sub = it.reduce((a, x) => a + x.p.preco * x.q, 0),
    c = S.cli.find(x => x.id == cli);
  const fee = tipo == 'entrega' ? (c ? ZN[c.zona].t : null) : 0,
    fora = tipo == 'entrega' && c && fee === null;
  const ok = it.length && !fora && (tipo == 'retirada' || c);
  return `<div class="hd"><div><h1>Novo pedido</h1><p>Itens sem estoque ficam bloqueados automaticamente.</p></div></div>
 <div class="pdv"><div><div class="tabs">${['Todos', 'Lanche', 'Porção', 'Bebida'].map(x => `<button class="tab ${cat == x ? 'on' : ''}" onclick="setCat('${x}')">${x}</button>`).join('')}</div>
 <div class="grid">${L.map(p => {
   const dis = !can(p),
     max = !dis && !can(p, (cart[p.id] || 0) + 1);
   return `<button class="pt" ${dis || max ? 'disabled' : ''} onclick="add(${p.id})"><span class="pi">${foto(p)}</span><span class="mut">${p.cat}</span><b>${esc(p.nome)}</b>${dis ? `<span class="bdg bd" style="align-self:flex-start">Indisponível</span><span class="fch">Falta: ${falta(p).map(esc).join(', ')}</span>` : max ? '<span class="bdg wn" style="align-self:flex-start">Limite do estoque</span>' : ''}<span class="num">${R(p.preco)}</span></button>`;
 }).join('')}</div></div>
 <div class="card"><h2>Pedido</h2>
 <div class="seg"><button class="${tipo == 'retirada' ? 'on' : ''}" onclick="setTipo('retirada')">Retirada</button><button class="${tipo == 'entrega' ? 'on' : ''}" onclick="setTipo('entrega')">Entrega</button></div>
 <label>Cliente<select onchange="setCli(this.value)"><option value="">${tipo == 'entrega' ? 'Selecione o cliente' : 'Balcão (sem cadastro)'}</option>${S.cli.map(x => `<option value="${x.id}" ${x.id == cli ? 'selected' : ''}>${esc(x.nome)}${x.zona == 0 ? ' (somente retirada)' : ''}</option>`).join('')}</select></label>
 ${it.length ? it.map(x => `<div class="row"><div class="grow"><b>${esc(x.p.nome)}</b><div class="mut">${R(x.p.preco)}</div></div><div class="qty"><button onclick="dec(${x.p.id})" aria-label="Remover um">−</button><b>${x.q}</b><button onclick="add(${x.p.id})" aria-label="Adicionar um">+</button></div></div>`).join('') : '<div class="empty">Toque em um item para adicionar.</div>'}
 <div class="sum" style="margin-top:8px"><span>Subtotal</span><span class="num">${R(sub)}</span></div>
 <div class="sum"><span>Taxa de entrega ${tipo == 'entrega' && c ? `(${ZN[c.zona].l})` : ''}</span><span class="num">${tipo != 'entrega' ? 'Sem taxa' : fora ? '—' : fee === null ? 'Escolha o cliente' : R(fee)}</span></div>
 ${fora ? `<div class="alert"><b>Entrega não atendida</b><span>O endereço de ${esc(c.nome)} fica acima de 8 km. Este cliente pode retirar o pedido no balcão, sem taxa.</span><button class="btn sm" onclick="setTipo('retirada')">Mudar para retirada no balcão</button></div>` : ''}
 <div class="sum tot"><span>Total</span><span>${R(sub + (fee || 0))}</span></div>
 <button class="btn pri" style="width:100%;margin-top:14px" ${ok ? '' : 'disabled'} onclick="confirmar()">Confirmar pedido</button></div></div>`;
}
// Regras 1 e 3: valida o pedido, calcula a taxa por zona e dá baixa no estoque
function confirmar() {
  const it = Object.entries(cart).map(([k, q]) => ({ p: S.prod.find(x => x.id == k), q }));
  if (!it.length) return toast('Adicione itens ao pedido');
  const c = S.cli.find(x => x.id == cli);
  if (tipo == 'entrega' && (!c || ZN[c.zona].t === null))
    return toast('Selecione um cliente dentro da área de entrega');
  for (const x of it) if (!can(x.p, x.q)) return toast(x.p.nome + ': estoque insuficiente');
  const taxa = tipo == 'entrega' ? ZN[c.zona].t : 0,
    id = S.n++,
    used = {};
  it.forEach(x => x.p.ficha.forEach(f => (used[f.i] = (used[f.i] || 0) + f.q * x.q)));
  Object.entries(used).forEach(([k, q]) => {
    const g = ing(k);
    g.qtd -= q;
    mov(g, 'Saída', q, 'Pedido #' + id);
  });
  S.ped.push({
    id,
    cli: c ? c.nome : 'Balcão',
    tipo,
    taxa,
    data: new Date().toISOString(),
    status: 'Em preparo',
    itens: it.map(x => ({ n: x.p.nome, q: x.q, p: x.p.preco })),
    total: it.reduce((a, x) => a + x.p.preco * x.q, 0) + taxa
  });
  cart = {};
  cli = '';
  view = 'pedidos';
  render();
  toast('Pedido #' + id + ' confirmado e estoque atualizado');
}

/* ---------- Pedidos ---------- */
function adv(id) {
  const p = S.ped.find(x => x.id == id),
    f = flow(p),
    k = f.indexOf(p.status);
  if (k < 2) p.status = f[k + 1];
  render();
}
function vPedidos() {
  const L = S.ped.slice().reverse();
  return `<div class="hd"><div><h1>Pedidos</h1><p>${L.length} registrados</p></div><button class="btn pri" onclick="go('pdv')">Novo pedido</button></div>
 <div class="card">${L.map(p => {
   const f = flow(p),
     k = f.indexOf(p.status);
   return `<div class="row" style="flex-wrap:wrap"><div class="grow" style="min-width:200px"><b>#${p.id} ${esc(p.cli)}</b> <span class="bdg ${p.tipo == 'entrega' ? 'wn' : 'ok'}" style="margin-left:6px">${p.tipo}</span><div class="mut">${p.itens.map(i => i.q + '× ' + esc(i.n)).join(', ')}</div><div class="mut">${new Date(p.data).toLocaleDateString('pt-BR')} às ${hora(p.data)}${p.taxa ? ', taxa ' + R(p.taxa) : ''}</div></div>${sbdg(p.status)}<span class="num" style="width:90px;text-align:right">${R(p.total)}</span>${k < 2 ? `<button class="btn sm" onclick="adv(${p.id})">Marcar como ${f[k + 1].toLowerCase()}</button>` : ''}</div>`;
 }).join('')}</div>`;
}

/* ---------- Máscaras e validação de campos ---------- */
const MK = {
  int: 'inputmode="numeric" autocomplete="off"',
  dec: 'inputmode="decimal" autocomplete="off"',
  tel: 'inputmode="tel" autocomplete="off" placeholder="(00) 00000-0000"'
};
const fld = (id, l, m = '', x = '') =>
  `<label>${l}<input id="${id}" type="text" ${m ? `data-m="${m}" ${MK[m]}` : ''} ${x}></label>`;
const num = v => parseFloat(String(v).replace(',', '.')) || 0;
document.addEventListener('input', e => {
  const m = e.target.dataset && e.target.dataset.m;
  if (!m) return;
  let v = e.target.value;
  if (m == 'int') v = v.replace(/\D/g, '').slice(0, 7);
  else if (m == 'dec') {
    v = v.replace(/[^\d.,]/g, '').replace(/\./g, ',');
    const i = v.indexOf(',');
    if (i >= 0)
      v =
        v.slice(0, i + 1) +
        v
          .slice(i + 1)
          .replace(/,/g, '')
          .slice(0, 2);
    v = v.slice(0, 9);
  } else if (m == 'tel') {
    const d = v.replace(/\D/g, '').slice(0, 11),
      k = d.length > 10 ? 7 : 6;
    v =
      d.length > k
        ? `(${d.slice(0, 2)}) ${d.slice(2, k)}-${d.slice(k)}`
        : d.length > 2
          ? `(${d.slice(0, 2)}) ${d.slice(2)}`
          : d
            ? `(${d}`
            : '';
  }
  e.target.value = v;
});
function modal(t, body, ok, lb = 'Salvar') {
  const d = $('#dlg');
  d.innerHTML = `<h2>${t}</h2>${body}<div class="act"><button class="btn" onclick="dlg.close()">Cancelar</button><button class="btn pri" id="okb">${lb}</button></div>`;
  $('#okb').onclick = () => {
    if (ok() !== false) d.close();
  };
  d.showModal();
}
function ask(t, msg, fn) {
  modal(
    t,
    `<p>${msg}</p>`,
    () => {
      fn();
    },
    'Excluir'
  );
}
// Registra a movimentação no histórico do estoque
function mov(i, t, q, m) {
  S.mov.push({ d: new Date().toISOString(), n: i.nome, un: i.un, t, q, m });
  if (S.mov.length > 80) S.mov.shift();
}

/* ---------- Cardápio ---------- */
function vCardapio() {
  return `<div class="hd"><div><h1>Cardápio e fichas técnicas</h1><p>A disponibilidade segue o estoque dos ingredientes.</p></div><button class="btn pri" onclick="novoProd()">Novo produto</button></div>
 <div class="card">${S.prod
   .map(p => {
     const dis = !can(p);
     return `<div class="row" style="align-items:flex-start;flex-wrap:wrap"><div class="th">${foto(p)}</div><div class="grow" style="min-width:200px"><b>${esc(p.nome)}</b> <span class="mut">${p.cat}</span><div class="fch">${p.ficha.map(f => `${N(f.q)} ${ing(f.i).un} ${esc(ing(f.i).nome)}`).join(', ')}</div>${dis ? `<div class="fch" style="color:var(--bd)">Falta: ${falta(p).map(esc).join(', ')}</div>` : ''}</div><span class="bdg ${dis ? 'bd' : 'ok'}">${dis ? 'Indisponível' : 'Disponível'}</span><span class="num" style="width:80px;text-align:right">${R(p.preco)}</span><button class="btn sm" onclick="trocarFoto(${p.id})">Foto</button><button class="btn sm" onclick="delProd(${p.id})">Excluir</button></div>`;
   })
   .join('')}</div>`;
}
function novoProd() {
  modal(
    'Novo produto',
    fld('f1', 'Nome') +
      `<label>Categoria<select id="f2"><option>Lanche</option><option>Porção</option><option>Bebida</option></select></label>` +
      fld('f3', 'Preço (R$)', 'dec', 'placeholder="0,00"') +
      `<div class="mut" style="margin-bottom:6px">Ficha técnica: quantidade por unidade</div><div class="scr">${S.ing.map(i => `<div class="fr"><span>${esc(i.nome)}</span><input data-m="int" inputmode="numeric" id="q${i.id}" placeholder="0 ${i.un}"></div>`).join('')}</div>`,
    () => {
      const nome = $('#f1').value.trim(),
        preco = num($('#f3').value),
        ficha = S.ing.map(i => ({ i: i.id, q: num($('#q' + i.id).value) })).filter(f => f.q > 0);
      if (!nome || preco <= 0 || !ficha.length) {
        toast('Informe nome, preço e ao menos um ingrediente');
        return false;
      }
      S.prod.push({ id: ++S.k, nome, cat: $('#f2').value, preco, ficha });
      render();
      toast('Produto cadastrado');
    }
  );
}
function delProd(id) {
  const p = S.prod.find(x => x.id == id);
  ask(
    'Excluir produto',
    `Remover <b>${esc(p.nome)}</b> do cardápio? Os pedidos anteriores são mantidos.`,
    () => {
      S.prod = S.prod.filter(x => x.id != id);
      delete cart[id];
      render();
      toast('Produto excluído');
    }
  );
}

/* ---------- Estoque ---------- */
function vEstoque() {
  const M = S.mov.slice().reverse().slice(0, 10);
  return `<div class="hd"><div><h1>Estoque de ingredientes</h1><p>Alerta quando a quantidade chega ao mínimo.</p></div><button class="btn pri" onclick="novoIng()">Novo ingrediente</button></div>
 <div class="card">${S.ing
   .map(i => {
     const s = stt(i),
       pc = Math.min(100, (i.qtd / (i.min * 3 || 1)) * 100);
     return `<div class="row" style="flex-wrap:wrap"><div class="grow" style="min-width:150px"><b>${esc(i.nome)}</b><div class="mut">Mínimo ${N(i.min)} ${i.un}</div></div><div class="bar" style="width:20%"><i style="width:${pc}%;background:var(--${s[1]})"></i></div><span class="num" style="width:90px;text-align:right">${N(i.qtd)} ${i.un}</span><span class="bdg ${s[1]}" style="width:62px;text-align:center">${s[0]}</span><div style="display:flex;gap:6px"><button class="btn sm" onclick="repor(${i.id})">Repor</button><button class="btn sm" onclick="retirar(${i.id})">Retirar</button><button class="btn sm" aria-label="Excluir ingrediente" onclick="delIng(${i.id})">Excluir</button></div></div>`;
   })
   .join('')}</div>
 <div class="card" style="margin-top:18px"><h2>Movimentações recentes</h2>${M.length ? M.map(m => `<div class="row"><div class="grow"><b>${esc(m.n)}</b><div class="mut">${esc(m.m)}</div></div><span class="bdg ${m.t == 'Entrada' ? 'ok' : 'wn'}">${m.t}</span><span class="num" style="width:90px;text-align:right">${m.t == 'Entrada' ? '+' : '−'}${N(m.q)} ${m.un}</span><span class="mut" style="width:96px;text-align:right">${new Date(m.d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></div>`).join('') : '<div class="empty">Nenhuma movimentação registrada.</div>'}</div>`;
}
function repor(id) {
  const i = ing(id);
  modal(
    'Repor ' + esc(i.nome),
    fld('f1', 'Quantidade a adicionar (' + i.un + ')', 'int') +
      `<label>Motivo<select id="f2"><option>Compra / reposição</option><option>Ajuste de inventário</option><option>Devolução</option></select></label>`,
    () => {
      const q = num($('#f1').value);
      if (q <= 0) {
        toast('Informe uma quantidade válida');
        return false;
      }
      i.qtd += q;
      mov(i, 'Entrada', q, $('#f2').value);
      render();
      toast('Entrada registrada: ' + i.nome);
    }
  );
}
function retirar(id) {
  const i = ing(id);
  modal(
    'Retirar ' + esc(i.nome),
    `<p class="mut" style="margin-top:0">Disponível: ${N(i.qtd)} ${i.un}</p>` +
      fld('f1', 'Quantidade a retirar (' + i.un + ')', 'int') +
      `<label>Motivo<select id="f2"><option>Saída manual (entrega ou venda avulsa)</option><option>Perda ou vencimento</option><option>Consumo interno</option><option>Ajuste de inventário</option></select></label>`,
    () => {
      const q = num($('#f1').value);
      if (q <= 0) {
        toast('Informe uma quantidade válida');
        return false;
      }
      if (q > i.qtd) {
        toast('Não é possível retirar mais do que o estoque (' + N(i.qtd) + ' ' + i.un + ')');
        return false;
      }
      i.qtd -= q;
      mov(i, 'Saída', q, $('#f2').value);
      render();
      toast('Saída registrada: ' + i.nome);
    }
  );
}
function novoIng() {
  modal(
    'Novo ingrediente',
    fld('f1', 'Nome') +
      `<label>Unidade<select id="f2"><option>un</option><option>g</option><option>ml</option></select></label>` +
      fld('f3', 'Quantidade atual', 'int') +
      fld('f4', 'Estoque mínimo', 'int'),
    () => {
      const nome = $('#f1').value.trim();
      if (!nome) {
        toast('Informe o nome');
        return false;
      }
      const g = { id: ++S.k, nome, un: $('#f2').value, qtd: num($('#f3').value), min: num($('#f4').value) };
      S.ing.push(g);
      if (g.qtd > 0) mov(g, 'Entrada', g.qtd, 'Cadastro inicial');
      render();
      toast('Ingrediente cadastrado');
    }
  );
}
function delIng(id) {
  const i = ing(id),
    u = S.prod.filter(p => p.ficha.some(f => f.i == id));
  if (u.length) return toast('Não é possível excluir: usado na ficha de ' + u.map(p => p.nome).join(', '));
  ask('Excluir ingrediente', `Remover <b>${esc(i.nome)}</b> do estoque?`, () => {
    S.ing = S.ing.filter(x => x.id != id);
    render();
    toast('Ingrediente excluído');
  });
}

/* ---------- Clientes ---------- */
function vClientes() {
  return `<div class="hd"><div><h1>Clientes</h1><p>A zona define a taxa de entrega.</p></div><button class="btn pri" onclick="novoCli()">Novo cliente</button></div>
 <div class="g2"><div class="card">${S.cli.map(c => `<div class="row" style="flex-wrap:wrap"><div class="grow" style="min-width:180px"><b>${esc(c.nome)}</b><div class="mut">${esc(c.end)}, ${esc(c.bairro)}</div><div class="mut">${esc(c.tel)}</div></div><span class="bdg ${ZN[c.zona].t === null ? 'wn' : 'ok'}">${ZN[c.zona].t === null ? 'Somente retirada' : ZN[c.zona].l}</span><button class="btn sm" onclick="delCli(${c.id})">Excluir</button></div>`).join('')}</div>
 <div class="card"><h2>Taxa de entrega</h2>${[1, 2, 3, 0].map(z => `<div class="row"><div class="grow"><b>${ZN[z].l}</b><div class="mut">${ZN[z].d}</div></div><span class="num">${ZN[z].t === null ? 'Somente retirada' : R(ZN[z].t)}</span></div>`).join('')}<p class="mut" style="margin:12px 0 0">Retirada no balcão não paga taxa.</p></div></div>`;
}
function novoCli() {
  modal(
    'Novo cliente',
    fld('f1', 'Nome') +
      fld('f2', 'Telefone', 'tel') +
      fld('f3', 'Endereço') +
      fld('f4', 'Bairro') +
      `<label>Zona de entrega<select id="f5">${[1, 2, 3, 0].map(z => `<option value="${z}">${z ? ZN[z].l + ' (' + ZN[z].d + ')' : 'Fora da área, somente retirada (acima de 8 km)'}</option>`).join('')}</select></label>`,
    () => {
      const nome = $('#f1').value.trim(),
        tel = $('#f2').value,
        end = $('#f3').value.trim(),
        b = $('#f4').value.trim();
      if (!nome || !end || !b) {
        toast('Preencha nome, endereço e bairro');
        return false;
      }
      if (tel.replace(/\D/g, '').length < 10) {
        toast('Informe um telefone válido com DDD');
        return false;
      }
      S.cli.push({ id: ++S.k, nome, tel, end, bairro: b, zona: +$('#f5').value });
      render();
      toast('Cliente cadastrado');
    }
  );
}
function delCli(id) {
  const c = S.cli.find(x => x.id == id);
  ask('Excluir cliente', `Remover <b>${esc(c.nome)}</b>? Os pedidos anteriores são mantidos.`, () => {
    S.cli = S.cli.filter(x => x.id != id);
    if (cli == id) cli = '';
    render();
    toast('Cliente excluído');
  });
}

const V = {
  painel: vPainel,
  pdv: vPdv,
  pedidos: vPedidos,
  cardapio: vCardapio,
  estoque: vEstoque,
  clientes: vClientes
};

/* ---------- Acesso: cadastro da empresa e login ---------- */
const FL = s =>
  `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path fill="#D9431E" d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 3-6 1 1 1 2 2 2 0-3-1-5 1-8z"/></svg>`;
const logo = s => {
  const u = S.emp && S.emp.logo,
    st = 'width:100%;height:100%;object-fit:cover';
  return u
    ? `<img src="${u}" alt="Logo da empresa" style="${st}">`
    : `<img src="logo.png" alt="Logo da empresa" style="${st}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'">` +
        FL(s).replace('<svg', '<svg style="display:none"');
};
const ik = p =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="#AEB6AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC = {
  mail: ik('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
  lock: ik('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  bld: ik('<path d="M4 21V4h10v17M14 9h6v12M8 8h2M8 12h2M8 16h2M3 21h18"/>')
};
let pendLogo = null;
const SK = 'brasadev_sess';
const sess = () => {
  try {
    return localStorage.getItem(SK) || sessionStorage.getItem(SK);
  } catch (e) {
    return null;
  }
};
async function sha(s) {
  try {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let h = 0;
    for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
    return 'f' + h;
  }
}
function setSess(rem) {
  try {
    localStorage.removeItem(SK);
    sessionStorage.removeItem(SK);
    (rem ? localStorage : sessionStorage).setItem(SK, S.emp.email);
  } catch (e) {}
}
function err(m) {
  const e = $('#aerr');
  e.textContent = m;
  e.hidden = false;
}
function mostrar(id, b) {
  const i = $('#' + id);
  i.type = i.type == 'password' ? 'text' : 'password';
  b.textContent = i.type == 'password' ? 'Mostrar' : 'Ocultar';
}
const afl = (ic, id, ph, ex = '', sh = false) =>
  `<div class="fl">${ic}<input id="${id}" aria-label="${ph}" placeholder="${ph}" ${ex}>${sh ? `<button class="sh" type="button" onclick="mostrar('${id}',this)">Mostrar</button>` : ''}</div>`;
function renderAuth() {
  document.body.classList.add('lock');
  const a = $('#auth');
  a.hidden = false;
  a.innerHTML = S.emp
    ? `<div class="gc"><div class="av">${logo(54)}</div><div class="cn">${esc(S.emp.nome)}</div><div class="err" id="aerr" role="alert" hidden></div>
 ${afl(IC.mail, 'le', 'E-mail', `autocomplete="username" inputmode="email" value="${esc(S.emp.email)}" onkeydown="if(event.key=='Enter')doLogin()"`)}
 ${afl(IC.lock, 'lp', 'Senha', 'type="password" autocomplete="current-password" onkeydown="if(event.key==\'Enter\')doLogin()"', true)}
 <div class="row2"><label class="rm"><input type="checkbox" id="lr" checked> Lembrar de mim</label><button class="lk" type="button" onclick="esqueci()">Esqueceu a senha?</button></div>
 <button class="lg" onclick="doLogin()">ENTRAR</button></div>`
    : `<div class="gc"><div class="av" id="avc">${logo(54)}</div><input type="file" id="lf" accept="image/png,image/jpeg,image/webp" hidden onchange="pickLogo(this)">
 <button class="lk logo-btn" type="button" onclick="$('#lf').click()">Enviar logo da empresa (PNG)</button>
 <div class="cn">Cadastro da empresa</div><div class="err" id="aerr" role="alert" hidden></div>
 ${afl(IC.bld, 'cn', 'Nome da empresa', 'value="Brasa Dev"')}${afl(IC.mail, 'ce', 'E-mail de acesso', 'inputmode="email" autocomplete="username"')}
 ${afl(IC.lock, 'c1', 'Senha (mínimo 6 caracteres)', 'type="password" autocomplete="new-password" onkeydown="if(event.key==\'Enter\')doCad()"', true)}
 <button class="lg" style="margin-top:8px" onclick="doCad()">CADASTRAR EMPRESA</button></div>`;
}
function pickLogo(inp) {
  const f = inp.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 256 / Math.max(im.width, im.height)),
        c = document.createElement('canvas');
      c.width = Math.round(im.width * k);
      c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      pendLogo = c.toDataURL('image/png');
      $('#avc').innerHTML =
        `<img src="${pendLogo}" alt="Logo" style="width:100%;height:100%;object-fit:cover">`;
    };
    im.onerror = () => err('Não foi possível ler a imagem. Use um arquivo PNG.');
    im.src = r.result;
  };
  r.readAsDataURL(f);
}
async function doCad() {
  const nome = $('#cn').value.trim(),
    email = $('#ce').value.trim().toLowerCase(),
    s1 = $('#c1').value;
  if (!nome) return err('Informe o nome da empresa.');
  if (!/^\S+@\S+\.\S+$/.test(email)) return err('Informe um e-mail válido.');
  if (s1.length < 6) return err('A senha deve ter ao menos 6 caracteres.');
  S.emp = { nome, email, hash: await sha(email + ':' + s1), logo: pendLogo };
  save();
  setSess(true);
  enter();
  toast('Empresa cadastrada. Bem-vindo!');
}
async function doLogin() {
  const e = $('#le').value.trim().toLowerCase(),
    p = $('#lp').value;
  if (!p) return err('Digite a sua senha.');
  if (e === S.emp.email && (await sha(e + ':' + p)) === S.emp.hash) {
    setSess($('#lr').checked);
    enter();
  } else err('E-mail ou senha incorretos.');
}
function esqueci() {
  modal(
    'Redefinir senha',
    `<label>E-mail cadastrado<input id="rx" type="text" inputmode="email"></label><label>Nova senha<input id="rp" type="password" autocomplete="new-password"></label>`,
    () => {
      const e = $('#rx').value.trim().toLowerCase(),
        p = $('#rp').value;
      if (e !== S.emp.email) {
        toast('Este e-mail não é o da empresa cadastrada');
        return false;
      }
      if (p.length < 6) {
        toast('A senha deve ter ao menos 6 caracteres');
        return false;
      }
      sha(e + ':' + p).then(h => {
        S.emp.hash = h;
        save();
        toast('Senha redefinida. Entre com a nova senha.');
      });
    }
  );
}
function logout() {
  try {
    localStorage.removeItem(SK);
    sessionStorage.removeItem(SK);
  } catch (e) {}
  cart = {};
  renderAuth();
}
function enter() {
  document.body.classList.remove('lock');
  $('#auth').hidden = true;
  view = 'painel';
  render();
  window.scrollTo(0, 0);
}
function boot() {
  if (S.emp && sess() === S.emp.email) enter();
  else renderAuth();
}
boot();
