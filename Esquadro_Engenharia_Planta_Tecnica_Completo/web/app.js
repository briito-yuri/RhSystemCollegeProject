/* ==========================================================================
   SISTEMA DE RH — ESQUADRO ENGENHARIA LTDA.
   FRONTEND JS INTEGRADO AO SERVIDOR JAVA (ServidorRH.java)
   ========================================================================== */

const STORAGE_KEYS = {
  LOGADO: "esquadro_rh_logado",
  USUARIO: "esquadro_rh_usuario",
  TELA: "esquadro_rh_tela_atual",
  ID_SEL: "esquadro_rh_id_selecionado",
  ID_REM: "esquadro_rh_id_remover"
};

let listaFuncionarios = [];
let idSelecionado = localStorage.getItem(STORAGE_KEYS.ID_SEL) || "004";
let idSelecionadoRemover = localStorage.getItem(STORAGE_KEYS.ID_REM) || "006";

const MAPA_TELAS = {
  principal: {
    folhaTopo: "FOLHA 02",
    modulo: "GESTÃO DE PESSOAL",
    titulo: "MENU PRINCIPAL",
    carimbo: "02 / 09"
  },
  cadastrar: {
    folhaTopo: "FOLHA 03",
    modulo: "GESTÃO DE PESSOAL",
    titulo: "CADASTRAR FUNCIONÁRIO",
    carimbo: "03 / 09"
  },
  cargo: {
    folhaTopo: "FOLHA 04",
    modulo: "GESTÃO DE PESSOAL",
    titulo: "ATUALIZAR CARGO",
    carimbo: "04 / 09"
  },
  salario: {
    folhaTopo: "FOLHA 05",
    modulo: "GESTÃO DE PESSOAL",
    titulo: "ATUALIZAR SALÁRIO",
    carimbo: "05 / 09"
  },
  remover: {
    folhaTopo: "FOLHA 06",
    modulo: "GESTÃO DE PESSOAL",
    titulo: "REMOVER FUNCIONÁRIO",
    carimbo: "06 / 09"
  },
  contracheque: {
    folhaTopo: "FOLHA 07",
    modulo: "FOLHA DE PAGAMENTO",
    titulo: "EMITIR CONTRACHEQUE",
    carimbo: "07 / 09"
  },
  ferias: {
    folhaTopo: "FOLHA 08",
    modulo: "FOLHA DE PAGAMENTO",
    titulo: "SIMULAR FÉRIAS",
    carimbo: "08 / 09"
  },
  relatorio: {
    folhaTopo: "FOLHA 09",
    modulo: "FOLHA DE PAGAMENTO",
    titulo: "RELATÓRIO DA FOLHA",
    carimbo: "09 / 09"
  }
};

// Formatadores numéricos padrão brasileiro
function fmtMoeda(valor) {
  const num = Number(valor) || 0;
  return "R$ " + num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtNumero(valor) {
  const num = Number(valor) || 0;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtAliquota(valor) {
  const num = Number(valor) || 0;
  if (Number.isInteger(num)) {
    return num + "%";
  }
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
}

function parseValorDigitado(texto) {
  if (!texto) return 0;
  let limpo = String(texto).replace(/[^\d.,-]/g, "").trim();
  if (limpo.includes(",") && limpo.includes(".")) {
    limpo = limpo.replace(/\./g, "").replace(",", ".");
  } else if (limpo.includes(",")) {
    limpo = limpo.replace(",", ".");
  }
  const n = parseFloat(limpo);
  return isNaN(n) ? 0 : n;
}

function exibirMensagem(idElemento, texto, sucesso = false) {
  const el = document.getElementById(idElemento);
  if (!el) return;
  el.textContent = texto;
  el.className = sucesso ? "feedback-msg ok" : "feedback-msg";
  el.style.display = "block";
}

function ocultarMensagem(idElemento) {
  const el = document.getElementById(idElemento);
  if (el) el.style.display = "none";
}

// ==========================================================================
// 0. RESTAURAÇÃO DE SESSÃO AO DAR RELOAD (F5)
// ==========================================================================
window.addEventListener("DOMContentLoaded", async () => {
  const estaLogado = localStorage.getItem(STORAGE_KEYS.LOGADO) === "true";
  if (estaLogado) {
    const usuarioSalvo = localStorage.getItem(STORAGE_KEYS.USUARIO) || "Admin";
    const telaSalva = localStorage.getItem(STORAGE_KEYS.TELA) || "principal";
    document.getElementById("carimbo-usuario").textContent = usuarioSalvo;
    document.getElementById("folha-login").classList.remove("ativo");
    document.getElementById("sistema-shell").classList.add("ativo");
    await navegarPara(telaSalva);
  }
});

// ==========================================================================
// 1. AUTENTICAÇÃO (FOLHA 01 — LOGIN)
// ==========================================================================
async function realizarLogin(event) {
  if (event) event.preventDefault();
  ocultarMensagem("login-msg");

  const usuario = document.getElementById("login-usuario").value.trim();
  const senha = document.getElementById("login-senha").value.trim();

  try {
    const resp = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha })
    });
    const dados = await resp.json();

    document.getElementById("login-tentativas").textContent = `${dados.tentativas || 0} / 3`;

    if (dados.sucesso) {
      const nomeUsuario = dados.usuario || "Admin";
      localStorage.setItem(STORAGE_KEYS.LOGADO, "true");
      localStorage.setItem(STORAGE_KEYS.USUARIO, nomeUsuario);
      document.getElementById("carimbo-usuario").textContent = nomeUsuario;

      document.getElementById("folha-login").classList.remove("ativo");
      document.getElementById("sistema-shell").classList.add("ativo");
      await carregarDadosBase();
      await navegarPara("principal");
    } else {
      let msg = dados.mensagem || "Usuário ou senha inválidos.";
      if (!dados.bloqueado) {
        msg += " (Credencial do SistemaRhLogin: usuário 1 / senha 1)";
      }
      exibirMensagem("login-msg", msg, false);
    }
  } catch (erro) {
    exibirMensagem("login-msg", "Erro de conexão com o servidor Java.", false);
  }
}

function sairDoSistema() {
  localStorage.removeItem(STORAGE_KEYS.LOGADO);
  localStorage.removeItem(STORAGE_KEYS.USUARIO);
  localStorage.removeItem(STORAGE_KEYS.TELA);
  localStorage.removeItem(STORAGE_KEYS.ID_SEL);
  localStorage.removeItem(STORAGE_KEYS.ID_REM);

  document.getElementById("sistema-shell").classList.remove("ativo");
  document.getElementById("folha-login").classList.add("ativo");
  document.getElementById("login-senha").value = "";
  ocultarMensagem("login-msg");
}

// ==========================================================================
// 2. NAVEGAÇÃO ENTRE AS FOLHAS 02 A 09
// ==========================================================================
async function navegarPara(nomeTela) {
  const info = MAPA_TELAS[nomeTela] ? nomeTela : "principal";
  const meta = MAPA_TELAS[info];

  localStorage.setItem(STORAGE_KEYS.TELA, info);

  // Atualiza cabeçalho de diretório e carimbo do rodapé
  document.getElementById("topo-folha").textContent = meta.folhaTopo;
  document.getElementById("bc-modulo").textContent = meta.modulo;
  document.getElementById("bc-tela").textContent = meta.titulo;
  document.getElementById("carimbo-folha").textContent = meta.carimbo;

  // Atualiza estado ativo do menu lateral
  document.querySelectorAll(".menu-btn").forEach(btn => {
    btn.classList.toggle("ativo", btn.getAttribute("data-tela") === info);
  });

  // Alterna a visualização da folha
  document.querySelectorAll(".folha-view").forEach(sec => {
    sec.classList.remove("ativo");
  });
  const alvo = document.getElementById("tela-" + info);
  if (alvo) alvo.classList.add("ativo");

  // Oculta alertas anteriores
  ["cad-msg", "f04-msg", "f05-msg", "f06-msg"].forEach(ocultarMensagem);

  // Recarrega os dados do servidor Java e atualiza a folha aberta
  await carregarDadosBase();

  if (info === "principal") renderizarFolha02();
  else if (info === "cadastrar") limparFormularioCadastro();
  else if (info === "cargo") renderizarFolha04(false);
  else if (info === "salario") renderizarFolha05(false);
  else if (info === "remover") renderizarFolha06();
  else if (info === "contracheque") renderizarFolha07();
  else if (info === "ferias") renderizarFolha08();
  else if (info === "relatorio") renderizarFolha09();
}

async function carregarDadosBase() {
  const resp = await fetch("/api/funcionarios");
  listaFuncionarios = await resp.json();

  if (listaFuncionarios.length > 0) {
    const existeSel = listaFuncionarios.some(f => f.id === idSelecionado);
    if (!existeSel) {
      idSelecionado = listaFuncionarios[0].id;
    }
    const existeRem = listaFuncionarios.some(f => f.id === idSelecionadoRemover);
    if (!existeRem) {
      idSelecionadoRemover = listaFuncionarios[listaFuncionarios.length - 1].id;
    }
    localStorage.setItem(STORAGE_KEYS.ID_SEL, idSelecionado);
    localStorage.setItem(STORAGE_KEYS.ID_REM, idSelecionadoRemover);
  }
}

function obterFuncionarioSelecionado(idAlvo = idSelecionado) {
  return listaFuncionarios.find(f => f.id === idAlvo) || listaFuncionarios[0] || null;
}

function renderizarListaLateral(idContainer, idAtivo, callbackSelecao) {
  const container = document.getElementById(idContainer);
  if (!container) return;

  container.innerHTML = listaFuncionarios.map(f => {
    const classe = f.id === idAtivo ? "side-emp-item ativo" : "side-emp-item";
    return `
      <div class="${classe}" onclick="${callbackSelecao}('${f.id}')">
        <span class="emp-id">${f.id}</span>
        <span>${f.nome}</span>
      </div>
    `;
  }).join("");
}

// ==========================================================================
// 3. FOLHA 02 — MENU PRINCIPAL (LISTAR FUNCIONÁRIOS)
// ==========================================================================
async function renderizarFolha02() {
  const respRel = await fetch("/api/relatorio");
  const rel = await respRel.json();

  const qtd = rel.qtd || 0;
  const descontosTotais = (rel.inss || 0) + (rel.irpf || 0);

  document.getElementById("f02-registros").textContent = `${qtd} REGISTROS`;
  document.getElementById("f02-kpi-qtd").textContent = String(qtd);
  document.getElementById("f02-kpi-bruto").textContent = fmtMoeda(rel.bruto);
  document.getElementById("f02-kpi-descontos").textContent = fmtMoeda(descontosTotais);
  document.getElementById("f02-kpi-liquido").textContent = fmtMoeda(rel.liquido);

  const corpo = document.getElementById("f02-lista-funcionarios");
  corpo.innerHTML = listaFuncionarios.map(f => {
    const sel = f.id === idSelecionado ? "table-row grid-f02 selecionada" : "table-row grid-f02";
    return `
      <div class="${sel}" onclick="selecionarFuncionarioF02('${f.id}')">
        <span class="mono txt-sec">${f.id}</span>
        <span>${f.nome}</span>
        <span class="txt-sec">${f.cargo}</span>
        <span class="mono txt-right">${fmtMoeda(f.salario)}</span>
      </div>
    `;
  }).join("");

  const func = obterFuncionarioSelecionado();
  if (func) {
    document.getElementById("f02-sel-nome").textContent = func.nome;
    document.getElementById("f02-sel-sub").textContent = `${func.cargo.toUpperCase()} · ID ${func.id}`;
    document.getElementById("f02-sel-bruto").textContent = fmtMoeda(func.salario);
    document.getElementById("f02-sel-inss-label").textContent = `INSS (${fmtAliquota(func.aliquotaInss)})`;
    document.getElementById("f02-sel-inss").textContent = `- ${fmtMoeda(func.inss)}`;
    document.getElementById("f02-sel-irpf").textContent = `- ${fmtMoeda(func.irpf)}`;
    document.getElementById("f02-sel-fgts").textContent = fmtMoeda(func.fgts);
    document.getElementById("f02-sel-liquido").textContent = fmtMoeda(func.liquido);
  }
}

function selecionarFuncionarioF02(id) {
  idSelecionado = id;
  localStorage.setItem(STORAGE_KEYS.ID_SEL, idSelecionado);
  renderizarFolha02();
}

// ==========================================================================
// 4. FOLHA 03 — CADASTRAR FUNCIONÁRIO (CAMPOS ZERADOS POR PADRÃO)
// ==========================================================================
function limparFormularioCadastro() {
  document.getElementById("cad-id").value = "";
  document.getElementById("cad-nome").value = "";
  document.getElementById("cad-cargo").value = "";
  document.getElementById("cad-salario").value = "";
  atualizarPreviaCadastro();
}

async function atualizarPreviaCadastro() {
  const textoSal = document.getElementById("cad-salario").value.trim();
  const salario = parseValorDigitado(textoSal);

  if (!textoSal || salario <= 0) {
    document.getElementById("cad-prev-bruto").textContent = "R$ 0,00";
    document.getElementById("cad-prev-inss-label").textContent = "INSS (0%)";
    document.getElementById("cad-prev-inss").textContent = "- R$ 0,00";
    document.getElementById("cad-prev-irpf").textContent = "- R$ 0,00";
    document.getElementById("cad-prev-fgts").textContent = "R$ 0,00";
    document.getElementById("cad-prev-liquido").textContent = "R$ 0,00";
    return;
  }

  const resp = await fetch(`/api/previa?salario=${encodeURIComponent(salario)}`);
  const prev = await resp.json();

  document.getElementById("cad-prev-bruto").textContent = fmtMoeda(prev.salario);
  document.getElementById("cad-prev-inss-label").textContent = `INSS (${fmtAliquota(prev.aliquotaInss)})`;
  document.getElementById("cad-prev-inss").textContent = `- ${fmtMoeda(prev.inss)}`;
  document.getElementById("cad-prev-irpf").textContent = `- ${fmtMoeda(prev.irpf)}`;
  document.getElementById("cad-prev-fgts").textContent = fmtMoeda(prev.fgts);
  document.getElementById("cad-prev-liquido").textContent = fmtMoeda(prev.liquido);
}

async function salvarCadastro() {
  ocultarMensagem("cad-msg");
  const id = document.getElementById("cad-id").value.trim();
  const nome = document.getElementById("cad-nome").value.trim();
  const cargo = document.getElementById("cad-cargo").value.trim();
  const salarioNum = parseValorDigitado(document.getElementById("cad-salario").value);

  if (!id || !nome || !cargo || salarioNum <= 0) {
    exibirMensagem("cad-msg", "Preencha ID, nome, cargo e um salário válido.", false);
    return;
  }

  const resp = await fetch("/api/funcionarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, nome, cargo, salario: String(salarioNum) })
  });
  const dados = await resp.json();

  if (dados.sucesso) {
    idSelecionado = id;
    localStorage.setItem(STORAGE_KEYS.ID_SEL, idSelecionado);
    limparFormularioCadastro();
    await navegarPara("principal");
  } else {
    exibirMensagem("cad-msg", dados.mensagem || "O ID já existe. Cadastro recusado.", false);
  }
}

// ==========================================================================
// 5. FOLHA 04 — ATUALIZAR CARGO (CAMPO NOVO CARGO VAZIO POR PADRÃO)
// ==========================================================================
function renderizarFolha04(preservarInput = false) {
  renderizarListaLateral("f04-lista-lateral", idSelecionado, "selecionarFuncionarioF04");
  const func = obterFuncionarioSelecionado();
  if (!func) return;

  document.getElementById("f04-nome").textContent = func.nome;
  document.getElementById("f04-sub").innerHTML = `ID ${func.id} <span class="dot-amarelo">·</span> SALÁRIO ${fmtMoeda(func.salario)}`;
  document.getElementById("f04-cargo-atual").textContent = func.cargo;

  if (!preservarInput) {
    document.getElementById("f04-novo-cargo").value = "";
  }
}

function selecionarFuncionarioF04(id) {
  idSelecionado = id;
  localStorage.setItem(STORAGE_KEYS.ID_SEL, idSelecionado);
  ocultarMensagem("f04-msg");
  renderizarFolha04(false);
}

async function salvarNovoCargo() {
  ocultarMensagem("f04-msg");
  const func = obterFuncionarioSelecionado();
  if (!func) return;

  const novoCargo = document.getElementById("f04-novo-cargo").value.trim();
  if (!novoCargo) {
    exibirMensagem("f04-msg", "Digite o novo cargo antes de salvar.", false);
    return;
  }

  const resp = await fetch("/api/cargo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: func.id, cargo: novoCargo })
  });
  const dados = await resp.json();

  if (dados.sucesso) {
    await carregarDadosBase();
    renderizarFolha04(false);
    exibirMensagem("f04-msg", "Cargo atualizado com sucesso no sistema.", true);
  } else {
    exibirMensagem("f04-msg", "Não foi possível atualizar o cargo.", false);
  }
}

// ==========================================================================
// 6. FOLHA 05 — ATUALIZAR SALÁRIO (CAMPO NOVO SALÁRIO ZERADO POR PADRÃO)
// ==========================================================================
async function renderizarFolha05(preservarInput = false) {
  renderizarListaLateral("f05-lista-lateral", idSelecionado, "selecionarFuncionarioF05");
  const func = obterFuncionarioSelecionado();
  if (!func) return;

  document.getElementById("f05-nome").textContent = func.nome;
  document.getElementById("f05-sub").innerHTML = `ID ${func.id} <span class="dot-amarelo">·</span> ${func.cargo.toUpperCase()}`;
  document.getElementById("f05-salario-atual").textContent = fmtMoeda(func.salario);

  if (!preservarInput) {
    document.getElementById("f05-novo-salario").value = "";
  }

  await atualizarComparativoSalario();
}

function selecionarFuncionarioF05(id) {
  idSelecionado = id;
  localStorage.setItem(STORAGE_KEYS.ID_SEL, idSelecionado);
  ocultarMensagem("f05-msg");
  renderizarFolha05(false);
}

async function atualizarComparativoSalario() {
  const func = obterFuncionarioSelecionado();
  if (!func) return;

  document.getElementById("f05-comp-liq-atual").textContent = fmtMoeda(func.liquido);

  const textoNovo = document.getElementById("f05-novo-salario").value.trim();
  const novoSalario = parseValorDigitado(textoNovo);

  if (!textoNovo || novoSalario <= 0) {
    document.getElementById("f05-comp-dif").textContent = "R$ 0,00";
    document.getElementById("f05-comp-perc").textContent = "0,0%";
    document.getElementById("f05-comp-liq-novo").textContent = "R$ 0,00";
    return;
  }

  const salarioAtual = func.salario;
  const diferenca = novoSalario - salarioAtual;
  const reajuste = salarioAtual > 0 ? (diferenca / salarioAtual) * 100 : 0;

  const sinalDif = diferenca > 0 ? "+ " : (diferenca < 0 ? "- " : "");
  const sinalPerc = reajuste > 0 ? "+ " : (reajuste < 0 ? "- " : "");

  document.getElementById("f05-comp-dif").textContent = sinalDif + fmtMoeda(Math.abs(diferenca));
  document.getElementById("f05-comp-perc").textContent =
    sinalPerc + Math.abs(reajuste).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";

  const resp = await fetch(`/api/previa?salario=${encodeURIComponent(novoSalario)}`);
  const prev = await resp.json();
  document.getElementById("f05-comp-liq-novo").textContent = fmtMoeda(prev.liquido);
}

async function salvarNovoSalario() {
  ocultarMensagem("f05-msg");
  const func = obterFuncionarioSelecionado();
  if (!func) return;

  const novoSalario = parseValorDigitado(document.getElementById("f05-novo-salario").value);
  if (novoSalario <= 0) {
    exibirMensagem("f05-msg", "Informe um salário válido maior que zero.", false);
    return;
  }

  const resp = await fetch("/api/salario", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: func.id, salario: String(novoSalario) })
  });
  const dados = await resp.json();

  if (dados.sucesso) {
    await carregarDadosBase();
    await renderizarFolha05(false);
    exibirMensagem("f05-msg", "Salário atualizado com sucesso.", true);
  } else {
    exibirMensagem("f05-msg", "Erro ao atualizar salário.", false);
  }
}

// ==========================================================================
// 7. FOLHA 06 — REMOVER FUNCIONÁRIO
// ==========================================================================
function renderizarFolha06() {
  renderizarListaLateral("f06-lista-lateral", idSelecionadoRemover, "selecionarFuncionarioF06");
  const func = obterFuncionarioSelecionado(idSelecionadoRemover);
  if (!func) return;

  document.getElementById("f06-id").textContent = func.id;
  document.getElementById("f06-nome").textContent = func.nome;
  document.getElementById("f06-cargo").textContent = func.cargo;
  document.getElementById("f06-salario").textContent = fmtMoeda(func.salario);
}

function selecionarFuncionarioF06(id) {
  idSelecionadoRemover = id;
  localStorage.setItem(STORAGE_KEYS.ID_REM, idSelecionadoRemover);
  ocultarMensagem("f06-msg");
  renderizarFolha06();
}

async function confirmarRemocao() {
  ocultarMensagem("f06-msg");
  const func = obterFuncionarioSelecionado(idSelecionadoRemover);
  if (!func) return;

  const resp = await fetch("/api/remover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: func.id })
  });
  const dados = await resp.json();

  if (dados.sucesso) {
    await navegarPara("principal");
  } else {
    exibirMensagem("f06-msg", "Não foi possível remover o funcionário.", false);
  }
}

// ==========================================================================
// 8. FOLHA 07 — EMITIR CONTRACHEQUE
// ==========================================================================
async function renderizarFolha07() {
  renderizarListaLateral("f07-lista-lateral", idSelecionado, "selecionarFuncionarioF07");
  const func = obterFuncionarioSelecionado();
  if (!func) return;

  const resp = await fetch(`/api/contracheque?id=${encodeURIComponent(func.id)}`);
  const h = await resp.json();

  const totalDescontos = (h.inss || 0) + (h.irpf || 0);

  document.getElementById("f07-nome").textContent = h.nome;
  document.getElementById("f07-cargo").textContent = h.cargo;
  document.getElementById("f07-id").textContent = h.id;

  document.getElementById("f07-prov-sal").textContent = fmtNumero(h.salario);
  document.getElementById("f07-ref-inss").textContent = fmtAliquota(h.aliquotaInss);
  document.getElementById("f07-desc-inss").textContent = fmtNumero(h.inss);
  document.getElementById("f07-ref-irpf").textContent = fmtAliquota(h.aliquotaIrpf);
  document.getElementById("f07-desc-irpf").textContent = fmtNumero(h.irpf);

  document.getElementById("f07-tot-prov").textContent = fmtNumero(h.salario);
  document.getElementById("f07-tot-desc").textContent = fmtNumero(totalDescontos);
  document.getElementById("f07-fgts").textContent = fmtMoeda(h.fgts);
  document.getElementById("f07-liquido").textContent = fmtMoeda(h.liquido);
}

function selecionarFuncionarioF07(id) {
  idSelecionado = id;
  localStorage.setItem(STORAGE_KEYS.ID_SEL, idSelecionado);
  renderizarFolha07();
}

// ==========================================================================
// 9. FOLHA 08 — SIMULAR FÉRIAS
// ==========================================================================
async function renderizarFolha08() {
  renderizarListaLateral("f08-lista-lateral", idSelecionado, "selecionarFuncionarioF08");
  const func = obterFuncionarioSelecionado();
  if (!func) return;

  const resp = await fetch(`/api/ferias?id=${encodeURIComponent(func.id)}`);
  const fer = await resp.json();

  document.getElementById("f08-nome").textContent = fer.nome;
  document.getElementById("f08-sub").innerHTML = `ID ${fer.id} <span class="dot-amarelo">·</span> ${fer.cargo.toUpperCase()}`;

  document.getElementById("f08-bar-sal").textContent = fmtMoeda(fer.salario);
  document.getElementById("f08-bar-terco").textContent = fmtMoeda(fer.umTerco);
  document.getElementById("f08-total-bruto").textContent = fmtMoeda(fer.totalFerias);

  document.getElementById("f08-inss-label").textContent = `INSS (${fmtAliquota(fer.aliquotaInss)})`;
  document.getElementById("f08-inss").textContent = `- ${fmtMoeda(fer.inss)}`;
  document.getElementById("f08-irpf-label").textContent = `IRPF (${fmtAliquota(fer.aliquotaIrpf)})`;
  document.getElementById("f08-irpf").textContent = `- ${fmtMoeda(fer.irpf)}`;
  document.getElementById("f08-fgts").textContent = fmtMoeda(fer.fgts);
  document.getElementById("f08-liquido").textContent = fmtMoeda(fer.liquido);
}

function selecionarFuncionarioF08(id) {
  idSelecionado = id;
  localStorage.setItem(STORAGE_KEYS.ID_SEL, idSelecionado);
  renderizarFolha08();
}

// ==========================================================================
// 10. FOLHA 09 — RELATÓRIO DA FOLHA
// ==========================================================================
async function renderizarFolha09() {
  const resp = await fetch("/api/relatorio");
  const rel = await resp.json();

  document.getElementById("f09-kpi-qtd").textContent = String(rel.qtd || 0);
  document.getElementById("f09-kpi-bruto").textContent = fmtMoeda(rel.bruto);
  document.getElementById("f09-kpi-inss").textContent = fmtMoeda(rel.inss);
  document.getElementById("f09-kpi-irpf").textContent = fmtMoeda(rel.irpf);

  const corpo = document.getElementById("f09-tabela-corpo");
  const funcs = rel.funcionarios || [];
  corpo.innerHTML = funcs.map(f => `
    <div class="table-row grid-f09" style="cursor: default;">
      <span>${f.nome}</span>
      <span class="mono txt-right">${fmtNumero(f.salario)}</span>
      <span class="mono txt-right">${fmtNumero(f.inss)}</span>
      <span class="mono txt-right">${fmtNumero(f.irpf)}</span>
      <span class="mono txt-right">${fmtNumero(f.liquido)}</span>
    </div>
  `).join("");

  document.getElementById("f09-tot-bruto").textContent = fmtNumero(rel.bruto);
  document.getElementById("f09-tot-inss").textContent = fmtNumero(rel.inss);
  document.getElementById("f09-tot-irpf").textContent = fmtNumero(rel.irpf);
  document.getElementById("f09-tot-liquido").textContent = fmtNumero(rel.liquido);

  const bruto = rel.bruto > 0 ? rel.bruto : 1;
  const pctLiq = ((rel.liquido || 0) / bruto) * 100;
  const pctInss = ((rel.inss || 0) / bruto) * 100;
  const pctIrpf = ((rel.irpf || 0) / bruto) * 100;

  document.getElementById("f09-bar-liq").style.width = `${pctLiq.toFixed(1)}%`;
  document.getElementById("f09-bar-inss").style.width = `${pctInss.toFixed(1)}%`;
  document.getElementById("f09-bar-irpf").style.width = `${pctIrpf.toFixed(1)}%`;

  document.getElementById("f09-pct-liq").textContent =
    pctLiq.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
  document.getElementById("f09-pct-inss").textContent =
    pctInss.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
  document.getElementById("f09-pct-irpf").textContent =
    pctIrpf.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";

  document.getElementById("f09-fgts-total").textContent = fmtMoeda(rel.fgts);
  document.getElementById("f09-card-liquido").textContent = fmtMoeda(rel.liquido);
}
