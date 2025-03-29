const leitoScroll = document.getElementById('leito-scroll');
const tituloLeito = document.getElementById('titulo-leito');
const painelControle = document.getElementById('painel-controle');
const cronometro = document.getElementById('cronometro');
const linhaTempo = document.getElementById('linha-tempo');
const registroInfo = document.getElementById('registro-info');
const registroFluxo = document.getElementById('registro-fluxo');

let leitoSelecionado = null;
let dadosLeitos = {};
let intervalos = {};

function gerarLeitos() {
  for (let i = 1; i <= 19; i++) {
    const btn = document.createElement('div');
    btn.className = 'leito-btn';
    btn.innerText = `UTI ${i}`;
    btn.onclick = () => selecionarLeito(i);
    leitoScroll.appendChild(btn);
    dadosLeitos[i] = {
      protocoloAtivo: false,
      inicio: null,
      coletaIndex: 0,
      historico: [],
      suspenso: false
    };
  }
}

function selecionarLeito(numero) {
  leitoSelecionado = numero;
  const dados = dadosLeitos[numero];

  document.querySelectorAll('.leito-btn').forEach(btn => btn.classList.remove('ativo'));
  document.querySelectorAll('.leito-btn')[numero - 1].classList.add('ativo');

  tituloLeito.textContent = `Leito ${numero} – Iniciar HNF + Controle TTPa`;
  painelControle.classList.remove('hidden');
  atualizarRegistro(numero);

  document.querySelectorAll('.ponto').forEach(ponto => ponto.classList.remove('confirmado'));
  for (let i = 1; i <= dados.coletaIndex; i++) {
    const ponto = document.querySelector(`.ponto[data-step="${i}"]`);
    if (ponto) ponto.classList.add('confirmado');
  }

  if (dados.protocoloAtivo) iniciarContador(numero);
  else pararContador(numero);
}

function iniciarProtocolo() {
  if (!leitoSelecionado) return;
  const dados = dadosLeitos[leitoSelecionado];

  dados.protocoloAtivo = true;
  dados.inicio = Date.now();
  dados.suspenso = false;
  dados.historico.push(`Protocolo iniciado em ${new Date().toLocaleString()}`);
  dados.coletaIndex = 0;

  document.getElementById('btn-suspender').classList.remove('hidden');
  iniciarContador(leitoSelecionado);
  atualizarRegistro(leitoSelecionado);
}

function suspenderProtocolo() {
  if (!leitoSelecionado) return;
  const dados = dadosLeitos[leitoSelecionado];
  dados.protocoloAtivo = false;
  dados.suspenso = true;
  dados.historico.push(`Protocolo suspenso em ${new Date().toLocaleString()}`);
  pararContador(leitoSelecionado);
  atualizarRegistro(leitoSelecionado);
  document.getElementById('btn-suspender').classList.add('hidden');
  cronometro.textContent = '00:00:00';
}

function iniciarContador(numero) {
  pararContador(numero);
  intervalos[numero] = setInterval(() => {
    const dados = dadosLeitos[numero];
    if (!dados.protocoloAtivo || !dados.inicio) return;

    const restante = 6 * 60 * 60 * 1000 - (Date.now() - dados.inicio);
    if (restante <= 0) {
      if (leitoSelecionado === numero) cronometro.textContent = '00:00:00';
      return;
    }

    const h = String(Math.floor(restante / 3600000)).padStart(2, '0');
    const m = String(Math.floor((restante % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((restante % 60000) / 1000)).padStart(2, '0');

    if (leitoSelecionado === numero) {
      cronometro.textContent = `${h}:${m}:${s}`;
    }
  }, 1000);
}

function pararContador(numero) {
  if (intervalos[numero]) {
    clearInterval(intervalos[numero]);
    delete intervalos[numero];
  }
}

function confirmarColeta() {
  if (!leitoSelecionado) return;
  const dados = dadosLeitos[leitoSelecionado];
  if (!dados.protocoloAtivo) return;

  const index = dados.coletaIndex + 1;
  const ponto = document.querySelector(`.ponto[data-step="${index}"]`);
  if (ponto) ponto.classList.add('confirmado');

  dados.coletaIndex = index;
  dados.inicio = Date.now();

  const tecnico = document.getElementById('nomeTecnico').value;
  const lab = document.getElementById('nomeLab').value;
  const enf = document.getElementById('enfermeiroContato').value;

  dados.historico.push(`Coleta ${index} confirmada por ${tecnico || 'Técnico Não Identificado'} / Lab: ${lab || 'Desconhecido'} / Contato: ${enf || 'Desconhecido'} - ${new Date().toLocaleString()}`);
  atualizarRegistro(leitoSelecionado);
  iniciarContador(leitoSelecionado);
}

function atualizarRegistro(numero) {
  const dados = dadosLeitos[numero];
  registroInfo.innerHTML = dados.protocoloAtivo
    ? `<p><strong>Ativo desde:</strong> ${new Date(dados.inicio).toLocaleString()}</p>`
    : '';
  registroFluxo.innerHTML = dados.historico.map(e => `<p>${e}</p>`).join('');
}

async function abrirLeitor() {
  const codeReader = new ZXing.BrowserBarcodeReader();
  const preview = document.getElementById('video-preview');
  preview.classList.remove('hidden');

  try {
    const result = await codeReader.decodeOnceFromVideoDevice(undefined, 'video-preview');
    alert(`Código lido: ${result.text}`);
    preview.classList.add('hidden');
    codeReader.reset();
    confirmarColeta();
  } catch (err) {
    alert('Erro na leitura do código.');
    preview.classList.add('hidden');
    codeReader.reset();
  }
}

function abrirPopup(tipo) {
  document.getElementById(`popup-${tipo}`).classList.remove('hidden');
}

function fecharPopup(tipo) {
  document.getElementById(`popup-${tipo}`).classList.add('hidden');
}

gerarLeitos();
