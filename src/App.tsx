import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Usb,
  Cable,
  ExternalLink,
  Download,
  RotateCcw,
  Cpu,
  X,
  Minus,
  Square,
  BookOpen,
  Award,
  Activity,
  Printer,
  Trophy,
  ShieldCheck,
  Bug,
  Network,
  HardDrive,
  HeartHandshake,
  GraduationCap,
  Lock,
  HelpCircle,
  History,
  FolderOpen,
  Fan,
  Headphones,
  Palette,
  FastForward,
  ClipboardList,
  Power,
  Search,
} from 'lucide-react';
import { AliceFullSprite, CharacterPortrait, AliceExpression } from './components/AnimeAssets';
import { OfficeSceneSVG } from './components/OfficeSceneSVG';
import {
  TerminalAuditPanel,
  AuditLogEntry,
  AuditCategory,
  AuditSeverity,
} from './components/TerminalAuditPanel';
import { soundFX } from './utils/soundEffects';
import { loadProgress, saveProgress, clearProgress, calculateGrade as computeGrade } from './engine/progress';
import iconoUrl from './assets/icono.png';
import {
  SMR_THEORY_SHEETS,
  TIA_568B_PINS,
  SMR_ACHIEVEMENTS,
  AchievementDef,
  VIRTUAL_FILE_SYSTEM,
  VirtualDirPath,
} from './data/smrCurriculum';

const CMD_HISTORY_STORAGE_KEY = 'smr_cyberacademy_cmd_history_v1';
const AUDIO_PREFS_STORAGE_KEY = 'smr_cyberacademy_audio_prefs_v1';
const TERMINAL_THEME_STORAGE_KEY = 'smr_cyberacademy_terminal_theme_v1';
const DIALOG_FAST_FORWARD_KEY = 'smr_cyberacademy_fast_forward_v1';
const AUDIT_LOG_STORAGE_KEY = 'smr_cyberacademy_audit_log_v1';

const createInitialAuditLog = (): AuditLogEntry[] => [
  {
    id: 'audit-init-0',
    timestamp: new Date().toLocaleTimeString('es-ES', { hour12: false }),
    missionId: 1,
    eventId: 'EVT-1000',
    category: 'HARDWARE',
    severity: 'WARNING',
    action: 'Inicio del Monitor de Auditoría del Sistema Virtual',
    details:
      'Enlace físico RJ45 en Rack 42U desconectado (cable_conectado = false). Interfaz Ethernet0 en espera.',
  },
];

type TerminalThemeId = 'matrix' | 'win95' | 'high-contrast' | 'powershell';

interface TerminalThemeConfig {
  id: TerminalThemeId;
  label: string;
  shortLabel: string;
  colorCmd: string;
  swatchBg: string;
  swatchFg: string;
  windowContainer: string;
  titleBar: string;
  titleBadge: string;
  menuButton: string;
  menuBarBg: string;
  windowControlBtn: string;
  closeControlBtn: string;
  bodyBg: string;
  textDefault: string;
  textSuccess: string;
  textError: string;
  textWarning: string;
  textSystem: string;
  tabBarBg: string;
  tabLabel: string;
  tabChipIdle: string;
  tabChipActive: string;
  promptFormBg: string;
  promptText: string;
  inputPlaceholder: string;
}

const TERMINAL_THEMES: Record<TerminalThemeId, TerminalThemeConfig> = {
  matrix: {
    id: 'matrix',
    label: 'Matrix Green',
    shortLabel: 'Matrix',
    colorCmd: 'color 0a',
    swatchBg: '#000000',
    swatchFg: '#4ADE80',
    windowContainer: 'bg-black border-2 border-slate-200 shadow-[0_18px_45px_rgba(0,0,0,0.85)]',
    titleBar: 'bg-white text-slate-900 border-b border-slate-300',
    titleBadge: 'bg-black text-[#4ADE80] border border-green-500/40',
    menuButton: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300',
    menuBarBg: 'bg-slate-900 border-b border-green-500/40 text-slate-100',
    windowControlBtn: 'hover:bg-slate-200 rounded text-slate-700',
    closeControlBtn: 'hover:bg-rose-500 hover:text-white rounded text-slate-700',
    bodyBg: 'bg-black',
    textDefault: 'text-[#4ADE80]',
    textSuccess: 'text-[#86EFAC] font-bold drop-shadow-[0_0_4px_rgba(74,222,128,0.4)]',
    textError: 'text-red-400 font-semibold',
    textWarning: 'text-amber-300',
    textSystem: 'text-sky-300',
    tabBarBg: 'bg-slate-950 border-t border-slate-800',
    tabLabel: 'text-sky-400',
    tabChipIdle: 'bg-slate-900 hover:bg-green-950 border-green-700/60 text-[#4ADE80]',
    tabChipActive: 'bg-emerald-900 border-emerald-400 text-white font-bold',
    promptFormBg: 'bg-black border-t border-green-900/40 text-[#4ADE80]',
    promptText: 'text-[#4ADE80]',
    inputPlaceholder: 'placeholder:text-green-900',
  },
  win95: {
    id: 'win95',
    label: 'Classic Windows 95',
    shortLabel: 'Win 95',
    colorCmd: 'color 07',
    swatchBg: '#000080',
    swatchFg: '#C0C0C0',
    windowContainer:
      'bg-[#C0C0C0] p-1 border-t-2 border-l-2 border-white border-r-2 border-b-2 border-[#202020] shadow-[4px_4px_0px_#000000]',
    titleBar: 'bg-gradient-to-r from-[#000080] to-[#1084D0] text-white font-bold',
    titleBadge: 'bg-[#C0C0C0] text-black border border-black',
    menuButton:
      'bg-[#C0C0C0] hover:bg-[#D4D0C8] text-black border-t border-l border-white border-r border-b border-black font-bold',
    menuBarBg: 'bg-[#C0C0C0] border-b-2 border-[#808080] text-black',
    windowControlBtn:
      'bg-[#C0C0C0] text-black border-t border-l border-white border-r border-b border-black active:border-t-black',
    closeControlBtn:
      'bg-[#C0C0C0] text-black hover:bg-red-600 hover:text-white border-t border-l border-white border-r border-b border-black',
    bodyBg: 'bg-[#000000] border-t-2 border-l-2 border-[#808080] border-r border-b border-white',
    textDefault: 'text-[#E5E5E5]',
    textSuccess: 'text-[#55FF55] font-bold',
    textError: 'text-[#FF5555] font-semibold',
    textWarning: 'text-[#FFFF55]',
    textSystem: 'text-[#55FFFF]',
    tabBarBg: 'bg-[#1A1A1A] border-t border-[#808080]',
    tabLabel: 'text-[#55FFFF]',
    tabChipIdle: 'bg-[#262626] hover:bg-[#3A3A3A] border-[#808080] text-[#E5E5E5]',
    tabChipActive: 'bg-[#000080] border-white text-[#FFFF55] font-bold',
    promptFormBg: 'bg-[#000000] border-t border-[#404040] text-[#FFFFFF]',
    promptText: 'text-[#FFFFFF]',
    inputPlaceholder: 'placeholder:text-[#666666]',
  },
  'high-contrast': {
    id: 'high-contrast',
    label: 'High Contrast',
    shortLabel: 'Alto Contraste',
    colorCmd: 'color 0e',
    swatchBg: '#000000',
    swatchFg: '#FFFF00',
    windowContainer:
      'bg-black border-[3px] border-[#FFFF00] ring-2 ring-black shadow-[0_20px_50px_rgba(0,0,0,0.95)]',
    titleBar: 'bg-black text-[#FFFF00] border-b-2 border-[#FFFF00] font-bold',
    titleBadge: 'bg-[#FFFF00] text-black font-extrabold',
    menuButton: 'bg-black hover:bg-[#FFFF00] text-[#FFFF00] hover:text-black border border-[#FFFF00] font-bold',
    menuBarBg: 'bg-black border-b-2 border-[#00FFFF] text-[#FFFF00]',
    windowControlBtn: 'border border-[#FFFF00] text-[#FFFF00] hover:bg-[#FFFF00] hover:text-black',
    closeControlBtn: 'border border-[#FF5555] text-[#FF5555] hover:bg-[#FF5555] hover:text-black',
    bodyBg: 'bg-black',
    textDefault: 'text-[#FFFF00] font-semibold',
    textSuccess: 'text-[#00FF00] font-extrabold underline',
    textError: 'text-[#FF4444] font-extrabold',
    textWarning: 'text-[#FFFFFF] font-bold',
    textSystem: 'text-[#00FFFF] font-bold',
    tabBarBg: 'bg-black border-t-2 border-[#FFFF00]',
    tabLabel: 'text-[#00FFFF] font-bold',
    tabChipIdle: 'bg-black hover:bg-[#222200] border-[#FFFF00] text-[#FFFF00] font-bold',
    tabChipActive: 'bg-[#FFFF00] border-white text-black font-extrabold',
    promptFormBg: 'bg-black border-t-2 border-[#FFFF00] text-[#FFFF00] font-bold',
    promptText: 'text-[#FFFF00] font-bold',
    inputPlaceholder: 'placeholder:text-[#888800]',
  },
  powershell: {
    id: 'powershell',
    label: 'PowerShell Blue',
    shortLabel: 'PowerShell',
    colorCmd: 'color 1f',
    swatchBg: '#012456',
    swatchFg: '#F9F1A5',
    windowContainer:
      'bg-[#012456] border-2 border-sky-300 shadow-[0_18px_45px_rgba(1,36,86,0.9)]',
    titleBar: 'bg-[#001635] text-sky-100 border-b border-sky-500/50',
    titleBadge: 'bg-sky-500 text-slate-950 font-bold',
    menuButton: 'bg-[#012456] hover:bg-sky-900 text-sky-100 border border-sky-400/50',
    menuBarBg: 'bg-[#00122B] border-b border-sky-500/50 text-sky-100',
    windowControlBtn: 'hover:bg-sky-800 rounded text-sky-200',
    closeControlBtn: 'hover:bg-rose-500 hover:text-white rounded text-sky-200',
    bodyBg: 'bg-[#012456]',
    textDefault: 'text-[#EEEDF0]',
    textSuccess: 'text-[#6CCB5F] font-bold',
    textError: 'text-[#FF6B6B] font-semibold',
    textWarning: 'text-[#F9F1A5]',
    textSystem: 'text-[#61D6D6]',
    tabBarBg: 'bg-[#001635] border-t border-sky-800',
    tabLabel: 'text-[#F9F1A5]',
    tabChipIdle: 'bg-[#012456] hover:bg-sky-900 border-sky-500/60 text-[#EEEDF0]',
    tabChipActive: 'bg-[#F9F1A5] border-white text-slate-950 font-bold',
    promptFormBg: 'bg-[#012456] border-t border-sky-700/60 text-[#F9F1A5]',
    promptText: 'text-[#F9F1A5]',
    inputPlaceholder: 'placeholder:text-sky-400/50',
  },
};

interface MissionInfo {
  id: number;
  shortLabel: string;
  headerTitle: string;
  location: string;
  objective: string;
  hint: string;
  initialDialog: string;
}

const MISSIONS: MissionInfo[] = [
  {
    id: 1,
    shortLabel: 'M1: Red Local',
    headerTitle: 'Restaurar la red local',
    location: 'Oficina de Soporte',
    objective:
      'Recupera la conectividad con la puerta de enlace 192.168.1.1: diagnostica desde la consola y revisa el medio físico.',
    hint: 'Haz clic primero en el círculo de "Rack de Comunicaciones" para conectar el cable RJ45 suelto (cable_conectado = true). Después escribe en el terminal: ping 192.168.1.1 (también puedes probar ping 127.0.0.1 para verificar el loopback).',
    initialDialog:
      'Este equipo se ha quedado sin red y el LED de enlace de su tarjeta está apagado... ¿Fallo físico o de configuración IP? ¡Vamos a diagnosticarlo desde el terminal!',
  },
  {
    id: 2,
    shortLabel: 'M2: Arranque SO',
    headerTitle: 'El Arranque del Sistema Operativo',
    location: 'Oficina de Soporte',
    objective:
      'Arranca el PC desde un medio de recuperación y repara el código de arranque del disco desde la consola de WinRE.',
    hint: 'Haz clic en el "Cajón / Herramientas" para coger el Pendrive con la ISO. Luego haz clic en "PC del Técnico" y escribe en el terminal: bootrec /fixmbr y después bootrec /fixboot',
    initialDialog:
      '¡El equipo muestra el error crítico "BOOTMGR is missing" y no inicia! Necesito buscar el pendrive con la ISO de rescate en el Cajón de Herramientas e insertarlo en el PC.',
  },
  {
    id: 3,
    shortLabel: 'M3: Despliegue',
    headerTitle: 'Despliegue Silencioso de Antivirus',
    location: 'Oficina de Soporte',
    objective:
      'Lee el ticket, localiza el instalador e instálalo de forma desatendida, sin que aparezca ninguna ventana delante del empleado.',
    hint: 'En el terminal escribe "cd Descargas" (usa Tab para autocompletar rutas según el directorio actual) y ejecuta: antivirus_setup.exe /S. Si olvidas el /S, saltará la ventana gráfica.',
    initialDialog:
      'Acaba de entrar el Ticket #304: hay que instalar el antivirus corporativo en el equipo del nuevo empleado sin interrumpir su trabajo. El instalador ya está descargado en el equipo.',
  },
  {
    id: 4,
    shortLabel: 'M4: Proceso Rebelde',
    headerTitle: 'El Proceso Rebelde (CPU 99%)',
    location: 'Oficina de Soporte',
    objective:
      'Identifica desde la consola qué proceso satura la CPU y termínalo.',
    hint: 'Escribe "tasklist" en el terminal de comandos para ver el consumo de memoria de bucle.exe (PID 4812) y ciérralo con: taskkill /F /IM bucle.exe',
    initialDialog:
      '¡La pantalla tiembla y el sistema sufre un lag terrible! Algún programa colgado se está comiendo el 99% de la CPU. Hay que averiguar cuál desde la consola.',
  },
  {
    id: 5,
    shortLabel: 'M5: Conflicto IP',
    headerTitle: 'Conflicto de Identidad (MF0220_2)',
    location: 'Oficina de Soporte',
    objective:
      'Averigua con quién choca nuestra IP y consigue una concesión DHCP nueva y libre de conflictos.',
    hint: 'En el terminal de comandos escribe primero "ipconfig /release" para liberar la IP actual y luego "ipconfig /renew" para solicitar una nueva concesión DHCP.',
    initialDialog:
      '¡Windows acaba de mostrar una alerta de "Conflicto de dirección IP" en la red! Otro equipo está usando nuestra dirección. Hay que diagnosticarlo y resolverlo desde la consola.',
  },
  {
    id: 6,
    shortLabel: 'M6: Helpdesk',
    headerTitle: 'El Asistente Empático (MF0222_2)',
    location: 'Oficina de Soporte · Helpdesk',
    objective:
      'Atiende al usuario alterado de contabilidad aplicando habilidades blandas (empatía) y guíale a la ruta de Autorrecuperación.',
    hint: 'Busca la respuesta que hace las dos cosas a la vez: calmar al usuario sin culparle y acompañarle a recuperar la copia automática (.asd) de Word desde Archivo > Información > Administrar documento.',
    initialDialog:
      '¡El procesador de textos se ha cerrado y he perdido el informe que llevo haciendo 3 horas! ¡Arréglalo ya!',
  },
];

type HelpdeskChoice = 'aggressive' | 'passive' | 'cold' | 'empathetic';

const HELPDESK_OPTIONS: Record<HelpdeskChoice, string> = {
  aggressive: '"El fallo es de la memoria RAM, que es volátil. Es culpa tuya por no guardar cada cinco minutos."',
  passive: '"Cuando se cierra así no se puede hacer nada, lo siento. Tendrás que repetir el informe desde cero."',
  cold: '"Las copias .asd están en %AppData%\\Microsoft\\Word. Búscalo tú ahí y ábrelo, que tengo más tickets."',
  empathetic:
    '"Tranquilo, entiendo el disgusto. Word guarda copias automáticas cada pocos minutos: vamos a abrirlo juntos y buscarlo en Archivo > Información > Administrar documento."',
};

const shuffleHelpdeskOptions = (): HelpdeskChoice[] => {
  const order: HelpdeskChoice[] = ['aggressive', 'passive', 'cold', 'empathetic'];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'success' | 'error' | 'warning' | 'system';
  text: string;
  replayCommand?: string;
}

interface DnsCacheEntry {
  recordName: string;
  recordType: string;
  ttlSeconds: number;
  dataLength: number;
  section: string;
  ipAddress: string;
  sourceCommand: string;
}

const createInitialDnsCache = (): DnsCacheEntry[] => [
  {
    recordName: 'localhost.cyberacademy.local',
    recordType: '1 (A - Host IPv4)',
    ttlSeconds: 86400,
    dataLength: 4,
    section: 'Respuesta (hosts)',
    ipAddress: '127.0.0.1',
    sourceCommand: 'Sistema (hosts)',
  },
];

interface ArpCacheEntry {
  ipAddress: string;
  macAddress: string;
  type: 'dinámico' | 'estático';
}

const createInitialArpCache = (): ArpCacheEntry[] => [
  {
    ipAddress: '192.168.1.1',
    macAddress: '00-1b-63-84-45-e6',
    type: 'dinámico',
  },
  {
    ipAddress: '192.168.1.2',
    macAddress: '00-24-a5-11-9c-02',
    type: 'dinámico',
  },
  {
    ipAddress: '192.168.1.255',
    macAddress: 'ff-ff-ff-ff-ff-ff',
    type: 'estático',
  },
];

type ActiveSubView =
  | 'none'
  | 'rack'
  | 'drawer'
  | 'ticket'
  | 'theory'
  | 'certificate'
  | 'achievements';

declare global {
  interface Window {
    moverAlice: (destinoX: number, destinoY: number, mirarIzquierda: boolean) => void;
  }
}

/**
 * Ornamento SVG de Filigrana para las esquinas de la Caja de Diálogo estilo Visual Novel
 */
const FiligreeCorner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 36 36"
    className={`w-6 h-6 text-[#3E2212] pointer-events-none select-none ${className}`}
    fill="none"
  >
    <path
      d="M2 34 L2 8 C2 4, 4 2, 8 2 L34 2"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M6 26 L6 10 C6 7, 7 6, 10 6 L26 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="11" cy="11" r="2.5" fill="currentColor" />
    <path
      d="M11 6 C16 6, 18 11, 14 14 C11 16, 6 14, 6 11"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

export default function App() {
  // Máquina de estados global de las 6 misiones
  // Progreso guardado en localStorage (recargar la página no borra la partida)
  const [initialProgress] = useState(loadProgress);
  const [currentMission, setCurrentMission] = useState<number>(initialProgress.currentMission);
  const [completedMissions, setCompletedMissions] = useState<number[]>(initialProgress.completedMissions);
  const [completedQuizzes, setCompletedQuizzes] = useState<number[]>(initialProgress.completedQuizzes);
  const [failedQuizzes, setFailedQuizzes] = useState<number[]>(initialProgress.failedQuizzes);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<number | null>(null);

  // Estados de Logros (Achievements) y seguimiento de pistas/errores
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(initialProgress.unlockedAchievements);
  const [recentAchievementToast, setRecentAchievementToast] = useState<AchievementDef | null>(null);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(initialProgress.hintsUsedCount);
  const [hadGuiErrorInM3, setHadGuiErrorInM3] = useState<boolean>(initialProgress.hadGuiErrorInM3);
  const [hadHelpdeskMistakeInM6, setHadHelpdeskMistakeInM6] = useState<boolean>(initialProgress.hadHelpdeskMistakeInM6);

  // Estados específicos de las misiones y directorio actual del VFS
  const [cableConectado, setCableConectado] = useState<boolean>(initialProgress.cableConectado);
  // El latiguillo suelto es la avería de la Misión 1: en el resto de misiones el enlace está levantado.
  const linkUp = cableConectado || currentMission !== 1;
  const [testingCablePin, setTestingCablePin] = useState<number>(0);
  const [usbRecogido, setUsbRecogido] = useState<boolean>(initialProgress.usbRecogido);
  const [usbInsertado, setUsbInsertado] = useState<boolean>(initialProgress.usbInsertado);
  const [biosUsbPriority, setBiosUsbPriority] = useState<boolean>(initialProgress.biosUsbPriority);
  const [mbrFixed, setMbrFixed] = useState<boolean>(initialProgress.mbrFixed);
  const [bootFixed, setBootFixed] = useState<boolean>(initialProgress.bootFixed);
  const [winReExited, setWinReExited] = useState<boolean>(initialProgress.winReExited);
  const [isSimulatingReboot, setIsSimulatingReboot] = useState<boolean>(false);
  const [rebootOverlayLabel, setRebootOverlayLabel] = useState<string>(
    '[SIMULANDO REINICIO DEL SISTEMA DESDE WINRE (X:\\Sources)] Ejecutando secuencia BIOS/UEFI POST...'
  );
  const [showShutdownScreen, setShowShutdownScreen] = useState<boolean>(false);
  const [currentDir, setCurrentDir] = useState<VirtualDirPath>('C:\\Users\\Tecnico');
  const [antivirusInstalado, setAntivirusInstalado] = useState<boolean>(initialProgress.antivirusInstalado);
  const [guiWarningTriggered, setGuiWarningTriggered] = useState<boolean>(false);
  const [procesoTerminado, setProcesoTerminado] = useState<boolean>(initialProgress.procesoTerminado);
  // bucle.exe es la avería de la Misión 4: solo existe mientras esa misión está sin resolver.
  const bucleActivo = currentMission === 4 && !procesoTerminado;
  const [ipLiberada, setIpLiberada] = useState<boolean>(initialProgress.ipLiberada);
  const [ipRenovada, setIpRenovada] = useState<boolean>(initialProgress.ipRenovada);
  const [dnsCacheEntries, setDnsCacheEntries] = useState<DnsCacheEntry[]>(() =>
    createInitialDnsCache()
  );
  const [arpCacheEntries, setArpCacheEntries] = useState<ArpCacheEntry[]>(() =>
    createInitialArpCache()
  );
  const [helpdeskResuelto, setHelpdeskResuelto] = useState<boolean>(initialProgress.helpdeskResuelto);
  const [helpdeskOptionOrder] = useState<HelpdeskChoice[]>(shuffleHelpdeskOptions);

  const populateDefaultArpResolution = useCallback(() => {
    setArpCacheEntries((prev) => (prev.length > 0 ? prev : createInitialArpCache()));
  }, []);

  const registerDnsCacheEntry = useCallback((newEntries: DnsCacheEntry[]) => {
    setDnsCacheEntries((prev) => {
      const updated = [...prev];
      newEntries.forEach((entry) => {
        const existingIdx = updated.findIndex(
          (e) => e.recordName.toLowerCase() === entry.recordName.toLowerCase()
        );
        if (existingIdx >= 0) {
          updated[existingIdx] = entry;
        } else {
          updated.push(entry);
        }
      });
      return updated;
    });
  }, []);

  // Datos del alumno para el certificado imprimible
  const [studentName, setStudentName] = useState<string>(initialProgress.studentName);

  // Motor de Movimiento CSS Nativo de Alice
  const [alicePos, setAlicePos] = useState<{ x: number; y: number; lookLeft: boolean }>({
    x: 880,
    y: 0,
    lookLeft: false,
  });
  const [isAliceWalking, setIsAliceWalking] = useState<boolean>(false);
  const walkTimeoutRef = useRef<number | null>(null);

  // Estado de la Caja de Diálogo / Narrativa con efecto Typewriter y Modo Fast-Forward
  const [speaker, setSpeaker] = useState<'alice' | 'carlos'>('alice');
  const [aliceExpression, setAliceExpression] = useState<AliceExpression>('normal');
  const [dialogText, setDialogText] = useState<string>(MISSIONS[0].initialDialog);
  const [displayedDialog, setDisplayedDialog] = useState<string>(MISSIONS[0].initialDialog);
  const [fastForwardDialog, setFastForwardDialog] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(DIALOG_FAST_FORWARD_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleFastForwardDialog = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundFX.playClick();
    setDisplayedDialog(dialogText);
    setFastForwardDialog((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(DIALOG_FAST_FORWARD_KEY, String(next));
      } catch {
        // Ignorar
      }
      return next;
    });
  };

  // Ventana Flotante de Terminal de Comandos, Panel de Auditoría y Tema Visual Personalizable
  const [terminalVisible, setTerminalVisible] = useState<boolean>(true);
  const [terminalExpanded, setTerminalExpanded] = useState<boolean>(false);
  const [terminalThemeMenuOpen, setTerminalThemeMenuOpen] = useState<boolean>(false);
  const [terminalAuditOpen, setTerminalAuditOpen] = useState<boolean>(false);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = window.localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignorar errores de localStorage
    }
    return createInitialAuditLog();
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(auditLog.slice(0, 60)));
    } catch {
      // Ignorar errores de localStorage
    }
  }, [auditLog]);

  const recordAuditEvent = useCallback(
    (
      eventId: string,
      category: AuditCategory,
      severity: AuditSeverity,
      action: string,
      details: string,
      missionOverride?: number
    ) => {
      const entry: AuditLogEntry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour12: false }),
        missionId: missionOverride ?? currentMission,
        eventId,
        category,
        severity,
        action,
        details,
      };
      setAuditLog((prev) => [entry, ...prev].slice(0, 60));
    },
    [currentMission]
  );

  const [terminalTheme, setTerminalTheme] = useState<TerminalThemeId>(() => {
    try {
      const saved = window.localStorage.getItem(TERMINAL_THEME_STORAGE_KEY) as TerminalThemeId | null;
      if (saved && saved in TERMINAL_THEMES) {
        return saved;
      }
    } catch {
      // Ignorar
    }
    return 'matrix';
  });
  const activeTerminalTheme = TERMINAL_THEMES[terminalTheme] || TERMINAL_THEMES.matrix;

  const selectTerminalTheme = (themeId: TerminalThemeId) => {
    soundFX.playClick();
    setTerminalTheme(themeId);
    try {
      window.localStorage.setItem(TERMINAL_THEME_STORAGE_KEY, themeId);
    } catch {
      // Ignorar
    }
  };

  const [activeSubView, setActiveSubView] = useState<ActiveSubView>('none');
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'output',
      text: 'Microsoft Windows [Versión 10.0.19045.5131]',
    },
    {
      id: 'init-2',
      type: 'output',
      text: '(c) Microsoft Corporation. Todos los derechos reservados.',
    },
    {
      id: 'init-3',
      type: 'system',
      text: 'Tip: Usa [TAB] para rutas, [Ctrl+P] o [↑/↓] para navegar atrás en el historial, [Ctrl+R] para buscar, "history" para re-ejecutar o "help".',
    },
  ]);
  const [cmdInput, setCmdInput] = useState<string>('');

  // Historial persistente de comandos en localStorage
  const [cmdHistory, setCmdHistory] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(CMD_HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === 'string');
        }
      }
    } catch {
      // Fallback silencioso si localStorage está bloqueado
    }
    return [];
  });
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  // Estado para la búsqueda rápida interactiva en el historial persistente (Ctrl+R / reverse-i-search)
  const [isHistorySearchOpen, setIsHistorySearchOpen] = useState<boolean>(false);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [historySearchSelectedIdx, setHistorySearchSelectedIdx] = useState<number>(0);

  // Estado para el ciclo de autocompletado con tecla Tab
  const [tabCycleSeed, setTabCycleSeed] = useState<string | null>(null);
  const [tabCycleMatches, setTabCycleMatches] = useState<string[]>([]);
  const [tabCycleIndex, setTabCycleIndex] = useState<number>(0);

  // Estados independientes de Audio: Bucle Ambiente de Oficina (Ventiladores + Tecleo) y Efectos SFX
  const [ambientEnabled, setAmbientEnabled] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem(AUDIO_PREFS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.ambientEnabled === 'boolean') return parsed.ambientEnabled;
      }
    } catch {
      // Ignorar errores de lectura
    }
    return true;
  });

  const [ambientVolume, setAmbientVolume] = useState<number>(() => {
    try {
      const saved = window.localStorage.getItem(AUDIO_PREFS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.ambientVolume === 'number') return parsed.ambientVolume;
      }
    } catch {
      // Ignorar
    }
    return 0.45;
  });

  const [soundMuted, setSoundMuted] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem(AUDIO_PREFS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.sfxMuted === 'boolean') return parsed.sfxMuted;
      }
    } catch {
      // Ignorar
    }
    return false;
  });

  const [sfxVolume, setSfxVolume] = useState<number>(() => {
    try {
      const saved = window.localStorage.getItem(AUDIO_PREFS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.sfxVolume === 'number') return parsed.sfxVolume;
      }
    } catch {
      // Ignorar
    }
    return 0.75;
  });

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const terminalInputRef = useRef<HTMLInputElement | null>(null);
  const historySearchInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const sfcScanIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (sfcScanIntervalRef.current) {
        window.clearInterval(sfcScanIntervalRef.current);
      }
    };
  }, []);

  const activeMissionData = MISSIONS.find((m) => m.id === currentMission) || MISSIONS[0];
  const activeTheory = SMR_THEORY_SHEETS[currentMission] || SMR_THEORY_SHEETS[1];

  // Directorio efectivo en el prompt (X:\Sources cuando estamos en modo WinRE de Misión 2 hasta reiniciar con exit)
  const effectiveDir: VirtualDirPath =
    currentMission === 2 && !winReExited ? 'X:\\Sources' : currentDir;

  // Sincronizar historial de comandos con localStorage cada vez que cambie
  useEffect(() => {
    try {
      window.localStorage.setItem(CMD_HISTORY_STORAGE_KEY, JSON.stringify(cmdHistory.slice(0, 100)));
    } catch {
      // Ignorar errores de cuota
    }
  }, [cmdHistory]);

  // Sincronizar volúmenes independientes y estado de carga CPU con el sintetizador Web Audio API
  useEffect(() => {
    soundFX.setSfxMuted(soundMuted);
    soundFX.setSfxVolume(sfxVolume);
    soundFX.setAmbientVolume(ambientVolume);
    try {
      window.localStorage.setItem(
        AUDIO_PREFS_STORAGE_KEY,
        JSON.stringify({
          ambientEnabled,
          ambientVolume,
          sfxMuted: soundMuted,
          sfxVolume,
        })
      );
    } catch {
      // Ignorar
    }
  }, [ambientEnabled, ambientVolume, soundMuted, sfxVolume]);

  useEffect(() => {
    soundFX.setHighCpuLoad(currentMission === 4 && !procesoTerminado);
  }, [currentMission, procesoTerminado]);

  /**
   * Motor de sugerencias contextuales de autocompletado según el directorio actual del sistema de archivos
   */
  const computeContextualCompletions = useCallback(
    (rawInput: string, dirPath: VirtualDirPath): string[] => {
      const entries = VIRTUAL_FILE_SYSTEM[dirPath] || [];
      const trimmedLeft = rawInput.replace(/^\s+/, '');
      const lower = trimmedLeft.toLowerCase();

      // 1A. Autocompletado mejorado para "dir": sugiere rutas de carpetas completas del VFS al presionar [Tab]
      if (lower === 'dir' || lower.startsWith('dir ')) {
        const rawVerb = trimmedLeft.slice(0, 3);
        const cmdVerb = `${rawVerb} `;
        const partialPath =
          lower === 'dir' ? '' : trimmedLeft.slice(trimmedLeft.indexOf(' ') + 1).trim();
        const partialLower = partialPath
          .toLowerCase()
          .replace(/^"|"$/g, '')
          .replace(/^\.\\/, '')
          .replace(/\\$/, '');

        // Rutas completas de carpetas del VFS ordenadas contextualmente para descubrir toda la estructura
        const orderedVfsDirs: VirtualDirPath[] =
          dirPath === 'X:\\Sources'
            ? [
                'X:\\Sources',
                'C:\\Users\\Tecnico',
                'C:\\Users\\Tecnico\\Descargas',
                'C:\\Users\\Tecnico\\Documents',
                'C:\\Users\\Tecnico\\Desktop',
                'C:\\Users\\Tecnico\\Scripts',
              ]
            : [
                'C:\\Users\\Tecnico\\Descargas',
                'C:\\Users\\Tecnico\\Documents',
                'C:\\Users\\Tecnico\\Desktop',
                'C:\\Users\\Tecnico\\Scripts',
                'C:\\Users\\Tecnico',
                'X:\\Sources',
              ];

        const fullDirCandidates = orderedVfsDirs.map((vfsPath) => `${cmdVerb}${vfsPath}`);
        // Añadir el comando base "dir" al final del ciclo para volver fácilmente al directorio actual
        fullDirCandidates.push(rawVerb);

        if (!partialLower) {
          return fullDirCandidates;
        }

        const matchedByPathOrLeaf = orderedVfsDirs
          .filter((vfsPath) => {
            const pathLower = vfsPath.toLowerCase();
            const segments = pathLower.split('\\');
            const leafName = segments[segments.length - 1] || '';
            return (
              pathLower.startsWith(partialLower) ||
              leafName.startsWith(partialLower) ||
              pathLower.includes(partialLower)
            );
          })
          .map((vfsPath) => `${cmdVerb}${vfsPath}`);

        return matchedByPathOrLeaf.length > 0 ? matchedByPathOrLeaf : fullDirCandidates;
      }

      // 1A-bis. Autocompletado para "tree": sugiere "tree", "tree /f" y rutas del VFS
      if (lower === 'tree' || lower.startsWith('tree ')) {
        const treeCandidates = [
          'tree',
          'tree /f',
          'tree C:\\Users\\Tecnico',
          'tree C:\\Users\\Tecnico\\Descargas',
          'tree C:\\Users\\Tecnico\\Documents',
          'tree C:\\Users\\Tecnico\\Desktop',
          'tree C:\\Users\\Tecnico\\Scripts',
          'tree X:\\Sources',
        ];
        if (lower === 'tree' || lower === 'tree ') {
          return treeCandidates;
        }
        const filteredTree = treeCandidates.filter((c) => c.toLowerCase().startsWith(lower));
        return filteredTree.length > 0 ? filteredTree : treeCandidates;
      }

      // 1A-ter. Autocompletado para "nbtstat": sugiere "nbtstat -A <ip>" para nodos de la red local
      if (lower === 'nbtstat' || lower.startsWith('nbtstat ')) {
        const nbtCandidates = [
          'nbtstat -A 192.168.1.50',
          'nbtstat -A 192.168.1.1',
          'nbtstat -A 192.168.1.2',
          'nbtstat -A 192.168.1.105',
          'nbtstat -n',
          'nbtstat -c',
        ];
        if (lower === 'nbtstat' || lower === 'nbtstat ' || lower === 'nbtstat -a' || lower === 'nbtstat -a ') {
          return nbtCandidates;
        }
        const filteredNbt = nbtCandidates.filter((c) => c.toLowerCase().startsWith(lower));
        return filteredNbt.length > 0 ? filteredNbt : nbtCandidates;
      }

      // 1A-quater. Autocompletado para "netsh": sugiere "netsh interface show interface" para diagnóstico de Capa 1
      if (lower === 'netsh' || lower.startsWith('netsh ')) {
        const netshCandidates = [
          'netsh interface show interface',
          'netsh interface ipv4 show interfaces',
          'netsh interface ip show config',
        ];
        if (lower === 'netsh' || lower === 'netsh ') {
          return netshCandidates;
        }
        const filteredNetsh = netshCandidates.filter((c) => c.toLowerCase().startsWith(lower));
        return filteredNetsh.length > 0 ? filteredNetsh : netshCandidates;
      }

      // 1B. Contexto de navegación de directorios: "cd" / "cd "
      if (lower === 'cd' || lower.startsWith('cd ')) {
        const rawVerb = trimmedLeft.slice(0, 2);
        const cmdVerb = `${rawVerb} `;
        const partialPath =
          lower === 'cd' ? '' : trimmedLeft.slice(trimmedLeft.indexOf(' ') + 1).trim();
        const partialLower = partialPath.toLowerCase().replace(/^\.\\/, '').replace(/\\$/, '');

        const dirCandidates = entries
          .filter((e) => e.isDirectory)
          .map((e) => `${cmdVerb}${e.name}`);

        const fullVfsPaths: VirtualDirPath[] = [
          'C:\\Users\\Tecnico\\Descargas',
          'C:\\Users\\Tecnico\\Documents',
          'C:\\Users\\Tecnico\\Desktop',
          'C:\\Users\\Tecnico\\Scripts',
          'C:\\Users\\Tecnico',
        ];
        fullVfsPaths.forEach((p) => {
          const candidate = `${cmdVerb}${p}`;
          if (!dirCandidates.includes(candidate)) {
            dirCandidates.push(candidate);
          }
        });

        if (dirPath !== 'C:\\Users\\Tecnico' && dirPath !== 'X:\\Sources') {
          dirCandidates.unshift(`${cmdVerb}..`);
        }

        if (!partialLower) {
          return dirCandidates;
        }

        const filtered = dirCandidates.filter((c) => {
          const targetPart = c.toLowerCase().slice(cmdVerb.length);
          const leafPart = targetPart.split('\\').pop() || '';
          return targetPart.startsWith(partialLower) || leafPart.startsWith(partialLower);
        });
        return filtered.length > 0 ? filtered : dirCandidates;
      }

      // 2. Contexto de lectura de archivos: "type " o "cat "
      if (lower.startsWith('type ') || lower.startsWith('cat ')) {
        const cmdVerb = trimmedLeft.slice(0, trimmedLeft.indexOf(' ') + 1);
        const partialFile = trimmedLeft.slice(trimmedLeft.indexOf(' ') + 1).trim().toLowerCase();

        const fileCandidates = entries
          .filter((e) => !e.isDirectory)
          .map((e) => `${cmdVerb}${e.name}`);

        // Si está en C:\Users\Tecnico, sugerir también rutas relativas como Descargas\ticket_304.txt
        if (dirPath === 'C:\\Users\\Tecnico') {
          (VIRTUAL_FILE_SYSTEM['C:\\Users\\Tecnico\\Descargas'] || [])
            .filter((e) => !e.isDirectory && !e.isExecutable)
            .forEach((e) => fileCandidates.push(`${cmdVerb}Descargas\\${e.name}`));
        }

        const filtered = fileCandidates.filter((c) =>
          c.toLowerCase().slice(cmdVerb.length).startsWith(partialFile)
        );
        return filtered.length > 0 ? filtered : fileCandidates;
      }

      // 3. Contexto de rutas relativas explícitas: ".\..." o "Descargas\..."
      if (lower.startsWith('.\\') || lower.startsWith('./')) {
        const prefix = trimmedLeft.slice(0, 2);
        const partial = lower.slice(2);
        const localExecs: string[] = [];
        entries.forEach((e) => {
          if (e.isDirectory) {
            localExecs.push(`${prefix}${e.name}\\`);
          } else if (e.recommendedArgs && e.recommendedArgs.length > 0) {
            e.recommendedArgs.forEach((arg) => localExecs.push(`${prefix}${arg}`));
          } else {
            localExecs.push(`${prefix}${e.name}`);
          }
        });
        return localExecs.filter((c) => c.toLowerCase().slice(2).startsWith(partial));
      }

      if (dirPath === 'C:\\Users\\Tecnico' && lower.startsWith('descargas\\')) {
        const subPartial = lower.slice('descargas\\'.length);
        const subEntries = VIRTUAL_FILE_SYSTEM['C:\\Users\\Tecnico\\Descargas'] || [];
        const subCandidates: string[] = [];
        subEntries.forEach((e) => {
          if (e.recommendedArgs && e.recommendedArgs.length > 0) {
            e.recommendedArgs.forEach((arg) => subCandidates.push(`Descargas\\${arg}`));
          } else {
            subCandidates.push(`Descargas\\${e.name}`);
          }
        });
        return subCandidates.filter((c) =>
          c.toLowerCase().slice('descargas\\'.length).startsWith(subPartial)
        );
      }

      // 4. Contexto general en la raíz del prompt: priorizar ejecutables/rutas del directorio actual + comandos SMR
      const contextualPool: string[] = [];

      // Primero añadir los ejecutables y comandos propios del directorio actual
      entries.forEach((e) => {
        if (e.isExecutable) {
          if (e.recommendedArgs && e.recommendedArgs.length > 0) {
            e.recommendedArgs.forEach((cmdWithArgs) => contextualPool.push(cmdWithArgs));
          }
          contextualPool.push(e.name);
        } else if (e.isDirectory) {
          contextualPool.push(`cd ${e.name}`);
        } else {
          contextualPool.push(`type ${e.name}`);
        }
      });

      // Si estamos en C:\Users\Tecnico en la Misión 3, sugerir también la ruta relativa a Descargas\antivirus_setup.exe /S
      if (dirPath === 'C:\\Users\\Tecnico') {
        contextualPool.push('Descargas\\antivirus_setup.exe /?');
      }
      if (dirPath === 'X:\\Sources') {
        contextualPool.push('exit');
      }
      if (dirPath !== 'C:\\Users\\Tecnico' && dirPath !== 'X:\\Sources') {
        contextualPool.push('cd ..');
      }

      // Comandos globales del sistema SMR
      const globalCommands = [
        'ping 192.168.1.1',
        'ping 8.8.8.8',
        'ping 127.0.0.1',
        'bootrec /fixmbr',
        'bootrec /fixboot',
        'bootrec /rebuildbcd',
        'antivirus_setup.exe /?',
        'tasklist',
        'taskkill /?',
        'ipconfig /all',
        'ipconfig /displaydns',
        'ipconfig /release',
        'ipconfig /renew',
        'ipconfig /flushdns',
        'dir',
        'dir C:\\Users\\Tecnico\\Descargas',
        'dir C:\\Users\\Tecnico\\Documents',
        'dir C:\\Users\\Tecnico\\Desktop',
        'dir C:\\Users\\Tecnico\\Scripts',
        'dir C:\\Users\\Tecnico',
        'dir X:\\Sources',
        'tree',
        'tree /f',
        'arp -a',
        'arp -d',
        'tracert 192.168.1.1',
        'tracert 8.8.8.8',
        'nbtstat -A 192.168.1.50',
        'nbtstat -A 192.168.1.1',
        'nbtstat -A 192.168.1.2',
        'netsh interface show interface',
        'netstat -b',
        'netstat -ano',
        'powercfg /energy',
        'sfc /scannow',
        'ver',
        'systeminfo',
        'history',
        'help',
        'cls',
        'exit',
        'shutdown /r',
        'shutdown /s',
      ];

      globalCommands.forEach((g) => {
        if (!contextualPool.some((existing) => existing.toLowerCase() === g.toLowerCase())) {
          contextualPool.push(g);
        }
      });

      if (!lower) {
        return contextualPool.slice(0, 8);
      }

      return contextualPool.filter((item) => item.toLowerCase().startsWith(lower));
    },
    []
  );

  // Sugerencias en vivo para mostrar sobre el prompt mientras el usuario escribe
  const liveTabSuggestions = useMemo(() => {
    return computeContextualCompletions(cmdInput, effectiveDir).slice(0, 5);
  }, [cmdInput, effectiveDir, computeContextualCompletions]);

  // Coincidencias en tiempo real para la búsqueda rápida [Ctrl+R] sobre cmdHistory (con fallback contextual)
  const historySearchMatches = useMemo(() => {
    const q = historySearchQuery.trim().toLowerCase();
    const results: { cmd: string; fromHistory: boolean; historyOrder?: number }[] = [];
    const seen = new Set<string>();

    // 1. Buscar en cmdHistory (primero coincidencias por prefijo, luego por subcadena)
    cmdHistory.forEach((hCmd, idx) => {
      const lower = hCmd.toLowerCase();
      if (!q || lower.startsWith(q)) {
        const key = lower;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({ cmd: hCmd, fromHistory: true, historyOrder: idx + 1 });
        }
      }
    });

    if (q) {
      cmdHistory.forEach((hCmd, idx) => {
        const lower = hCmd.toLowerCase();
        if (!lower.startsWith(q) && lower.includes(q)) {
          const key = lower;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({ cmd: hCmd, fromHistory: true, historyOrder: idx + 1 });
          }
        }
      });
    }

    // 2. Complementar con sugerencias contextuales del directorio actual si hay pocos resultados en cmdHistory
    const contextualFallback = computeContextualCompletions('', effectiveDir);
    contextualFallback.forEach((cCmd) => {
      const lower = cCmd.toLowerCase();
      if (!q || lower.includes(q)) {
        if (!seen.has(lower) && results.length < 8) {
          seen.add(lower);
          results.push({ cmd: cCmd, fromHistory: false });
        }
      }
    });

    return results.slice(0, 8);
  }, [cmdHistory, historySearchQuery, effectiveDir, computeContextualCompletions]);

  const activeHistorySearchMatch =
    historySearchMatches[historySearchSelectedIdx] || historySearchMatches[0] || null;

  // Abrir/Alternar el buscador rápido Ctrl+R
  const openHistorySearch = useCallback(() => {
    soundFX.playClick();
    setIsHistorySearchOpen(true);
    setHistorySearchQuery('');
    setHistorySearchSelectedIdx(0);
    window.setTimeout(() => {
      historySearchInputRef.current?.focus();
    }, 30);
  }, []);

  // Navegación hacia atrás en el historial de comandos (usado por Flecha Arriba y atajo Ctrl+P)
  const navigateHistoryBackward = useCallback(() => {
    if (cmdHistory.length === 0) return;
    soundFX.playClick();
    setHistoryIdx((prevIdx) => {
      const nextIdx = prevIdx < cmdHistory.length - 1 ? prevIdx + 1 : prevIdx;
      setCmdInput(cmdHistory[nextIdx]);
      return nextIdx;
    });
    setTabCycleSeed(null);
  }, [cmdHistory]);

  // Navegación hacia adelante en el historial de comandos (usado por Flecha Abajo y atajo Ctrl+N)
  const navigateHistoryForward = useCallback(() => {
    soundFX.playClick();
    setHistoryIdx((prevIdx) => {
      if (prevIdx > 0) {
        const nextIdx = prevIdx - 1;
        setCmdInput(cmdHistory[nextIdx]);
        return nextIdx;
      }
      if (prevIdx === 0) {
        setCmdInput('');
        return -1;
      }
      return prevIdx;
    });
    setTabCycleSeed(null);
  }, [cmdHistory]);

  // Escucha de teclado global cuando el terminal está visible para capturar Ctrl+R y Ctrl+P sin abrir diálogos del navegador
  useEffect(() => {
    if (!terminalVisible || currentMission === 6) return;
    const onWindowKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (!isHistorySearchOpen) {
          openHistorySearch();
        } else {
          soundFX.playClick();
          setHistorySearchSelectedIdx((prev) =>
            historySearchMatches.length > 0 ? (prev + 1) % historySearchMatches.length : 0
          );
          historySearchInputRef.current?.focus();
        }
        return;
      }

      // Atajo global Ctrl+P cuando el terminal está abierto: navegar hacia atrás en el historial en lugar de imprimir página
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (isHistorySearchOpen) {
          soundFX.playClick();
          if (historySearchMatches.length > 0) {
            const prevIdx =
              (historySearchSelectedIdx - 1 + historySearchMatches.length) %
              historySearchMatches.length;
            setHistorySearchSelectedIdx(prevIdx);
            setCmdInput(historySearchMatches[prevIdx].cmd);
          }
        } else {
          navigateHistoryBackward();
          terminalInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', onWindowKeyDown);
    return () => window.removeEventListener('keydown', onWindowKeyDown);
  }, [
    terminalVisible,
    currentMission,
    isHistorySearchOpen,
    openHistorySearch,
    historySearchMatches,
    historySearchSelectedIdx,
    navigateHistoryBackward,
  ]);

  // Desbloqueador de Logros (Achievements) con notificación emergente
  const unlockAchievement = useCallback((achievementId: string) => {
    setUnlockedAchievements((prev) => {
      if (prev.includes(achievementId)) return prev;
      const found = SMR_ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (found) {
        soundFX.playSuccess();
        setRecentAchievementToast(found);
        if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = window.setTimeout(() => {
          setRecentAchievementToast(null);
        }, 4800);
      }
      return [...prev, achievementId];
    });
  }, []);

  // Guardar el progreso cada vez que cambia
  useEffect(() => {
    saveProgress({
      currentMission,
      completedMissions,
      completedQuizzes,
      failedQuizzes,
      unlockedAchievements,
      hintsUsedCount,
      hadGuiErrorInM3,
      hadHelpdeskMistakeInM6,
      cableConectado,
      usbRecogido,
      usbInsertado,
      biosUsbPriority,
      mbrFixed,
      bootFixed,
      winReExited,
      antivirusInstalado,
      procesoTerminado,
      ipLiberada,
      ipRenovada,
      helpdeskResuelto,
      studentName,
    });
  }, [
    currentMission,
    completedMissions,
    completedQuizzes,
    failedQuizzes,
    unlockedAchievements,
    hintsUsedCount,
    hadGuiErrorInM3,
    hadHelpdeskMistakeInM6,
    cableConectado,
    usbRecogido,
    usbInsertado,
    biosUsbPriority,
    mbrFixed,
    bootFixed,
    winReExited,
    antivirusInstalado,
    procesoTerminado,
    ipLiberada,
    ipRenovada,
    helpdeskResuelto,
    studentName,
  ]);

  // Comprobar condiciones globales de logros ("Expert Debugger" y "Erudito Técnico SMR")
  useEffect(() => {
    if (completedMissions.length === 6 && hintsUsedCount === 0) {
      unlockAchievement('expert_debugger');
    }
    if (completedQuizzes.length === 6) {
      unlockAchievement('smr_scholar');
    }
  }, [completedMissions, completedQuizzes, hintsUsedCount, unlockAchievement]);

  // Efecto Typewriter para los diálogos de la novela visual (se omite si Fast-Forward está activo)
  useEffect(() => {
    if (fastForwardDialog) {
      setDisplayedDialog(dialogText);
      return;
    }

    let idx = 0;
    setDisplayedDialog('');
    const interval = window.setInterval(() => {
      idx += 2;
      if (idx >= dialogText.length) {
        setDisplayedDialog(dialogText);
        window.clearInterval(interval);
      } else {
        setDisplayedDialog(dialogText.slice(0, idx));
      }
    }, 14);
    return () => window.clearInterval(interval);
  }, [dialogText, fastForwardDialog]);

  // Animación del Tester de Cables RJ45 (Pines 1 a 8)
  useEffect(() => {
    if (activeSubView !== 'rack') {
      setTestingCablePin(0);
      return;
    }
    const timer = window.setInterval(() => {
      setTestingCablePin((prev) => (prev >= 8 ? 1 : prev + 1));
    }, 350);
    return () => window.clearInterval(timer);
  }, [activeSubView]);

  // Ajustar posición inicial de Alice a la derecha
  useEffect(() => {
    if (viewportRef.current) {
      const vw = viewportRef.current.clientWidth;
      setAlicePos({ x: Math.max(220, vw - 250), y: 0, lookLeft: false });
    }
  }, []);

  // Auto-scroll del terminal de comandos
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines, terminalVisible]);

  /**
   * Función nativa de navegación del personaje:
   * moverAlice(destinoX, destinoY, mirarIzquierda)
   */
  const moverAlice = useCallback(
    (destinoX: number, destinoY: number, mirarIzquierda: boolean, onArrive?: () => void) => {
      if (walkTimeoutRef.current) {
        window.clearTimeout(walkTimeoutRef.current);
      }

      const vw = viewportRef.current?.clientWidth || 1200;
      const clampedX = Math.max(16, Math.min(destinoX, vw - 210));
      const clampedY = Math.max(0, Math.min(destinoY, 65));

      soundFX.playClick();
      setAlicePos({ x: clampedX, y: clampedY, lookLeft: mirarIzquierda });
      setIsAliceWalking(true);

      walkTimeoutRef.current = window.setTimeout(() => {
        setIsAliceWalking(false);
        if (onArrive) {
          onArrive();
        }
      }, 1500);
    },
    []
  );

  useEffect(() => {
    window.moverAlice = (destinoX: number, destinoY: number, mirarIzquierda: boolean) => {
      moverAlice(destinoX, destinoY, mirarIzquierda);
    };
  }, [moverAlice]);

  const markMissionComplete = (missionNum: number) => {
    soundFX.playSuccess();
    setAliceExpression('celebrating');
    setCompletedMissions((prev) => (prev.includes(missionNum) ? prev : [...prev, missionNum]));

    if (missionNum === 1) unlockAchievement('osi_layer1_master');
    if (missionNum === 2) unlockAchievement('boot_surgeon');
    if (missionNum === 3 && !hadGuiErrorInM3) unlockAchievement('stealth_deployer');
    if (missionNum === 4) unlockAchievement('process_hunter');
    if (missionNum === 5) unlockAchievement('dhcp_architect');
    if (missionNum === 6 && !hadHelpdeskMistakeInM6) unlockAchievement('empathy_champion');
  };

  // Solicitar una pista a Alice
  const requestHint = () => {
    soundFX.playClick();
    if (!completedMissions.includes(currentMission)) {
      setHintsUsedCount((prev) => prev + 1);
    }
    setSpeaker('alice');
    setAliceExpression('thinking');
    setDialogText(`[PISTA TÉCNICA] ${activeMissionData.hint}`);
  };

  const calculateGrade = (): string => computeGrade(completedMissions, completedQuizzes);

  const selectMission = (missionId: number) => {
    soundFX.playClick();
    applyMissionIntro(missionId);
  };

  // Coloca la escena, el diálogo y el terminal al entrar en una misión
  const applyMissionIntro = (missionId: number) => {
    setCurrentMission(missionId);
    setActiveSubView('none');
    setQuizSelectedAnswer(null);
    setGuiWarningTriggered(false);
    setTabCycleSeed(null);

    const targetMission = MISSIONS.find((m) => m.id === missionId);
    if (targetMission) {
      if (missionId === 6 && !helpdeskResuelto) {
        setSpeaker('carlos');
        setAliceExpression('worried');
        setDialogText(targetMission.initialDialog);
        setTerminalVisible(false);
      } else {
        setSpeaker('alice');
        setAliceExpression(missionId === 4 && !procesoTerminado ? 'worried' : 'normal');
        setDialogText(targetMission.initialDialog);
        setTerminalVisible(true);
      }
    }
  };

  // Si se recarga a mitad de partida, retomar la misión guardada con su escena
  useEffect(() => {
    if (initialProgress.currentMission !== 1) applyMissionIntro(initialProgress.currentMission);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAllProgress = () => {
    soundFX.playClick();
    clearProgress();
    setCmdHistory([]);
    setHistoryIdx(-1);
    try {
      window.localStorage.removeItem(CMD_HISTORY_STORAGE_KEY);
    } catch {
      // Ignorar
    }
    setStudentName('');
    setCompletedMissions([]);
    setCompletedQuizzes([]);
    setFailedQuizzes([]);
    setUnlockedAchievements([]);
    setRecentAchievementToast(null);
    setHintsUsedCount(0);
    setHadGuiErrorInM3(false);
    setHadHelpdeskMistakeInM6(false);
    setQuizSelectedAnswer(null);
    setCableConectado(false);
    setUsbRecogido(false);
    setUsbInsertado(false);
    setBiosUsbPriority(false);
    setMbrFixed(false);
    setBootFixed(false);
    setWinReExited(false);
    setIsSimulatingReboot(false);
    setShowShutdownScreen(false);
    setCurrentDir('C:\\Users\\Tecnico');
    setAntivirusInstalado(false);
    setGuiWarningTriggered(false);
    setProcesoTerminado(false);
    setIpLiberada(false);
    setIpRenovada(false);
    setDnsCacheEntries(createInitialDnsCache());
    setArpCacheEntries(createInitialArpCache());
    setHelpdeskResuelto(false);
    setActiveSubView('none');
    setShowResetConfirmModal(false);
    setTerminalAuditOpen(false);
    setAuditLog(createInitialAuditLog());
    setTerminalVisible(true);
    setCurrentMission(1);
    setSpeaker('alice');
    setAliceExpression('normal');
    setDialogText(MISSIONS[0].initialDialog);
    setTerminalLines([
      {
        id: String(Date.now()),
        type: 'output',
        text: 'Microsoft Windows [Versión 10.0.19045.5131]',
      },
      {
        id: String(Date.now() + 1),
        type: 'output',
        text: '(c) Microsoft Corporation. Todos los derechos reservados.',
      },
    ]);
  };

  // Limpiar el historial persistente de localStorage
  const clearPersistentHistory = () => {
    soundFX.playClick();
    setCmdHistory([]);
    setHistoryIdx(-1);
    try {
      window.localStorage.removeItem(CMD_HISTORY_STORAGE_KEY);
    } catch {
      // Ignorar
    }
    appendLines([
      {
        type: 'system',
        text: '[localStorage] Historial persistente de comandos eliminado correctamente.',
      },
    ]);
  };

  // =========================================================================
  // GATILLOS DE MOVIMIENTO DE LOS 3 HOTSPOTS
  // =========================================================================

  const handleHotspotPC = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vw = viewportRef.current?.clientWidth || 1200;
    const targetX = Math.round(vw * 0.22);
    const lookLeft = targetX < alicePos.x;

    setSpeaker('alice');
    setAliceExpression('thinking');
    setDialogText('Caminando hacia el PC del Técnico para operar desde el terminal...');

    moverAlice(targetX, 0, lookLeft, () => {
      setShowShutdownScreen(false);
      setTerminalVisible(true);
      if (currentMission === 2 && !bootFixed) {
        if (usbRecogido && !usbInsertado) {
          setUsbInsertado(true);
          setBiosUsbPriority(true);
          soundFX.playCableSnap();
          recordAuditEvent(
            'EVT-2002',
            'BOOT',
            'INFO',
            'Pendrive USB ISO insertado y prioridad BIOS configurada',
            'usb_insertado = true | bios_usb_priority = true -> Entorno WinRE montado en X:\\Sources.'
          );
          setAliceExpression('happy');
          setDialogText(
            '¡He insertado el Pendrive USB con la ISO de rescate y configurado el arranque USB en BIOS! Ya estamos en la consola de WinRE (X:\\Sources): toca reparar el arranque del disco con la herramienta de recuperación.'
          );
        } else if (!usbRecogido) {
          setAliceExpression('worried');
          setDialogText(
            'La pantalla del PC muestra "BOOTMGR is missing". Antes de usar el terminal de rescate, haz clic en el Cajón de Herramientas para recoger el Pendrive USB con la ISO.'
          );
        }
      } else if (currentMission === 3 && !antivirusInstalado) {
        setActiveSubView('ticket');
        setDialogText(
          'He abierto el Ticket de Soporte #304. El instalador admite parámetros de línea de comandos: averigua cuál lo hace silencioso antes de lanzarlo.'
        );
      } else {
        setAliceExpression('normal');
        setDialogText(activeMissionData.objective);
      }
      setTimeout(() => terminalInputRef.current?.focus(), 80);
    });
  };

  const handleHotspotRack = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vw = viewportRef.current?.clientWidth || 1200;
    const targetX = Math.round(vw * 0.62);
    const lookLeft = targetX < alicePos.x;

    setSpeaker('alice');
    setAliceExpression('thinking');
    setDialogText('Acercándome al Rack de Comunicaciones para inspeccionar el cableado de red...');

    moverAlice(targetX, 0, lookLeft, () => {
      setActiveSubView('rack');
      if (!linkUp) {
        setAliceExpression('worried');
        setDialogText(
          '¡Lo encontré! En el armario del Rack de Comunicaciones hay un cable de red RJ45 amarillo suelto. Puedes verificar los 8 hilos EIA/TIA-568B y hacer clic para conectarlo.'
        );
      } else {
        setAliceExpression('happy');
        setDialogText(
          'Todos los cables de parcheo del Rack de Comunicaciones están conectados (`cable_conectado = true`) y los 8 hilos pasan el test de continuidad.'
        );
      }
    });
  };

  const handleHotspotDrawer = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vw = viewportRef.current?.clientWidth || 1200;
    const targetX = Math.round(vw * 0.34);
    const lookLeft = targetX < alicePos.x;

    setSpeaker('alice');
    setAliceExpression('thinking');
    setDialogText('Desplazándome hacia el Cajón de Herramientas del escritorio...');

    moverAlice(targetX, 0, lookLeft, () => {
      setActiveSubView('drawer');
      if (!usbRecogido) {
        setDialogText(
          '¡Aquí está! En el Cajón de Herramientas tenemos el Pendrive USB con la ISO de recuperación del Sistema Operativo. Haz clic para recogerlo.'
        );
      } else {
        setDialogText(
          'Ya tienes el Pendrive USB con la ISO en tu inventario. Haz clic en el PC del Técnico para insertarlo.'
        );
      }
    });
  };

  const handleConnectCable = () => {
    if (linkUp) return;
    soundFX.playCableSnap();
    setCableConectado(true);
    recordAuditEvent(
      'EVT-1001',
      'HARDWARE',
      'SUCCESS',
      'Cambio de estado en Rack 42U: Latiguillo RJ45 conectado',
      'cable_conectado: false -> true (Puerto Gi0/1 Switch Patch Panel · Norma EIA/TIA-568B 1000BASE-T).'
    );
    setSpeaker('alice');
    setAliceExpression('happy');
    setDialogText(
      '¡Cable RJ45 conectado al Switch del Rack (cable_conectado = true)! Ahora vuelve a la consola y comprueba que llegamos a la puerta de enlace.'
    );
  };

  const handlePickUpUsb = () => {
    if (usbRecogido) return;
    soundFX.playCableSnap();
    setUsbRecogido(true);
    recordAuditEvent(
      'EVT-2001',
      'HARDWARE',
      'INFO',
      'Inventario de Hardware: Pendrive USB ISO recogido',
      'usb_recogido: false -> true (Imagen ISO de recuperación Windows 10 Pro lista para inserción).'
    );
    setSpeaker('alice');
    setAliceExpression('happy');
    setDialogText(
      '¡Has guardado el Pendrive USB con la ISO en tu inventario! Ahora haz clic en "PC del Técnico" para insertarlo y ejecutar bootrec.'
    );
  };

  // =========================================================================
  // INTÉRPRETE DE COMANDOS DEL TERMINAL SIMULADO (CON VFS Y LOCALSTORAGE)
  // =========================================================================

  const appendLines = (newLines: Omit<TerminalLine, 'id'>[]) => {
    setTerminalLines((prev) => [
      ...prev,
      ...newLines.map((l, idx) => ({ ...l, id: `${Date.now()}-${idx}-${Math.random()}` })),
    ]);
  };

  const executeTerminalCommand = (rawCommand: string) => {
    const trimmed = rawCommand.trim();
    if (!trimmed) return;

    const promptPrefix = `${effectiveDir}>`;

    const cmdLower = trimmed.toLowerCase().replace(/\s+/g, ' ');

    // ATAJOS DE RE-EJECUCIÓN DE HISTORIAL: "!!", "!<n>", "history <n>" o "history run <n>"
    const bangMatch = trimmed.match(/^!(\d+|!)$/);
    const historyRunMatch = cmdLower.match(/^history\s+(?:run\s+|exec\s+|r\s+)?(\d+)$/);

    if (bangMatch || historyRunMatch) {
      appendLines([{ type: 'input', text: `${promptPrefix}${trimmed}` }]);
      setHistoryIdx(-1);
      setCmdInput('');
      setTabCycleSeed(null);
      setTabCycleMatches([]);

      const chronologicalHistory = [...cmdHistory].slice(0, 25).reverse();

      if (chronologicalHistory.length === 0) {
        soundFX.playError();
        appendLines([
          {
            type: 'error',
            text: 'El historial de comandos está vacío. Ejecuta algún comando primero.',
          },
        ]);
        return;
      }

      let targetCmd: string | undefined;
      let displayIndexLabel = '';

      if (bangMatch && bangMatch[1] === '!') {
        targetCmd = chronologicalHistory[chronologicalHistory.length - 1];
        displayIndexLabel = `#${chronologicalHistory.length} (último comando)`;
      } else {
        const rawIndex = Number(bangMatch ? bangMatch[1] : historyRunMatch?.[1]);
        if (rawIndex >= 1 && rawIndex <= chronologicalHistory.length) {
          targetCmd = chronologicalHistory[rawIndex - 1];
          displayIndexLabel = `#${String(rawIndex).padStart(2, '0')}`;
        } else {
          soundFX.playError();
          appendLines([
            {
              type: 'error',
              text: `No existe ningún comando con el índice #${rawIndex} en el historial (rango disponible: 1 a ${chronologicalHistory.length}). Escribe "history" para ver la lista numerada.`,
            },
          ]);
          return;
        }
      }

      if (targetCmd) {
        soundFX.playClick();
        appendLines([
          {
            type: 'system',
            text: `[Historial ${displayIndexLabel}] Re-ejecutando comando antiguo: "${targetCmd}"`,
          },
        ]);
        executeTerminalCommand(targetCmd);
      }
      return;
    }

    appendLines([{ type: 'input', text: `${promptPrefix}${trimmed}` }]);

    // Guardar en historial persistente (evitando duplicar si es idéntico al último comando o si es consulta de history)
    const isHistoryMetaCmd =
      cmdLower === 'history' ||
      cmdLower === 'doskey /history' ||
      cmdLower.startsWith('history /') ||
      cmdLower.startsWith('history -');

    if (!isHistoryMetaCmd) {
      setCmdHistory((prev) => {
        const next = prev[0] === trimmed ? prev : [trimmed, ...prev];
        return next.slice(0, 100);
      });
    }
    setHistoryIdx(-1);
    setCmdInput('');
    setTabCycleSeed(null);
    setTabCycleMatches([]);

    if (cmdLower === 'cls' || cmdLower === 'clear') {
      if (sfcScanIntervalRef.current) {
        window.clearInterval(sfcScanIntervalRef.current);
        sfcScanIntervalRef.current = null;
      }
      setTerminalLines([]);
      return;
    }

    // COMANDO HISTORY MEJORADO / DOSKEY /HISTORY (LISTAR, FILTRAR Y EJECUTAR COMANDOS ANTIGUOS)
    if (cmdLower === 'history /clear' || cmdLower === 'history -c') {
      clearPersistentHistory();
      return;
    }

    if (
      cmdLower === 'history' ||
      cmdLower === 'doskey /history' ||
      cmdLower.startsWith('history ')
    ) {
      const historyArg =
        cmdLower === 'history' || cmdLower === 'doskey /history'
          ? ''
          : trimmed.slice(7).trim();

      if (historyArg === '/?' || historyArg === '--help' || historyArg === '-h') {
        appendLines([
          {
            type: 'system',
            text: '=== GESTOR AVANZADO DE HISTORIAL DE COMANDOS (HISTORY) ===',
          },
          {
            type: 'output',
            text: '  history                  Lista los comandos antiguos numerados con botones para re-ejecutarlos.',
          },
          {
            type: 'output',
            text: '  history <n>  | !<n>      Ejecuta inmediatamente el comando antiguo número <n> (ej. "history 1" o "!1").',
          },
          {
            type: 'output',
            text: '  !!                       Repite el último comando ejecutado en el terminal.',
          },
          {
            type: 'output',
            text: '  history <texto>          Filtra el historial buscando comandos que contengan <texto>.',
          },
          {
            type: 'output',
            text: '  history /clear           Borra el historial persistente almacenado en localStorage.',
          },
          {
            type: 'warning',
            text: '  Atajo de teclado: Presiona [Ctrl + P] para navegar hacia atrás en el historial sin usar las flechas.',
          },
        ]);
        return;
      }

      const chronologicalHistory = [...cmdHistory].slice(0, 25).reverse();

      if (chronologicalHistory.length === 0) {
        appendLines([
          {
            type: 'system',
            text: 'El historial persistente de comandos está vacío. Ejecuta comandos y usa [Ctrl+P] o "history" para reutilizarlos.',
          },
        ]);
        return;
      }

      const filterQuery = historyArg.replace(/^\/search\s+/i, '').trim().toLowerCase();
      const indexedEntries = chronologicalHistory
        .map((hCmd, idx) => ({ index: idx + 1, cmd: hCmd }))
        .filter((item) => !filterQuery || item.cmd.toLowerCase().includes(filterQuery));

      if (indexedEntries.length === 0) {
        appendLines([
          {
            type: 'warning',
            text: `No se encontraron comandos antiguos en el historial que coincidan con "${historyArg}".`,
          },
        ]);
        return;
      }

      appendLines([
        {
          type: 'system',
          text: filterQuery
            ? `=== HISTORIAL FILTRADO POR "${historyArg}" (${indexedEntries.length} coincidencias) ===`
            : `=== HISTORIAL PERSISTENTE DE COMANDOS (${chronologicalHistory.length} comandos) ===`,
        },
        ...indexedEntries.map((item) => ({
          type: 'output' as const,
          text: `  #${String(item.index).padStart(2, '0')}  ${item.cmd}`,
          replayCommand: item.cmd,
        })),
        {
          type: 'system',
          text: '▶ Ejecución rápida: escribe "history <n>" o "!<n>" (ej. "history 1" / "!1"), "!!" (último), o haz clic en [▶ Ejecutar] junto a cada línea.',
        },
        {
          type: 'warning',
          text: '⌨️ Navegación sin flechas: presiona [Ctrl + P] para retroceder a comandos anteriores ([Ctrl + N] para avanzar).',
        },
      ]);
      return;
    }

    if (cmdLower === 'help') {
      appendLines([
        { type: 'system', text: '=== MANUAL DE COMANDOS Y ATAJOS AVANZADOS DE CONSOLA SMR ===' },
        { type: 'warning', text: '[ATAJOS DE TECLADO AVANZADOS]' },
        { type: 'output', text: '  [TAB]                      Autocompleta en bucle rutas/archivos del directorio actual' },
        { type: 'output', text: '  [Ctrl + P] / [Ctrl + N]    Navega hacia atrás (Ctrl+P) o adelante (Ctrl+N) en el historial sin flechas' },
        { type: 'output', text: '  [Ctrl + R]                 Búsqueda rápida interactiva en el historial (reverse-i-search)' },
        { type: 'output', text: '  [Ctrl + L]                 Limpia la pantalla del terminal al instante (igual que cls)' },
        { type: 'output', text: '  [Ctrl + C]                 Cancela el comando o ejecución actual e imprime ^C (SIGINT)' },
        { type: 'output', text: '  [Ctrl + U] / [Esc]         Borra toda la línea de entrada actual rápidamente' },
        { type: 'output', text: '  [Flechas ↑ / ↓]            Navega por el historial persistente en localStorage' },
        { type: 'warning', text: '[COMANDOS DEL SISTEMA Y MISIONES SMR]' },
        { type: 'output', text: '  history | history <n> | !<n> Lista, filtra o re-ejecuta comandos antiguos por su número' },
        { type: 'output', text: '  audit | eventvwr           Abre el Panel Flotante de Auditoría del Sistema Virtual' },
        { type: 'output', text: '  theme <matrix|win95|contrast|powershell> | color 0a/07/0e/1f  Cambia el tema visual' },
        { type: 'output', text: '  dir | cd <carpeta> | type  Explora directorios y lee archivos del VFS' },
        { type: 'output', text: '  tree | tree /f             Visualiza el árbol jerárquico de carpetas y archivos del VFS' },
        { type: 'output', text: '  ping 192.168.1.1 | 8.8.8.8 Verifica conectividad con el router LAN o Google DNS (8.8.8.8)' },
        { type: 'output', text: '  bootrec /?                 Herramienta de reparación del arranque (solo en WinRE, X:\\Sources)' },
        { type: 'output', text: '  <instalador>.exe /?        Muestra los modificadores que admite un instalador' },
        { type: 'output', text: '  tasklist | taskkill        Lista los procesos / termina uno (taskkill /? para la sintaxis)' },
        { type: 'output', text: '  netstat -b | netstat -ano  Lista conexiones activas y el ejecutable que abrió cada puerto' },
        { type: 'output', text: '  powercfg /energy           Genera informe de eficiencia energética y diagnostica lag de CPU' },
        { type: 'output', text: '  sfc /scannow               Verifica la integridad de archivos del sistema Windows (WinSxS)' },
        { type: 'output', text: '  ipconfig /all | /displaydns | /release | /renew  Configuración IP, caché DNS y concesión DHCP' },
        { type: 'output', text: '  arp -a | arp -d            Muestra o purga la tabla de caché ARP (IP <-> MAC)' },
        { type: 'output', text: '  tracert <ip>               Traza los saltos de enrutamiento hacia una IP (ej. 8.8.8.8)' },
        { type: 'output', text: '  nbtstat -A <ip>            Muestra la tabla de nombres NetBIOS remotos y compartición SMB' },
        { type: 'output', text: '  netsh interface show interface  Estado administrativo y físico (Capa 1) de adaptadores' },
        { type: 'output', text: '  ver | systeminfo           Muestra la versión del SO y arquitectura de compilación (x64)' },
        { type: 'output', text: '  shutdown /r | shutdown /s  Reinicia el sistema virtual (/r) o apaga y minimiza (/s)' },
        { type: 'output', text: '  exit                       Reinicia el sistema si estás en WinRE (X:\\Sources) o minimiza el terminal' },
      ]);
      return;
    }

    // COMANDOS SHUTDOWN /R (REINICIO COMPLETO DEL SISTEMA VIRTUAL) Y SHUTDOWN /S (PANTALLA DE APAGADO + MINIMIZAR TERMINAL)
    if (cmdLower.startsWith('shutdown')) {
      const isRestartFlag =
        cmdLower === 'shutdown /r' ||
        cmdLower === 'shutdown -r' ||
        cmdLower.startsWith('shutdown /r ') ||
        cmdLower.startsWith('shutdown -r ');
      const isShutdownFlag =
        cmdLower === 'shutdown /s' ||
        cmdLower === 'shutdown -s' ||
        cmdLower.startsWith('shutdown /s ') ||
        cmdLower.startsWith('shutdown -s ');

      if (isRestartFlag) {
        soundFX.playCableSnap();
        setShowShutdownScreen(false);
        setRebootOverlayLabel(
          `[SHUTDOWN /R · REINICIO COMPLETO DEL SISTEMA VIRTUAL (${effectiveDir})] Ejecutando secuencia BIOS/UEFI POST...`
        );
        setIsSimulatingReboot(true);
        window.setTimeout(() => {
          setIsSimulatingReboot(false);
        }, 1500);

        const wasInWinRE = effectiveDir === 'X:\\Sources';
        if (wasInWinRE && mbrFixed && bootFixed) {
          setWinReExited(true);
          setCurrentDir('C:\\Users\\Tecnico');
        } else if (!wasInWinRE) {
          setCurrentDir('C:\\Users\\Tecnico');
        }

        recordAuditEvent(
          'EVT-9010',
          'SISTEMA',
          'INFO',
          'Reinicio completo del sistema virtual (shutdown /r)',
          `Ejecutado shutdown /r desde ${effectiveDir} -> Cierre de servicios ACPI -> BIOS/UEFI POST -> Sistema virtual reiniciado.`
        );

        appendLines([
          {
            type: 'system',
            text: `[shutdown /r] Iniciando reinicio completo del sistema virtual desde ${effectiveDir}...`,
          },
          {
            type: 'output',
            text: '[Service Control Manager] Deteniendo servicios del sistema y desmontando volúmenes NTFS...',
          },
          {
            type: 'output',
            text: '[BIOS/UEFI POST] Memoria física 16384 MB OK · Controladora SATA/NVMe inicializada.',
          },
          wasInWinRE && (!mbrFixed || !bootFixed)
            ? {
                type: 'warning',
                text: '[WinRE X:\\Sources] Sector de arranque aún pendiente (bootrec /fixmbr y /fixboot). Sistema reiniciado en entorno WinRE.',
              }
            : {
                type: 'success',
                text: 'Microsoft Windows [Versión 10.0.19045.5131] — Reinicio completo del sistema virtual finalizado en C:\\Users\\Tecnico.',
              },
        ]);

        setSpeaker('alice');
        setAliceExpression('happy');
        setDialogText(
          '¡Reinicio completo ejecutado con "shutdown /r"! El sistema virtual ha cerrado todos los servicios, ejecutado el test POST de la BIOS y reiniciado la sesión sin importar el modo actual.'
        );
        return;
      }

      if (isShutdownFlag) {
        soundFX.playClick();
        recordAuditEvent(
          'EVT-9020',
          'SISTEMA',
          'WARNING',
          'Apagado del sistema virtual (shutdown /s)',
          `Ejecutado shutdown /s desde ${effectiveDir} -> Pantalla de apagado ACPI S5 (Soft Off) activada y terminal minimizado.`
        );

        appendLines([
          {
            type: 'warning',
            text: '[shutdown /s] Cerrando sesión activa y deteniendo servicios de Windows...',
          },
          {
            type: 'system',
            text: '[ACPI S5 Soft Off] Mostrando pantalla de apagado del sistema y minimizando el terminal.',
          },
        ]);

        setTerminalAuditOpen(false);
        setTerminalVisible(false);
        setShowShutdownScreen(true);

        setSpeaker('alice');
        setAliceExpression('thinking');
        setDialogText(
          'Has ejecutado "shutdown /s": se muestra la pantalla de apagado del equipo y se ha minimizado el terminal. Haz clic en "Encender Equipo (Power ON)" o en el "PC del Técnico" para volver a iniciarlo.'
        );
        return;
      }

      appendLines([
        { type: 'system', text: 'Uso del comando de energía de Windows (shutdown.exe):' },
        {
          type: 'output',
          text: '  shutdown /r    Simula un reinicio completo del sistema virtual sin importar el modo actual.',
        },
        {
          type: 'output',
          text: '  shutdown /s    Muestra la pantalla de apagado del sistema y minimiza el terminal.',
        },
      ]);
      return;
    }

    // COMANDO EXIT: SIMULAR REINICIO DEL SISTEMA EN WINRE (X:\Sources) O MINIMIZAR TERMINAL EN MODO ESTÁNDAR
    if (cmdLower === 'exit' || cmdLower === 'exit /b') {
      if (effectiveDir === 'X:\\Sources') {
        soundFX.playCableSnap();
        setRebootOverlayLabel(
          '[SIMULANDO REINICIO DEL SISTEMA DESDE WINRE (X:\\Sources)] Ejecutando secuencia BIOS/UEFI POST...'
        );
        setIsSimulatingReboot(true);
        window.setTimeout(() => {
          setIsSimulatingReboot(false);
        }, 1200);

        if (mbrFixed && bootFixed) {
          setWinReExited(true);
          setCurrentDir('C:\\Users\\Tecnico');
          recordAuditEvent(
            'EVT-2020',
            'BOOT',
            'SUCCESS',
            'Reinicio del sistema desde WinRE completado (exit)',
            'Cerrado X:\\Sources\\cmd.exe -> POST BIOS superado -> Cargador BOOTMGR inició Windows 10 en C:\\Users\\Tecnico.'
          );
          appendLines([
            {
              type: 'system',
              text: '[WinRE X:\\Sources] Cerrando entorno de recuperación y reiniciando el sistema (wpeutil reboot)...',
            },
            {
              type: 'output',
              text: '[BIOS/UEFI POST] Verificando Sector 0 (MBR) y sector de arranque de partición... OK.',
            },
            {
              type: 'success',
              text: '[Windows Boot Manager] BOOTMGR verificado. Iniciando Microsoft Windows 10 Pro en C:\\Users\\Tecnico...',
            },
          ]);
          setSpeaker('alice');
          setAliceExpression('happy');
          setDialogText(
            '¡Reinicio completado con éxito! Al escribir "exit" en WinRE (X:\\Sources), el equipo se ha reiniciado y Windows ha arrancado normalmente en C:\\Users\\Tecnico.'
          );
        } else {
          recordAuditEvent(
            'EVT-2021',
            'BOOT',
            'WARNING',
            'Reinicio desde WinRE con arranque incompleto (exit)',
            `Reinicio ejecutado desde X:\\Sources con MBR=${mbrFixed ? 'OK' : 'PENDIENTE'} y BOOT=${
              bootFixed ? 'OK' : 'PENDIENTE'
            }. El sistema volvió a WinRE.`
          );
          appendLines([
            {
              type: 'system',
              text: '[WinRE X:\\Sources] Cerrando consola de rescate y reiniciando el sistema...',
            },
            {
              type: 'error',
              text: '[BIOS/UEFI POST] Error en disco duro: BOOTMGR is missing (Falta completar bootrec /fixmbr y /fixboot).',
            },
            {
              type: 'warning',
              text: '[WinRE X:\\Sources] Reiniciando de nuevo desde el Pendrive USB ISO en X:\\Sources...',
            },
          ]);
          setSpeaker('alice');
          setAliceExpression('worried');
          setDialogText(
            'El PC se ha reiniciado al ejecutar "exit", pero como aún falta completar bootrec /fixmbr y bootrec /fixboot, ha vuelto a entrar en el entorno WinRE (X:\\Sources).'
          );
        }
      } else {
        soundFX.playClick();
        appendLines([
          {
            type: 'system',
            text: '[Sistema] Cerrando sesión interactiva y minimizando la ventana del terminal (exit)...',
          },
        ]);
        setSpeaker('alice');
        setAliceExpression('normal');
        setDialogText(
          'Has minimizado la ventana del terminal con el comando "exit". Haz clic en "PC del Técnico" cuando quieras volver a abrirla.'
        );
        setTerminalVisible(false);
      }
      return;
    }

    // COMANDO AUDIT / EVENTVWR (PANEL FLOTANTE DE AUDITORÍA DEL SISTEMA VIRTUAL)
    if (cmdLower === 'audit' || cmdLower === 'eventvwr' || cmdLower === 'auditoria') {
      setTerminalAuditOpen((prev) => !prev);
      appendLines([
        {
          type: 'system',
          text: `[Visor de Auditoría SMR] Panel flotante de auditoría ${
            !terminalAuditOpen ? 'abierto' : 'cerrado'
          } (${auditLog.length} eventos críticos registrados).`,
        },
      ]);
      return;
    }

    // CAMBIO DE TEMA VISUAL DESDE CONSOLA (THEME / COLOR)
    if (cmdLower.startsWith('theme') || cmdLower.startsWith('color')) {
      const arg = cmdLower.split(' ')[1] || '';
      if (arg === 'matrix' || arg === '0a') {
        selectTerminalTheme('matrix');
        appendLines([{ type: 'success', text: 'Tema visual cambiado a: Matrix Green (color 0a).' }]);
      } else if (arg === 'win95' || arg === '95' || arg === '07') {
        selectTerminalTheme('win95');
        appendLines([{ type: 'success', text: 'Tema visual cambiado a: Classic Windows 95 (MS-DOS Prompt).' }]);
      } else if (arg === 'contrast' || arg === 'high-contrast' || arg === '0e') {
        selectTerminalTheme('high-contrast');
        appendLines([{ type: 'success', text: 'Tema visual cambiado a: High Contrast (Alto Contraste Accesible).' }]);
      } else if (arg === 'powershell' || arg === 'ps' || arg === '1f') {
        selectTerminalTheme('powershell');
        appendLines([{ type: 'success', text: 'Tema visual cambiado a: PowerShell Blue (color 1f).' }]);
      } else {
        setTerminalThemeMenuOpen(true);
        appendLines([
          {
            type: 'system',
            text: 'Temas disponibles: "theme matrix" (color 0a), "theme win95" (color 07), "theme contrast" (color 0e), "theme powershell" (color 1f).',
          },
        ]);
      }
      return;
    }

    // EXPLORACIÓN DEL SISTEMA DE ARCHIVOS VIRTUAL (DIR / LS CON SOPORTE DE RUTAS COMPLETAS DEL VFS)
    if (
      cmdLower === 'dir' ||
      cmdLower === 'ls' ||
      cmdLower.startsWith('dir ') ||
      cmdLower.startsWith('ls ')
    ) {
      const rawArg =
        cmdLower === 'dir' || cmdLower === 'ls'
          ? ''
          : trimmed
              .slice(trimmed.indexOf(' ') + 1)
              .trim()
              .replace(/^"|"$/g, '')
              .replace(/\s*\/[a-z]+\b/gi, '')
              .trim()
              .replace(/\\$/, '');

      const argLower = rawArg.toLowerCase().replace(/^\.\\/, '');

      const vfsPathMap: Record<string, VirtualDirPath> = {
        '': effectiveDir,
        '.': effectiveDir,
        '..': effectiveDir === 'X:\\Sources' ? 'X:\\Sources' : 'C:\\Users\\Tecnico',
        '\\': effectiveDir === 'X:\\Sources' ? 'X:\\Sources' : 'C:\\Users\\Tecnico',
        'c:': 'C:\\Users\\Tecnico',
        'c:\\users\\tecnico': 'C:\\Users\\Tecnico',
        tecnico: 'C:\\Users\\Tecnico',
        'c:\\users\\tecnico\\descargas': 'C:\\Users\\Tecnico\\Descargas',
        descargas: 'C:\\Users\\Tecnico\\Descargas',
        downloads: 'C:\\Users\\Tecnico\\Descargas',
        'c:\\users\\tecnico\\documents': 'C:\\Users\\Tecnico\\Documents',
        documents: 'C:\\Users\\Tecnico\\Documents',
        documentos: 'C:\\Users\\Tecnico\\Documents',
        'c:\\users\\tecnico\\desktop': 'C:\\Users\\Tecnico\\Desktop',
        desktop: 'C:\\Users\\Tecnico\\Desktop',
        escritorio: 'C:\\Users\\Tecnico\\Desktop',
        'c:\\users\\tecnico\\scripts': 'C:\\Users\\Tecnico\\Scripts',
        scripts: 'C:\\Users\\Tecnico\\Scripts',
        'x:': 'X:\\Sources',
        'x:\\sources': 'X:\\Sources',
        sources: 'X:\\Sources',
      };

      const resolvedDir = vfsPathMap[argLower];

      if (!resolvedDir) {
        soundFX.playError();
        appendLines([
          {
            type: 'error',
            text: `El sistema no puede encontrar la ruta especificada: "${rawArg}".`,
          },
          {
            type: 'system',
            text: 'Tip VFS: Escribe "dir" y presiona [TAB] para autocompletar rutas completas de carpetas (C:\\Users\\Tecnico\\Descargas, Documents, Desktop, Scripts, X:\\Sources).',
          },
        ]);
        return;
      }

      const entries = VIRTUAL_FILE_SYSTEM[resolvedDir] || [];
      let totalBytes = 0;
      let fileCount = 0;
      let dirCount = 2;

      const entryLines: Omit<TerminalLine, 'id'>[] = [
        { type: 'output', text: ` El volumen de la unidad ${resolvedDir.slice(0, 2)} es CyberAcademy_SMR` },
        { type: 'output', text: ` Directorio de ${resolvedDir}` },
        { type: 'output', text: '' },
        { type: 'output', text: '04/11/2026  08:00    <DIR>          .' },
        { type: 'output', text: '04/11/2026  08:00    <DIR>          ..' },
      ];

      entries.forEach((entry) => {
        if (entry.isDirectory) {
          dirCount++;
          const fullSubPath =
            resolvedDir === 'C:\\Users\\Tecnico' ? `C:\\Users\\Tecnico\\${entry.name}` : entry.name;
          entryLines.push({
            type: 'output',
            text: `${entry.date}  ${entry.time}    <DIR>          ${entry.name.padEnd(18, ' ')} [${fullSubPath}]`,
          });
        } else {
          fileCount++;
          const sz = entry.sizeBytes || 0;
          totalBytes += sz;
          const formattedSize = sz.toLocaleString('es-ES').padStart(14, ' ');
          entryLines.push({
            type: entry.isExecutable ? 'success' : 'output',
            text: `${entry.date}  ${entry.time} ${formattedSize} ${entry.name}`,
          });
        }
      });

      entryLines.push(
        {
          type: 'system',
          text: `               ${fileCount} archivos   ${totalBytes.toLocaleString('es-ES')} bytes (${dirCount} dirs)`,
        },
        {
          type: 'system',
          text: 'Tip: Escribe "dir" y pulsa [TAB] repetidamente para explorar todas las rutas completas del VFS.',
        }
      );

      appendLines(entryLines);
      return;
    }

    // COMANDO TREE (VISUALIZACIÓN JERÁRQUICA EN ÁRBOL DE CARPETAS Y ARCHIVOS DEL VFS)
    if (cmdLower === 'tree' || cmdLower.startsWith('tree ')) {
      const rawTreeArgs = cmdLower === 'tree' ? '' : trimmed.slice(4).trim();
      const lowerArgs = rawTreeArgs.toLowerCase();

      if (lowerArgs === '/?' || lowerArgs === '--help' || lowerArgs === '-h') {
        appendLines([
          {
            type: 'system',
            text: 'Muestra de forma gráfica la estructura de carpetas y archivos de una unidad o ruta (TREE):',
          },
          { type: 'output', text: '  TREE [unidad:][ruta] [/F] [/A]' },
          {
            type: 'output',
            text: '  /F   Muestra los nombres de los archivos contenidos en cada carpeta (activo por defecto en SMR).',
          },
          {
            type: 'output',
            text: '  /A   Usa caracteres ASCII (+---, |, \\---) en lugar de caracteres gráficos extendidos.',
          },
        ]);
        return;
      }

      const useAscii = /\B\/a\b|\B-a\b/i.test(rawTreeArgs);
      const branchMid = useAscii ? '+---' : '├───';
      const branchLast = useAscii ? '\\---' : '└───';
      const pipeVert = useAscii ? '|   ' : '│   ';
      const spaceIndent = '    ';

      const cleanedTarget = rawTreeArgs
        .replace(/\s*(\/[fa]|-[fa])\b/gi, '')
        .trim()
        .replace(/^"|"$/g, '')
        .replace(/\\$/, '')
        .toLowerCase()
        .replace(/^\.\\/, '');

      const treePathMap: Record<string, VirtualDirPath> = {
        'c:': 'C:\\Users\\Tecnico',
        'c:\\users\\tecnico': 'C:\\Users\\Tecnico',
        tecnico: 'C:\\Users\\Tecnico',
        'c:\\users\\tecnico\\descargas': 'C:\\Users\\Tecnico\\Descargas',
        descargas: 'C:\\Users\\Tecnico\\Descargas',
        downloads: 'C:\\Users\\Tecnico\\Descargas',
        'c:\\users\\tecnico\\documents': 'C:\\Users\\Tecnico\\Documents',
        documents: 'C:\\Users\\Tecnico\\Documents',
        documentos: 'C:\\Users\\Tecnico\\Documents',
        'c:\\users\\tecnico\\desktop': 'C:\\Users\\Tecnico\\Desktop',
        desktop: 'C:\\Users\\Tecnico\\Desktop',
        escritorio: 'C:\\Users\\Tecnico\\Desktop',
        'c:\\users\\tecnico\\scripts': 'C:\\Users\\Tecnico\\Scripts',
        scripts: 'C:\\Users\\Tecnico\\Scripts',
        'x:': 'X:\\Sources',
        'x:\\sources': 'X:\\Sources',
        sources: 'X:\\Sources',
      };

      if (cleanedTarget && cleanedTarget !== '.' && cleanedTarget !== '..' && !treePathMap[cleanedTarget]) {
        soundFX.playError();
        appendLines([
          {
            type: 'error',
            text: `Ruta no válida: "${rawTreeArgs}". No existen subdirectorios para mostrar.`,
          },
          {
            type: 'system',
            text: 'Tip VFS: Ejecuta "tree" sin parámetros o usa [TAB] para autocompletar rutas válidas del VFS.',
          },
        ]);
        return;
      }

      const targetRoot: VirtualDirPath =
        cleanedTarget === '..'
          ? effectiveDir === 'X:\\Sources'
            ? 'X:\\Sources'
            : 'C:\\Users\\Tecnico'
          : cleanedTarget && cleanedTarget !== '.'
          ? treePathMap[cleanedTarget]
          : effectiveDir;

      const formatFileLabel = (file: { name: string; sizeBytes?: number; isExecutable?: boolean }) => {
        const sizeKb = file.sizeBytes ? `${(file.sizeBytes / 1024).toFixed(1)} KB` : '0 KB';
        return file.isExecutable ? `${file.name}  [EXE · ${sizeKb}]` : `${file.name}  (${sizeKb})`;
      };

      const buildDirectoryTreeLines = (rootDir: VirtualDirPath): Omit<TerminalLine, 'id'>[] => {
        const lines: Omit<TerminalLine, 'id'>[] = [{ type: 'warning', text: `${rootDir}` }];
        const rootEntries = VIRTUAL_FILE_SYSTEM[rootDir] || [];
        const rootSubDirs = rootEntries.filter((e) => e.isDirectory);
        const rootFiles = rootEntries.filter((e) => !e.isDirectory);

        // 1. Archivos directos de la carpeta raíz seleccionada
        rootFiles.forEach((file, fIdx) => {
          const isVeryLastItem = fIdx === rootFiles.length - 1 && rootSubDirs.length === 0;
          const connector = isVeryLastItem ? branchLast : branchMid;
          lines.push({
            type: file.isExecutable ? 'success' : 'output',
            text: `${connector}${formatFileLabel(file)}`,
          });
        });

        // 2. Subdirectorios y sus archivos anidados
        rootSubDirs.forEach((subDir, dIdx) => {
          const isLastDir = dIdx === rootSubDirs.length - 1;
          const dirConnector = isLastDir ? branchLast : branchMid;
          const fullSubDirPath = `${rootDir}\\${subDir.name}` as VirtualDirPath;

          lines.push({
            type: 'system',
            text: `${dirConnector}📁 ${subDir.name}  [${fullSubDirPath}]`,
          });

          const childEntries = VIRTUAL_FILE_SYSTEM[fullSubDirPath] || [];
          const childIndent = isLastDir ? spaceIndent : pipeVert;

          childEntries.forEach((child, cIdx) => {
            const isLastChild = cIdx === childEntries.length - 1;
            const childConnector = isLastChild ? branchLast : branchMid;
            lines.push({
              type: child.isExecutable ? 'success' : 'output',
              text: `${childIndent}${childConnector}${formatFileLabel(child)}`,
            });
          });

          if (!isLastDir) {
            lines.push({ type: 'output', text: pipeVert.trimEnd() });
          }
        });

        return lines;
      };

      const treeLines: Omit<TerminalLine, 'id'>[] = [
        {
          type: 'output',
          text: 'Listado de rutas de carpetas y archivos para el volumen CyberAcademy_SMR',
        },
        { type: 'output', text: 'El número de serie del volumen es 004F-8B2A' },
        { type: 'output', text: '' },
      ];

      // Si el usuario ejecuta "tree" sin ruta específica estando en una subcarpeta de C:\Users\Tecnico,
      // mostramos el árbol completo de C:\Users\Tecnico (marcando su carpeta actual) más el volumen X:\Sources
      if (!cleanedTarget) {
        const primaryRoot: VirtualDirPath =
          effectiveDir === 'X:\\Sources' ? 'X:\\Sources' : 'C:\\Users\\Tecnico';
        const secondaryRoot: VirtualDirPath =
          primaryRoot === 'C:\\Users\\Tecnico' ? 'X:\\Sources' : 'C:\\Users\\Tecnico';

        treeLines.push(...buildDirectoryTreeLines(primaryRoot));
        treeLines.push(
          { type: 'output', text: '' },
          {
            type: 'system',
            text: `─── Volumen secundario montado en el VFS (${secondaryRoot}) ───`,
          },
          ...buildDirectoryTreeLines(secondaryRoot)
        );
      } else {
        treeLines.push(...buildDirectoryTreeLines(targetRoot));
      }

      treeLines.push(
        { type: 'output', text: '' },
        {
          type: 'system',
          text: `Directorio activo actual: ${effectiveDir} · Usa "cd <carpeta>" para moverte o "type <archivo>" para leerlo.`,
        }
      );

      appendLines(treeLines);

      recordAuditEvent(
        'EVT-3045',
        'SISTEMA',
        'INFO',
        `Inspección jerárquica del VFS (${rawTreeArgs ? `tree ${rawTreeArgs}` : 'tree'})`,
        `Árbol de directorios y archivos generado desde ${targetRoot}.`
      );

      setSpeaker('alice');
      setAliceExpression('happy');
      setDialogText(
        '¡Aquí tienes el árbol completo del Sistema de Archivos Virtual con "tree"! De un vistazo puedes ver todas las subcarpetas (Descargas, Documents, Desktop, Scripts y X:\\Sources) y los archivos ejecutables o de texto dentro de cada una.'
      );
      return;
    }

    // NAVEGACIÓN DE DIRECTORIOS CONTEXTUAL (CD CON SOPORTE DE RUTAS COMPLETAS Y RELATIVAS)
    if (cmdLower.startsWith('cd ') || cmdLower === 'cd..') {
      if (effectiveDir === 'X:\\Sources') {
        appendLines([
          {
            type: 'warning',
            text: 'En el entorno de recuperación WinRE debes permanecer en X:\\Sources para usar bootrec.',
          },
        ]);
        return;
      }

      const rawTarget = cmdLower === 'cd..' ? '..' : trimmed.slice(3).trim().replace(/^"|"$/g, '').replace(/\\$/, '');
      const targetLower = rawTarget.toLowerCase().replace(/^\.\\/, '');

      if (targetLower === '..' || targetLower === '\\' || targetLower === 'c:\\users\\tecnico') {
        setCurrentDir('C:\\Users\\Tecnico');
        return;
      }

      // Buscar subdirectorio coincidente o ruta completa en C:\Users\Tecnico
      const subDirs: Record<string, VirtualDirPath> = {
        descargas: 'C:\\Users\\Tecnico\\Descargas',
        downloads: 'C:\\Users\\Tecnico\\Descargas',
        'c:\\users\\tecnico\\descargas': 'C:\\Users\\Tecnico\\Descargas',
        documents: 'C:\\Users\\Tecnico\\Documents',
        documentos: 'C:\\Users\\Tecnico\\Documents',
        'c:\\users\\tecnico\\documents': 'C:\\Users\\Tecnico\\Documents',
        desktop: 'C:\\Users\\Tecnico\\Desktop',
        escritorio: 'C:\\Users\\Tecnico\\Desktop',
        'c:\\users\\tecnico\\desktop': 'C:\\Users\\Tecnico\\Desktop',
        scripts: 'C:\\Users\\Tecnico\\Scripts',
        'c:\\users\\tecnico\\scripts': 'C:\\Users\\Tecnico\\Scripts',
      };

      if (subDirs[targetLower]) {
        setCurrentDir(subDirs[targetLower]);
      } else {
        soundFX.playError();
        appendLines([
          {
            type: 'error',
            text: `El sistema no puede encontrar la ruta especificada: "${rawTarget}". Usa [TAB] para autocompletar carpetas.`,
          },
        ]);
      }
      return;
    }

    // LECTURA DE ARCHIVOS DEL VFS (TYPE / CAT)
    if (cmdLower.startsWith('type ') || cmdLower.startsWith('cat ')) {
      const targetFile = trimmed
        .slice(trimmed.indexOf(' ') + 1)
        .trim()
        .replace(/^\.\\/, '')
        .toLowerCase();

      // Permitir también rutas relativas como Descargas\ticket_304.txt
      let searchDir: VirtualDirPath = effectiveDir;
      let fileName = targetFile;

      if (targetFile.startsWith('descargas\\')) {
        searchDir = 'C:\\Users\\Tecnico\\Descargas';
        fileName = targetFile.slice('descargas\\'.length);
      } else if (targetFile.startsWith('documents\\')) {
        searchDir = 'C:\\Users\\Tecnico\\Documents';
        fileName = targetFile.slice('documents\\'.length);
      }

      const entries = VIRTUAL_FILE_SYSTEM[searchDir] || [];
      const foundFile = entries.find((e) => !e.isDirectory && e.name.toLowerCase() === fileName);

      if (foundFile && foundFile.content) {
        appendLines([
          { type: 'system', text: `--- ${foundFile.name} ---` },
          { type: 'output', text: foundFile.content },
        ]);
      } else if (foundFile && foundFile.isExecutable) {
        appendLines([
          {
            type: 'warning',
            text: `"${foundFile.name}" es un archivo binario ejecutable (.exe), no un documento de texto.`,
          },
        ]);
      } else {
        soundFX.playError();
        appendLines([
          {
            type: 'error',
            text: `El sistema no puede encontrar el archivo "${fileName}" en ${searchDir}. Pulsa [TAB] tras escribir "type ".`,
          },
        ]);
      }
      return;
    }

    // EJECUCIÓN DE SCRIPT DIAGNOSTICO_RED.BAT EN C:\USERS\TECNICO\SCRIPTS
    if (cmdLower === 'diagnostico_red.bat' || cmdLower === '.\\diagnostico_red.bat') {
      appendLines([
        { type: 'system', text: 'Ejecutando script por lotes: diagnostico_red.bat...' },
        { type: 'success', text: 'Loopback 127.0.0.1: OK (<1ms)' },
        linkUp
          ? { type: 'success', text: 'Gateway 192.168.1.1: OK (1ms TTL=64)' }
          : { type: 'error', text: 'Gateway 192.168.1.1: FALLO DE ENLACE FÍSICO' },
      ]);
      return;
    }

    if (cmdLower === 'whoami') {
      appendLines([{ type: 'output', text: 'oficina-soporte\\tecnico_smr' }]);
      return;
    }
    if (cmdLower === 'hostname') {
      appendLines([{ type: 'output', text: 'PC-SOPORTE-SMR01' }]);
      return;
    }
    if (cmdLower === 'ver' || cmdLower === 'ver /all') {
      const isWinReEnv = effectiveDir === 'X:\\Sources';
      appendLines([
        {
          type: 'output',
          text: 'Microsoft Windows [Versión 10.0.19045.5131] (x64-based system)',
        },
        {
          type: 'system',
          text: `  Arquitectura de compilación : x64-based system (AMD64 / x86_64 · 64 bits)`,
        },
        {
          type: 'output',
          text: `  Rama y compilación del SO   : 15382.330.amd64fre.rs_prerelease (${
            isWinReEnv
              ? 'Windows Recovery Environment - WinRE x64'
              : 'Windows 10 Pro Educativo x64'
          })`,
        },
        {
          type: 'output',
          text: '  Kernel NT / HAL             : NT 10.0 · Multiprocessor Free (16 hilos lógicos)',
        },
      ]);
      return;
    }
    if (cmdLower === 'systeminfo') {
      appendLines([
        { type: 'output', text: 'Nombre de host:                            PC-SOPORTE-SMR01' },
        { type: 'output', text: 'Nombre del sistema operativo:              Microsoft Windows 10 Pro Educativo' },
        { type: 'output', text: 'Versión del sistema:                       10.0.15382 N/A Compilación 15382.330' },
        { type: 'system', text: 'Tipo de sistema (Arquitectura):            x64-based PC (x64-based system · AMD64)' },
        { type: 'output', text: 'Cantidad total de memoria física:          16.384 MB' },
        {
          type: currentMission === 4 && !procesoTerminado ? 'error' : 'success',
          text: `Memoria física disponible:                 ${
            currentMission === 4 && !procesoTerminado ? '412 MB (CRÍTICO - bucle.exe activo)' : '11.840 MB'
          }`,
        },
        {
          type: 'output',
          text: 'Tarjeta(s) de red:                         [01]: Intel(R) PRO/1000 MT Network Connection',
        },
      ]);
      return;
    }
    if (cmdLower.startsWith('arp')) {
      if (cmdLower === 'arp -d' || cmdLower === 'arp -d *' || cmdLower.startsWith('arp -d ')) {
        const targetIpArg = cmdLower.replace(/^arp\s+-d\s*/, '').trim();
        soundFX.playClick();

        if (targetIpArg && targetIpArg !== '*') {
          setArpCacheEntries((prev) => prev.filter((entry) => entry.ipAddress !== targetIpArg));
          recordAuditEvent(
            'EVT-1041',
            'RED_DHCP',
            'WARNING',
            `Entrada ARP eliminada (arp -d ${targetIpArg})`,
            `Se borró la asociación MAC de la dirección IPv4 ${targetIpArg} en la tabla ARP local.`
          );
          appendLines([
            {
              type: 'system',
              text: `[ARP Cache] Eliminando entrada ${targetIpArg} de la tabla ARP de la interfaz Ethernet0...`,
            },
            {
              type: 'success',
              text: `Se borró correctamente la entrada ARP para ${targetIpArg}. (Usa "arp -a" para revisar la tabla).`,
            },
          ]);
        } else {
          setArpCacheEntries([]);
          recordAuditEvent(
            'EVT-1040',
            'RED_DHCP',
            'WARNING',
            'Purga completa de la tabla de caché ARP (arp -d)',
            'Se borraron todas las entradas IP <-> MAC de la caché ARP local, forzando una nueva resolución ARP por difusión (Broadcast).'
          );
          appendLines([
            {
              type: 'system',
              text: '[ARP Cache Purge] Borrando todas las entradas de la tabla ARP actual en Interfaz Ethernet0...',
            },
            {
              type: 'success',
              text: 'Se vació correctamente la caché ARP (0 entradas en la tabla).',
            },
            {
              type: 'system',
              text: '[Diagnóstico SMR] La purga con "arp -d" elimina asociaciones IP <-> MAC obsoletas tras una reconexión o conflicto. Ejecuta "arp -a" para verificarlo o realiza un "ping 192.168.1.1" para forzar una nueva resolución ARP.',
            },
          ]);
          setSpeaker('alice');
          setAliceExpression('happy');
          setDialogText(
            '¡Caché ARP purgada con "arp -d"! Hemos borrado todas las asociaciones IP <-> MAC de la tabla actual. El próximo ping o conexión forzará una nueva resolución ARP limpia en la red.'
          );
        }
        return;
      }

      if (cmdLower === 'arp -a' || cmdLower === 'arp -g') {
        if (!linkUp && currentMission === 1) {
          appendLines([
            {
              type: 'warning',
              text: 'No se encontraron entradas ARP (Enlace físico desconectado en Rack).',
            },
          ]);
        } else if (arpCacheEntries.length === 0) {
          appendLines([
            {
              type: 'warning',
              text: 'No se encontraron entradas ARP.',
            },
            {
              type: 'system',
              text: '[Diagnóstico SMR] La tabla ARP está vacía (purgada con "arp -d"). Ejecuta "ping 192.168.1.1", "ping 8.8.8.8" o "ipconfig /renew" para forzar una nueva resolución ARP (ARP Broadcast Request -> ARP Reply).',
            },
          ]);
        } else {
          appendLines([
            { type: 'output', text: 'Interfaz: 192.168.1.105 --- 0x4' },
            { type: 'output', text: '  Dirección de Internet          Dirección física      Tipo' },
            ...arpCacheEntries.map((entry) => ({
              type: (entry.type === 'dinámico' ? 'success' : 'output') as TerminalLine['type'],
              text: `  ${entry.ipAddress.padEnd(30, ' ')} ${entry.macAddress.padEnd(21, ' ')} ${entry.type}`,
            })),
          ]);
        }
        return;
      }

      appendLines([
        {
          type: 'warning',
          text: 'Usa: "arp -a" (mostrar tabla ARP) o "arp -d" (borrar/purgar todas las entradas de la caché ARP).',
        },
      ]);
      return;
    }
    if (cmdLower.startsWith('tracert') || cmdLower.startsWith('traceroute')) {
      const rawArgs = trimmed
        .replace(/^(tracert|traceroute)\s*/i, '')
        .trim();
      const noResolveFlag = rawArgs.toLowerCase().startsWith('-d ');
      const targetArg = (noResolveFlag ? rawArgs.slice(3) : rawArgs).trim();

      if (!targetArg || targetArg === '/?' || targetArg === '--help') {
        appendLines([
          { type: 'system', text: 'Uso: tracert [-d] <dirección_IP_o_host>' },
          {
            type: 'output',
            text: '  Ejemplos SMR: "tracert 8.8.8.8" (ruta WAN multi-salto), "tracert 1.1.1.1" o "tracert 192.168.1.1" (Gateway LAN).',
          },
          {
            type: 'output',
            text: '  Modificador -d: No resuelve direcciones IP a nombres de host en cada salto.',
          },
        ]);
        return;
      }

      const targetLower = targetArg.toLowerCase();
      const targetIp =
        targetLower === 'localhost'
          ? '127.0.0.1'
          : targetLower === 'dns.google'
          ? '8.8.8.8'
          : targetLower === 'one.one.one.one'
          ? '1.1.1.1'
          : targetLower === 'gateway' || targetLower === 'router.oficina.local'
          ? '192.168.1.1'
          : targetArg;

      // 1. Traza a Loopback (127.0.0.1)
      if (targetIp === '127.0.0.1') {
        appendLines([
          {
            type: 'output',
            text: `Traza a la dirección ${targetIp} sobre un máximo de 30 saltos:`,
          },
          {
            type: 'success',
            text: `  1    <1 ms    <1 ms    <1 ms  ${
              noResolveFlag ? '127.0.0.1' : 'localhost.cyberacademy.local [127.0.0.1]'
            }`,
          },
          { type: 'output', text: 'Traza completa.' },
        ]);
        return;
      }

      // 2. Si el cable físico RJ45 del Rack está desconectado
      if (!linkUp) {
        soundFX.playError();
        recordAuditEvent(
          'EVT-1050',
          'RED_DHCP',
          'WARNING',
          `Fallo de seguimiento de ruta en Salto 1 (tracert ${targetIp})`,
          'Tiempo de espera agotado en el primer salto (Gateway 192.168.1.1 inaccesible por cable RJ45 suelto en Rack).'
        );
        appendLines([
          {
            type: 'output',
            text: `Traza a la dirección ${targetIp} sobre un máximo de 30 saltos:`,
          },
          {
            type: 'error',
            text: '  1     *        *        *     Tiempo de espera agotado para esta solicitud.',
          },
          {
            type: 'error',
            text: '  2     *        *        *     Tiempo de espera agotado para esta solicitud.',
          },
          {
            type: 'warning',
            text: `[Diagnóstico de Enrutamiento SMR] El paquete no alcanza ni siquiera el Salto 1 (Gateway 192.168.1.1). Revisa la conexión física en el Rack de Comunicaciones.`,
          },
        ]);
        setSpeaker('alice');
        setAliceExpression('worried');
        setDialogText(
          `¡Fallo en el Salto 1 al ejecutar "tracert ${targetIp}"! Los paquetes con TTL=1 ni siquiera llegan al router 192.168.1.1 porque el cable RJ45 del Rack está desconectado.`
        );
        return;
      }

      // 3. Si estamos en la Misión 5 con conflicto de IP o concesión DHCP liberada (0.0.0.0)
      if (currentMission === 5 && !ipRenovada) {
        soundFX.playError();
        recordAuditEvent(
          'EVT-1052',
          'RED_DHCP',
          'WARNING',
          `Bloqueo de enrutamiento en Gateway (tracert ${targetIp})`,
          `El tráfico se detuvo en el salto 1 (192.168.1.1) debido a ${
            ipLiberada ? 'IP 0.0.0.0 sin renovar' : 'conflicto de IP duplicada 192.168.1.50'
          }.`
        );
        appendLines([
          {
            type: 'output',
            text: `Traza a la dirección ${targetIp} sobre un máximo de 30 saltos:`,
          },
          {
            type: 'warning',
            text: '  1     1 ms     1 ms     1 ms  gateway.cyberacademy.local [192.168.1.1]',
          },
          {
            type: 'error',
            text: '  2   192.168.1.1  informes: Host de destino inaccesible (Bloqueo ARP/DHCP por conflicto IP).',
          },
          {
            type: 'system',
            text: '[Diagnóstico SMR] El Gateway 192.168.1.1 rechaza enrutar paquetes hacia el exterior mientras tu IP esté en conflicto o en 0.0.0.0. Hay que conseguir una concesión DHCP nueva.',
          },
        ]);
        setSpeaker('alice');
        setAliceExpression('worried');
        setDialogText(
          `¡Mira el resultado de "tracert ${targetIp}"! Llegamos al Salto 1 (192.168.1.1), pero el router bloquea el salto hacia el exterior por el conflicto de IP. Hay que soltar esta concesión y pedir otra al DHCP.`
        );
        return;
      }

      // 4. Red operativa: poblar caché ARP y simular saltos LAN o WAN más allá del gateway
      populateDefaultArpResolution();

      const isLocalSubnet = targetIp.startsWith('192.168.1.');
      if (isLocalSubnet) {
        const localHostName =
          targetIp === '192.168.1.1'
            ? 'gateway.cyberacademy.local'
            : targetIp === '192.168.1.2'
            ? 'switch-rack42u.cyberacademy.local'
            : targetIp === '192.168.1.105'
            ? 'pc-soporte-smr01.cyberacademy.local'
            : `nodo-lan-${targetIp.split('.')[3]}.cyberacademy.local`;

        recordAuditEvent(
          'EVT-1051',
          'RED_DHCP',
          'INFO',
          `Traza de ruta LAN completada (tracert ${targetIp})`,
          `Destino ${targetIp} alcanzado directamente en 1 salto dentro de la subred local 192.168.1.0/24 (<1 ms).`
        );

        appendLines([
          {
            type: 'output',
            text: `Traza a la dirección ${
              noResolveFlag ? targetIp : `${localHostName} [${targetIp}]`
            } sobre un máximo de 30 saltos:`,
          },
          {
            type: 'success',
            text: `  1    <1 ms    <1 ms    <1 ms  ${
              noResolveFlag ? targetIp : `${localHostName} [${targetIp}]`
            }`,
          },
          {
            type: 'system',
            text: 'Traza completa. [Subred local /24: 1 salto directo sin pasar por routers WAN].',
          },
        ]);
        setSpeaker('alice');
        setAliceExpression('happy');
        setDialogText(
          `¡Traza completada a ${targetIp} en solo 1 salto (<1 ms)! Como pertenece a nuestra misma red local 192.168.1.0/24, no necesita cruzar routers externos.`
        );
        return;
      }

      // 5. Destino externo (más allá del gateway 192.168.1.1): simular 5 saltos WAN con tiempos de respuesta
      const finalHostName =
        targetIp === '8.8.8.8'
          ? 'dns.google'
          : targetIp === '1.1.1.1'
          ? 'one.one.one.one'
          : targetIp === '8.8.4.4'
          ? 'dns-secondary.google'
          : `host-${targetIp.replace(/\./g, '-')}.wan.net`;

      registerDnsCacheEntry([
        {
          recordName: finalHostName,
          recordType: '1 (A - Host IPv4)',
          ttlSeconds: 18000,
          dataLength: 4,
          section: 'Respuesta (Tracert WAN)',
          ipAddress: targetIp,
          sourceCommand: `tracert ${targetIp}`,
        },
      ]);

      recordAuditEvent(
        'EVT-1051',
        'RED_DHCP',
        'SUCCESS',
        `Traza de enrutamiento WAN completada (tracert ${targetIp})`,
        `Ruta verificada en 5 saltos (Gateway 192.168.1.1 -> OLT ISP -> Backbone -> IX Peering -> ${targetIp} en 14 ms).`
      );

      appendLines([
        {
          type: 'output',
          text: `Traza a la dirección ${
            noResolveFlag ? targetIp : `${finalHostName} [${targetIp}]`
          } sobre un máximo de 30 saltos:`,
        },
        {
          type: 'output',
          text: '  Salto   RTT 1    RTT 2    RTT 3   Nodo / Enrutador de Salto [Dirección IP]',
        },
        {
          type: 'output',
          text: '  -----  -------  -------  -------  -----------------------------------------------------',
        },
        {
          type: 'success',
          text: `  1       <1 ms    <1 ms     1 ms   ${
            noResolveFlag ? '192.168.1.1' : 'gateway.cyberacademy.local [192.168.1.1]'
          }`,
        },
        {
          type: 'output',
          text: `  2        4 ms     3 ms     4 ms   ${
            noResolveFlag ? '10.24.0.1' : 'olt-fibra-central.isp-acceso.es [10.24.0.1]'
          }`,
        },
        {
          type: 'output',
          text: `  3        8 ms     9 ms     8 ms   ${
            noResolveFlag ? '185.42.110.14' : 'core-mad-bbr01.backbone-isp.net [185.42.110.14]'
          }`,
        },
        {
          type: 'output',
          text: `  4       11 ms    12 ms    11 ms   ${
            noResolveFlag ? '193.149.1.82' : 'ix-espanix-peering.mad.net [193.149.1.82]'
          }`,
        },
        {
          type: 'success',
          text: `  5       14 ms    13 ms    14 ms   ${
            noResolveFlag ? targetIp : `${finalHostName} [${targetIp}]`
          }`,
        },
        {
          type: 'system',
          text: `Traza completa en 5 saltos. [Salto 1: Gateway LAN (1ms) -> Saltos 2-4: Troncal ISP/WAN -> Salto 5: Destino ${targetIp} (14ms)].`,
        },
      ]);

      setSpeaker('alice');
      setAliceExpression('happy');
      setDialogText(
        `¡Excelente diagnóstico con "tracert ${targetIp}"! Hemos trazado los 5 saltos más allá del gateway (192.168.1.1 -> OLT ISP -> Backbone -> Punto Neutro -> ${targetIp}) comprobando los tiempos de respuesta (RTT) en cada router.`
      );
      return;
    }

    // COMANDO NBTSTAT -A <IP> (DIAGNÓSTICO DE RESOLUCIÓN DE NOMBRES NETBIOS SOBRE TCP/IP Y COMPARTICIÓN DE RED SMB)
    if (cmdLower === 'nbtstat' || cmdLower.startsWith('nbtstat ')) {
      const rawNbtArgs = trimmed.slice(7).trim();
      const lowerNbtArgs = rawNbtArgs.toLowerCase();

      if (!rawNbtArgs || lowerNbtArgs === '/?' || lowerNbtArgs === '--help' || lowerNbtArgs === '-h') {
        appendLines([
          {
            type: 'system',
            text: 'Muestra estadísticas del protocolo y tablas actuales de nombres NetBIOS sobre TCP/IP (NBT - UDP 137):',
          },
          {
            type: 'output',
            text: '  nbtstat -A <dirección IP>   Muestra la tabla de nombres de nodo remoto dada su dirección IP.',
          },
          {
            type: 'output',
            text: '  nbtstat -n                  Muestra los nombres NetBIOS locales registrados en este equipo.',
          },
          {
            type: 'output',
            text: '  nbtstat -c                  Muestra el contenido de la caché de nombres NetBIOS (IP <-> NetBIOS).',
          },
          {
            type: 'output',
            text: '  nbtstat -R                  Purga y vuelve a cargar la tabla de caché de nombres remotos.',
          },
          {
            type: 'warning',
            text: '  Ejemplo SMR: nbtstat -A 192.168.1.50  (o 192.168.1.1 / 192.168.1.2 / 192.168.1.105)',
          },
        ]);
        return;
      }

      // Verificar si el enlace físico RJ45 está desconectado
      if (currentMission === 1 && !linkUp) {
        soundFX.playError();
        appendLines([
          { type: 'output', text: 'Ethernet0:' },
          { type: 'output', text: 'Dirección IP del nodo: [0.0.0.0] Id. de ámbito: []' },
          { type: 'error', text: '    Host no encontrado.' },
          {
            type: 'warning',
            text: '    [Diagnóstico NetBIOS UDP/137] Imposible consultar nombres de nodos remotos: el cable RJ45 del Rack está desconectado.',
          },
        ]);
        setSpeaker('alice');
        setAliceExpression('worried');
        setDialogText(
          'NetBIOS sobre TCP/IP (puerto UDP 137) no puede alcanzar ningún nodo remoto porque el latiguillo RJ45 del Rack de Comunicaciones está desconectado.'
        );
        return;
      }

      // Opción -n: Tabla de nombres NetBIOS locales
      if (lowerNbtArgs === '-n' || lowerNbtArgs === '/n') {
        const localIp =
          currentMission === 5 && !ipRenovada
            ? ipLiberada
              ? '0.0.0.0'
              : '192.168.1.50'
            : '192.168.1.105';
        appendLines([
          { type: 'output', text: 'Ethernet0:' },
          { type: 'output', text: `Dirección IP del nodo: [${localIp}] Id. de ámbito: []` },
          { type: 'output', text: '' },
          { type: 'system', text: '                Tabla de nombres locales de NetBIOS' },
          { type: 'output', text: '' },
          { type: 'output', text: '       Nombre             Tipo         Estado' },
          { type: 'output', text: '    ---------------------------------------------' },
          { type: 'success', text: '    PC-SOPORTE-SMR01<00>  Único       Registrado   (Servicio Estación de trabajo)' },
          { type: 'success', text: '    PC-SOPORTE-SMR01<20>  Único       Registrado   (Servicio Servidor SMB / Compartición)' },
          { type: 'output', text: '    CYBERACADEMY   <00>  Grupo       Registrado   (Grupo de trabajo LAN)' },
          { type: 'output', text: '    CYBERACADEMY   <1E>  Grupo       Registrado   (Elección de explorador de red)' },
        ]);
        return;
      }

      // Opción -c: Caché de nombres NetBIOS
      if (lowerNbtArgs === '-c' || lowerNbtArgs === '/c') {
        appendLines([
          { type: 'output', text: 'Ethernet0:' },
          { type: 'output', text: 'Dirección IP del nodo: [192.168.1.105] Id. de ámbito: []' },
          { type: 'output', text: '' },
          { type: 'system', text: '            Tabla de nombres de caché remota de NetBIOS' },
          { type: 'output', text: '' },
          { type: 'output', text: '        Nombre            Tipo       Dirección Host    Duración [seg]' },
          { type: 'output', text: '    -----------------------------------------------------------------' },
          { type: 'success', text: '    GW-CYBERACADEMY<20>  Único      192.168.1.1           540' },
          { type: 'success', text: '    NAS-CONTA-01   <20>  Único      192.168.1.50          480' },
          { type: 'output', text: '    SW-RACK42U     <00>  Único      192.168.1.2           310' },
        ]);
        return;
      }

      // Opción -R: Purgar y recargar caché NetBIOS
      if (lowerNbtArgs === '-r' || lowerNbtArgs === '/r') {
        soundFX.playClick();
        appendLines([
          {
            type: 'success',
            text: '    Se han purgado y cargado correctamente los nombres de la tabla de caché NetBIOS NBT.',
          },
        ]);
        return;
      }

      // Opción principal: nbtstat -A <ip> (o -a <ip>)
      const matchAFlag = rawNbtArgs.match(/^[-/]a\s+(.+)$/i);
      if (!matchAFlag) {
        appendLines([
          {
            type: 'warning',
            text: 'Sintaxis incorrecta. Uso recomendado: nbtstat -A <ip> (ej: nbtstat -A 192.168.1.50 o nbtstat -A 192.168.1.1)',
          },
        ]);
        return;
      }

      const targetIp = matchAFlag[1].trim();
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipv4Regex.test(targetIp)) {
        soundFX.playError();
        appendLines([
          {
            type: 'error',
            text: `El parámetro "-A" requiere una dirección IPv4 válida (recibido: "${targetIp}"). Ejemplo: nbtstat -A 192.168.1.50`,
          },
        ]);
        return;
      }

      // Si es una IP fuera de la red local (ej. 8.8.8.8), NetBIOS UDP 137 no es enrutable por Internet
      if (!targetIp.startsWith('192.168.1.') && targetIp !== '127.0.0.1') {
        soundFX.playError();
        appendLines([
          { type: 'output', text: 'Ethernet0:' },
          { type: 'output', text: 'Dirección IP del nodo: [192.168.1.105] Id. de ámbito: []' },
          { type: 'output', text: '' },
          { type: 'error', text: '    Host no encontrado.' },
          {
            type: 'warning',
            text: `    [Diagnóstico SMR] NetBIOS sobre TCP/IP (UDP 137) es un protocolo de ámbito LAN local y está filtrado hacia IPs WAN externas como ${targetIp}. Prueba con un nodo local: 192.168.1.50, 192.168.1.1 o 192.168.1.2.`,
          },
        ]);
        return;
      }

      populateDefaultArpResolution();

      interface RemoteNetBiosNode {
        netbiosName: string;
        workgroup: string;
        macAddress: string;
        hasFileServerService20: boolean;
        hasMasterBrowser1D?: boolean;
        sharesSummary: string;
        diagnosticNote: string;
      }

      const lastOctet = targetIp.split('.')[3] || '100';
      const knownNodes: Record<string, RemoteNetBiosNode> = {
        '192.168.1.50': {
          netbiosName: 'NAS-CONTA-01',
          workgroup: 'CYBERACADEMY',
          macAddress: '00-50-56-C0-00-50',
          hasFileServerService20: true,
          sharesSummary: '\\\\NAS-CONTA-01\\Contabilidad_Informes, \\\\NAS-CONTA-01\\Backups_ASD',
          diagnosticNote:
            currentMission === 5 && !ipRenovada
              ? '¡CONFLICTO DETECTADO! La IP 192.168.1.50 pertenece al servidor de archivos NAS-CONTA-01 (sufijo <20> activo). Alguien le puso a mano una IP fija que está DENTRO del ámbito DHCP, y el servidor nos la concedió también a nosotros. Toca soltar esta concesión y pedir otra.'
              : 'Servidor NAS de Contabilidad con servicio de compartición SMB (<20>) activo y accesible en la red.',
        },
        '192.168.1.1': {
          netbiosName: 'GW-CYBERACADEMY',
          workgroup: 'CYBERACADEMY',
          macAddress: '00-1B-63-84-45-E6',
          hasFileServerService20: true,
          hasMasterBrowser1D: true,
          sharesSummary: '\\\\GW-CYBERACADEMY\\NetLogon, \\\\GW-CYBERACADEMY\\SysLogs',
          diagnosticNote:
            'Gateway principal y Master Browser (<1D>) del grupo de trabajo CYBERACADEMY. El sufijo <20> confirma que la compartición de recursos de red está operativa.',
        },
        '192.168.1.2': {
          netbiosName: 'SW-RACK42U',
          workgroup: 'CYBERACADEMY',
          macAddress: '00-24-A5-11-9C-02',
          hasFileServerService20: false,
          sharesSummary: 'Ninguno (Servicio Servidor <20> deshabilitado en este nodo)',
          diagnosticNote:
            '¡Atención diagnóstico de compartición! Este nodo registra <00> (Estación), pero NO registra el sufijo <20> (Servidor SMB). Por ello responde a ping pero rechaza conexiones a carpetas compartidas \\\\192.168.1.2.',
        },
        '192.168.1.105': {
          netbiosName: 'PC-SOPORTE-SMR01',
          workgroup: 'CYBERACADEMY',
          macAddress: '00-1A-2B-3C-4D-5E',
          hasFileServerService20: true,
          sharesSummary: '\\\\PC-SOPORTE-SMR01\\Users, \\\\PC-SOPORTE-SMR01\\Soporte_Tools$',
          diagnosticNote:
            'Estación del técnico de soporte con servicio de compartición de archivos e impresoras (<20>) habilitado.',
        },
        '127.0.0.1': {
          netbiosName: 'PC-SOPORTE-SMR01',
          workgroup: 'CYBERACADEMY',
          macAddress: '00-1A-2B-3C-4D-5E',
          hasFileServerService20: true,
          sharesSummary: '\\\\PC-SOPORTE-SMR01\\Users, \\\\PC-SOPORTE-SMR01\\Soporte_Tools$',
          diagnosticNote:
            'Consulta NetBIOS por bucle local (Loopback): servicios <00> y <20> registrados correctamente.',
        },
      };

      const nodeInfo: RemoteNetBiosNode = knownNodes[targetIp] || {
        netbiosName: `PC-AULA-SMR${lastOctet.padStart(2, '0')}`,
        workgroup: 'CYBERACADEMY',
        macAddress: `00-1A-2B-99-01-${Number(lastOctet).toString(16).padStart(2, '0').toUpperCase()}`,
        hasFileServerService20: true,
        sharesSummary: `\\\\PC-AULA-SMR${lastOctet.padStart(2, '0')}\\Publico`,
        diagnosticNote: `Nodo del aula SMR (${targetIp}) con resolución NetBIOS y servicio de compartición SMB (<20>) activos.`,
      };

      const padName = (name: string) => name.padEnd(15, ' ').slice(0, 15);
      const localNodeIp =
        currentMission === 5 && !ipRenovada
          ? ipLiberada
            ? '0.0.0.0'
            : '192.168.1.50'
          : '192.168.1.105';

      const nbtLines: Omit<TerminalLine, 'id'>[] = [
        { type: 'output', text: 'Ethernet0:' },
        { type: 'output', text: `Dirección IP del nodo: [${localNodeIp}] Id. de ámbito: []` },
        { type: 'output', text: '' },
        {
          type: 'system',
          text: `           Tabla de nombres de equipo remoto de NetBIOS (${targetIp})`,
        },
        { type: 'output', text: '' },
        {
          type: 'output',
          text: '       Nombre             Tipo         Estado        Función del Sufijo NetBIOS',
        },
        {
          type: 'output',
          text: '    ----------------------------------------------------------------------------',
        },
        {
          type: 'success',
          text: `    ${padName(nodeInfo.netbiosName)}<00>  Único       Registrado    Servicio Estación de trabajo (Workstation)`,
        },
        {
          type: 'output',
          text: `    ${padName(nodeInfo.workgroup)}<00>  Grupo       Registrado    Nombre de Dominio / Grupo de trabajo`,
        },
      ];

      if (nodeInfo.hasFileServerService20) {
        nbtLines.push({
          type: 'success',
          text: `    ${padName(nodeInfo.netbiosName)}<20>  Único       Registrado    Servicio Servidor SMB (Compartición Activa)`,
        });
      } else {
        nbtLines.push({
          type: 'warning',
          text: `    ${padName(nodeInfo.netbiosName)}<20>  Único       No registrado [!] Compartición de archivos SMB desactivada`,
        });
      }

      if (nodeInfo.hasMasterBrowser1D) {
        nbtLines.push({
          type: 'system',
          text: `    ${padName(nodeInfo.workgroup)}<1D>  Único       Registrado    Explorador maestro de subred (Master Browser)`,
        });
      }

      nbtLines.push(
        {
          type: 'output',
          text: `    ${padName(nodeInfo.workgroup)}<1E>  Grupo       Registrado    Elecciones del servicio Explorador de red`,
        },
        { type: 'output', text: '' },
        {
          type: 'system',
          text: `    Dirección del adaptador (MAC) . . : ${nodeInfo.macAddress}`,
        },
        {
          type: nodeInfo.hasFileServerService20 ? 'output' : 'warning',
          text: `    Recursos compartidos SMB (<20>) . : ${nodeInfo.sharesSummary}`,
        },
        {
          type:
            targetIp === '192.168.1.50' && currentMission === 5 && !ipRenovada
              ? 'error'
              : nodeInfo.hasFileServerService20
              ? 'success'
              : 'warning',
          text: `    💡 Diagnóstico NetBIOS: ${nodeInfo.diagnosticNote}`,
        }
      );

      appendLines(nbtLines);

      recordAuditEvent(
        'EVT-1060',
        'RED_DHCP',
        targetIp === '192.168.1.50' && currentMission === 5 && !ipRenovada ? 'WARNING' : 'INFO',
        `Consulta de tabla de nombres NetBIOS remotos (nbtstat -A ${targetIp})`,
        `Nodo remoto resuelto: ${nodeInfo.netbiosName} (${targetIp} · MAC ${nodeInfo.macAddress} · Servicio Servidor <20>: ${
          nodeInfo.hasFileServerService20 ? 'Registrado' : 'Inactivo'
        }).`
      );

      setSpeaker('alice');
      setAliceExpression(
        targetIp === '192.168.1.50' && currentMission === 5 && !ipRenovada ? 'worried' : 'happy'
      );
      setDialogText(
        targetIp === '192.168.1.50' && currentMission === 5 && !ipRenovada
          ? `¡Mira la tabla NetBIOS con "nbtstat -A 192.168.1.50"! Esa IP pertenece al servidor "${nodeInfo.netbiosName}" (MAC ${nodeInfo.macAddress}) con compartición SMB <20> activa. ¡Por eso teníamos conflicto de IP!`
          : !nodeInfo.hasFileServerService20
          ? `Con "nbtstat -A ${targetIp}" hemos descubierto por qué no podíamos acceder a sus carpetas compartidas: el nodo "${nodeInfo.netbiosName}" tiene registrado <00>, pero le falta el sufijo <20> (Servicio Servidor SMB).`
          : `¡Tabla NetBIOS obtenida con "nbtstat -A ${targetIp}"! El nodo "${nodeInfo.netbiosName}" tiene registrados los sufijos <00> (Estación) y <20> (Servidor SMB de compartición de red) en el grupo ${nodeInfo.workgroup}.`
      );
      return;
    }

    // COMANDO NETSH INTERFACE SHOW INTERFACE (DIAGNÓSTICO DE ESTADO ADMINISTRATIVO Y FÍSICO DE CAPA 1)
    if (cmdLower === 'netsh' || cmdLower.startsWith('netsh ')) {
      const netshArgs = cmdLower.replace(/^netsh\s*/, '').trim();

      if (
        netshArgs === 'interface show interface' ||
        netshArgs === 'int show int' ||
        netshArgs === 'interface ipv4 show interfaces' ||
        netshArgs === 'interface ip show config'
      ) {
        const isPhysicallyUnplugged = currentMission === 1 && !linkUp;

        appendLines([
          { type: 'output', text: '' },
          {
            type: 'system',
            text: 'Estado admin.   Estado          Tipo             Nombre de interfaz',
          },
          {
            type: 'output',
            text: '-------------------------------------------------------------------------',
          },
          {
            type: isPhysicallyUnplugged ? 'error' : 'success',
            text: `Habilitado      ${
              isPhysicallyUnplugged ? 'Desconectado  ' : 'Conectado     '
            }  Dedicado         Ethernet0`,
          },
          {
            type: 'output',
            text: 'Deshabilitado   Desconectado    Dedicado         Ethernet1 (Backup-VLAN)',
          },
          {
            type: 'output',
            text: 'Habilitado      Conectado       Bucle invertido  Loopback Pseudo-Interface 1',
          },
          { type: 'output', text: '' },
          {
            type: 'system',
            text: '─── DIAGNÓSTICO DE CAPA 1 (NIVEL FÍSICO OSI · ADAPTADOR ETHERNET0) ───',
          },
          {
            type: 'output',
            text: '  • Adaptador físico NIC           : Intel(R) PRO/1000 MT Network Connection (PCIe x1)',
          },
          {
            type: 'output',
            text: '  • Estado Administrativo (SO)     : Habilitado (Driver NDIS activo en Windows)',
          },
          {
            type: isPhysicallyUnplugged ? 'error' : 'success',
            text: `  • Estado Operativo / Físico (L1) : ${
              isPhysicallyUnplugged
                ? 'DESCONECTADO (Sin portadora eléctrica / Link Pulse ausente)'
                : 'CONECTADO (Portadora 1000BASE-T Full-Duplex · EIA/TIA-568B OK)'
            }`,
          },
          {
            type: isPhysicallyUnplugged ? 'warning' : 'output',
            text: isPhysicallyUnplugged
              ? '  💡 Conclusión Capa 1: La tarjeta de red está habilitada por software, pero el cable RJ45 está suelto en el Armario Rack 42U (Puerto Gi0/1). Conéctalo para levantar la interfaz.'
              : '  💡 Conclusión Capa 1: Continuidad física verificada en los 8 hilos del latiguillo RJ45 y enlace Gigabit activo con el Switch del Rack.',
          },
        ]);

        recordAuditEvent(
          isPhysicallyUnplugged ? 'EVT-1070' : 'EVT-1071',
          'HARDWARE',
          isPhysicallyUnplugged ? 'WARNING' : 'SUCCESS',
          'Inspección de adaptadores de red (netsh interface show interface)',
          isPhysicallyUnplugged
            ? 'Interfaz Ethernet0: Estado Admin = Habilitado | Estado Físico (Capa 1) = Desconectado (Latiguillo RJ45 sin señal en Rack 42U).'
            : 'Interfaz Ethernet0: Estado Admin = Habilitado | Estado Físico (Capa 1) = Conectado (1000BASE-T Full-Duplex).'
        );

        setSpeaker('alice');
        setAliceExpression(isPhysicallyUnplugged ? 'worried' : 'happy');
        setDialogText(
          isPhysicallyUnplugged
            ? '¡Fíjate en la salida de "netsh interface show interface"! "Ethernet0" aparece con Estado admin. "Habilitado" pero Estado operativo "Desconectado". Eso confirma al 100% un fallo de Capa 1: el cable RJ45 está desconectado en el Rack.'
            : '¡Excelente comprobación de Capa 1 con "netsh interface show interface"! El adaptador "Ethernet0" está tanto "Habilitado" administrativamente como "Conectado" físicamente al Switch del Rack.'
        );
        return;
      }

      appendLines([
        {
          type: 'system',
          text: 'Utilidad de configuración de red NetShell (netsh) - Comandos SMR disponibles:',
        },
        {
          type: 'output',
          text: '  netsh interface show interface         Muestra el estado administrativo y operativo/físico (Capa 1) de los adaptadores.',
        },
        {
          type: 'output',
          text: '  netsh interface ipv4 show interfaces   Muestra el índice de interfaz, MTU y estado de conexión.',
        },
      ]);
      return;
    }

    if (cmdLower.startsWith('netstat')) {
      const args = cmdLower.replace(/^netstat\s*/, '').trim();
      if (args === '/?' || args === '--help' || args === '-h') {
        appendLines([
          { type: 'system', text: 'Muestra estadísticas de protocolo y conexiones TCP/IP actuales (netstat.exe):' },
          {
            type: 'output',
            text: '  netstat -b      Muestra el ejecutable implicado en la creación de cada conexión o puerto de escucha.',
          },
          {
            type: 'output',
            text: '  netstat -ano    Muestra todas las conexiones, puertos en formato numérico y el PID del proceso.',
          },
        ]);
        return;
      }

      const hasBinaryFlag =
        args.includes('b') || cmdLower === 'netstat -b' || cmdLower === 'netstat /b';

      if (hasBinaryFlag) {
        recordAuditEvent(
          'EVT-4008',
          'PROCESOS',
          bucleActivo ? 'WARNING' : 'INFO',
          'Auditoría de sockets y ejecutables asociados (netstat -b)',
          bucleActivo
            ? 'Detectado ejecutable rebelde [bucle.exe] (PID 4812) saturando los puertos TCP 8080 (SYN_SENT) y 4444 (LISTENING).'
            : 'Inspección de ejecutables por puerto completada sin procesos anómalos.'
        );

        const binaryLines: Omit<TerminalLine, 'id'>[] = [
          {
            type: 'system',
            text: 'Conexiones activas (Modo Administrador - Mostrando ejecutables por puerto [-b]):',
          },
          {
            type: 'output',
            text: '  Proto  Dirección local         Dirección remota       Estado          PID',
          },
          {
            type: 'output',
            text: '  ---------------------------------------------------------------------------',
          },
          {
            type: 'output',
            text: '  TCP    0.0.0.0:135             0.0.0.0:0              LISTENING       912',
          },
          {
            type: 'system',
            text: '   RpcSs [svchost.exe]',
          },
          {
            type: 'output',
            text: '  TCP    192.168.1.105:49672     192.168.1.1:443        ESTABLISHED     2140',
          },
          {
            type: 'system',
            text: '   [explorer.exe]',
          },
        ];

        if (antivirusInstalado) {
          binaryLines.push(
            {
              type: 'success',
              text: '  TCP    192.168.1.105:51204     192.168.1.1:8443       ESTABLISHED     3316',
            },
            {
              type: 'success',
              text: '   [antivirus_setup.exe · Servicio Protección Corporativa Activo]',
            }
          );
        }

        if (bucleActivo) {
          binaryLines.push(
            {
              type: 'error',
              text: '  TCP    0.0.0.0:4444            0.0.0.0:0              LISTENING       4812',
            },
            {
              type: 'error',
              text: '   [bucle.exe]  <-- ¡PUERTO ABIERTO POR PROCESO REBELDE (PID 4812)!',
            },
            {
              type: 'error',
              text: '  TCP    127.0.0.1:8080          127.0.0.1:8080         SYN_SENT        4812',
            },
            {
              type: 'error',
              text: '   [bucle.exe]  <-- ¡BUCLE DE CONEXIONES LOCALES (99% CPU)!',
            },
            {
              type: 'warning',
              text: '[Diagnóstico SMR] El ejecutable [bucle.exe] (PID 4812) mantiene abiertos los puertos TCP 4444 y 8080. Hay que terminarlo desde la consola.',
            }
          );

          setSpeaker('alice');
          setAliceExpression('worried');
          setDialogText(
            '¡Bien visto con "netstat -b"! El parámetro -b revela el nombre exacto del ejecutable debajo de cada conexión: [bucle.exe] (PID 4812) está saturando los puertos 4444 y 8080. Toca terminarlo desde la consola, y a la fuerza: está colgado.'
          );
        } else {
          binaryLines.push(
            {
              type: 'output',
              text: '  UDP    0.0.0.0:68              *:*                    DHCP_CLIENT     1104',
            },
            {
              type: 'system',
              text: '   Dhcp [svchost.exe]',
            },
            {
              type: 'success',
              text: '[Diagnóstico SMR] Todos los puertos pertenecen a servicios legítimos del sistema (bucle.exe fue erradicado).',
            }
          );

          setSpeaker('alice');
          setAliceExpression('happy');
          setDialogText(
            '¡Excelente comprobación con "netstat -b"! Todos los puertos activos pertenecen a ejecutables legítimos de Windows ([svchost.exe], [explorer.exe]) y no queda rastro de [bucle.exe].'
          );
        }

        appendLines(binaryLines);
        return;
      }

      appendLines([
        {
          type: 'system',
          text: 'Conexiones activas (Tip: usa "netstat -b" para ver el ejecutable que abrió cada puerto):',
        },
        { type: 'output', text: '  Proto  Dirección local         Dirección remota       Estado          PID' },
        { type: 'output', text: '  TCP    0.0.0.0:135             0.0.0.0:0              LISTENING       912' },
        { type: 'output', text: '  TCP    192.168.1.105:49672     192.168.1.1:443        ESTABLISHED     2140' },
        bucleActivo
          ? {
              type: 'error',
              text: '  TCP    127.0.0.1:8080          127.0.0.1:8080         SYN_SENT        4812 (Usa "netstat -b" para ver el .exe)',
            }
          : { type: 'success', text: '  UDP    0.0.0.0:68              *:*                                    1104' },
      ]);
      return;
    }
    // COMANDO SFC /SCANNOW (VERIFICACIÓN DE INTEGRIDAD DE ARCHIVOS DEL SISTEMA WINDOWS CON PROGRESO SIMULADO)
    if (cmdLower === 'sfc' || cmdLower.startsWith('sfc ')) {
      const sfcArg = cmdLower.replace(/^sfc\s*/, '').trim();

      if (sfcArg === '/scannow' || sfcArg === '-scannow' || sfcArg === '/verifyonly' || sfcArg === '-verifyonly') {
        const isVerifyOnly = sfcArg.includes('verifyonly');

        if (sfcScanIntervalRef.current) {
          window.clearInterval(sfcScanIntervalRef.current);
          sfcScanIntervalRef.current = null;
        }

        const progressLineId = `sfc-progress-${Date.now()}-${Math.random()}`;

        setTerminalLines((prev) => [
          ...prev,
          {
            id: `sfc-hdr-1-${Date.now()}`,
            type: 'output',
            text: 'Iniciando examen del sistema. Este proceso tardará algún tiempo.',
          },
          {
            id: `sfc-hdr-2-${Date.now()}`,
            type: 'output',
            text: 'Iniciando la fase de comprobación del examen del sistema.',
          },
          {
            id: progressLineId,
            type: 'system',
            text: 'Se completó la comprobación del 0%.   [░░░░░░░░░░░░░░░░░░░░] (Inicializando motor CBS y almacén WinSxS...)',
          },
        ]);

        setSpeaker('alice');
        setAliceExpression('thinking');
        setDialogText(
          'Ejecutando "sfc /scannow"... El Comprobador de recursos de Windows está verificando la integridad criptográfica (SHA-256) de todos los archivos críticos en C:\\Windows\\System32.'
        );

        const scanStages = [
          {
            pct: 18,
            bar: '████░░░░░░░░░░░░░░░░',
            detail: 'Verificando núcleo NT (ntoskrnl.exe, hal.dll, winload.efi)...',
          },
          {
            pct: 42,
            bar: '████████░░░░░░░░░░░░',
            detail: 'Verificando pila de red y controladores (tcpip.sys, ndis.sys, dnsrslvr.dll)...',
          },
          {
            pct: 68,
            bar: '██████████████░░░░░░',
            detail: 'Verificando subsistema gráfico y shell (explorer.exe, user32.dll, gdi32.dll)...',
          },
          {
            pct: 91,
            bar: '██████████████████░░',
            detail: 'Contrastando manifiestos del almacén de componentes C:\\Windows\\WinSxS...',
          },
          {
            pct: 100,
            bar: '████████████████████',
            detail: '4.812 archivos críticos verificados (0 infracciones detectadas)',
          },
        ];

        let stageIdx = 0;
        sfcScanIntervalRef.current = window.setInterval(() => {
          const currentStage = scanStages[stageIdx];
          if (!currentStage) {
            if (sfcScanIntervalRef.current) {
              window.clearInterval(sfcScanIntervalRef.current);
              sfcScanIntervalRef.current = null;
            }
            return;
          }

          soundFX.playClick();

          if (currentStage.pct < 100) {
            setTerminalLines((prev) =>
              prev.map((line) =>
                line.id === progressLineId
                  ? {
                      ...line,
                      type: 'system',
                      text: `Se completó la comprobación del ${currentStage.pct}%.  [${currentStage.bar}] (${currentStage.detail})`,
                    }
                  : line
              )
            );
          } else {
            if (sfcScanIntervalRef.current) {
              window.clearInterval(sfcScanIntervalRef.current);
              sfcScanIntervalRef.current = null;
            }

            soundFX.playSuccess();

            setTerminalLines((prev) => [
              ...prev.map((line) =>
                line.id === progressLineId
                  ? {
                      ...line,
                      type: 'system' as const,
                      text: `Se completó la comprobación del 100%. [${currentStage.bar}] (${currentStage.detail})`,
                    }
                  : line
              ),
              {
                id: `sfc-done-1-${Date.now()}`,
                type: 'success',
                text: 'Protección de recursos de Windows no encontró ninguna infracción de integridad.',
              },
              {
                id: `sfc-done-2-${Date.now()}`,
                type: 'success',
                text: `[ESTADO SALUDABLE] El sistema se encuentra saludable y no presenta corrupciones de archivos (${
                  isVerifyOnly ? 'Modo solo verificación' : 'Examen completo /scannow'
                }).`,
              },
              {
                id: `sfc-done-3-${Date.now()}`,
                type: 'output',
                text: '  • Almacén de componentes (WinSxS) : Íntegro (Firmas digitales SHA-256 válidas)',
              },
              {
                id: `sfc-done-4-${Date.now()}`,
                type: 'output',
                text: '  • Archivos críticos System32      : 4.812 examinados · 0 corruptos · 0 reparados',
              },
              {
                id: `sfc-done-5-${Date.now()}`,
                type: 'system',
                text: '  • Registro de auditoría CBS       : C:\\Windows\\Logs\\CBS\\CBS.log',
              },
            ]);

            recordAuditEvent(
              'EVT-3040',
              'SISTEMA',
              'SUCCESS',
              `Verificación de integridad de archivos (${isVerifyOnly ? 'sfc /verifyonly' : 'sfc /scannow'})`,
              'Comprobación del 100% completada: Protección de recursos de Windows confirmó que el sistema está saludable y sin corrupciones en System32 ni WinSxS.'
            );

            setSpeaker('alice');
            setAliceExpression('happy');
            setDialogText(
              '¡Comprobación del 100% completada con "sfc /scannow"! Protección de recursos de Windows ha verificado los 4.812 archivos críticos de System32 y WinSxS y confirma que el sistema está saludable y no tiene archivos corruptos.'
            );
          }

          stageIdx += 1;
        }, 320);

        return;
      }

      appendLines([
        {
          type: 'system',
          text: 'Comprobador de recursos de Microsoft (R) Windows (SFC) Versión 10.0.19045.5131:',
        },
        {
          type: 'output',
          text: '  sfc /scannow       Examina la integridad de todos los archivos protegidos del sistema y repara los archivos con problemas.',
        },
        {
          type: 'output',
          text: '  sfc /verifyonly    Examina la integridad de todos los archivos protegidos del sistema sin realizar reparaciones.',
        },
      ]);
      return;
    }

    // COMANDO POWERCFG /ENERGY (INFORME DE EFICIENCIA ENERGÉTICA Y DIAGNÓSTICO DE LAG POR ALTA CARGA DE CPU)
    if (cmdLower === 'powercfg' || cmdLower.startsWith('powercfg ')) {
      const powerArg = cmdLower.replace(/^powercfg\s*/, '').trim();

      if (powerArg === '/energy' || powerArg === '-energy') {
        const reportPath = `${currentDir}\\energy-report.html`;

        if (bucleActivo) {
          appendLines([
            { type: 'output', text: 'Habilitando seguimiento durante 60 segundos...' },
            { type: 'output', text: 'Observando el comportamiento del sistema y estados ACPI P-State / C-State...' },
            { type: 'output', text: 'Analizando datos de seguimiento...' },
            { type: 'output', text: 'Análisis completado.' },
            { type: 'output', text: '' },
            { type: 'error', text: 'Se encontraron problemas de eficiencia energética que degradan el rendimiento (LAG).' },
            { type: 'output', text: '  3 Errores' },
            { type: 'output', text: '  2 Advertencias' },
            { type: 'output', text: '  6 Informativos' },
            { type: 'output', text: '' },
            {
              type: 'system',
              text: `─── RESUMEN DEL INFORME DE DIAGNÓSTICO (${reportPath}) ───`,
            },
            {
              type: 'error',
              text: '  [ERROR #1] Utilización de CPU: Proceso individual con uso crítico de procesador',
            },
            {
              type: 'output',
              text: '             Nombre de imagen : bucle.exe (PID: 4812)',
            },
            {
              type: 'output',
              text: '             Uso medio de CPU : 99.24% (Saturación de hilos de ejecución)',
            },
            {
              type: 'warning',
              text: '             Impacto          : Causa principal del lag severo del sistema y bloqueo de E/S.',
            },
            {
              type: 'error',
              text: '  [ERROR #2] Directiva de energía del procesador: Estados de reposo ACPI C-State inactivos',
            },
            {
              type: 'output',
              text: '             Tiempo en C0 (Activo) : 100.0% · Tiempo en C3/C6 (Reposo) : 0.0%',
            },
            {
              type: 'output',
              text: '             Motivo                : El proceso bucle.exe impide que la CPU reduzca su voltaje.',
            },
            {
              type: 'error',
              text: '  [ERROR #3] Estrangulamiento térmico (CPU Thermal Throttling) detectado',
            },
            {
              type: 'output',
              text: '             Temperatura paquete   : 94 °C (TDP al 100% · 95W continuos)',
            },
            {
              type: 'output',
              text: '             Frecuencia efectiva   : Reducida a 1.80 GHz (-50%) por protección térmica PROCHOT#.',
            },
            {
              type: 'warning',
              text: '  [ADVERTENCIA #1] Resolución del temporizador de la plataforma alterada (1.0 ms solicitado por bucle.exe).',
            },
            {
              type: 'warning',
              text: '  [ADVERTENCIA #2] Plan de energía activo: Alto rendimiento (Desgaste térmico elevado bajo bucle infinito).',
            },
            { type: 'output', text: '' },
            {
              type: 'system',
              text: `Vea ${reportPath} para obtener más detalles.`,
            },
            {
              type: 'warning',
              text: '💡 DIAGNÓSTICO SMR: El lag del sistema se debe al estrangulamiento térmico provocado por "bucle.exe" (PID 4812) al 99% de CPU. Hay que terminar ese proceso.',
            },
          ]);
          recordAuditEvent(
            'EVT-4020',
            'PROCESOS',
            'WARNING',
            'Informe de eficiencia energética (powercfg /energy)',
            'Informe energético detectó 3 errores críticos: bucle.exe (PID 4812) consume 99.2% CPU, bloquea estados C-State (0%) y provoca Thermal Throttling (94°C).'
          );
          setSpeaker('alice');
          setAliceExpression('worried');
          setDialogText(
            '¡El informe de "powercfg /energy" lo explica todo! El equipo sufre lag porque "bucle.exe" (PID 4812) mantiene la CPU al 99.2%, bloquea los estados de reposo C-State y dispara el Thermal Throttling a 94°C. ¡Hay que terminar ese proceso cuanto antes!'
          );
        } else {
          appendLines([
            { type: 'output', text: 'Habilitando seguimiento durante 60 segundos...' },
            { type: 'output', text: 'Observando el comportamiento del sistema y estados ACPI P-State / C-State...' },
            { type: 'output', text: 'Analizando datos de seguimiento...' },
            { type: 'output', text: 'Análisis completado.' },
            { type: 'output', text: '' },
            { type: 'success', text: 'No se encontraron problemas de eficiencia energética ni cuellos de botella de CPU.' },
            { type: 'output', text: '  0 Errores' },
            { type: 'output', text: '  0 Advertencias' },
            { type: 'output', text: '  8 Informativos' },
            { type: 'output', text: '' },
            {
              type: 'system',
              text: `─── RESUMEN DEL INFORME DE DIAGNÓSTICO (${reportPath}) ───`,
            },
            {
              type: 'success',
              text: '  [OK] Utilización media de CPU      : 3.82% (Sin procesos descontrolados activos)',
            },
            {
              type: 'success',
              text: '  [OK] Estados de reposo ACPI C-State : 88.4% en estado profundo C6 (Ahorro energético óptimo)',
            },
            {
              type: 'success',
              text: '  [OK] Temperatura paquete CPU       : 42 °C · Frecuencia Turbo estable (3.60 GHz · Sin Throttling)',
            },
            {
              type: 'output',
              text: '  [INFO] Resolución del temporizador : 15.6 ms (Estándar predeterminado del kernel NT)',
            },
            {
              type: 'output',
              text: '  [INFO] Plan de energía activo      : Equilibrado (GUID: 381b4222-f694-41f0-9685-ff5bb260df2e)',
            },
            { type: 'output', text: '' },
            {
              type: 'system',
              text: `Vea ${reportPath} para obtener más detalles.`,
            },
          ]);
          recordAuditEvent(
            'EVT-4021',
            'PROCESOS',
            'SUCCESS',
            'Informe de eficiencia energética (powercfg /energy)',
            'Informe de eficiencia energética completado con 0 errores: CPU al 3.8%, C-States activos (88.4% C6) y 42°C sin estrangulamiento térmico.'
          );
          setSpeaker('alice');
          setAliceExpression('happy');
          setDialogText(
            '¡Informe energético impecable! Tras cerrar bucle.exe, "powercfg /energy" muestra 0 errores, la CPU descansa al 3.8% en estado C6 y la temperatura bajó a 42°C sin nada de lag.'
          );
        }
        return;
      }

      if (powerArg === '/list' || powerArg === '-list' || powerArg === '/l' || powerArg === '-l') {
        appendLines([
          { type: 'output', text: '' },
          { type: 'output', text: 'Combinaciones de energía existentes (* Activo)' },
          { type: 'output', text: '-----------------------------------' },
          {
            type: 'output',
            text: `GUID de combinación de energía: 381b4222-f694-41f0-9685-ff5bb260df2e  (Equilibrado) ${!bucleActivo ? '*' : ''}`,
          },
          {
            type: 'output',
            text: `GUID de combinación de energía: 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c  (Alto rendimiento) ${bucleActivo ? '*' : ''}`,
          },
          {
            type: 'output',
            text: 'GUID de combinación de energía: a1841308-3541-4fab-bc81-f71556f20b4a  (Economizador)',
          },
        ]);
        return;
      }

      appendLines([
        { type: 'warning', text: 'Uso de POWERCFG en CyberAcademy SMR:' },
        {
          type: 'output',
          text: '  powercfg /energy   Analiza el sistema durante un ciclo de rastreo y genera un informe de eficiencia energética y uso de CPU.',
        },
        {
          type: 'output',
          text: '  powercfg /list     Lista los planes de energía configurados en el equipo.',
        },
      ]);
      return;
    }

    // MISIÓN 1: PING 192.168.1.1, PING 8.8.8.8 y PING 127.0.0.1
    if (cmdLower.startsWith('ping')) {
      if (cmdLower === 'ping 127.0.0.1' || cmdLower === 'ping localhost') {
        registerDnsCacheEntry([
          {
            recordName: 'localhost.cyberacademy.local',
            recordType: '1 (A - Host IPv4)',
            ttlSeconds: 86400,
            dataLength: 4,
            section: 'Respuesta (Loopback)',
            ipAddress: '127.0.0.1',
            sourceCommand: 'ping 127.0.0.1',
          },
        ]);
        appendLines([
          { type: 'output', text: 'Haciendo ping a 127.0.0.1 con 32 bytes de datos:' },
          { type: 'success', text: 'Respuesta desde 127.0.0.1: bytes=32 tiempo<1ms TTL=128' },
          { type: 'success', text: 'Respuesta desde 127.0.0.1: bytes=32 tiempo<1ms TTL=128' },
          {
            type: 'system',
            text: '[Diagnóstico SMR] El bucle local (loopback) responde: la pila TCP/IP del equipo funciona. Siguiente salto lógico: la puerta de enlace.',
          },
        ]);
        setSpeaker('alice');
        setAliceExpression('happy');
        setDialogText(
          '¡Buen diagnóstico! Hacer ping a 127.0.0.1 confirma que el protocolo TCP/IP de Windows funciona. El problema está más allá de nuestro equipo: comprueba la puerta de enlace.'
        );
        return;
      }

      if (cmdLower === 'ping 8.8.8.8' || cmdLower === 'ping dns.google') {
        const isNetworkActive = linkUp && !(currentMission === 5 && !ipRenovada);

        if (!isNetworkActive) {
          soundFX.playError();
          const failureReason = !linkUp
            ? 'Enlace físico desconectado en Rack (cable_conectado = false)'
            : ipLiberada
            ? 'Dirección IPv4 en 0.0.0.0 (Concesión DHCP liberada, ejecuta ipconfig /renew)'
            : 'Conflicto de dirección IPv4 duplicada (192.168.1.50)';

          recordAuditEvent(
            'EVT-1008',
            'RED_DHCP',
            'CRITICAL',
            'ERROR en comprobación de alcance Google DNS (ping 8.8.8.8)',
            `[ERROR] 4 paquetes perdidos (100%). Causa: ${failureReason}.`
          );

          appendLines([
            {
              type: 'output',
              text: 'Haciendo ping a 8.8.8.8 (Google Public DNS - dns.google) con 32 bytes de datos:',
            },
            {
              type: 'error',
              text: '[ERROR] Red de destino inaccesible / Tiempo de espera agotado para esta solicitud.',
            },
            {
              type: 'error',
              text: '[ERROR] Tiempo de espera agotado para esta solicitud.',
            },
            {
              type: 'error',
              text: '[ERROR] Tiempo de espera agotado para esta solicitud.',
            },
            {
              type: 'error',
              text: '[ERROR] Tiempo de espera agotado para esta solicitud.',
            },
            {
              type: 'warning',
              text: 'Estadísticas de ping para 8.8.8.8: Paquetes: enviados = 4, recibidos = 0, perdidos = 4 (100% perdidos).',
            },
            {
              type: 'error',
              text: `[Diagnóstico WAN/DNS - ERROR] No hay alcance hacia Google DNS (8.8.8.8). Motivo: ${failureReason}.`,
            },
          ]);

          setSpeaker('alice');
          setAliceExpression('worried');
          setDialogText(
            !linkUp
              ? '¡[ERROR] al hacer ping a Google DNS (8.8.8.8)! Si ni siquiera llegamos a la puerta de enlace 192.168.1.1, tampoco saldremos a Internet. Empieza por lo más cercano.'
              : '¡[ERROR] al hacer ping a Google DNS (8.8.8.8)! Mientras tengamos conflicto de IP o la concesión en 0.0.0.0, el router no puede enrutar nuestros paquetes hacia Internet. Completa ipconfig /release e ipconfig /renew.'
          );
        } else {
          populateDefaultArpResolution();
          registerDnsCacheEntry([
            {
              recordName: 'dns.google',
              recordType: '1 (A - Host IPv4)',
              ttlSeconds: 21599,
              dataLength: 4,
              section: 'Respuesta (WAN DNS)',
              ipAddress: '8.8.8.8',
              sourceCommand: 'ping 8.8.8.8',
            },
            {
              recordName: 'one.one.one.one',
              recordType: '1 (A - Host IPv4)',
              ttlSeconds: 14400,
              dataLength: 4,
              section: 'Respuesta (DNS Secundario)',
              ipAddress: '1.1.1.1',
              sourceCommand: 'ping 8.8.8.8',
            },
          ]);
          recordAuditEvent(
            'EVT-1009',
            'RED_DHCP',
            'SUCCESS',
            'SUCCESS en comprobación de alcance Google DNS (ping 8.8.8.8)',
            '[SUCCESS] 4/4 paquetes recibidos desde 8.8.8.8 (TTL=117, 14ms). Entrada dns.google cargada en caché DNS.'
          );

          appendLines([
            {
              type: 'output',
              text: 'Haciendo ping a 8.8.8.8 (Google Public DNS - dns.google) con 32 bytes de datos:',
            },
            {
              type: 'success',
              text: '[SUCCESS] Respuesta desde 8.8.8.8: bytes=32 tiempo=14ms TTL=117',
            },
            {
              type: 'success',
              text: '[SUCCESS] Respuesta desde 8.8.8.8: bytes=32 tiempo=13ms TTL=117',
            },
            {
              type: 'success',
              text: '[SUCCESS] Respuesta desde 8.8.8.8: bytes=32 tiempo=14ms TTL=117',
            },
            {
              type: 'success',
              text: '[SUCCESS] Respuesta desde 8.8.8.8: bytes=32 tiempo=14ms TTL=117',
            },
            {
              type: 'system',
              text: 'Estadísticas de ping para 8.8.8.8: Paquetes: enviados = 4, recibidos = 4, perdidos = 0 (0% perdidos).',
            },
            {
              type: 'success',
              text: '[Diagnóstico WAN/DNS - SUCCESS] Alcance verificado hacia Google DNS (8.8.8.8). Entrada "dns.google" añadida a "ipconfig /displaydns".',
            },
          ]);

          setSpeaker('alice');
          setAliceExpression('happy');
          setDialogText(
            '¡[SUCCESS]! El servidor DNS público de Google (8.8.8.8) responde en 14ms (TTL=117) y se ha guardado en la caché DNS. Puedes consultarla con "ipconfig /displaydns".'
          );
        }
        return;
      }

      if (cmdLower === 'ping 192.168.1.1') {
        if (!linkUp) {
          soundFX.playError();
          recordAuditEvent(
            'EVT-1002',
            'RED_DHCP',
            'WARNING',
            'Fallo de eco ICMP a Puerta de Enlace (192.168.1.1)',
            '4 paquetes perdidos (100%). Causa detectada: Enlace físico desconectado en Rack (cable_conectado = false).'
          );
          appendLines([
            { type: 'output', text: 'Haciendo ping a 192.168.1.1 con 32 bytes de datos:' },
            { type: 'error', text: 'PING: error en la transmisión. Error general.' },
            { type: 'error', text: 'PING: error en la transmisión. Error general.' },
            { type: 'error', text: 'PING: error en la transmisión. Error general.' },
            { type: 'error', text: 'PING: error en la transmisión. Error general.' },
            { type: 'warning', text: 'Paquetes: enviados = 4, recibidos = 0, perdidos = 4 (100% perdidos).' },
          ]);
          setSpeaker('alice');
          setAliceExpression('worried');
          setDialogText(
            '"Error general" no es lo mismo que "Tiempo de espera agotado": el paquete ni siquiera sale del equipo porque la tarjeta de red no tiene enlace. Eso apunta a la Capa 1. ¿Revisamos el cableado?'
          );
        } else {
          populateDefaultArpResolution();
          registerDnsCacheEntry([
            {
              recordName: 'gateway.cyberacademy.local',
              recordType: '1 (A - Host IPv4)',
              ttlSeconds: 3600,
              dataLength: 4,
              section: 'Respuesta (LAN Gateway)',
              ipAddress: '192.168.1.1',
              sourceCommand: 'ping 192.168.1.1',
            },
            {
              recordName: 'switch-rack42u.cyberacademy.local',
              recordType: '1 (A - Host IPv4)',
              ttlSeconds: 3600,
              dataLength: 4,
              section: 'Respuesta (LAN Switch)',
              ipAddress: '192.168.1.2',
              sourceCommand: 'ping 192.168.1.1',
            },
          ]);
          recordAuditEvent(
            'EVT-1003',
            'RED_DHCP',
            'SUCCESS',
            'Verificación ICMP exitosa con Gateway (192.168.1.1)',
            '4/4 paquetes recibidos (TTL=64, 1ms). Entrada gateway.cyberacademy.local cargada en caché DNS.'
          );
          appendLines([
            { type: 'output', text: 'Haciendo ping a 192.168.1.1 con 32 bytes de datos:' },
            { type: 'success', text: 'Respuesta desde 192.168.1.1: bytes=32 tiempo=1ms TTL=64' },
            { type: 'success', text: 'Respuesta desde 192.168.1.1: bytes=32 tiempo=1ms TTL=64' },
            { type: 'success', text: 'Respuesta desde 192.168.1.1: bytes=32 tiempo=1ms TTL=64' },
            { type: 'success', text: 'Respuesta desde 192.168.1.1: bytes=32 tiempo=1ms TTL=64' },
            {
              type: 'system',
              text: 'Paquetes: enviados = 4, recibidos = 4, perdidos = 0 (0% perdidos). [Caché DNS actualizada: usa "ipconfig /displaydns"]',
            },
          ]);
          if (currentMission === 1) {
            markMissionComplete(1);
            setSpeaker('alice');
            setDialogText(
              '¡Genial! El router 192.168.1.1 responde en 1ms sin perder paquetes y su nombre se ha cargado en la caché DNS ("ipconfig /displaydns"). ¡Has completado la Misión 1!'
            );
          }
        }
      } else {
        appendLines([
          {
            type: 'warning',
            text: 'Ejecuta: ping 192.168.1.1 (Gateway), ping 8.8.8.8 (Google DNS) o ping 127.0.0.1 (Loopback)',
          },
        ]);
      }
      return;
    }

    // MISIÓN 2: BOOTREC /FIXMBR & BOOTREC /FIXBOOT (también acepta .\bootrec.exe)
    const normalizedBootCmd = cmdLower.replace(/^\.\\/, '').replace('bootrec.exe', 'bootrec');
    if (normalizedBootCmd.startsWith('bootrec')) {
      if (currentMission !== 2 || winReExited) {
        soundFX.playError();
        appendLines([
          {
            type: 'error',
            text: "'bootrec' no se reconoce como un comando interno o externo, programa o archivo por lotes ejecutable.",
          },
          {
            type: 'system',
            text: '[SMR] bootrec.exe solo existe en el entorno de recuperación (WinRE, X:\\Sources), no en un Windows arrancado con normalidad.',
          },
        ]);
        return;
      }
      if (!usbInsertado) {
        soundFX.playError();
        recordAuditEvent(
          'EVT-2004',
          'BOOT',
          'CRITICAL',
          'Intento fallido de reparación de arranque (BOOTMGR ausente)',
          'Se intentó ejecutar bootrec sin medio de rescate ISO montado (usb_insertado = false).'
        );
        appendLines([
          { type: 'error', text: 'BOOTMGR is missing. Inserta primero el Pendrive USB con la ISO desde el Cajón.' },
        ]);
        setSpeaker('alice');
        setAliceExpression('worried');
        setDialogText(
          'Aún no hemos insertado el Pendrive con la ISO. Haz clic primero en "Cajón / Herramientas" y luego en "PC del Técnico".'
        );
        return;
      }

      if (normalizedBootCmd === 'bootrec /fixmbr') {
        soundFX.playCableSnap();
        setMbrFixed(true);
        recordAuditEvent(
          'EVT-2010',
          'BOOT',
          'SUCCESS',
          'Registro Maestro de Arranque reparado (bootrec /fixmbr)',
          'mbr_fixed: false -> true (Escrito nuevo MBR compatible en Sector 0 del disco principal).'
        );
        appendLines([{ type: 'success', text: 'La operación se completó correctamente.' }]);
        if (bootFixed) {
          markMissionComplete(2);
          setSpeaker('alice');
          setDialogText(
            '¡"La operación se completó correctamente"! El sistema operativo vuelve a arrancar sin el error BOOTMGR. Escribe "exit" para reiniciar desde WinRE (X:\\Sources) o pasa a la Misión 3.'
          );
        } else {
          setSpeaker('alice');
          setAliceExpression('happy');
          setDialogText(
            '¡Muy bien! El MBR se ha reparado ("La operación se completó correctamente"). Ahora escribe: bootrec /fixboot'
          );
        }
      } else if (normalizedBootCmd === 'bootrec /fixboot') {
        soundFX.playCableSnap();
        setBootFixed(true);
        recordAuditEvent(
          'EVT-2011',
          'BOOT',
          'SUCCESS',
          'Sector de arranque de partición reparado (bootrec /fixboot)',
          'boot_fixed: false -> true (Cargador BOOTMGR restaurado desde entorno WinRE X:\\Sources).'
        );
        appendLines([{ type: 'success', text: 'La operación se completó correctamente.' }]);
        if (mbrFixed) {
          markMissionComplete(2);
          setSpeaker('alice');
          setDialogText(
            '¡"La operación se completó correctamente"! El sector de arranque está listo. Escribe "exit" para simular el reinicio del sistema desde WinRE (X:\\Sources) o pasa a la Misión 3.'
          );
        } else {
          setSpeaker('alice');
          setAliceExpression('thinking');
          setDialogText(
            'Sector de arranque reparado. Asegúrate de ejecutar también: bootrec /fixmbr'
          );
        }
      } else if (normalizedBootCmd === 'bootrec /rebuildbcd' || normalizedBootCmd === 'bootrec /scanos') {
        appendLines([
          { type: 'output', text: 'Explorando todos los discos en busca de instalaciones de Windows: [1] C:\\Windows' },
          { type: 'success', text: 'La operación se completó correctamente.' },
        ]);
      } else {
        appendLines([
          { type: 'output', text: 'BOOTREC.EXE - Herramienta de recuperación de Windows' },
          { type: 'output', text: '  /FIXMBR      Escribe un registro de arranque maestro (MBR) compatible en el disco del sistema.' },
          { type: 'output', text: '  /FIXBOOT     Escribe un nuevo sector de arranque en la partición del sistema.' },
          { type: 'output', text: '  /SCANOS      Busca instalaciones de Windows en todos los discos.' },
          { type: 'output', text: '  /REBUILDBCD  Busca instalaciones de Windows y permite agregarlas al almacén BCD.' },
        ]);
      }
      return;
    }

    // MISIÓN 3: ANTIVIRUS_SETUP.EXE /S (soporta ejecución en Descargas o ruta relativa Descargas\antivirus_setup.exe /S)
    if (/^"?[^ ]*antivirus_setup(\.exe)?"?(\s|$)/.test(cmdLower)) {
      if (cmdLower.includes('/?') || cmdLower.includes('--help')) {
        appendLines([
          { type: 'system', text: 'Parámetros del Instalador Corporativo (antivirus_setup.exe):' },
          { type: 'output', text: '  /S          Modo Silencioso (Silent): instala en segundo plano sin GUI. Distingue mayúsculas.' },
          { type: 'output', text: '  /D=<ruta>   Directorio de instalación personalizado.' },
        ]);
        return;
      }

      const avPathMatch = cmdLower.match(/^"?(.*?)antivirus_setup(?:\.exe)?"?(?:\s|$)/);
      const avPrefix = (avPathMatch?.[1] || '').replace(/^\.\\/, '');
      const avReachable =
        avPrefix === ''
          ? effectiveDir === 'C:\\Users\\Tecnico\\Descargas'
          : avPrefix === 'descargas\\'
          ? effectiveDir === 'C:\\Users\\Tecnico'
          : avPrefix === 'c:\\users\\tecnico\\descargas\\';
      if (!avReachable) {
        soundFX.playError();
        appendLines([
          {
            type: 'error',
            text: `'${trimmed.split(' ')[0]}' no se reconoce como un comando interno o externo, programa o archivo por lotes ejecutable.`,
          },
          { type: 'system', text: '[SMR] El instalador no está en esta carpeta: usa "dir" para localizarlo o indica su ruta.' },
        ]);
        return;
      }
      if (currentMission !== 3) {
        appendLines([
          {
            type: 'system',
            text: 'Instalador corporativo: no hay ningún despliegue pendiente en este puesto (el Ticket #304 se trabaja en la Misión 3).',
          },
        ]);
        return;
      }

      // NSIS distingue mayúsculas en sus modificadores: "/S" instala en silencio, "/s" se ignora.
      const avArgs = trimmed.replace(/\s+/g, ' ').split(' ').slice(1);
      const normalizedAv =
        avArgs.length === 0
          ? 'antivirus_setup.exe'
          : avArgs.includes('/S')
          ? 'antivirus_setup.exe /s'
          : avArgs.includes('/s')
          ? 'lowercase-s'
          : 'other';

      if (normalizedAv === 'lowercase-s') {
        soundFX.playError();
        setGuiWarningTriggered(true);
        setHadGuiErrorInM3(true);
        recordAuditEvent(
          'EVT-3005',
          'SOFTWARE',
          'CRITICAL',
          'Incidencia en despliegue de software: modificador /s ignorado',
          'El instalador NSIS distingue mayúsculas: "/s" no es "/S" y se abrió el asistente gráfico (Ticket #304).'
        );
        appendLines([
          {
            type: 'error',
            text: '[ADVERTENCIA] El instalador ha ignorado "/s" y ha abierto su asistente gráfico delante del usuario.',
          },
        ]);
        setSpeaker('alice');
        setAliceExpression('worried');
        setDialogText(
          '¡Ojo! Este instalador está hecho con NSIS y sus modificadores distinguen mayúsculas: "/s" en minúscula no significa nada para él. Consulta su ayuda y vuelve a intentarlo.'
        );
      } else if (normalizedAv === 'antivirus_setup.exe') {
        soundFX.playError();
        setGuiWarningTriggered(true);
        setHadGuiErrorInM3(true);
        recordAuditEvent(
          'EVT-3004',
          'SOFTWARE',
          'CRITICAL',
          'Incidencia en despliegue de software: Interrupción por GUI',
          'Se ejecutó antivirus_setup.exe sin el modificador silencioso /S, abriendo una ventana emergente al usuario (Ticket #304).'
        );
        appendLines([
          {
            type: 'error',
            text: '[ADVERTENCIA] Se ha abierto la interfaz gráfica e interrumpido al usuario.',
          },
        ]);
        setSpeaker('alice');
        setAliceExpression('worried');
        setDialogText(
          '¡Cuidado! Sin el modificador de instalación silenciosa salta el asistente gráfico en pantalla e interrumpes el trabajo del nuevo empleado. Mira qué parámetros admite el instalador.'
        );
      } else if (normalizedAv === 'antivirus_setup.exe /s') {
        setGuiWarningTriggered(false);
        setAntivirusInstalado(true);
        recordAuditEvent(
          'EVT-3010',
          'SOFTWARE',
          'SUCCESS',
          'Instalación desatendida de software completada (/S)',
          'antivirus_instalado: false -> true (Paquete antivirus_setup.exe /S desplegado con código de salida 0).'
        );
        appendLines([
          {
            type: 'success',
            text: 'Despliegue silencioso (/S) completado en segundo plano. (Exit code: 0)',
          },
        ]);
        markMissionComplete(3);
        setSpeaker('alice');
        setDialogText(
          '¡Perfecto! Con antivirus_setup.exe /S el antivirus se ha instalado en silencio sin molestar al empleado. ¡Misión 3 completada!'
        );
      } else {
        appendLines([
          { type: 'warning', text: 'Parámetro no reconocido. Consulta los modificadores admitidos con: antivirus_setup.exe /?' },
        ]);
      }
      return;
    }

    // MISIÓN 4: TASKLIST & TASKKILL /F /IM BUCLE.EXE
    if (cmdLower.startsWith('tasklist')) {
      appendLines([
        { type: 'output', text: 'Nombre de imagen          PID  Sesión        Uso de mem.' },
        { type: 'output', text: '==================== ======== =========== ==============' },
        { type: 'output', text: 'System                      4  Services           148 KB' },
        { type: 'output', text: 'svchost.exe               912  Services        22.180 KB' },
        { type: 'output', text: 'explorer.exe             2140  Console         58.420 KB' },
        currentMission === 4 && !procesoTerminado
          ? {
              type: 'error',
              text: 'bucle.exe                4812  Console      1.894.520 KB [99% CPU BLOQUEADO]',
            }
          : { type: 'success', text: '-- Todos los procesos funcionan con consumo nominal --' },
      ]);
      if (currentMission === 4 && !procesoTerminado) {
        setSpeaker('alice');
        setAliceExpression('worried');
        setDialogText(
          '¡Ahí está el culpable! "bucle.exe" (PID 4812) consume casi 1,9 GB de memoria y no responde. Hay que terminarlo desde la consola... y como está colgado, no atenderá una petición de cierre normal.'
        );
      }
      return;
    }

    if (cmdLower.startsWith('taskkill')) {
      const tkTokens = cmdLower.split(' ').slice(1);
      const tkForce = tkTokens.includes('/f');
      const tkImIdx = tkTokens.indexOf('/im');
      const tkPidIdx = tkTokens.indexOf('/pid');
      const tkTargetsBucle =
        (tkImIdx >= 0 && tkTokens[tkImIdx + 1] === 'bucle.exe') ||
        (tkPidIdx >= 0 && tkTokens[tkPidIdx + 1] === '4812');
      const bucleRunning = currentMission === 4 && !procesoTerminado;
      if (tkTargetsBucle && !bucleRunning) {
        soundFX.playError();
        appendLines([
          {
            type: 'error',
            text:
              tkImIdx >= 0
                ? 'ERROR: no se encontró el proceso "bucle.exe".'
                : 'ERROR: no se encontró el proceso "4812".',
          },
        ]);
        return;
      }
      if (tkTargetsBucle && !tkForce) {
        soundFX.playError();
        appendLines([
          { type: 'error', text: 'ERROR: no se pudo terminar el proceso "bucle.exe" con PID 4812.' },
          { type: 'error', text: 'Motivo: este proceso solo se puede terminar forzosamente (con la opción /F).' },
        ]);
        setSpeaker('alice');
        setAliceExpression('thinking');
        setDialogText(
          'Sin forzar, taskkill solo le pide al programa que se cierre, y un proceso colgado no atiende esa petición. ¿Qué modificador obliga al sistema a terminarlo?'
        );
        return;
      }
      if (tkTargetsBucle && tkForce) {
        setProcesoTerminado(true);
        recordAuditEvent(
          'EVT-4012',
          'PROCESOS',
          'SUCCESS',
          'Terminación forzosa de proceso crítico (bucle.exe PID 4812)',
          'proceso_terminado: false -> true (Liberados 1.894.520 KB de RAM; carga de CPU reducida del 99% al 4%).'
        );
        appendLines([
          {
            type: 'success',
            text: 'CORRECTO: se terminó el proceso "bucle.exe" con PID 4812.',
          },
        ]);
        markMissionComplete(4);
        setSpeaker('alice');
        setDialogText(
          '¡Proceso rebelde eliminado! La oficina vuelve a la normalidad sin fallos ni lag. ¡Misión 4 completada!'
        );
      } else {
        appendLines([
          { type: 'warning', text: 'Sintaxis: TASKKILL [/F] { /IM nombre_imagen | /PID id_proceso }' },
        ]);
      }
      return;
    }

    // MISIÓN 5 Y DIAGNÓSTICO DE RED: IPCONFIG, IPCONFIG /ALL, /RELEASE & /RENEW
    if (cmdLower.startsWith('ipconfig')) {
      const isPhysicalDisconnected = currentMission === 1 && !linkUp;
      const currentIpv4Label = isPhysicalDisconnected
        ? '(sin dirección: medios desconectados)'
        : currentMission === 5
        ? ipRenovada
          ? '192.168.1.105 (Preferido - Concesión activa)'
          : ipLiberada
          ? '0.0.0.0 (Concesión liberada)'
          : '192.168.1.50 (DUPLICADA - CONFLICTO IP)'
        : '192.168.1.105 (Preferido)';

      const ipv4LineType: TerminalLine['type'] =
        isPhysicalDisconnected || (currentMission === 5 && !ipLiberada && !ipRenovada)
          ? 'error'
          : currentMission === 5 && ipLiberada && !ipRenovada
          ? 'warning'
          : 'success';

      // Sin enlace físico Windows no asigna ninguna IP (ni siquiera APIPA): muestra "medios desconectados".
      if (isPhysicalDisconnected && (cmdLower === 'ipconfig' || cmdLower === 'ipconfig /all')) {
        appendLines([
          { type: 'system', text: 'Configuración IP de Windows' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Adaptador de Ethernet Ethernet0:' },
          { type: 'output', text: '' },
          { type: 'error', text: '   Estado de los medios. . . . . . . . . . . : medios desconectados' },
          { type: 'output', text: '   Sufijo DNS específico para la conexión. . : cyberacademy.local' },
          ...(cmdLower === 'ipconfig /all'
            ? [
                { type: 'output' as const, text: '   Descripción . . . . . . . . . . . . . . . : Intel(R) PRO/1000 MT Network Connection' },
                { type: 'output' as const, text: '   Dirección física. . . . . . . . . . . . . : 00-1A-2B-3C-4D-5E' },
                { type: 'output' as const, text: '   DHCP habilitado . . . . . . . . . . . . . : sí' },
                { type: 'output' as const, text: '   Configuración automática habilitada . . . : sí' },
              ]
            : []),
        ]);
        setSpeaker('alice');
        setAliceExpression('thinking');
        setDialogText(
          '"Medios desconectados": la tarjeta no detecta señal en el cable, así que Windows ni siquiera tiene IP. Fíjate en que no es una IP APIPA (169.254.x.x): esa aparecería si hubiera enlace pero el servidor DHCP no contestara.'
        );
        return;
      }

      if (cmdLower === 'ipconfig') {
        appendLines([
          { type: 'system', text: 'Configuración IP de Windows (Resumen - usa "ipconfig /all" para ver DHCP, DNS y topología visual):' },
          { type: 'output', text: 'Adaptador de Ethernet Ethernet0:' },
          { type: 'output', text: '   Sufijo DNS específico para la conexión. . : cyberacademy.local' },
          {
            type: ipv4LineType,
            text: `   Dirección IPv4. . . . . . . . . . . . . . : ${currentIpv4Label}`,
          },
          { type: 'output', text: '   Máscara de subred . . . . . . . . . . . . : 255.255.255.0' },
          {
            type: isPhysicalDisconnected ? 'error' : 'output',
            text: `   Puerta de enlace predeterminada . . . . . : ${
              isPhysicalDisconnected ? '--- (Cable RJ45 desconectado)' : '192.168.1.1'
            }`,
          },
        ]);
      } else if (cmdLower === 'ipconfig /all') {
        const shortIp = isPhysicalDisconnected
          ? '(sin IP)'
          : currentMission === 5
          ? ipRenovada
            ? '192.168.1.105'
            : ipLiberada
            ? '0.0.0.0'
            : '192.168.1.50!'
          : '192.168.1.105';

        const linkDiagram = isPhysicalDisconnected
          ? ' --[X RJ45 SUELTO X]--> '
          : currentMission === 5 && !ipRenovada && !ipLiberada
          ? ' ==[CONFLICTO IP!]==> '
          : ' ====[1 Gbps OK]====> ';

        appendLines([
          { type: 'system', text: '====================================================================' },
          { type: 'system', text: '       CONFIGURACIÓN IP DE WINDOWS DETALLADA (IPCONFIG /ALL)        ' },
          { type: 'system', text: '====================================================================' },
          { type: 'output', text: '   Nombre de host. . . . . . . . . : PC-SOPORTE-SMR01' },
          { type: 'output', text: '   Sufijo DNS principal  . . . . . : cyberacademy.local' },
          { type: 'output', text: '   Tipo de nodo. . . . . . . . . . : Híbrido (Broadcast + Peer)' },
          { type: 'output', text: '   Enrutamiento IP habilitado. . . : No' },
          { type: 'output', text: '   Proxy WINS habilitado . . . . . : No' },
          { type: 'output', text: '' },
          { type: 'warning', text: 'Adaptador de Ethernet Ethernet0 (LAN Oficina de Soporte):' },
          { type: 'output', text: '   Descripción . . . . . . . . . . : Intel(R) PRO/1000 MT Network Connection' },
          { type: 'output', text: '   Dirección física (MAC). . . . . : 00-1A-2B-3C-4D-5E' },
          {
            type: isPhysicalDisconnected ? 'error' : 'success',
            text: `   Estado del medio físico (OSI 1) : ${
              isPhysicalDisconnected
                ? 'Medios desconectados (Latiguillo RJ45 suelto en Rack)'
                : 'Conectado (1000 Mbps Full-Duplex · EIA/TIA-568B)'
            }`,
          },
          { type: 'output', text: '   DHCP habilitado . . . . . . . . : Sí (Ciclo DORA · UDP 67/68)' },
          { type: 'output', text: '   Configuración automática. . . . : Habilitada' },
          {
            type: ipv4LineType,
            text: `   Dirección IPv4. . . . . . . . . : ${currentIpv4Label}`,
          },
          { type: 'output', text: '   Máscara de subred . . . . . . . : 255.255.255.0 (Prefijo /24)' },
          {
            type: 'output',
            text: '   Concesión obtenida (Lease)  . . : miércoles, 4 de noviembre de 2026 08:00:00',
          },
          {
            type: 'output',
            text: '   La concesión expira . . . . . . : jueves, 5 de noviembre de 2026 08:00:00 (TTL 24h)',
          },
          { type: 'output', text: '   Puerta de enlace predeterminada : 192.168.1.1' },
          {
            type: 'system',
            text: '   Servidor DHCP . . . . . . . . . : 192.168.1.1 (Ámbito: 192.168.1.50 - .200)',
          },
          {
            type: 'system',
            text: '   Servidores DNS configurados . . : 192.168.1.1 (DNS Local - cyberacademy.local)',
          },
          {
            type: 'system',
            text: '                                     8.8.8.8     (Google Public DNS Primario)',
          },
          {
            type: 'system',
            text: '                                     1.1.1.1     (Cloudflare DNS Secundario)',
          },
          { type: 'output', text: '   NetBIOS sobre TCP/IP. . . . . . : Habilitado (Puerto 137-139)' },
          { type: 'output', text: '' },
          { type: 'warning', text: '[REPRESENTACIÓN VISUAL DE LA TOPOLOGÍA Y CONFIGURACIÓN DE RED]' },
          {
            type: 'output',
            text: '+--------------------+                        +--------------------+      +-----------------------+',
          },
          {
            type: ipv4LineType,
            text: `| PC-SOPORTE-SMR01   |${linkDiagram}| SWITCH RACK 42U    |=====>| ROUTER / GATEWAY      |`,
          },
          {
            type: 'output',
            text: `| IP: ${shortIp.padEnd(14, ' ')} |                        | Patch Panel Cat6   |      | IP: 192.168.1.1 (/24) |`,
          },
          {
            type: 'output',
            text: '| MAC: 00-1A-2B...5E |                        | VLAN 10 Soporte    |      | DHCP: .50-.200 Activo |',
          },
          {
            type: 'output',
            text: '+--------------------+                        +--------------------+      +-----------+-----------+',
          },
          {
            type: 'system',
            text: '                                                                                      | WAN / FIBRA',
          },
          {
            type: 'system',
            text: '                                                                                      v',
          },
          {
            type: 'success',
            text: '                                                                          [DNS: 8.8.8.8 / 1.1.1.1]',
          },
        ]);

        setSpeaker('alice');
        setAliceExpression('happy');
        setDialogText(
          '¡Excelente diagnóstico con ipconfig /all! Ahí tienes la dirección MAC física, el servidor DHCP (192.168.1.1), los tres servidores DNS (192.168.1.1, 8.8.8.8 y 1.1.1.1) y el esquema visual de nuestra red local.'
        );
      } else if ((cmdLower === 'ipconfig /release' || cmdLower === 'ipconfig /renew') && !linkUp) {
        soundFX.playError();
        appendLines([
          {
            type: 'error',
            text: 'No se puede realizar ninguna operación en Ethernet0 mientras los medios estén desconectados.',
          },
        ]);
      } else if ((cmdLower === 'ipconfig /release' || cmdLower === 'ipconfig /renew') && currentMission !== 5) {
        appendLines(
          cmdLower === 'ipconfig /release'
            ? [
                { type: 'output', text: 'Adaptador de Ethernet Ethernet0:' },
                { type: 'warning', text: '   Dirección IPv4. . . . . . . . . . . . . . : 0.0.0.0 (Concesión liberada)' },
                {
                  type: 'system',
                  text: '[SMR] Este puesto no tiene ningún conflicto de IP: la concesión se recupera automáticamente. (El conflicto se trabaja en la Misión 5.)',
                },
              ]
            : [
                { type: 'output', text: 'Adaptador de Ethernet Ethernet0:' },
                { type: 'success', text: '   Dirección IPv4. . . . . . . . . . . . . . : 192.168.1.105' },
                { type: 'output', text: '   Puerta de enlace predeterminada . . . . . : 192.168.1.1' },
              ]
        );
      } else if (cmdLower === 'ipconfig /release') {
        soundFX.playCableSnap();
        setIpLiberada(true);
        recordAuditEvent(
          'EVT-5010',
          'RED_DHCP',
          'WARNING',
          'Liberación de concesión DHCP (ipconfig /release)',
          'ip_liberada: false -> true (Dirección IPv4 en conflicto 192.168.1.50 liberada -> 0.0.0.0).'
        );
        appendLines([
          { type: 'output', text: 'Configuración IP de Windows - Liberando concesión en Servidor DHCP (192.168.1.1)...' },
          { type: 'output', text: 'Adaptador de Ethernet Ethernet0:' },
          { type: 'warning', text: '   Dirección IPv4. . . . . . . . . . . . . . : 0.0.0.0 (Concesión liberada)' },
          { type: 'output', text: '   Máscara de subred . . . . . . . . . . . . : 0.0.0.0' },
        ]);
        setSpeaker('alice');
        setAliceExpression('thinking');
        setDialogText(
          'Dirección liberada (0.0.0.0). Ahora solicita una nueva concesión al servidor DHCP 192.168.1.1 escribiendo: ipconfig /renew'
        );
      } else if (cmdLower === 'ipconfig /renew') {
        if (!ipLiberada) {
          soundFX.playError();
          appendLines([
            { type: 'warning', text: 'Primero libera la IP en conflicto con: ipconfig /release' },
          ]);
        } else {
          setIpRenovada(true);
          populateDefaultArpResolution();
          registerDnsCacheEntry([
            {
              recordName: 'pc-soporte-smr01.cyberacademy.local',
              recordType: '1 (A - Host IPv4)',
              ttlSeconds: 86400,
              dataLength: 4,
              section: 'Respuesta (DHCP Lease)',
              ipAddress: '192.168.1.105',
              sourceCommand: 'ipconfig /renew',
            },
            {
              recordName: 'dhcp-srv01.cyberacademy.local',
              recordType: '1 (A - Host IPv4)',
              ttlSeconds: 3600,
              dataLength: 4,
              section: 'Respuesta (Servidor DHCP)',
              ipAddress: '192.168.1.1',
              sourceCommand: 'ipconfig /renew',
            },
          ]);
          recordAuditEvent(
            'EVT-5020',
            'RED_DHCP',
            'SUCCESS',
            'Nueva concesión DHCP asignada (ipconfig /renew)',
            'ip_renovada: false -> true (Ciclo DORA completado con Servidor DHCP 192.168.1.1 -> Nueva IP: 192.168.1.105).'
          );
          appendLines([
            { type: 'system', text: '[Ciclo DHCP DORA] Discover -> Offer (192.168.1.1) -> Request -> ACK completado.' },
            { type: 'output', text: 'Adaptador de Ethernet Ethernet0:' },
            {
              type: 'success',
              text: '   Dirección IPv4. . . . . . . . . . . . . . : 192.168.1.105 (Nueva concesión DHCP)',
            },
            { type: 'output', text: '   Máscara de subred . . . . . . . . . . . . : 255.255.255.0' },
            { type: 'output', text: '   Servidor DHCP . . . . . . . . . . . . . . : 192.168.1.1' },
            { type: 'output', text: '   Servidores DNS. . . . . . . . . . . . . . : 192.168.1.1, 8.8.8.8, 1.1.1.1' },
            { type: 'output', text: '   Puerta de enlace predeterminada . . . . . : 192.168.1.1' },
          ]);
          markMissionComplete(5);
          setSpeaker('alice');
          setDialogText(
            '¡Enhorabuena! El servidor DHCP nos ha asignado la nueva IP 192.168.1.105 mediante el ciclo DORA y hemos restablecido la conectividad. ¡Misión 5 superada!'
          );
        }
      } else if (cmdLower === 'ipconfig /displaydns') {
        recordAuditEvent(
          'EVT-5030',
          'RED_DHCP',
          'INFO',
          'Consulta de caché de resolución DNS (ipconfig /displaydns)',
          `Mostradas ${dnsCacheEntries.length} entradas activas en la tabla de resolución de nombres DNS.`
        );

        if (dnsCacheEntries.length === 0) {
          appendLines([
            { type: 'system', text: 'Configuración IP de Windows' },
            {
              type: 'warning',
              text: '   La caché de resolución de DNS está vacía actualmente (tras ejecutar ipconfig /flushdns).',
            },
            {
              type: 'system',
              text: '   Tip SMR: Ejecuta un ping exitoso (ej. "ping 192.168.1.1", "ping 8.8.8.8" o "ping 127.0.0.1") para cargar entradas en la tabla DNS.',
            },
          ]);
          setSpeaker('alice');
          setAliceExpression('thinking');
          setDialogText(
            'La caché de resolución DNS está vacía. Haz un ping exitoso a 192.168.1.1 o a 8.8.8.8 y vuelve a ejecutar "ipconfig /displaydns" para ver cómo se llena la tabla.'
          );
        } else {
          const tableRows: Omit<TerminalLine, 'id'>[] = [
            { type: 'system', text: '===========================================================================' },
            { type: 'system', text: '     CONFIGURACIÓN IP DE WINDOWS · CACHÉ DE RESOLUCIÓN DNS (/DISPLAYDNS)   ' },
            { type: 'system', text: '===========================================================================' },
            {
              type: 'warning',
              text: '[TABLA DE RESOLUCIÓN DE NOMBRES CARGADA TRAS PINGS EXITOSOS]',
            },
            {
              type: 'output',
              text: '+-------------------------------------+-----------------+----------+------------------+',
            },
            {
              type: 'system',
              text: '| NOMBRE DE REGISTRO (FQDN)           | REGISTRO A (IP) | TTL (s)  | ORIGEN EN CACHÉ  |',
            },
            {
              type: 'output',
              text: '+-------------------------------------+-----------------+----------+------------------+',
            },
          ];

          dnsCacheEntries.forEach((entry) => {
            const fqdnCol = entry.recordName.padEnd(35, ' ').slice(0, 35);
            const ipCol = entry.ipAddress.padEnd(15, ' ').slice(0, 15);
            const ttlCol = String(entry.ttlSeconds).padEnd(8, ' ').slice(0, 8);
            const srcCol = entry.sourceCommand.padEnd(16, ' ').slice(0, 16);
            tableRows.push({
              type: entry.sourceCommand.startsWith('ping') ? 'success' : 'output',
              text: `| ${fqdnCol} | ${ipCol} | ${ttlCol} | ${srcCol} |`,
            });
          });

          tableRows.push({
            type: 'output',
            text: '+-------------------------------------+-----------------+----------+------------------+',
          });

          dnsCacheEntries.forEach((entry) => {
            tableRows.push(
              { type: 'output', text: `   ${entry.recordName}` },
              { type: 'output', text: '   ----------------------------------------' },
              { type: 'output', text: `   Nombre de registro. . . . . : ${entry.recordName}` },
              { type: 'output', text: `   Tipo de registro. . . . . . : ${entry.recordType}` },
              { type: 'output', text: `   Tiempo de vida (TTL). . . . : ${entry.ttlSeconds}` },
              { type: 'output', text: `   Longitud de datos . . . . . : ${entry.dataLength}` },
              { type: 'output', text: `   Sección . . . . . . . . . . : ${entry.section}` },
              {
                type: 'success',
                text: `   Registro A (Host) . . . . . : ${entry.ipAddress} (Cargado vía ${entry.sourceCommand})`,
              },
              { type: 'output', text: '' }
            );
          });

          if (dnsCacheEntries.length === 1) {
            tableRows.push({
              type: 'system',
              text: 'Tip SMR: Ejecuta pings exitosos ("ping 192.168.1.1" o "ping 8.8.8.8") para cargar más entradas dinámicas en la caché DNS.',
            });
          }

          appendLines(tableRows);
          setSpeaker('alice');
          setAliceExpression('happy');
          setDialogText(
            `¡Aquí tienes la caché de resolución DNS con "ipconfig /displaydns"! Actualmente muestra ${dnsCacheEntries.length} entrada(s) resuelta(s) en la tabla. Cada ping exitoso a 192.168.1.1 o 8.8.8.8 registra su resolución aquí.`
          );
        }
      } else if (cmdLower === 'ipconfig /flushdns') {
        soundFX.playClick();
        setDnsCacheEntries([]);
        recordAuditEvent(
          'EVT-5031',
          'RED_DHCP',
          'WARNING',
          'Vaciado de caché de resolución DNS (ipconfig /flushdns)',
          'Se purgaron todas las entradas de la tabla de resolución de nombres DNS local.'
        );
        appendLines([
          { type: 'output', text: 'Configuración IP de Windows' },
          {
            type: 'success',
            text: 'Se vació correctamente la caché de resolución de DNS. (Usa "ipconfig /displaydns" para verificarlo).',
          },
        ]);
      } else {
        appendLines([
          {
            type: 'warning',
            text: 'Usa: ipconfig /all, ipconfig /displaydns, ipconfig /flushdns, ipconfig /release o ipconfig /renew',
          },
        ]);
      }
      return;
    }

    soundFX.playError();
    appendLines([
      {
        type: 'error',
        text: `"${trimmed}" no se reconoce en ${effectiveDir}. Escribe "help" o pulsa [TAB] para autocompletar rutas.`,
      },
    ]);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeTerminalCommand(cmdInput);
  };

  /**
   * Manejador de teclado en la consola:
   * - [Ctrl+R]: Abre la búsqueda rápida en el historial persistente (reverse-i-search)
   * - [Ctrl+L]: Limpia la pantalla de la consola (equivalente a cls / clear)
   * - [Ctrl+C]: Cancela la entrada/ejecución actual e imprime la señal de interrupción ^C
   * - [Ctrl+U / Escape]: Borra la línea de entrada actual
   * - [TAB]: Autocompletado cíclico sensible al directorio actual (VFS)
   * - [ArrowUp / ArrowDown]: Navegación por el historial persistente en localStorage
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Atajo Ctrl+R: Abrir búsqueda rápida interactiva en el historial (cmdHistory)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
      e.preventDefault();
      e.stopPropagation();
      openHistorySearch();
      return;
    }

    // Atajo Ctrl+L: Limpiar la pantalla del terminal inmediatamente
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      soundFX.playClick();
      if (sfcScanIntervalRef.current) {
        window.clearInterval(sfcScanIntervalRef.current);
        sfcScanIntervalRef.current = null;
      }
      setTerminalLines([]);
      setTabCycleSeed(null);
      return;
    }

    // Atajo Ctrl+C: Cancelar comando o ejecución actual (si no hay texto seleccionado para copiar)
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      const inputEl = e.currentTarget;
      const hasSelection =
        inputEl.selectionStart !== null &&
        inputEl.selectionEnd !== null &&
        inputEl.selectionStart !== inputEl.selectionEnd;

      if (!hasSelection) {
        e.preventDefault();
        soundFX.playClick();
        if (sfcScanIntervalRef.current) {
          window.clearInterval(sfcScanIntervalRef.current);
          sfcScanIntervalRef.current = null;
        }
        appendLines([
          {
            type: 'warning',
            text: `${effectiveDir}>${cmdInput}^C`,
          },
        ]);
        setCmdInput('');
        setHistoryIdx(-1);
        setTabCycleSeed(null);
        setTabCycleMatches([]);
        return;
      }
    }

    // Atajo Ctrl+U o Escape: Limpiar línea de comando actual
    if ((e.ctrlKey && e.key.toLowerCase() === 'u') || e.key === 'Escape') {
      e.preventDefault();
      soundFX.playClick();
      setCmdInput('');
      setHistoryIdx(-1);
      setTabCycleSeed(null);
      setTabCycleMatches([]);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      soundFX.playClick();

      // Si ya estamos ciclando con Tab sobre una lista de sugerencias, avanzar al siguiente elemento
      if (
        tabCycleSeed !== null &&
        tabCycleMatches.length > 0 &&
        cmdInput === tabCycleMatches[tabCycleIndex]
      ) {
        const nextIndex = (tabCycleIndex + 1) % tabCycleMatches.length;
        setTabCycleIndex(nextIndex);
        setCmdInput(tabCycleMatches[nextIndex]);
        return;
      }

      // Calcular nuevas sugerencias contextuales según el directorio actual (effectiveDir)
      const matches = computeContextualCompletions(cmdInput, effectiveDir);
      if (matches.length > 0) {
        setTabCycleSeed(cmdInput);
        setTabCycleMatches(matches);
        setTabCycleIndex(0);
        setCmdInput(matches[0]);
      }
      return;
    }

    // Atajo Ctrl+P: Navegar hacia atrás en el historial de comandos (alternativa sin usar flechas)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      e.stopPropagation();
      navigateHistoryBackward();
      return;
    }

    // Atajo Ctrl+N: Navegar hacia adelante en el historial de comandos
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      e.stopPropagation();
      navigateHistoryForward();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistoryBackward();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistoryForward();
    }
  };

  // MISIÓN 6: RESPUESTAS HELPDESK
  const handleHelpdeskChoice = (choiceType: HelpdeskChoice) => {
    if (choiceType === 'cold') {
      soundFX.playError();
      setHadHelpdeskMistakeInM6(true);
      setSpeaker('alice');
      setAliceExpression('thinking');
      setDialogText(
        'Técnicamente vas bien encaminado, pero le has soltado una ruta de carpetas a alguien que está al borde del llanto y le has dejado solo. En Helpdesk primero se calma a la persona y luego se resuelve CON ella.'
      );
    } else if (choiceType === 'aggressive') {
      soundFX.playError();
      setHadHelpdeskMistakeInM6(true);
      setSpeaker('alice');
      setAliceExpression('worried');
      setDialogText(
        '¡No elijas esa respuesta! Culpar al usuario ("es tu culpa por no guardar") es agresivo y empeora la incidencia. En Helpdesk debemos calmarle y darle una solución.'
      );
    } else if (choiceType === 'passive') {
      soundFX.playError();
      setHadHelpdeskMistakeInM6(true);
      setSpeaker('alice');
      setAliceExpression('thinking');
      setDialogText(
        'Esa respuesta es pasiva y además falsa: Word guarda copias automáticas. Rendirse deja al usuario sin su informe de 3 horas.'
      );
    } else {
      setHelpdeskResuelto(true);
      markMissionComplete(6);
      setSpeaker('alice');
      setDialogText(
        '¡Misión 6 superada! Has tranquilizado al usuario con empatía y recuperado su informe (.asd) desde Archivo > Información > Administrar documento > Recuperar documentos no guardados. ¡Revisa tus Logros e Insignias arriba!'
      );
    }
  };

  const toggleSound = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    soundFX.setSfxMuted(nextMuted);
  };

  const toggleAmbientSound = () => {
    const nextEnabled = !ambientEnabled;
    setAmbientEnabled(nextEnabled);
    soundFX.setAmbientEnabled(nextEnabled);
  };

  const handleAmbientVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAmbientVolume(val);
    soundFX.setAmbientVolume(val);
    if (val > 0 && !ambientEnabled) {
      setAmbientEnabled(true);
      soundFX.setAmbientEnabled(true);
    } else if (val === 0 && ambientEnabled) {
      setAmbientEnabled(false);
      soundFX.setAmbientEnabled(false);
    }
  };

  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVolume(val);
    soundFX.setSfxVolume(val);
    if (val > 0 && soundMuted) {
      setSoundMuted(false);
      soundFX.setSfxMuted(false);
    } else if (val === 0 && !soundMuted) {
      setSoundMuted(true);
      soundFX.setSfxMuted(true);
    }
  };

  const ensureAmbientStartedOnInteraction = () => {
    if (ambientEnabled && !soundFX.ambientEnabled) {
      soundFX.setAmbientEnabled(true);
    }
  };

  // Solo cuenta el primer intento: después de responder, la pregunta queda cerrada
  const quizAlreadyAnswered =
    completedQuizzes.includes(currentMission) || failedQuizzes.includes(currentMission);

  const handleQuizAnswer = (optionIdx: number) => {
    if (quizAlreadyAnswered) return;
    setQuizSelectedAnswer(optionIdx);
    if (optionIdx === activeTheory.examQuestion.correctIndex) {
      soundFX.playSuccess();
      setCompletedQuizzes((prev) => (prev.includes(currentMission) ? prev : [...prev, currentMission]));
    } else {
      soundFX.playError();
      setFailedQuizzes((prev) => (prev.includes(currentMission) ? prev : [...prev, currentMission]));
    }
  };

  const renderAchievementIcon = (iconType: AchievementDef['iconType'], unlocked: boolean) => {
    const cls = `w-5 h-5 shrink-0 ${unlocked ? 'text-amber-300' : 'text-slate-500'}`;
    switch (iconType) {
      case 'debugger':
        return <Bug className={cls} />;
      case 'network':
        return <Network className={cls} />;
      case 'boot':
        return <HardDrive className={cls} />;
      case 'stealth':
        return <ShieldCheck className={cls} />;
      case 'cpu':
        return <Cpu className={cls} />;
      case 'dhcp':
        return <Activity className={cls} />;
      case 'empathy':
        return <HeartHandshake className={cls} />;
      case 'scholar':
        return <GraduationCap className={cls} />;
    }
  };

  return (
    <div
      onMouseDown={ensureAmbientStartedOnInteraction}
      onKeyDown={ensureAmbientStartedOnInteraction}
      className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-2 lg:p-3 select-none overflow-hidden"
    >
      {/* ===================================================================
          CONTENEDOR PRINCIPAL DEL VIEWPORT (ESTÉTICA VISUAL NOVEL / RPG)
         =================================================================== */}
      <div
        ref={viewportRef}
        onClick={(e) => {
          if (activeSubView !== 'none') return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left - 95;
          moverAlice(clickX, 0, clickX < alicePos.x);
        }}
        className={`relative w-full max-w-[1400px] h-screen sm:h-[92vh] max-h-[840px] rounded-none sm:rounded-2xl border-0 sm:border-2 border-slate-700 bg-[#DDD5C0] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] ${
          currentMission === 4 && !procesoTerminado ? 'scene-cpu-lag' : ''
        }`}
      >
        {/* =================================================================
            NOTIFICACIÓN EMERGENTE (TOAST) DE LOGRO DESBLOQUEADO
           ================================================================= */}
        {recentAchievementToast && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveSubView('achievements');
              setRecentAchievementToast(null);
            }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-amber-950/95 border-2 border-amber-400 rounded-2xl px-5 py-3 shadow-[0_12px_35px_rgba(245,158,11,0.55)] flex items-center gap-3.5 cursor-pointer animate-bounce"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold tracking-wider text-amber-300">
                ¡INSIGNIA DESBLOQUEADA! · CLIC PARA VER LOGROS
              </div>
              <div className="text-sm font-display font-bold text-white">
                {recentAchievementToast.title}
              </div>
              <div className="text-xs text-slate-300">{recentAchievementToast.description}</div>
            </div>
          </div>
        )}

        {/* =================================================================
            MODAL DE CONFIRMACIÓN DE REINICIO RÁPIDO (QUICK RESET)
           ================================================================= */}
        {showResetConfirmModal && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowResetConfirmModal(false);
            }}
            className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 border-2 border-rose-400 rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-slate-100 space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base sm:text-lg text-white">
                    ¿Confirmar Reinicio Rápido (Quick Reset)?
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Esta acción restablecerá el progreso de las 6 misiones, el contador de pistas,
                    las insignias de la sesión actual y el estado del hardware a sus valores iniciales.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Misiones</div>
                  <div className="font-bold text-amber-300">{completedMissions.length}/6</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Logros</div>
                  <div className="font-bold text-emerald-300">
                    {unlockedAchievements.length}/{SMR_ACHIEVEMENTS.length}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Pistas usadas</div>
                  <div className="font-bold text-sky-300">{hintsUsedCount}</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setShowResetConfirmModal(false);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={resetAllProgress}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 border border-rose-400 text-white text-xs font-display font-bold shadow-lg cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sí, Reiniciar Todo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            1. PANEL SUPERIOR METÁLICO DE MISIÓN, CONTROLES DE VOLUMEN E IDENTIDAD
           ================================================================= */}
        <header
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2.5 left-3 right-3 z-40 bg-gradient-to-b from-[#475569]/95 via-[#334155]/95 to-[#1E293B]/95 border-2 border-slate-200 ring-2 ring-slate-900 rounded-xl px-4 py-2 shadow-2xl flex flex-col gap-1.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Izquierda: Logo Un Fantasma en el Sistema + Misión actual */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.unfantasmaenelsistema.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950/95 hover:bg-slate-900 border-2 border-amber-400/80 hover:border-amber-300 text-white transition-all shrink-0 shadow-[0_0_15px_rgba(251,191,36,0.25)]"
                title="Visitar Un Fantasma en el Sistema — https://www.unfantasmaenelsistema.com/"
              >
                <img
                  src={iconoUrl}
                  alt="Logo Un Fantasma en el Sistema"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 object-contain group-hover:scale-110 transition-transform drop-shadow"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-mono font-bold text-amber-300 tracking-wide flex items-center gap-1">
                    UN FANTASMA EN EL SISTEMA
                    <ExternalLink className="w-2.5 h-2.5 text-amber-400" />
                  </span>
                  <span className="text-[11px] font-sans font-semibold text-sky-300 group-hover:underline">
                    unfantasmaenelsistema.com
                  </span>
                </div>
              </a>

              <h1 className="text-white font-display font-semibold text-sm sm:text-base lg:text-lg tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                Misión actual: {activeMissionData.headerTitle}
              </h1>
            </div>

            {/* Derecha: Ubicación + Controles de Volumen Independientes (Ambiente Oficina & SFX) + Logros + Nota */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span className="text-slate-100 font-display font-medium text-xs sm:text-sm lg:text-base drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] hidden xl:inline">
                Ubicación: {activeMissionData.location}
              </span>

              {/* Mezclador de Audio en la Barra Superior: Controles Independientes Ambiente Oficina vs Efectos SFX */}
              <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-500/70 rounded-lg px-2.5 py-1 shadow-inner">
                {/* Canal 1: Bucle de Sonido Ambiente de Oficina (Ventiladores de Servidor + Tecleo Lejano) */}
                <div
                  className="flex items-center gap-1.5"
                  title="Volumen Ambiente de Oficina (Ventiladores del Rack de Servidores + Tecleo Mecánico Lejano)"
                >
                  <button
                    type="button"
                    onClick={toggleAmbientSound}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      ambientEnabled && ambientVolume > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <Fan
                      className={`w-3.5 h-3.5 ${
                        ambientEnabled && ambientVolume > 0 ? 'animate-spin text-emerald-400' : 'text-slate-400'
                      }`}
                      style={{
                        animationDuration:
                          currentMission === 4 && !procesoTerminado ? '0.6s' : '2.8s',
                      }}
                    />
                    <span className="hidden sm:inline">Ambiente</span>
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambientEnabled ? ambientVolume : 0}
                    onChange={handleAmbientVolumeChange}
                    aria-label="Volumen de sonido ambiente de oficina"
                    className="w-14 sm:w-16 h-1.5 accent-emerald-400 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-emerald-300 w-7 text-right hidden md:inline">
                    {ambientEnabled ? `${Math.round(ambientVolume * 100)}%` : 'OFF'}
                  </span>
                </div>

                <div className="h-4 w-[1px] bg-slate-700" />

                {/* Canal 2: Efectos Interactivos SFX (Consola, Cables, Misiones) */}
                <div
                  className="flex items-center gap-1.5"
                  title="Volumen de Efectos de Sonido SFX (Terminal, Conexión RJ45 y Logros)"
                >
                  <button
                    type="button"
                    onClick={toggleSound}
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      !soundMuted && sfxVolume > 0
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {soundMuted || sfxVolume === 0 ? (
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                    )}
                    <span className="hidden sm:inline">SFX</span>
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundMuted ? 0 : sfxVolume}
                    onChange={handleSfxVolumeChange}
                    aria-label="Volumen de efectos de sonido SFX"
                    className="w-14 sm:w-16 h-1.5 accent-sky-400 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-sky-300 w-7 text-right hidden md:inline">
                    {!soundMuted ? `${Math.round(sfxVolume * 100)}%` : 'OFF'}
                  </span>
                </div>
              </div>

              {/* Botón del Panel de Logros (Achievements Overlay) */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveSubView(activeSubView === 'achievements' ? 'none' : 'achievements');
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-colors cursor-pointer shadow ${
                  activeSubView === 'achievements'
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-900/90 hover:bg-slate-950 border-amber-400/60 text-amber-300'
                }`}
                title="Abrir Panel de Logros e Insignias (Expert Debugger)"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Logros ({unlockedAchievements.length}/{SMR_ACHIEVEMENTS.length})</span>
              </button>

              {/* Indicador de Nota Formativa SMR */}
              <button
                type="button"
                onClick={() => setActiveSubView(activeSubView === 'certificate' ? 'none' : 'certificate')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-950 border border-sky-400/60 text-sky-300 text-xs font-mono font-bold cursor-pointer shadow"
                title="Ver Expediente de Evaluación y Diploma SMR"
              >
                <Award className="w-3.5 h-3.5 text-sky-400" />
                <span>Nota: {calculateGrade()}/10</span>
              </button>

              {/* Botón Quick Reset en la barra superior con modal de confirmación */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowResetConfirmModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/90 hover:bg-rose-900 border border-rose-400/70 text-rose-200 text-xs font-mono font-bold cursor-pointer shadow transition-colors"
                title="Reinicio Rápido (Quick Reset) con confirmación de seguridad"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-300" />
                <span className="hidden sm:inline">Quick Reset</span>
              </button>
            </div>
          </div>

          {/* Sub-barra compacta de selector de las 6 misiones, Ficha Teórica y utilidades */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-500/40 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto">
              {MISSIONS.map((m) => {
                const isDone = completedMissions.includes(m.id);
                const isCurrent = currentMission === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => selectMission(m.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 font-bold shadow'
                        : isDone
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900/80'
                        : 'bg-slate-900/60 text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                    <span>{m.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5 text-[11px] text-slate-200 font-mono">
              {/* Botón de Ficha Teórica y Test SMR de la misión actual */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setActiveSubView(activeSubView === 'theory' ? 'none' : 'theory');
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-sans font-semibold transition-colors cursor-pointer ${
                  activeSubView === 'theory'
                    ? 'bg-sky-400 text-slate-950'
                    : 'bg-sky-950/90 hover:bg-sky-900 text-sky-300 border border-sky-500/50'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Teoría y Test SMR</span>
                {completedQuizzes.includes(currentMission) && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                )}
              </button>

              <span className="hidden xl:inline text-slate-500">·</span>
              <span className="hidden xl:inline">
                Pistas: <strong className={hintsUsedCount === 0 ? 'text-emerald-300' : 'text-amber-300'}>{hintsUsedCount}</strong>
              </span>
              <span className="hidden xl:inline text-slate-500">·</span>
              {import.meta.env.MODE !== 'offline' && (
                <a
                  href={`${import.meta.env.BASE_URL}cyberacademy-smr-offline.html`}
                  download="cyberacademy-smr-offline.html"
                  className="inline-flex items-center gap-1 text-sky-300 hover:underline cursor-pointer"
                  title="Descarga la app completa en un único archivo .html que funciona sin conexión (Moodle, pendrive, aula sin Internet)"
                >
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">Versión offline</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowResetConfirmModal(true);
                }}
                className="inline-flex items-center gap-1 text-rose-300 hover:text-rose-200 cursor-pointer"
                title="Abrir confirmación de Reinicio Rápido (Quick Reset)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reiniciar</span>
              </button>
            </div>
          </div>
        </header>

        {/* =================================================================
            2. ESCENARIO DE FONDO ANIME "OFICINA DE SOPORTE"
           ================================================================= */}
        <OfficeSceneSVG
          currentMission={currentMission}
          cableConectado={linkUp}
          usbRecogido={usbRecogido}
          usbInsertado={usbInsertado}
          bootReparado={mbrFixed && bootFixed}
          antivirusInstalado={antivirusInstalado}
          procesoTerminado={procesoTerminado}
          ipRenovada={ipRenovada}
          helpdeskResuelto={helpdeskResuelto}
        />

        {/* Notificaciones de Windows en Misión 4 (Lag CPU) y Misión 5 (Conflicto IP) */}
        {currentMission === 4 && !procesoTerminado && (
          <div className="absolute top-24 left-4 z-20 bg-rose-950/95 border-2 border-rose-400 text-rose-100 px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2.5 text-xs pointer-events-none">
            <Cpu className="w-4 h-4 text-rose-300 shrink-0" />
            <span>
              <strong>ALERTA CPU 99%:</strong> el sistema no responde con normalidad.
            </span>
          </div>
        )}

        {currentMission === 5 && !ipRenovada && (
          <div className="absolute top-24 left-4 z-20 bg-amber-950/95 border-2 border-amber-400 text-amber-100 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 text-xs pointer-events-none">
            <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
            <div>
              <div className="font-bold text-amber-200">
                Windows ha detectado un conflicto de dirección IP (192.168.1.50)
              </div>
              <div>
                Otro equipo de la red usa esta dirección. Puede que pierdas la conexión.
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            3. HOTSPOTS CON ANILLOS CIRCULARES BLANCOS LUMINOSOS Y TOOLTIPS DIDÁCTICOS
           ================================================================= */}

        {/* HOTSPOT: PC del Técnico */}
        <button
          type="button"
          onClick={handleHotspotPC}
          className="group absolute left-[20%] top-[43%] z-20 flex items-center justify-center cursor-pointer focus:outline-none"
          aria-label="PC del Técnico: Consola de comandos y diagnóstico"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3.5px] border-white/95 bg-sky-400/15 shadow-[0_0_24px_rgba(255,255,255,0.95),inset_0_0_14px_rgba(255,255,255,0.6)] group-hover:scale-108 transition-transform flex items-center justify-center">
            <span
              className="text-white font-display font-bold text-xs sm:text-base whitespace-nowrap px-2 py-0.5 rounded"
              style={{
                textShadow:
                  '-1.5px -1.5px 0 #0f172a, 1.5px -1.5px 0 #0f172a, -1.5px 1.5px 0 #0f172a, 1.5px 1.5px 0 #0f172a, 0 2px 6px rgba(0,0,0,0.9)',
              }}
            >
              PC del Técnico
            </span>
          </div>

          {/* Tooltip sutil al pasar el ratón */}
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-56 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 transition-all duration-200 z-30">
            <div className="bg-slate-950/95 border border-sky-400/70 rounded-xl px-3 py-2 shadow-xl text-left">
              <div className="text-[11px] font-display font-bold text-sky-300 flex items-center justify-between">
                <span>Estación de Diagnóstico</span>
                <span className="font-mono text-[9px] text-emerald-400">CMD / WinRE</span>
              </div>
              <p className="text-[10px] text-slate-200 leading-snug mt-0.5">
                Abre el terminal para ejecutar <code className="text-amber-300">ping</code>,{' '}
                <code className="text-amber-300">bootrec</code>,{' '}
                <code className="text-amber-300">taskkill</code> o{' '}
                <code className="text-amber-300">ipconfig</code> e insertar el USB.
              </p>
            </div>
          </div>
        </button>

        {/* HOTSPOT: Rack de Comunicaciones */}
        <button
          type="button"
          onClick={handleHotspotRack}
          className="group absolute left-[60%] top-[28%] z-20 flex items-center justify-center cursor-pointer focus:outline-none"
          aria-label="Rack de Comunicaciones: Armario de red y patch panel"
        >
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3.5px] transition-transform group-hover:scale-108 flex flex-col items-center justify-center ${
              currentMission === 1 && !linkUp
                ? 'border-amber-300 bg-amber-400/20 shadow-[0_0_28px_rgba(251,191,36,0.95),inset_0_0_14px_rgba(251,191,36,0.6)]'
                : 'border-white/95 bg-white/10 shadow-[0_0_24px_rgba(255,255,255,0.95),inset_0_0_14px_rgba(255,255,255,0.6)]'
            }`}
          >
            <span
              className="text-white font-display font-bold text-xs sm:text-base whitespace-nowrap"
              style={{
                textShadow:
                  '-1.5px -1.5px 0 #0f172a, 1.5px -1.5px 0 #0f172a, -1.5px 1.5px 0 #0f172a, 1.5px 1.5px 0 #0f172a, 0 2px 6px rgba(0,0,0,0.9)',
              }}
            >
              Rack de Comunicaciones
            </span>
            {currentMission === 1 && !linkUp && (
              <span className="mt-1 px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[10px] shadow">
                ¡Cable suelto!
              </span>
            )}
          </div>

          {/* Tooltip sutil al pasar el ratón */}
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-60 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 transition-all duration-200 z-30">
            <div className="bg-slate-950/95 border border-amber-400/70 rounded-xl px-3 py-2 shadow-xl text-left">
              <div className="text-[11px] font-display font-bold text-amber-300 flex items-center justify-between">
                <span>Armario Rack 42U (Capa 1)</span>
                <span className="font-mono text-[9px] text-sky-300">
                  {linkUp ? 'LINK UP' : 'LINK DOWN'}
                </span>
              </div>
              <p className="text-[10px] text-slate-200 leading-snug mt-0.5">
                Inspecciona el Switch, conecta latiguillos RJ45 sueltos y verifica los 8 pines de la norma EIA/TIA-568B.
              </p>
            </div>
          </div>
        </button>

        {/* HOTSPOT: Cajón de Herramientas / Inventario */}
        <button
          type="button"
          onClick={handleHotspotDrawer}
          className="group absolute left-[31%] top-[59%] z-20 flex items-center justify-center cursor-pointer focus:outline-none"
          aria-label="Cajón de Herramientas: Medios de rescate USB e inventario"
        >
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] transition-transform group-hover:scale-108 flex flex-col items-center justify-center ${
              currentMission === 2 && !usbRecogido
                ? 'border-amber-300 bg-amber-400/25 shadow-[0_0_25px_rgba(251,191,36,0.95)]'
                : 'border-white/90 bg-white/10 shadow-[0_0_18px_rgba(255,255,255,0.85)]'
            }`}
          >
            <span
              className="text-white font-display font-bold text-[11px] sm:text-sm whitespace-nowrap"
              style={{
                textShadow:
                  '-1.5px -1.5px 0 #0f172a, 1.5px -1.5px 0 #0f172a, -1.5px 1.5px 0 #0f172a, 1.5px 1.5px 0 #0f172a, 0 2px 6px rgba(0,0,0,0.9)',
              }}
            >
              Cajón / Herramientas
            </span>
            {currentMission === 2 && !usbRecogido && (
              <span className="mt-0.5 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[9px]">
                ¡Recoger USB!
              </span>
            )}
          </div>

          {/* Tooltip sutil al pasar el ratón */}
          <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-56 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 transition-all duration-200 z-30">
            <div className="bg-slate-950/95 border border-rose-400/70 rounded-xl px-3 py-2 shadow-xl text-left">
              <div className="text-[11px] font-display font-bold text-rose-300 flex items-center justify-between">
                <span>Inventario y Rescate</span>
                <span className="font-mono text-[9px] text-amber-300">
                  {usbRecogido ? 'USB en mano' : 'ISO Win10'}
                </span>
              </div>
              <p className="text-[10px] text-slate-200 leading-snug mt-0.5">
                Recoge el Pendrive USB con la ISO de recuperación y configura la prioridad de arranque BIOS/UEFI.
              </p>
            </div>
          </div>
        </button>

        {/* =================================================================
            4. VENTANA FLOTANTE DE TERMINAL DE COMANDOS (CON TEMAS VISUALES, TAB VFS Y LOCALSTORAGE)
           ================================================================= */}
        {terminalVisible && currentMission !== 6 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute z-30 flex flex-col transition-all ${activeTerminalTheme.windowContainer} ${
              terminalExpanded
                ? 'left-[8%] right-[8%] top-[18%] bottom-[30%]'
                : 'left-[max(39%,calc(31%_+_104px))] top-[calc(28%_+_124px)] w-[340px] sm:w-[min(450px,calc(69%_-_112px))] lg:w-[490px] h-[min(285px,calc(72%_-_290px))] min-h-[150px]'
            }`}
          >
            {/* Barra de título / Menú del Terminal adaptable al tema activo */}
            <div
              className={`px-2.5 py-1 text-[11px] font-sans font-semibold flex items-center justify-between shrink-0 ${activeTerminalTheme.titleBar}`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className={`px-1 py-0.2 font-mono text-[9px] font-bold ${activeTerminalTheme.titleBadge}`}
                >
                  {terminalTheme === 'win95' ? 'MS-DOS' : terminalTheme === 'powershell' ? 'PS>' : 'C:\\_'}
                </span>
                <span className="truncate">
                  {effectiveDir === 'X:\\Sources'
                    ? 'Administrador: X:\\Sources\\cmd.exe (WinRE)'
                    : terminalTheme === 'win95'
                    ? 'MS-DOS Prompt - COMMAND.COM'
                    : 'Terminal de comandos'}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Botón del Menú de Temas Visuales del Terminal */}
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setTerminalThemeMenuOpen((prev) => !prev);
                  }}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${activeTerminalTheme.menuButton}`}
                  title="Cambiar tema visual del terminal (Matrix Green, Windows 95, High Contrast, PowerShell)"
                >
                  <Palette className="w-2.5 h-2.5" />
                  <span>Tema: {activeTerminalTheme.shortLabel}</span>
                </button>

                {/* Botón del Panel Flotante de Auditoría del Sistema Virtual */}
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setTerminalAuditOpen((prev) => !prev);
                  }}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                    terminalAuditOpen
                      ? 'bg-emerald-500 text-slate-950 font-bold border border-white'
                      : activeTerminalTheme.menuButton
                  }`}
                  title="Abrir/Cerrar el Panel Flotante de Auditoría del Sistema Virtual (Rack, Arranque, Software, Procesos, DHCP)"
                >
                  <ClipboardList className="w-2.5 h-2.5" />
                  <span>Auditoría ({auditLog.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isHistorySearchOpen) {
                      setIsHistorySearchOpen(false);
                      terminalInputRef.current?.focus();
                    } else {
                      openHistorySearch();
                    }
                  }}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                    isHistorySearchOpen
                      ? 'bg-amber-400 text-slate-950 font-bold border border-white'
                      : activeTerminalTheme.menuButton
                  }`}
                  title="Búsqueda rápida en el historial persistente de comandos [Ctrl+R]"
                >
                  <Search className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">Ctrl+R</span>
                  <span>({cmdHistory.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => executeTerminalCommand('history')}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${activeTerminalTheme.menuButton}`}
                  title="Ver historial persistente guardado en localStorage"
                >
                  <History className="w-2.5 h-2.5" />
                  <span className="hidden sm:inline">Historial</span>
                </button>
                {currentMission === 3 && (
                  <button
                    type="button"
                    onClick={() => setActiveSubView('ticket')}
                    className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-bold cursor-pointer"
                  >
                    Ticket #304
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveSubView('theory')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${activeTerminalTheme.menuButton}`}
                  title="Ver explicación técnica de los comandos"
                >
                  ¿Por qué?
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalExpanded(!terminalExpanded)}
                  className={`p-0.5 cursor-pointer ${activeTerminalTheme.windowControlBtn}`}
                  title="Maximizar / Restaurar tamaño"
                >
                  <Square className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalVisible(false)}
                  className={`p-0.5 cursor-pointer ${activeTerminalTheme.closeControlBtn}`}
                  title="Minimizar / Cerrar terminal"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Menú desplegable de selección de Tema Visual en la cabecera del terminal */}
            {terminalThemeMenuOpen && (
              <div
                className={`px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-mono shrink-0 ${activeTerminalTheme.menuBarBg}`}
              >
                <span className="font-bold flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  <span>Tema Visual:</span>
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {(Object.values(TERMINAL_THEMES) as TerminalThemeConfig[]).map((themeOpt) => {
                    const isSelected = terminalTheme === themeOpt.id;
                    return (
                      <button
                        key={themeOpt.id}
                        type="button"
                        onClick={() => selectTerminalTheme(themeOpt.id)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-white font-bold shadow-sm scale-105'
                            : 'bg-slate-950/80 hover:bg-slate-800 text-slate-200 border-slate-600'
                        }`}
                        title={`${themeOpt.label} (${themeOpt.colorCmd})`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/60 shrink-0"
                          style={{
                            backgroundColor: themeOpt.swatchBg,
                            boxShadow: `inset 0 0 0 2px ${themeOpt.swatchFg}`,
                          }}
                        />
                        <span>{themeOpt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Aviso si intentó ejecutar antivirus_setup.exe sin /S */}
            {guiWarningTriggered && (
              <div className="bg-amber-950 border-b border-amber-500 px-2.5 py-1 text-[10px] text-amber-200 flex items-center justify-between">
                <span>¡Alerta! Saltó la ventana gráfica. Añade el parámetro /S</span>
                <button
                  type="button"
                  onClick={() => setGuiWarningTriggered(false)}
                  className="underline text-amber-300 ml-2 cursor-pointer"
                >
                  OK
                </button>
              </div>
            )}

            {/* Simulación visual de Reinicio del Sistema (POST BIOS / WinRE exit / shutdown /r) */}
            {isSimulatingReboot && (
              <div className="bg-sky-950/95 border-b border-sky-400 px-3 py-1.5 text-[10px] font-mono text-sky-200 flex items-center justify-between animate-pulse shrink-0">
                <span className="flex items-center gap-1.5 font-bold">
                  <RotateCcw className="w-3 h-3 animate-spin text-amber-300" />
                  <span>{rebootOverlayLabel}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-sky-800 text-amber-300 font-bold">
                  REBOOT
                </span>
              </div>
            )}

            {/* Cuerpo de consola adaptable al tema visual seleccionado */}
            <div
              onClick={() => terminalInputRef.current?.focus()}
              className={`flex-1 p-2.5 overflow-y-auto font-mono text-[11px] sm:text-xs leading-relaxed space-y-0.5 select-text cursor-text ${activeTerminalTheme.bodyBg}`}
            >
              {terminalLines.map((line) => (
                <div
                  key={line.id}
                  className={`whitespace-pre-wrap break-words flex items-center justify-between gap-2 ${
                    line.type === 'error'
                      ? activeTerminalTheme.textError
                      : line.type === 'warning'
                      ? activeTerminalTheme.textWarning
                      : line.type === 'system'
                      ? activeTerminalTheme.textSystem
                      : line.type === 'success'
                      ? activeTerminalTheme.textSuccess
                      : activeTerminalTheme.textDefault
                  }`}
                >
                  <span>{line.text}</span>
                  {line.replayCommand && (
                    <span className="inline-flex items-center gap-1 shrink-0 select-none">
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          soundFX.playClick();
                          setCmdInput(line.replayCommand || '');
                          terminalInputRef.current?.focus();
                        }}
                        className="px-1.5 py-0.2 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[9px] text-sky-300 font-mono cursor-pointer"
                        title={`Cargar "${line.replayCommand}" en la línea de entrada`}
                      >
                        Cargar
                      </button>
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (line.replayCommand) {
                            executeTerminalCommand(line.replayCommand);
                          }
                        }}
                        className="px-1.5 py-0.2 rounded bg-emerald-900/80 hover:bg-emerald-500 text-emerald-200 hover:text-slate-950 border border-emerald-500/60 text-[9px] font-bold font-mono cursor-pointer transition-colors"
                        title={`Ejecutar "${line.replayCommand}" inmediatamente`}
                      >
                        ▶ Ejecutar
                      </button>
                    </span>
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Barra de Autocompletado Contextual [TAB] según el directorio actual del VFS */}
            <div
              className={`px-2 py-1 flex items-center gap-1.5 overflow-x-auto ${activeTerminalTheme.tabBarBg}`}
            >
              <span
                className={`inline-flex items-center gap-1 text-[9px] font-mono shrink-0 ${activeTerminalTheme.tabLabel}`}
              >
                <FolderOpen className="w-2.5 h-2.5" />
                <span>[TAB en {effectiveDir.split('\\').pop()}]:</span>
              </span>
              {liveTabSuggestions.map((sug, idx) => {
                const isCyclingThis =
                  tabCycleSeed !== null &&
                  tabCycleMatches[tabCycleIndex] === sug;
                return (
                  <button
                    key={`${sug}-${idx}`}
                    type="button"
                    onClick={() => {
                      setCmdInput(sug);
                      terminalInputRef.current?.focus();
                    }}
                    onDoubleClick={() => executeTerminalCommand(sug)}
                    title="Clic para autocompletar · Doble clic para ejecutar"
                    className={`px-1.5 py-0.5 rounded border text-[10px] font-mono whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      isCyclingThis
                        ? activeTerminalTheme.tabChipActive
                        : activeTerminalTheme.tabChipIdle
                    }`}
                  >
                    {sug}
                  </button>
                );
              })}
            </div>

            {/* Panel de Auditoría Flotante dentro de la vista del Terminal */}
            {terminalAuditOpen && (
              <TerminalAuditPanel
                entries={auditLog}
                systemState={{
                  // Cada avería solo está pendiente dentro de su propia misión
                  cableConectado: linkUp,
                  usbRecogido,
                  usbInsertado,
                  mbrFixed: mbrFixed || currentMission !== 2,
                  bootFixed: bootFixed || currentMission !== 2,
                  antivirusInstalado: antivirusInstalado || currentMission !== 3,
                  procesoTerminado: !bucleActivo,
                  ipLiberada: ipLiberada && currentMission === 5,
                  ipRenovada: ipRenovada || currentMission !== 5,
                }}
                onClose={() => {
                  soundFX.playClick();
                  setTerminalAuditOpen(false);
                }}
                onClearAuditLog={() => {
                  soundFX.playClick();
                  setAuditLog(createInitialAuditLog());
                }}
                onPrintToTerminal={() => {
                  soundFX.playClick();
                  setTerminalAuditOpen(false);
                  appendLines([
                    {
                      type: 'system',
                      text: `=== REGISTRO DE AUDITORÍA DEL SISTEMA VIRTUAL (${auditLog.length} eventos) ===`,
                    },
                    ...auditLog
                      .slice(0, 12)
                      .reverse()
                      .map((ev) => ({
                        type:
                          ev.severity === 'CRITICAL'
                            ? ('error' as const)
                            : ev.severity === 'WARNING'
                            ? ('warning' as const)
                            : ev.severity === 'SUCCESS'
                            ? ('success' as const)
                            : ('output' as const),
                        text: `[${ev.timestamp}] [${ev.eventId} · M${ev.missionId} · ${ev.category}] ${ev.action} -> ${ev.details}`,
                      })),
                  ]);
                }}
              />
            )}

            {/* Interfaz de Búsqueda Rápida en el Historial Persistente [Ctrl+R] (reverse-i-search) */}
            {isHistorySearchOpen && (
              <div className="bg-slate-950/98 border-t-2 border-amber-400 px-2.5 py-2 font-mono text-[11px] text-slate-100 space-y-1.5 shrink-0 shadow-[0_-8px_25px_rgba(0,0,0,0.85)] z-20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-bold">
                    <Search className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>(reverse-i-search) [Ctrl+R · Historial Persistente]:</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                    <span className="hidden sm:inline">
                      [↑/↓ o Ctrl+R] Ciclar · [Tab] Autocompletar · [Enter] Ejecutar · [Esc] Salir
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsHistorySearchOpen(false);
                        terminalInputRef.current?.focus();
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white cursor-pointer"
                      title="Cerrar búsqueda Ctrl+R (Esc)"
                    >
                      Esc
                    </button>
                  </div>
                </div>

                {/* Campo de entrada con previsualización de autocompletado en tiempo real */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-400/60 rounded-lg px-2 py-1">
                  <span className="text-amber-400 font-bold shrink-0">Buscar&gt;</span>
                  <div className="relative flex-1 flex items-center overflow-hidden">
                    <input
                      ref={historySearchInputRef}
                      type="text"
                      value={historySearchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHistorySearchQuery(val);
                        setHistorySearchSelectedIdx(0);
                      }}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
                          e.preventDefault();
                          e.stopPropagation();
                          soundFX.playClick();
                          if (historySearchMatches.length > 0) {
                            const nextIdx =
                              (historySearchSelectedIdx + 1) % historySearchMatches.length;
                            setHistorySearchSelectedIdx(nextIdx);
                            setCmdInput(historySearchMatches[nextIdx].cmd);
                          }
                          return;
                        }
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          soundFX.playClick();
                          if (historySearchMatches.length > 0) {
                            const nextIdx =
                              (historySearchSelectedIdx + 1) % historySearchMatches.length;
                            setHistorySearchSelectedIdx(nextIdx);
                            setCmdInput(historySearchMatches[nextIdx].cmd);
                          }
                          return;
                        }
                        if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          soundFX.playClick();
                          if (historySearchMatches.length > 0) {
                            const prevIdx =
                              (historySearchSelectedIdx - 1 + historySearchMatches.length) %
                              historySearchMatches.length;
                            setHistorySearchSelectedIdx(prevIdx);
                            setCmdInput(historySearchMatches[prevIdx].cmd);
                          }
                          return;
                        }
                        if (e.key === 'Tab' || e.key === 'ArrowRight') {
                          e.preventDefault();
                          soundFX.playClick();
                          if (activeHistorySearchMatch) {
                            setCmdInput(activeHistorySearchMatch.cmd);
                          }
                          setIsHistorySearchOpen(false);
                          window.setTimeout(() => terminalInputRef.current?.focus(), 20);
                          return;
                        }
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const targetCmd =
                            activeHistorySearchMatch?.cmd || historySearchQuery.trim();
                          setIsHistorySearchOpen(false);
                          if (targetCmd) {
                            executeTerminalCommand(targetCmd);
                          }
                          window.setTimeout(() => terminalInputRef.current?.focus(), 20);
                          return;
                        }
                        if (
                          e.key === 'Escape' ||
                          (e.ctrlKey && (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'g'))
                        ) {
                          e.preventDefault();
                          soundFX.playClick();
                          setIsHistorySearchOpen(false);
                          window.setTimeout(() => terminalInputRef.current?.focus(), 20);
                        }
                      }}
                      placeholder="Escribe parte del comando (ej: ipconfig, bootrec, ping, /S)..."
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full bg-transparent text-white outline-none text-xs placeholder:text-slate-500"
                    />
                  </div>
                  {activeHistorySearchMatch && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setCmdInput(activeHistorySearchMatch.cmd);
                        setIsHistorySearchOpen(false);
                        window.setTimeout(() => terminalInputRef.current?.focus(), 20);
                      }}
                      className="px-1.5 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 border border-amber-400/50 text-[9px] font-bold shrink-0 cursor-pointer transition-colors"
                      title="Insertar comando en el prompt sin ejecutar [Tab]"
                    >
                      Autocompletar [Tab]
                    </button>
                  )}
                </div>

                {/* Lista de resultados y autocompletado en tiempo real sobre cmdHistory */}
                <div className="max-h-28 overflow-y-auto space-y-1 pr-0.5">
                  {historySearchMatches.length === 0 ? (
                    <div className="text-[10px] text-rose-300 py-1 px-2 bg-rose-950/40 border border-rose-500/30 rounded">
                      No hay coincidencias en el historial para &quot;{historySearchQuery}&quot;.
                    </div>
                  ) : (
                    historySearchMatches.map((item, idx) => {
                      const isSelected = idx === historySearchSelectedIdx;
                      return (
                        <div
                          key={`${item.cmd}-${idx}`}
                          onClick={() => {
                            soundFX.playClick();
                            setHistorySearchSelectedIdx(idx);
                            setCmdInput(item.cmd);
                            setIsHistorySearchOpen(false);
                            window.setTimeout(() => terminalInputRef.current?.focus(), 20);
                          }}
                          onDoubleClick={() => {
                            setIsHistorySearchOpen(false);
                            executeTerminalCommand(item.cmd);
                          }}
                          className={`flex items-center justify-between gap-2 px-2 py-1 rounded border text-[10px] cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 font-bold'
                              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className={`px-1 py-0.2 rounded text-[8px] font-bold shrink-0 ${
                                item.fromHistory
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                                  : 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                              }`}
                            >
                              {item.fromHistory ? `HIST #${item.historyOrder}` : 'SUGERENCIA'}
                            </span>
                            <span className="truncate">{item.cmd}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setIsHistorySearchOpen(false);
                              executeTerminalCommand(item.cmd);
                            }}
                            className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-400 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-[9px] font-bold shrink-0 cursor-pointer"
                            title="Ejecutar inmediatamente [Enter]"
                          >
                            Ejecutar ↵
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Input del prompt adaptable al tema visual */}
            <form
              onSubmit={handleTerminalSubmit}
              className={`px-2.5 py-1.5 flex items-center gap-1 font-mono text-[11px] sm:text-xs ${activeTerminalTheme.promptFormBg}`}
            >
              <span className="shrink-0">{effectiveDir}&gt;</span>
              <input
                ref={terminalInputRef}
                type="text"
                value={cmdInput}
                onChange={(e) => {
                  setCmdInput(e.target.value);
                  setTabCycleSeed(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Escribe comando, [Tab] para rutas o [Ctrl+R] para historial..."
                autoComplete="off"
                spellCheck={false}
                className={`flex-1 bg-transparent outline-none ${activeTerminalTheme.promptText} ${activeTerminalTheme.inputPlaceholder}`}
              />
            </form>
          </div>
        )}

        {/* =================================================================
            4B. PANTALLA DE APAGADO DEL SISTEMA VIRTUAL (SHUTDOWN /S)
           ================================================================= */}
        {showShutdownScreen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-[28%] top-[24%] w-[340px] sm:w-[440px] z-30 bg-slate-950/95 border-2 border-sky-500/80 rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-center space-y-4 backdrop-blur-md"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center">
              <Power className="w-6 h-6 text-sky-300 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold">
                Microsoft Windows 10 Pro · Estado ACPI S5 (Soft Off)
              </div>
              <h3 className="text-base sm:text-lg font-display font-extrabold text-white">
                El equipo se ha apagado (shutdown /s)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Se han cerrado todos los servicios del sistema virtual y la ventana del terminal se ha minimizado de forma segura.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-slate-300 text-left space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Comando ejecutado:</span>
                <span className="text-amber-300 font-bold">shutdown /s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Estado de la consola:</span>
                <span className="text-emerald-400">Minimizada en barra inferior</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundFX.playCableSnap();
                  setShowShutdownScreen(false);
                  setTerminalVisible(true);
                  appendLines([
                    {
                      type: 'success',
                      text: '[ACPI Power ON] Sistema virtual encendido de nuevo. Sesión restaurada.',
                    },
                  ]);
                  setSpeaker('alice');
                  setAliceExpression('happy');
                  setDialogText(
                    '¡Equipo encendido de nuevo! El terminal vuelve a estar activo en pantalla.'
                  );
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Encender Equipo y Abrir Terminal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowShutdownScreen(false);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-semibold text-xs transition-colors cursor-pointer"
              >
                Ocultar aviso
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            5. MINI-JUEGO HELPDESK (MISIÓN 6: 3 BOTONES SUPERPUESTOS)
           ================================================================= */}
        {currentMission === 6 && activeSubView === 'none' && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-[18%] right-[24%] top-[24%] z-30 bg-slate-900/95 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="text-xs font-mono font-bold text-amber-300">
                MISIÓN 6 · INCIDENCIA HELPDESK (USUARIO DE CONTABILIDAD)
              </span>
              <button
                type="button"
                onClick={() => setActiveSubView('theory')}
                className="text-[11px] text-sky-300 hover:underline cursor-pointer"
              >
                Ver Protocolo Soft Skills
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              El usuario de contabilidad está muy alterado. ¿Qué le respondes?
            </p>
            <div className="space-y-2">
              {helpdeskOptionOrder.map((choiceType, idx) => (
                <button
                  key={choiceType}
                  type="button"
                  onClick={() => handleHelpdeskChoice(choiceType)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-xs text-slate-100 transition-colors cursor-pointer"
                >
                  <strong className="text-amber-300">{String.fromCharCode(65 + idx)}.</strong>{' '}
                  {HELPDESK_OPTIONS[choiceType]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================
            6. SUB-VISTAS INTERACTIVAS Y PANEL DE LOGROS (ACHIEVEMENTS OVERLAY)
           ================================================================= */}
        {activeSubView !== 'none' && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-[6%] right-[14%] top-[16%] max-h-[62%] overflow-y-auto z-35 bg-slate-900/95 border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xl text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-2.5 mb-3">
              <h3 className="font-display font-bold text-sm sm:text-base text-amber-300 flex items-center gap-2">
                {activeSubView === 'achievements' && (
                  <>
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>
                      Panel de Logros e Insignias SMR ({unlockedAchievements.length}/{SMR_ACHIEVEMENTS.length})
                    </span>
                  </>
                )}
                {activeSubView === 'rack' && (
                  <>
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span>Armario Rack 42U y Comprobador EIA/TIA-568B</span>
                  </>
                )}
                {activeSubView === 'drawer' && (
                  <>
                    <Usb className="w-4 h-4 text-rose-400" />
                    <span>Cajón de Herramientas y Secuencia BIOS/UEFI</span>
                  </>
                )}
                {activeSubView === 'ticket' && 'Ticket de Soporte #304 · Despliegue Silencioso'}
                {activeSubView === 'theory' && (
                  <>
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>
                      Ficha Didáctica {activeTheory.moduleCode}: {activeTheory.conceptTitle}
                    </span>
                  </>
                )}
                {activeSubView === 'certificate' && (
                  <>
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Expediente Académico y Certificado de Prácticas SMR</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setActiveSubView('none')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cerrar</span>
              </button>
            </div>

            {/* PANEL DE LOGROS E INSIGNIAS (ACHIEVEMENTS OVERLAY) */}
            {activeSubView === 'achievements' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Bug className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">
                        Estado "Expert Debugger" (Resolver M1–M6 sin pistas):
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        Pistas solicitadas en esta sesión: <strong className="text-white">{hintsUsedCount}</strong> ·{' '}
                        {unlockedAchievements.includes('expert_debugger') ? (
                          <span className="text-emerald-400 font-bold">¡DESBLOQUEADO!</span>
                        ) : hintsUsedCount === 0 ? (
                          <span className="text-emerald-400">
                            Elegible ({completedMissions.length}/6 misiones completadas sin pistas)
                          </span>
                        ) : (
                          <span className="text-amber-300">
                            Reinicia el simulador para intentarlo con 0 pistas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="font-mono text-amber-300 font-bold">
                    Progreso: {Math.round((unlockedAchievements.length / SMR_ACHIEVEMENTS.length) * 100)}%
                  </div>
                </div>

                {/* Cuadrícula de las 8 Insignias SMR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SMR_ACHIEVEMENTS.map((ach) => {
                    const isUnlocked = unlockedAchievements.includes(ach.id);
                    const isExpertDebugger = ach.id === 'expert_debugger';
                    return (
                      <div
                        key={ach.id}
                        className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                          isUnlocked
                            ? isExpertDebugger
                              ? 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/50 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                              : 'bg-emerald-950/35 border-emerald-500/70'
                            : 'bg-slate-950/70 border-slate-800 opacity-75'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                            isUnlocked
                              ? 'bg-amber-400/20 border-amber-400'
                              : 'bg-slate-900 border-slate-700'
                          }`}
                        >
                          {renderAchievementIcon(ach.iconType, isUnlocked)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`font-display font-bold text-xs sm:text-sm truncate ${
                                isUnlocked ? 'text-white' : 'text-slate-400'
                              }`}
                            >
                              {ach.title}
                            </span>
                            {isUnlocked ? (
                              <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                                DESBLOQUEADO
                              </span>
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                            {ach.description}
                          </p>
                          <div className="text-[10px] font-mono text-sky-400 mt-1">
                            Requisito: {ach.conditionLabel}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RACK + COMPROBADOR DE CABLES RJ45 EIA/TIA-568B */}
            {activeSubView === 'rack' && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">
                      Puerto Troncal Switch Core Gi0/1 → Router Gateway (192.168.1.1)
                    </div>
                    <div className="font-mono text-slate-400 mt-0.5">
                      Variable de estado:{' '}
                      <strong className={linkUp ? 'text-emerald-400' : 'text-rose-400'}>
                        cable_conectado = {String(linkUp)}
                      </strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectCable}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
                      linkUp
                        ? 'bg-emerald-600/30 border border-emerald-400 text-emerald-300'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg'
                    }`}
                  >
                    <Cable className="w-4 h-4" />
                    <span>
                      {linkUp
                        ? 'Cable RJ45 Conectado (Link UP)'
                        : 'Conectar Cable RJ45 Suelto'}
                    </span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-sky-300">
                    <span>TESTER DE CONTINUIDAD UTP CAT6 · NORMA EIA/TIA-568B</span>
                    <span>
                      {linkUp ? `PROBANDO PIN #${testingCablePin}: OK` : 'ESPERANDO CONEXIÓN RJ45'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIA_568B_PINS.map((p) => {
                      const isActivePin = linkUp && testingCablePin === p.pin;
                      return (
                        <div
                          key={p.pin}
                          className={`p-2 rounded-lg border flex items-center gap-2 transition-colors ${
                            isActivePin
                              ? 'bg-emerald-950/80 border-emerald-400'
                              : 'bg-slate-900 border-slate-800'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 border border-black"
                            style={{ backgroundColor: p.hex }}
                          />
                          <div className="truncate">
                            <div className="font-bold text-[11px] text-white">
                              Pin {p.pin}: {p.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">{p.function}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CAJÓN DE HERRAMIENTAS + PRIORIDAD DE ARRANQUE BIOS */}
            {activeSubView === 'drawer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white text-sm">
                      <Usb className="w-4 h-4 text-rose-400" />
                      <span>Pendrive USB 32GB (ISO Windows WinRE)</span>
                    </div>
                    <p className="text-slate-300 mt-1.5 leading-relaxed">
                      Contiene el Entorno de Recuperación de Windows (<code className="text-sky-300">bootrec.exe</code>) necesario para reparar errores <code className="text-amber-300">BOOTMGR is missing</code> en la Misión 2.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePickUpUsb}
                    className={`w-full py-2 px-4 rounded-lg font-bold transition-colors cursor-pointer ${
                      usbRecogido
                        ? 'bg-emerald-600/30 border border-emerald-400 text-emerald-300'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg'
                    }`}
                  >
                    {usbRecogido ? 'En tu inventario (Recogido)' : 'Recoger Pendrive USB ISO'}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2 font-mono">
                  <div>
                    <div className="text-sky-400 font-bold">
                      BIOS / UEFI BOOT PRIORITY (MENÚ F12)
                    </div>
                    <div className="mt-2 space-y-1 text-[11px]">
                      <div className={biosUsbPriority ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        1st Boot: {biosUsbPriority ? '[USB Flash Drive: WinRE ISO]' : '[SATA0: HDD Dañado]'}
                      </div>
                      <div className="text-slate-400">
                        2nd Boot: {biosUsbPriority ? '[SATA0: Windows Boot Manager]' : '[USB Flash Drive]'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!usbRecogido) {
                        handlePickUpUsb();
                      }
                      setUsbInsertado(true);
                      setBiosUsbPriority(true);
                      soundFX.playCableSnap();
                    }}
                    className="w-full py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-sans font-semibold cursor-pointer"
                  >
                    {biosUsbPriority
                      ? 'Arranque USB Configurado e Insertado'
                      : 'Insertar USB en PC y Priorizar en BIOS'}
                  </button>
                </div>
              </div>
            )}

            {/* TICKET DE SOPORTE #304 */}
            {activeSubView === 'ticket' && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-mono text-amber-300">
                    TICKET #304 · RUTA: C:\Users\Tecnico\Descargas\antivirus_setup.exe
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    Instala el antivirus corporativo en el equipo del nuevo trabajador de forma <strong>silenciosa (desatendida)</strong> para que no aparezca ninguna ventana gráfica que interrumpa su tarea.
                  </p>
                  <p className="font-mono text-emerald-400">
                    Pista del ticket: los instaladores muestran sus parámetros con /?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentDir('C:\\Users\\Tecnico\\Descargas');
                    setActiveSubView('none');
                    setTerminalVisible(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold cursor-pointer"
                >
                  Ir al Terminal en carpeta Descargas
                </button>
              </div>
            )}

            {/* FICHA DIDÁCTICA TEÓRICA SMR + PREGUNTA DE EXAMEN */}
            {activeSubView === 'theory' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-mono text-sky-400">
                    MÓDULO FORMATIVO: {activeTheory.moduleCode} · {activeTheory.moduleName}
                  </div>
                  <p className="text-slate-200 leading-relaxed">{activeTheory.summary}</p>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside">
                    {activeTheory.technicalDeepDive.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2">
                  <div className="font-bold text-amber-300">
                    Pregunta de Autoevaluación SMR (Misión {currentMission}):
                  </div>
                  <p className="text-white font-medium">{activeTheory.examQuestion.question}</p>
                  <div className="space-y-1.5 pt-1">
                    {activeTheory.examQuestion.options.map((opt, idx) => {
                      const isSelected = quizSelectedAnswer === idx;
                      const isCorrect = idx === activeTheory.examQuestion.correctIndex;
                      const revealCorrect = quizAlreadyAnswered && isCorrect;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={quizAlreadyAnswered}
                          onClick={() => handleQuizAnswer(idx)}
                          className={`w-full text-left p-2 rounded-lg border transition-colors ${
                            quizAlreadyAnswered ? 'cursor-default' : 'cursor-pointer'
                          } ${
                            isSelected && !isCorrect
                              ? 'bg-rose-950/80 border-rose-400 text-rose-200'
                              : (isSelected && isCorrect) || revealCorrect
                              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-semibold'
                              : quizAlreadyAnswered
                              ? 'bg-slate-900 border-slate-800 text-slate-400'
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizAlreadyAnswered && (
                    <div
                      className={`p-2 rounded text-[11px] ${
                        completedQuizzes.includes(currentMission)
                          ? 'text-emerald-300 bg-emerald-950/40'
                          : 'text-amber-300 bg-amber-950/40'
                      }`}
                    >
                      <strong>
                        {completedQuizzes.includes(currentMission)
                          ? '✔ Correcta (cuenta para la nota). '
                          : '✘ Incorrecta: solo cuenta el primer intento. '}
                      </strong>
                      {activeTheory.examQuestion.explanation}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EXPEDIENTE Y CERTIFICADO PERSONALIZABLE DEL ALUMNO */}
            {activeSubView === 'certificate' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="font-bold text-white text-sm">
                      Datos del Alumno para el Informe / Diploma
                    </div>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Escribe tu Nombre y Apellidos..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none focus:border-amber-400"
                    />
                    <div className="flex items-center justify-between pt-1 font-mono">
                      <span>Misiones: {completedMissions.length}/6</span>
                      <span>Logros: {unlockedAchievements.length}/{SMR_ACHIEVEMENTS.length}</span>
                      <strong className="text-amber-300 text-sm">
                        Nota Final: {calculateGrade()}/10
                      </strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-400/50 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={iconoUrl}
                        alt="Un Fantasma en el Sistema"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 object-contain"
                      />
                      <div>
                        <div className="font-bold text-amber-300">
                          CERTIFICADO DE PRÁCTICAS SMR
                        </div>
                        <div className="text-slate-300">
                          Alumno/a: <strong>{studentName || 'Técnico en Formación SMR'}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
                      <a
                        href="https://www.unfantasmaenelsistema.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:underline font-mono text-[11px]"
                      >
                        unfantasmaenelsistema.com
                      </a>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir / Guardar PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================
            7. SPRITE DE CUERPO ENTERO DE ALICE (WALKING SIMULATOR)
           ================================================================= */}
        <div
          className="alice-sprite-container cursor-pointer"
          style={{
            left: `${alicePos.x}px`,
            bottom: `${alicePos.y}px`,
            transform: alicePos.lookLeft ? 'scaleX(-1)' : 'scaleX(1)',
          }}
          onClick={(e) => {
            e.stopPropagation();
            soundFX.playClick();
            setSpeaker('alice');
            setAliceExpression('normal');
            setDialogText(activeMissionData.objective);
          }}
          title="Haz clic en Alice para recordar el objetivo actual (sin gastar pistas)"
        >
          <AliceFullSprite
            expression={aliceExpression}
            isWalking={isAliceWalking}
            hasUsb={usbRecogido && !usbInsertado}
          />
        </div>

        {/* =================================================================
            8. CAJA DE DIÁLOGO / NARRATIVA ORNAMENTADA (PARTE INFERIOR)
           ================================================================= */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (displayedDialog.length < dialogText.length) {
              setDisplayedDialog(dialogText);
            }
          }}
          className="absolute bottom-3 left-3 right-3 sm:left-5 sm:right-5 z-35 flex items-end gap-3 sm:gap-4 max-w-[1140px] pointer-events-auto"
        >
          {/* Marco cuadrado redondeado del Retrato (Izquierda) */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-2xl border-[3.5px] border-[#1E293B] ring-2 ring-[#F8FAFC] bg-[#D8E2DC] shadow-[0_10px_25px_rgba(0,0,0,0.7)] overflow-hidden shrink-0">
            <CharacterPortrait speaker={speaker} expression={aliceExpression} />
          </div>

          {/* Caja de Diálogo con Filigranas y Pestaña Superior "Caja de Diálogo / Narrativa" */}
          <div className="relative flex-1 bg-gradient-to-b from-[#FFFDF9]/95 via-[#FFF0F3]/95 to-[#FCE4EC]/95 border-[3px] border-[#27150B] rounded-2xl px-5 sm:px-7 pt-7 pb-4 sm:pb-5 shadow-[0_12px_30px_rgba(0,0,0,0.75)]">
            <div className="absolute inset-1.5 border border-[#9F1239]/30 rounded-xl pointer-events-none" />
            <FiligreeCorner className="absolute top-1.5 left-1.5" />
            <FiligreeCorner className="absolute top-1.5 right-1.5 scale-x-[-1]" />
            <FiligreeCorner className="absolute bottom-1.5 left-1.5 scale-y-[-1]" />
            <FiligreeCorner className="absolute bottom-1.5 right-1.5 scale-[-1]" />

            <div className="absolute -top-4 left-4 sm:left-6 bg-gradient-to-b from-[#FFF5F5] via-[#FFE4E6] to-[#FECDD3] border-[2.5px] border-[#27150B] rounded-lg px-4 py-0.5 shadow-md flex items-center gap-2">
              <span className="text-[#881337] text-xs font-serif">❖</span>
              <span className="font-display font-bold text-xs sm:text-sm text-[#1E293B] tracking-tight">
                Caja de Diálogo / Narrativa
              </span>
              <span className="text-[#881337] text-xs font-serif">❖</span>
            </div>

            <p className="text-slate-900 font-sans text-xs sm:text-base lg:text-[17px] font-medium leading-relaxed pr-6 select-text min-h-[3rem]">
              <strong className="font-bold text-slate-950">
                [{speaker === 'carlos' ? 'Usuario Contabilidad' : 'Alice'}]
              </strong>{' '}
              - {displayedDialog}
              {displayedDialog.length < dialogText.length && (
                <span className="inline-block w-2 h-4 ml-1 align-middle bg-[#881337] animate-pulse" />
              )}
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              {/* Izquierda: Botón Fast-Forward (Avance Rápido Instantáneo del texto) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFastForwardDialog}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-sans text-xs font-bold cursor-pointer transition-all ${
                    fastForwardDialog
                      ? 'bg-[#881337] text-white border-[#27150B] shadow-sm'
                      : 'bg-[#27150B]/10 hover:bg-[#27150B]/20 border-[#27150B]/30 text-[#27150B]'
                  }`}
                  title="Activar/Desactivar Fast-Forward: muestra todo el texto del diálogo al instante sin esperar al efecto máquina de escribir"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Fast-Forward: {fastForwardDialog ? 'ON' : 'OFF'}</span>
                </button>

                {displayedDialog.length < dialogText.length && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFX.playClick();
                      setDisplayedDialog(dialogText);
                    }}
                    className="text-[11px] font-mono font-semibold text-[#881337] hover:underline cursor-pointer"
                    title="Mostrar el texto completo inmediatamente"
                  >
                    Saltar animación &gt;&gt;
                  </button>
                )}
              </div>

              {/* Derecha: Pistas, Terminal y Avance de Misión */}
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={requestHint}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#27150B]/10 hover:bg-[#27150B]/20 border border-[#27150B]/30 text-[#27150B] font-sans text-xs font-semibold cursor-pointer"
                  title="Solicitar una pista (desactiva el logro Expert Debugger si se usa antes de superar la misión)"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Pedir Pista ({hintsUsedCount})</span>
                </button>

                {!terminalVisible && currentMission !== 6 && (
                  <button
                    type="button"
                    onClick={() => setTerminalVisible(true)}
                    className="px-2.5 py-1 rounded bg-slate-900 text-[#4ADE80] font-mono text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                  >
                    Abrir Terminal CMD
                  </button>
                )}

                {completedMissions.includes(currentMission) && currentMission < 6 && (
                  <button
                    type="button"
                    onClick={() => selectMission(currentMission + 1)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs shadow cursor-pointer"
                  >
                    Siguiente Misión →
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    if (displayedDialog.length < dialogText.length) {
                      setDisplayedDialog(dialogText);
                    } else if (completedMissions.includes(currentMission) && currentMission < 6) {
                      selectMission(currentMission + 1);
                    } else {
                      setSpeaker('alice');
                      setAliceExpression('normal');
                      setDialogText(activeMissionData.objective);
                    }
                  }}
                  title="Haz clic para completar el texto actual, recordar el objetivo o avanzar a la siguiente misión"
                  className="group cursor-pointer focus:outline-none"
                >
                  <svg
                    viewBox="0 0 28 24"
                    className="w-6 h-5 drop-shadow group-hover:translate-y-0.5 transition-transform"
                  >
                    <polygon
                      points="3,3 25,3 14,21"
                      fill="#FB7185"
                      stroke="#27150B"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
