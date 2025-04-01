const leitoScroll = document.getElementById("leito-scroll");
const painelContainer = document.querySelector("main");
let leitoSelecionado = null;
let dadosLeitos = {};
let intervalos = {};
let pontoSelecionado = null;

// Gera os botões de leitos e painéis ocultos
for (let i = 1; i <= 19; i++) {
  // Botão
  const btn = document.createElement("div");
  btn.className = "leito-btn";
  btn.textContent = `Leito ${i}`;
  btn.onclick = () => selecionarLeito(i);
  leitoScroll.appendChild(btn);

  // Painel individual
  const painel = document.createElement("div");
  painel.className = "painel-leito hidden";
  painel.id = `painel-leito-${i}`;
  painel.innerHTML = `
    <div class="titulo-leito" id="titulo-leito-${i}">Leito ${i}</div>
    <div class="painel-controle">
      <input type="text" id="nome-paciente-${i}" placeholder="Nome do Paciente" />
      <button onclick="iniciarProtocolo(${i})" id="btn-iniciar-${i}">Iniciar Protocolo</button>
      <button onclick="suspenderProtocolo(${i})" id="btn-suspender-${i}" class="btn-suspender hidden">Suspender Protocolo</button>
      <div class="cronometro" id="cronometro-${i}">00:00:00</div>
      <div class="linha-tempo" id="linha-tempo-${i}"></div>
      <div class="registro-info" id="registro-info-${i}"></div>
    </div>
  `;
  painelContainer.appendChild(painel);

  // Dados iniciais
  dadosLeitos[i] = {
    paciente: "",
    protocoloAtivo: false,
    inicio: null,
    coletaIndex: 0,
    coletaStatus: [false, false, false, false, false, false],
    historico: []
  };

  // Criar pontos da linha do tempo
  const linhaTempo = painel.querySelector(`#linha-tempo-${i}`);
  for (let j = 0; j < 6; j++) {
    const ponto = document.createElement("div");
    ponto.className = "ponto";
    ponto.dataset.step = j;
    ponto.onclick = () => abrirPopupColeta(i, j);
    linhaTempo.appendChild(ponto);
  }
}

// Seleciona e exibe painel do leito
function selecionarLeito(n) {
  leitoSelecionado = n;
  document.querySelectorAll(".painel-leito").forEach(p => p.classList.add("hidden"));
  document.getElementById(`painel-leito-${n}`).classList.remove("hidden");
  document.querySelectorAll(".leito-btn").forEach((b, idx) => {
    b.classList.toggle("ativo", idx === n - 1);
  });
  atualizarCronometro(n);
  atualizarLinhaTempo(n);
  atualizarRegistro(n);
}

// Inicia o protocolo
function iniciarProtocolo(n) {
  const dados = dadosLeitos[n];
  const nomePaciente = document.getElementById(`nome-paciente-${n}`).value.trim();
  if (!nomePaciente) return alert("Informe o nome do paciente.");
  dados.paciente = nomePaciente;
  dados.inicio = Date.now();
  dados.protocoloAtivo = true;
  dados.historico.push(`Protocolo iniciado em ${new Date().toLocaleString()}`);
  document.getElementById(`btn-suspender-${n}`).classList.remove("hidden");
  iniciarContador(n);
  atualizarRegistro(n);
}

// Suspende o protocolo
function suspenderProtocolo(n) {
  const dados = dadosLeitos[n];
  dados.protocoloAtivo = false;
  dados.historico.push(`Protocolo suspenso em ${new Date().toLocaleString()}`);
  clearInterval(intervalos[n]);
  document.getElementById(`btn-suspender-${n}`).classList.add("hidden");
  document.getElementById(`cronometro-${n}`).textContent = "00:00:00";
  atualizarRegistro(n);
}

// Inicia o cronômetro
function iniciarContador(n) {
  const cron = document.getElementById(`cronometro-${n}`);
  clearInterval(intervalos[n]);
  intervalos[n] = setInterval(() => {
    const dados = dadosLeitos[n];
    if (!dados.inicio || !dados.protocoloAtivo) return;
    const tempo = Date.now() - dados.inicio;
    const h = String(Math.floor(tempo / 3600000)).padStart(2, '0');
    const m = String(Math.floor((tempo % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((tempo % 60000) / 1000)).padStart(2, '0');
    cron.textContent = `${h}:${m}:${s}`;
  }, 1000);
}

function atualizarCronometro(n) {
  if (dadosLeitos[n].protocoloAtivo) iniciarContador(n);
  else document.getElementById(`cronometro-${n}`).textContent = "00:00:00";
}

// Atualiza a linha do tempo
function atualizarLinhaTempo(n) {
  const linha = document.getElementById(`linha-tempo-${n}`);
  const pontos = linha.querySelectorAll(".ponto");
  const status = dadosLeitos[n].coletaStatus;

  pontos.forEach((p, idx) => {
    p.classList.remove("verde", "amarelo", "vermelho");
    if (status[idx]) p.classList.add("verde");
    else if (idx === status.findIndex(s => !s)) p.classList.add("vermelho");
    else p.classList.add("amarelo");
  });
}

// Atualiza o histórico
function atualizarRegistro(n) {
  const div = document.getElementById(`registro-info-${n}`);
  const dados = dadosLeitos[n];
  div.innerHTML = `<strong>${dados.paciente}</strong><br>` +
    dados.historico.map(h => `<p>${h}</p>`).join('');
}

// Abre popup externo para coleta
function abrirPopupColeta(leito, ponto) {
  leitoSelecionado = leito;
  pontoSelecionado = ponto;
  window.open('coleta-popup.html', 'popup', 'width=500,height=500');
}

// Escuta retorno do popup
window.addEventListener('message', function(e) {
  const dados = e.data;
  const leito = leitoSelecionado;
  const ponto = pontoSelecionado;
  const info = dadosLeitos[leito];

  info.coletaStatus[ponto] = true;
  info.historico.push(
    `Coleta ${ponto + 1} – Técnico: ${dados.tecnico}, Enfermeiro: ${dados.enfermeiro}, Código: ${dados.codigo || '---'} – ${dados.hora}`
  );

  atualizarLinhaTempo(leito);
  atualizarRegistro(leito);
});
