const leitoScroll = document.getElementById('leito-scroll');
const tituloLeito = document.getElementById('titulo-leito');
const painelControle = document.getElementById('painel-controle');
const cronometro = document.getElementById('cronometro');
const linhaTempo = document.getElementById('linha-tempo');

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
      coletaIndex: 0
    };
  }
}

function selecionarLeito(numero) {
  leitoSelecionado = numero;
  const dados = dadosLeitos[numero];

  tituloLeito.textContent = `Leito ${numero} – Iniciar HNF + Controle TTPa`;
  painelControle.classList.remove('hidden');
  cronometro.textContent = '00:00:00';

  // Resetar linha do tempo
  document.querySelectorAll('.ponto').forEach(ponto => {
    ponto.classList.remove('ativo', 'confirmado');
  });

  // Marcar pontos já confirmados se o protocolo estiver ativo
  if (dados.coletaIndex > 0) {
    for (let i = 1; i <= dados.coletaIndex; i++) {
      const ponto = document.querySelector(`.ponto[data-step="${i}"]`);
      ponto.classList.add('confirmado');
    }
  }

  // Reiniciar cronômetro se ativo
  if (dados.protocoloAtivo) {
    iniciarContador(numero);
  } else {
    pararContador(numero);
  }
}

function iniciarProtocolo() {
  if (!leitoSelecionado) return;

  const dados = dadosLeitos[leitoSelecionado];
  dados.protocoloAtivo = true;
  dados.inicio = Date.now();
  dados.coletaIndex = 0;

  iniciarContador(leitoSelecionado);
}

function iniciarContador(numero) {
  pararContador(numero); // evita múltiplos intervalos

  intervalos[numero] = setInterval(() => {
    const dados = dadosLeitos[numero];
    if (!dados.protocoloAtivo || !dados.inicio) return;

    const decorrido = Date.now() - dados.inicio;
    const restante = 6 * 60 * 60 * 1000 - decorrido;
    if (restante <= 0) {
      cronometro.textContent = "00:00:00";
      return;
    }

    const horas = String(Math.floor(restante / (1000 * 60 * 60))).padStart(2, '0');
    const minutos = String(Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const segundos = String(Math.floor((restante % (1000 * 60)) / 1000)).padStart(2, '0');

    cronometro.textContent = `${horas}:${minutos}:${segundos}`;
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

  if (ponto) {
    ponto.classList.add('confirmado');
    dados.coletaIndex = index;
  }

  // Reinicia contador para próxima coleta
  dados.inicio = Date.now();
  iniciarContador(leitoSelecionado);
}

// Popup de instruções
function abrirPopup(tipo) {
  document.getElementById(`popup-${tipo}`).classList.remove('hidden');
}

function fecharPopup(tipo) {
  document.getElementById(`popup-${tipo}`).classList.add('hidden');
}

gerarLeitos();
async function abrirLeitor() {
  const codeReader = new ZXing.BrowserBarcodeReader();
  const preview = document.getElementById('video-preview');
  preview.classList.remove('hidden');

  try {
    const result = await codeReader.decodeOnceFromVideoDevice(undefined, 'video-preview');
    alert(`Código lido: ${result.text}`);
    preview.classList.add('hidden');
    codeReader.reset();
    confirmarColeta(); // Confirma a coleta após leitura
  } catch (err) {
    alert('Erro ao ler o código ou leitura cancelada.');
    preview.classList.add('hidden');
    codeReader.reset();
  }
}
