/**
 * Genera y descarga una versión 100% autocontenida en un único archivo index.html
 * adaptada al estilo visual exacto de la Oficina de Soporte Anime (Alice con gafas y chaleco naranja,
 * anillos de hotspot circulares, ventana flotante de Terminal de comandos verde sobre negro y
 * Caja de Diálogo con filigranas estilo Visual Novel).
 */
export function downloadStandaloneHTML() {
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CyberAcademy SMR: Oficina de Soporte | Un Fantasma en el Sistema</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Outfit:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #1e293b; color: #f8fafc; overflow: hidden; margin: 0; }
    .font-display { font-family: 'Outfit', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    #alice-sprite {
      position: absolute;
      z-index: 25;
      transition: left 1.5s ease-in-out, bottom 1.5s ease-in-out;
      will-change: left, bottom, transform;
    }
    @keyframes walkBob {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    .walking-anim { animation: walkBob 0.45s infinite ease-in-out; }
    @keyframes cpuLag {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(-3px, 1px); }
      75% { transform: translate(3px, -1px); }
    }
    .lag-effect { animation: cpuLag 0.35s infinite steps(2, end); }
    .text-outline {
      text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 2px 6px rgba(0,0,0,0.85);
    }
  </style>
</head>
<body class="h-screen w-screen flex items-center justify-center bg-slate-950 select-none">
  <div id="viewport" class="relative w-full h-full max-w-[1440px] max-h-[860px] bg-[#ddd5c0] overflow-hidden shadow-2xl border border-slate-700">
    <!-- BARRA SUPERIOR ESTILO VISUAL NOVEL CON LOGO Y CONTROLES DE VOLUMEN INDEPENDIENTES -->
    <header class="absolute top-3 left-4 right-4 z-40 bg-slate-800/95 border-2 border-slate-200 rounded-xl px-4 py-2 shadow-xl flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <a href="https://www.unfantasmaenelsistema.com/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950 border-2 border-amber-400 text-white hover:bg-slate-900 transition shadow">
          <img src="/assets/aistudio/icono_81a3db5b.png" alt="Un Fantasma en el Sistema" class="w-6 h-6 object-contain" onerror="this.style.display='none'" />
          <div class="flex flex-col leading-tight">
            <span class="text-[10px] font-mono font-bold text-amber-300">UN FANTASMA EN EL SISTEMA</span>
            <span class="text-[11px] font-semibold text-sky-300">unfantasmaenelsistema.com</span>
          </div>
        </a>
        <span id="mission-title" class="text-white font-display font-semibold text-sm sm:text-base tracking-wide drop-shadow">
          Misión actual: Restaurar la red local
        </span>
        <div class="hidden lg:flex items-center gap-1 ml-1 bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-600 text-xs">
          <button onclick="cambiarMision(1)" class="px-2 py-0.5 rounded hover:bg-amber-500 hover:text-slate-950 transition">M1</button>
          <button onclick="cambiarMision(2)" class="px-2 py-0.5 rounded hover:bg-amber-500 hover:text-slate-950 transition">M2</button>
          <button onclick="cambiarMision(3)" class="px-2 py-0.5 rounded hover:bg-amber-500 hover:text-slate-950 transition">M3</button>
          <button onclick="cambiarMision(4)" class="px-2 py-0.5 rounded hover:bg-amber-500 hover:text-slate-950 transition">M4</button>
          <button onclick="cambiarMision(5)" class="px-2 py-0.5 rounded hover:bg-amber-500 hover:text-slate-950 transition">M5</button>
          <button onclick="cambiarMision(6)" class="px-2 py-0.5 rounded hover:bg-amber-500 hover:text-slate-950 transition">M6</button>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 bg-slate-950/90 border border-slate-600 rounded-lg px-2.5 py-1 text-[11px] font-mono">
          <label class="flex items-center gap-1 text-emerald-300">
            <span>Ambiente</span>
            <input id="amb-vol" type="range" min="0" max="1" step="0.05" value="0.45" oninput="ajustarAmbiente(this.value)" class="w-14 accent-emerald-400 cursor-pointer" />
          </label>
          <span class="text-slate-600">|</span>
          <label class="flex items-center gap-1 text-sky-300">
            <span>SFX</span>
            <input id="sfx-vol" type="range" min="0" max="1" step="0.05" value="0.75" oninput="ajustarSfx(this.value)" class="w-14 accent-sky-400 cursor-pointer" />
          </label>
        </div>
        <span class="text-slate-100 font-display font-medium text-xs sm:text-sm hidden xl:inline">Ubicación: Oficina de Soporte</span>
      </div>
    </header>

    <!-- ESCENARIO DE FONDO OFICINA DE SOPORTE SVG -->
    <svg viewBox="0 0 1280 720" class="w-full h-full object-cover" preserveAspectRatio="xMidYMid slice">
      <polygon points="0,0 1280,0 1160,65 370,115 0,68" fill="#94A3B8"/>
      <polygon points="0,68 370,115 370,505 0,565" fill="#d5ccb4"/>
      <polygon points="370,115 1160,65 1160,515 370,505" fill="#e5dec9"/>
      <polygon points="0,565 370,505 1160,515 1280,620 1280,720 0,720" fill="#64748B"/>
      <!-- Estanterías de madera -->
      <rect x="272" y="162" width="374" height="270" fill="#9c6b43" stroke="#3e2723" stroke-width="3"/>
      <!-- Reloj -->
      <circle cx="678" cy="148" r="22" fill="#f8fafc" stroke="#1e293b" stroke-width="4"/>
      <!-- Rack de Comunicaciones -->
      <rect x="780" y="130" width="165" height="380" fill="#1e293b" stroke="#0f172a" stroke-width="4"/>
      <!-- Escritorio y Monitor PC del Técnico -->
      <polygon points="14,468 380,418 625,418 445,498" fill="#dfb184" stroke="#27150b" stroke-width="3"/>
      <polygon points="14,468 445,498 445,695 14,655" fill="#8a5a36" stroke="#27150b" stroke-width="3"/>
      <polygon points="285,320 398,314 402,422 288,434" fill="#38bdf8" stroke="#0f172a" stroke-width="4"/>
    </svg>

    <!-- HOTSPOTS CIRCULARES LUMINOSOS -->
    <div onclick="interactuarPC()" class="absolute left-[22%] top-[43%] z-20 cursor-pointer flex items-center justify-center group">
      <div class="w-24 h-24 rounded-full border-[3px] border-white shadow-[0_0_20px_rgba(255,255,255,0.9)] group-hover:scale-110 transition-transform flex items-center justify-center">
        <span class="text-white font-bold text-sm whitespace-nowrap text-outline">PC del Técnico</span>
      </div>
    </div>

    <div onclick="interactuarCajon()" class="absolute left-[32%] top-[62%] z-20 cursor-pointer flex items-center justify-center group">
      <div class="w-20 h-20 rounded-full border-[3px] border-white/90 shadow-[0_0_16px_rgba(255,255,255,0.8)] group-hover:scale-110 transition-transform flex items-center justify-center">
        <span class="text-white font-bold text-xs whitespace-nowrap text-outline">Cajón / USB</span>
      </div>
    </div>

    <div onclick="interactuarRack()" class="absolute left-[63%] top-[30%] z-20 cursor-pointer flex items-center justify-center group">
      <div class="w-24 h-24 rounded-full border-[3px] border-white shadow-[0_0_20px_rgba(255,255,255,0.9)] group-hover:scale-110 transition-transform flex items-center justify-center">
        <span class="text-white font-bold text-sm whitespace-nowrap text-outline">Rack de Comunicaciones</span>
      </div>
    </div>

    <!-- VENTANA FLOTANTE TERMINAL DE COMANDOS (ESTILO WINDOWS CLÁSICO VERDE SOBRE NEGRO) -->
    <div id="cmd-window" class="absolute left-[43%] top-[38%] w-[340px] sm:w-[410px] h-[235px] z-30 bg-black border-2 border-slate-200 shadow-2xl flex flex-col">
      <div class="bg-white text-slate-900 px-2.5 py-1 text-xs font-semibold flex items-center justify-between border-b border-slate-300">
        <div class="flex items-center gap-1.5">
          <span class="bg-black text-white px-1 font-mono text-[10px]">C:\\_</span>
          <span id="win-title">Terminal de comandos</span>
        </div>
        <div class="flex items-center gap-2 text-slate-600 font-mono">
          <span>—</span><span>□</span><button onclick="document.getElementById('cmd-window').classList.add('hidden')" class="hover:text-red-600 font-bold">✕</button>
        </div>
      </div>
      <div id="term-out" class="flex-1 p-2.5 overflow-y-auto font-mono text-[11px] text-green-400 space-y-1">
        <div>Microsoft Windows [Version 10.0.15382.330]</div>
        <div>(c) Microsoft Corporation. All rights reserved.</div>
        <div class="pt-1">Escribe "help" o el comando de la misión...</div>
      </div>
      <form onsubmit="ejecutarCmd(event)" class="px-2.5 py-1.5 bg-black border-t border-green-900/50 flex items-center gap-1 font-mono text-[11px] text-green-400">
        <span>C:\\Users\\Tecnico&gt;</span>
        <input id="term-in" autocomplete="off" autofocus class="flex-1 bg-transparent outline-none text-green-300" />
      </form>
    </div>

    <!-- SPRITE DE ALICE DE CUERPO ENTERO (PELO CASTAÑO, GAFAS, CHALECO NARANJA) -->
    <div id="alice-sprite" style="left: 960px; bottom: 0px; transform: scaleX(1);" class="w-52 pointer-events-none">
      <div id="alice-inner">
        <svg viewBox="0 0 250 400" class="w-full h-auto drop-shadow-2xl">
          <path d="M68 78 C52 115, 52 162, 66 184 L184 184 C198 162, 198 115, 182 78 Z" fill="#6b3e26" stroke="#27150b" stroke-width="3"/>
          <path d="M80 158 L170 158 L166 296 L84 296 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3"/>
          <path d="M78 158 L112 158 L121 205 L121 296 L80 296 Z" fill="#ea580c" stroke="#27150b" stroke-width="3"/>
          <path d="M172 158 L138 158 L129 205 L129 296 L170 296 Z" fill="#ea580c" stroke="#27150b" stroke-width="3"/>
          <path d="M80 74 C80 42, 170 42, 170 74 C170 112, 152 138, 125 142 C98 138, 80 112, 80 74 Z" fill="#fff3e6" stroke="#27150b" stroke-width="3"/>
          <rect x="87" y="84" width="32" height="24" rx="9" fill="none" stroke="#1e293b" stroke-width="3.5"/>
          <rect x="131" y="84" width="32" height="24" rx="9" fill="none" stroke="#1e293b" stroke-width="3.5"/>
          <line x1="119" y1="94" x2="131" y2="94" stroke="#1e293b" stroke-width="3.5"/>
          <path d="M72 84 C68 28, 182 28, 178 84 C162 64, 88 64, 72 84 Z" fill="#6b3e26" stroke="#27150b" stroke-width="3"/>
        </svg>
      </div>
    </div>

    <!-- CAJA DE DIÁLOGO / NARRATIVA CON FILIGRANAS ESTILO VISUAL NOVEL -->
    <div class="absolute bottom-3 left-4 right-4 z-30 flex items-end gap-4 max-w-5xl">
      <!-- Retrato enmarcado -->
      <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-[3px] border-slate-900 bg-[#d8e2dc] shadow-2xl overflow-hidden shrink-0">
        <svg viewBox="0 0 120 120" class="w-full h-full">
          <path d="M22 48 C14 75, 16 105, 28 118 L92 118 C102 105, 102 75, 94 48 Z" fill="#6b3e26"/>
          <path d="M20 120 C26 94, 94 94, 100 120 Z" fill="#ea580c"/>
          <path d="M32 54 C32 28, 88 28, 88 54 C88 80, 75 95, 60 97 C45 95, 32 80, 32 54 Z" fill="#fff3e6" stroke="#27150b" stroke-width="2.5"/>
          <rect x="36" y="56" width="22" height="16" rx="6" fill="none" stroke="#1e293b" stroke-width="2.8"/>
          <rect x="62" y="56" width="22" height="16" rx="6" fill="none" stroke="#1e293b" stroke-width="2.8"/>
          <path d="M28 56 C26 18, 94 18, 92 56 Z" fill="#6b3e26"/>
        </svg>
      </div>

      <!-- Contenedor de Narrativa Rosa-Crema -->
      <div class="relative flex-1 bg-gradient-to-b from-[#fffdf9] via-[#fff0f3] to-[#fce4ec] border-[3px] border-[#27150b] rounded-2xl p-5 pt-7 shadow-2xl text-slate-900">
        <div class="absolute -top-4 left-4 bg-gradient-to-r from-[#ffdde1] to-[#fce4ec] border-2 border-[#27150b] rounded-lg px-4 py-1 font-display font-bold text-sm text-[#27150b] shadow">
          Caja de Diálogo / Narrativa
        </div>
        <p id="dialog-text" class="text-sm sm:text-base font-medium leading-relaxed text-slate-900">
          <strong>[Alice]</strong> - El router no responde al ping y el indicador WAN está apagado... ¡Tengo que comprobar la conexión física en el Rack o la configuración IP desde el terminal!
        </p>
      </div>
    </div>
  </div>

  <script>
    const estado = { mision: 1, cable_conectado: false, usb_recogido: false, usb_insertado: false, mbr_fijado: false, ip_liberada: false, ambVol: 0.45, sfxVol: 0.75 };
    let audioCtx = null, ambGain = null;
    function initAudio() {
      if (audioCtx) return;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
      ambGain = audioCtx.createGain();
      ambGain.gain.value = estado.ambVol * 0.25;
      ambGain.connect(audioCtx.destination);
      const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 3, audioCtx.sampleRate);
      const data = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) { last = (last + 0.025 * (Math.random() * 2 - 1)) / 1.025; data[i] = last * 1.6; }
      const src = audioCtx.createBufferSource(); src.buffer = buf; src.loop = true;
      const flt = audioCtx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 210;
      src.connect(flt); flt.connect(ambGain); src.start();
    }
    window.addEventListener('mousedown', initAudio, { once: true });
    function ajustarAmbiente(v) { initAudio(); estado.ambVol = parseFloat(v); if (ambGain && audioCtx) ambGain.gain.setTargetAtTime(estado.ambVol * 0.25, audioCtx.currentTime, 0.08); }
    function ajustarSfx(v) { initAudio(); estado.sfxVol = parseFloat(v); }
    function moverAlice(destinoX, destinoY, mirarIzquierda) {
      const sprite = document.getElementById('alice-sprite');
      const inner = document.getElementById('alice-inner');
      sprite.style.left = destinoX + 'px';
      sprite.style.bottom = destinoY + 'px';
      sprite.style.transform = mirarIzquierda ? 'scaleX(-1)' : 'scaleX(1)';
      inner.classList.add('walking-anim');
      setTimeout(() => inner.classList.remove('walking-anim'), 1500);
    }
    function hablar(msg) {
      document.getElementById('dialog-text').innerHTML = '<strong>[Alice]</strong> - ' + msg;
    }
    function cambiarMision(m) {
      estado.mision = m;
      const nombres = {
        1: 'Misión actual: Restaurar la red local',
        2: 'Misión actual: El Arranque del SO (BOOTMGR)',
        3: 'Misión actual: Despliegue Silencioso (/S)',
        4: 'Misión actual: El Proceso Rebelde (bucle.exe)',
        5: 'Misión actual: Conflicto de Identidad (DHCP)',
        6: 'Misión actual: El Asistente Empático (Helpdesk)'
      };
      document.getElementById('mission-title').textContent = nombres[m];
      document.getElementById('viewport').classList.toggle('lag-effect', m === 4);
      hablar('Cambiado a ' + nombres[m]);
    }
    function interactuarRack() {
      moverAlice(740, 0, true);
      setTimeout(() => {
        estado.cable_conectado = true;
        hablar('¡He conectado el cable RJ45 suelto en el Rack de Comunicaciones (cable_conectado = true)! Ahora ejecuta ping 192.168.1.1 en el terminal.');
      }, 1500);
    }
    function interactuarCajon() {
      moverAlice(340, 0, true);
      setTimeout(() => {
        estado.usb_recogido = true;
        estado.usb_insertado = true;
        hablar('¡He recogido el Pendrive USB con la ISO del cajón y lo he conectado al PC! Ahora ejecuta bootrec /fixmbr y bootrec /fixboot.');
      }, 1500);
    }
    function interactuarPC() {
      moverAlice(220, 0, true);
      setTimeout(() => {
        document.getElementById('cmd-window').classList.remove('hidden');
        document.getElementById('term-in').focus();
      }, 1500);
    }
    function ejecutarCmd(e) {
      e.preventDefault();
      const input = document.getElementById('term-in');
      const out = document.getElementById('term-out');
      const raw = input.value.trim();
      if (!raw) return;
      input.value = '';
      out.innerHTML += '<div>C:\\\\Users\\\\Tecnico&gt; ' + raw + '</div>';
      const cmd = raw.toLowerCase();
      if (cmd === 'cls') { out.innerHTML = ''; return; }
      if (cmd === 'ping 192.168.1.1') {
        if (!estado.cable_conectado) {
          out.innerHTML += '<div class="text-red-400">Tiempo de espera agotado para esta solicitud.</div>';
          hablar('Tiempo de espera agotado. Haz clic primero en el Rack de Comunicaciones para conectar el cable suelto.');
        } else {
          out.innerHTML += '<div>Respuesta desde 192.168.1.1: bytes=32 tiempo=1ms TTL=64</div>';
          hablar('¡Ping correcto! Misión 1 completada. Pasando a la Misión 2...');
          setTimeout(() => cambiarMision(2), 2000);
        }
      } else if (cmd === 'bootrec /fixmbr') {
        estado.mbr_fijado = true;
        out.innerHTML += '<div>La operación se completó correctamente.</div>';
      } else if (cmd === 'bootrec /fixboot') {
        out.innerHTML += '<div>La operación se completó correctamente.</div>';
        hablar('¡Arranque reparado! Pasando a la Misión 3...');
        setTimeout(() => cambiarMision(3), 2000);
      } else if (cmd === 'antivirus_setup.exe /s') {
        out.innerHTML += '<div>Instalación silenciosa completada correctamente.</div>';
        hablar('¡Antivirus desplegado sin interrumpir al usuario! Pasando a la Misión 4...');
        setTimeout(() => cambiarMision(4), 2000);
      } else if (cmd === 'tasklist') {
        out.innerHTML += '<div>bucle.exe   PID 4812   1.890.400 KB [99% CPU]</div>';
      } else if (cmd === 'taskkill /f /im bucle.exe') {
        out.innerHTML += '<div>CORRECTO: se terminó el proceso "bucle.exe" con PID 4812.</div>';
        document.getElementById('viewport').classList.remove('lag-effect');
        hablar('¡Proceso detenido! Pasando a la Misión 5...');
        setTimeout(() => cambiarMision(5), 2000);
      } else if (cmd === 'ipconfig /release') {
        out.innerHTML += '<div>Dirección IPv4: 0.0.0.0</div>';
      } else if (cmd === 'ipconfig /renew') {
        out.innerHTML += '<div>Nueva concesión DHCP Dirección IPv4: 192.168.1.105</div>';
        hablar('¡Conflicto IP resuelto! Todas las misiones de consola completadas.');
      } else {
        out.innerHTML += '<div>Comandos: ping 192.168.1.1 | bootrec /fixmbr | bootrec /fixboot | antivirus_setup.exe /S | tasklist | taskkill /F /IM bucle.exe | ipconfig /release | ipconfig /renew</div>';
      }
      out.scrollTop = out.scrollHeight;
    }
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'index.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
