// script.js

const grid = document.querySelector('.grid');
const totalLeitos = 19;
let leitos = [];

// Gera os 19 leitos ao carregar a página
for (let i = 1; i <= totalLeitos; i++) {
  const leito = document.createElement('div');
  leito.classList.add('leito');
  leito.setAttribute('id', `leito-${i}`);
  leito.innerHTML = `
    UTI ${i}
    <div class="timer" id="timer-${i}"></div>
    <button onclick="ativarProtocolo(${i})">Ativar Protocolo</button>
  `;
  grid.appendChild(leito);
  leitos[i] = { ativo: false, tempo: null };
}

function ativarProtocolo(id) {
  const leito = document.getElementById(`leito-${id}`);
  const btn = leito.querySelector('button');

  if (!leitos[id].ativo) {
    // Ativar protocolo
    leitos[id].ativo = true;
    leitos[id].tempo = Date.now() + 6 * 60 * 60 * 1000; // 6 horas
    leito.classList.remove('atrasado', 'proximo');
    leito.classList.add('ativo');
    btn.textContent = "Encerrar Protocolo";
    atualizarTimers();
  } else {
    // Encerrar protocolo
    leitos[id].ativo = false;
    leitos[id].tempo = null;
    leito.className = 'leito';
    leito.querySelector('.timer').textContent = '';
    btn.textContent = "Ativar Protocolo";
  }
}

// Atualiza timers a cada minuto
setInterval(atualizarTimers, 1000);

function atualizarTimers() {
  for (let i = 1; i <= totalLeitos; i++) {
    const leito = document.getElementById(`leito-${i}`);
    const timer = leito.querySelector('.timer');

    if (leitos[i].ativo && leitos[i].tempo) {
      const tempoRestante = leitos[i].tempo - Date.now();
      if (tempoRestante <= 0) {
        leito.classList.remove('ativo', 'proximo');
        leito.classList.add('atrasado');
        timer.textContent = 'Coleta atrasada!';
      } else {
        const h = Math.floor(tempoRestante / (1000 * 60 * 60));
        const m = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        timer.textContent = `Próxima coleta: ${h}h ${m}min`;
        if (tempoRestante <= 30 * 60 * 1000) {
          leito.classList.remove('ativo');
          leito.classList.add('proximo');
        } else {
          leito.classList.add('ativo');
          leito.classList.remove('proximo');
        }
      }
    }
  }
}

// Popups
function abrirPopup(tipo) {
  document.getElementById(`popup-${tipo}`).classList.remove('hidden');
}

function fecharPopup(tipo) {
  document.getElementById(`popup-${tipo}`).classList.add('hidden');
}
