export interface MissionTheory {
  missionId: number;
  moduleCode: string;
  moduleName: string;
  conceptTitle: string;
  summary: string;
  technicalDeepDive: string[];
  keyCommands: { cmd: string; desc: string }[];
  examQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface AchievementDef {
  id: string;
  title: string;
  englishSubtitle: string;
  description: string;
  conditionLabel: string;
  iconType: 'debugger' | 'network' | 'boot' | 'stealth' | 'cpu' | 'dhcp' | 'empathy' | 'scholar';
}

export type VirtualDirPath =
  | 'X:\\Sources'
  | 'C:\\Users\\Tecnico'
  | 'C:\\Users\\Tecnico\\Descargas'
  | 'C:\\Users\\Tecnico\\Documents'
  | 'C:\\Users\\Tecnico\\Desktop'
  | 'C:\\Users\\Tecnico\\Scripts';

export interface VirtualFileEntry {
  name: string;
  isDirectory: boolean;
  sizeBytes?: number;
  date: string;
  time: string;
  isExecutable?: boolean;
  recommendedArgs?: string[];
  content?: string;
}

/**
 * Sistema de Archivos Virtual (VFS) para autocompletado contextual con tecla Tab
 */
export const VIRTUAL_FILE_SYSTEM: Record<VirtualDirPath, VirtualFileEntry[]> = {
  'X:\\Sources': [
    {
      name: 'bootrec.exe',
      isDirectory: false,
      sizeBytes: 319488,
      date: '04/11/2026',
      time: '08:00',
      isExecutable: true,
      recommendedArgs: ['bootrec /fixmbr', 'bootrec /fixboot', 'bootrec /rebuildbcd', 'bootrec /scanos'],
    },
    {
      name: 'bcdedit.exe',
      isDirectory: false,
      sizeBytes: 442368,
      date: '04/11/2026',
      time: '08:00',
      isExecutable: true,
    },
    {
      name: 'diskpart.exe',
      isDirectory: false,
      sizeBytes: 184320,
      date: '04/11/2026',
      time: '08:00',
      isExecutable: true,
    },
    {
      name: 'winre_log.txt',
      isDirectory: false,
      sizeBytes: 1240,
      date: '04/11/2026',
      time: '08:15',
      content:
        '[WinRE Diagnostics] Error detectado en disco 0: BOOTMGR is missing. Ejecute bootrec /fixmbr y bootrec /fixboot.',
    },
  ],
  'C:\\Users\\Tecnico': [
    { name: 'Descargas', isDirectory: true, date: '04/11/2026', time: '09:14' },
    { name: 'Documents', isDirectory: true, date: '04/11/2026', time: '09:00' },
    { name: 'Desktop', isDirectory: true, date: '04/11/2026', time: '08:45' },
    { name: 'Scripts', isDirectory: true, date: '04/11/2026', time: '08:30' },
    {
      name: 'notas_red.txt',
      isDirectory: false,
      sizeBytes: 842,
      date: '04/11/2026',
      time: '08:20',
      content:
        'Gateway Oficina de Soporte: 192.168.1.1 (Puerto Troncal Gi0/1 en el Rack de Comunicaciones). Rango DHCP: 192.168.1.100 - 192.168.1.200.',
    },
    {
      name: 'inventario_rack.csv',
      isDirectory: false,
      sizeBytes: 2150,
      date: '04/11/2026',
      time: '08:10',
      content:
        'U1,PatchPanel_Cat6,24_Puertos\nU2,Switch_Core_SMR,Gi0/1_Uplink_Router\nU3,Router_Gateway,192.168.1.1',
    },
  ],
  'C:\\Users\\Tecnico\\Descargas': [
    {
      name: 'antivirus_setup.exe',
      isDirectory: false,
      sizeBytes: 48250880,
      date: '04/11/2026',
      time: '09:14',
      isExecutable: true,
      recommendedArgs: ['antivirus_setup.exe /S', 'antivirus_setup.exe /?'],
    },
    {
      name: 'ticket_304.txt',
      isDirectory: false,
      sizeBytes: 1420,
      date: '04/11/2026',
      time: '08:50',
      content:
        'TICKET #304 (Prioridad Alta): Desplegar antivirus_setup.exe en modo desatendido (/S) para no mostrar ventanas ni interrumpir al usuario.',
    },
    {
      name: 'leeme_despliegue.txt',
      isDirectory: false,
      sizeBytes: 980,
      date: '04/11/2026',
      time: '08:48',
      content:
        'Uso del instalador corporativo: ejecute "antivirus_setup.exe /S" desde la consola para instalación silenciosa.',
    },
  ],
  'C:\\Users\\Tecnico\\Documents': [
    {
      name: 'informe_contabilidad_autorecuperado.asd',
      isDirectory: false,
      sizeBytes: 1548200,
      date: '04/11/2026',
      time: '09:30',
      content:
        '[Copia de seguridad automática de procesador de textos (.asd)] Informe Trimestral de Contabilidad (3 horas de trabajo) - Íntegro.',
    },
    {
      name: 'checklist_mantenimiento.txt',
      isDirectory: false,
      sizeBytes: 640,
      date: '04/11/2026',
      time: '08:05',
      content:
        '1. Revisar latiguillos RJ45 en el Rack.\n2. Verificar procesos con tasklist.\n3. Renovar concesiones DHCP en conflicto.',
    },
  ],
  'C:\\Users\\Tecnico\\Desktop': [
    {
      name: 'guia_rapida_smr.txt',
      isDirectory: false,
      sizeBytes: 1120,
      date: '04/11/2026',
      time: '08:00',
      content:
        'Comandos clave SMR: ping 192.168.1.1 | bootrec /fixmbr | bootrec /fixboot | antivirus_setup.exe /S | tasklist | taskkill /F /IM bucle.exe | ipconfig /release | ipconfig /renew',
    },
  ],
  'C:\\Users\\Tecnico\\Scripts': [
    {
      name: 'diagnostico_red.bat',
      isDirectory: false,
      sizeBytes: 512,
      date: '04/11/2026',
      time: '08:30',
      isExecutable: true,
      content: '@echo off\necho Verificando bucle local y puerta de enlace...\nping 127.0.0.1\nping 192.168.1.1',
    },
  ],
};

export const SMR_ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'expert_debugger',
    title: 'Expert Debugger (Depurador Experto)',
    englishSubtitle: 'Zero-Hint Master',
    description:
      'Resuelve las 6 misiones técnicas del laboratorio SMR de principio a fin sin utilizar ninguna pista.',
    conditionLabel: 'Completar M1–M6 con 0 pistas usadas',
    iconType: 'debugger',
  },
  {
    id: 'osi_layer1_master',
    title: 'Maestro de Capa Física (OSI Layer 1)',
    englishSubtitle: 'Physical & Loopback Diagnostician',
    description:
      'Conecta el latiguillo RJ45 en el Rack de Comunicaciones y verifica la conectividad con ping 192.168.1.1.',
    conditionLabel: 'Superar la Misión 1 (Red Local)',
    iconType: 'network',
  },
  {
    id: 'boot_surgeon',
    title: 'Cirujano del Sector Cero (WinRE)',
    englishSubtitle: 'Master Boot Record Savior',
    description:
      'Arranca desde el Pendrive USB con la ISO y repara tanto el MBR (/fixmbr) como el sector de arranque (/fixboot).',
    conditionLabel: 'Superar la Misión 2 (BOOTMGR)',
    iconType: 'boot',
  },
  {
    id: 'stealth_deployer',
    title: 'Despliegue Fantasma (Silent Admin)',
    englishSubtitle: 'Flawless Unattended Setup',
    description:
      'Ejecuta antivirus_setup.exe /S al primer intento sin hacer saltar la ventana gráfica que interrumpe al usuario.',
    conditionLabel: 'Completar Misión 3 sin errores de GUI',
    iconType: 'stealth',
  },
  {
    id: 'process_hunter',
    title: 'Cazador de Procesos (Kernel Guardian)',
    englishSubtitle: 'Runaway Process Terminator',
    description:
      'Localiza bucle.exe mediante tasklist y libera el 99% de CPU ejecutando taskkill /F /IM bucle.exe.',
    conditionLabel: 'Superar la Misión 4 (Proceso Rebelde)',
    iconType: 'cpu',
  },
  {
    id: 'dhcp_architect',
    title: 'Arquitecto DORA (Especialista DHCP)',
    englishSubtitle: 'IP Conflict Resolver',
    description:
      'Elimina la colisión de IP duplicada liberando la concesión a 0.0.0.0 (/release) y renovándola a 192.168.1.105 (/renew).',
    conditionLabel: 'Superar la Misión 5 (Conflicto IP)',
    iconType: 'dhcp',
  },
  {
    id: 'empathy_champion',
    title: 'Asistente Empático (Helpdesk Gold)',
    englishSubtitle: 'First-Try Soft Skills & Recovery',
    description:
      'Tranquiliza al usuario de contabilidad y recupera su informe mediante Autorecuperación al primer intento sin culparle.',
    conditionLabel: 'Superar Misión 6 al primer intento',
    iconType: 'empathy',
  },
  {
    id: 'smr_scholar',
    title: 'Erudito Técnico SMR (Matrícula 10/10)',
    englishSubtitle: 'Full Curriculum Exam Mastery',
    description:
      'Responde correctamente a las 6 preguntas teóricas de autoevaluación de los módulos MF0219_2, MF0220_2 y MF0222_2.',
    conditionLabel: 'Acertar los 6 tests teóricos SMR',
    iconType: 'scholar',
  },
];

export const SMR_THEORY_SHEETS: Record<number, MissionTheory> = {
  1: {
    missionId: 1,
    moduleCode: 'MF0220_2',
    moduleName: 'Implantación de Elementos de la Red Local',
    conceptTitle: 'Diagnóstico en Capa 1 (Física) vs Capa 3 (Red) del Modelo OSI',
    summary:
      'Ante una caída de red, el técnico SMR siempre debe descartar primero un fallo en la Capa 1 (Física: cable UTP desconectado, conector RJ45 dañado o puerto del switch apagado) antes de modificar configuraciones IP.',
    technicalDeepDive: [
      'El comando "ping 127.0.0.1" (dirección de loopback) comprueba que la pila TCP/IP de nuestro propio sistema operativo funciona, incluso con el cable desconectado.',
      'El comando "ping 192.168.1.1" envía paquetes ICMP Echo Request a la Puerta de Enlace (Router). Si devuelve "Tiempo de espera agotado", no hay respuesta del destino.',
      'La norma EIA/TIA-568B define el orden de los 8 hilos de cobre en el conector RJ45. Los pines 1, 2 (transmisión) y 3, 6 (recepción) son esenciales en FastEthernet, y los 8 hilos en GigabitEthernet.',
    ],
    keyCommands: [
      { cmd: 'ping 127.0.0.1', desc: 'Comprueba la pila TCP/IP local (Loopback) sin salir al cable.' },
      { cmd: 'ping 192.168.1.1', desc: 'Comprueba conectividad ICMP con la puerta de enlace (Router).' },
      { cmd: 'arp -a', desc: 'Muestra la tabla de resolución de direcciones IP a direcciones físicas MAC.' },
    ],
    examQuestion: {
      question:
        '¿Qué ocurre si ejecutas "ping 127.0.0.1" cuando el cable de red RJ45 del equipo está desconectado?',
      options: [
        'Da error de "Tiempo de espera agotado" porque no hay cable.',
        'Responde correctamente (0% perdidos) porque 127.0.0.1 es la dirección de bucle local (loopback) interna.',
        'Reinicia automáticamente la tarjeta de red Ethernet.',
      ],
      correctIndex: 1,
      explanation:
        'La dirección 127.0.0.1 evalúa la pila TCP/IP interna del propio sistema operativo sin necesidad de salir por el medio físico.',
    },
  },
  2: {
    missionId: 2,
    moduleCode: 'MF0219_2',
    moduleName: 'Instalación y Configuración de Sistemas Operativos',
    conceptTitle: 'Secuencia de Arranque, MBR, Sector de Partición y Entorno WinRE',
    summary:
      'Cuando el gestor de arranque de Windows (BOOTMGR) se corrompe o desaparece, el sistema detiene la carga tras el POST de la BIOS. Es necesario iniciar desde un medio externo (Pendrive USB con ISO) y usar la consola de recuperación.',
    technicalDeepDive: [
      '1. BIOS/UEFI inicializa el hardware (POST) y busca el dispositivo de arranque según el orden configurado (Boot Priority).',
      '2. En discos con particionado MBR, el primer sector físico (512 bytes) contiene el Master Boot Record (código de arranque + tabla de particiones). Se repara con "bootrec /fixmbr".',
      '3. El sector de arranque de la partición activa invoca al archivo BOOTMGR, que a su vez lee el almacén BCD (Boot Configuration Data). Se repara con "bootrec /fixboot" y "bootrec /rebuildbcd".',
    ],
    keyCommands: [
      { cmd: 'bootrec /fixmbr', desc: 'Escribe un nuevo Registro de Arranque Maestro compatible en el primer sector del disco.' },
      { cmd: 'bootrec /fixboot', desc: 'Escribe un nuevo sector de arranque en la partición del sistema.' },
      { cmd: 'bootrec /rebuildbcd', desc: 'Escanea instalaciones de Windows y reconstruye el almacén BCD.' },
    ],
    examQuestion: {
      question:
        '¿Qué comando de la consola de recuperación WinRE reescribe específicamente el primer sector físico del disco (Master Boot Record) sin borrar la tabla de particiones?',
      options: ['bootrec /fixboot', 'bootrec /fixmbr', 'chkdsk /r'],
      correctIndex: 1,
      explanation:
        'bootrec /fixmbr repara el código maestro de arranque en el sector 0 del disco manteniendo intacta la tabla de particiones.',
    },
  },
  3: {
    missionId: 3,
    moduleCode: 'MF0219_2 / MF0221_2',
    moduleName: 'Despliegue y Mantenimiento de Software Corporativo',
    conceptTitle: 'Instalación Desatendida (Silent Install) mediante Parámetros CLI',
    summary:
      'En entornos empresariales, los técnicos desplieggan paquetes de software (como agentes antivirus o parches) en segundo plano para no interrumpir la productividad del empleado ni requerir confirmación en ventanas gráficas.',
    technicalDeepDive: [
      'Los instaladores ejecutables (.exe basados en NSIS/InnoSetup) utilizan modificadores como "/S", "/VERYSILENT" o "/silent" para suprimir toda interfaz gráfica (GUI).',
      'Los paquetes Windows Installer (.msi) se ejecutan mediante "msiexec /i paquete.msi /qn", donde "/qn" indica Quiet (sin interfaz de usuario).',
      'Antes de ejecutar el paquete desde la consola, es buena práctica consultar los modificadores admitidos con "antivirus_setup.exe /?" o navegar al directorio con "cd Descargas".',
    ],
    keyCommands: [
      { cmd: 'cd Descargas', desc: 'Cambia el directorio de trabajo actual a la carpeta Descargas.' },
      { cmd: 'antivirus_setup.exe /?', desc: 'Muestra los parámetros de línea de comandos soportados por el instalador.' },
      { cmd: 'antivirus_setup.exe /S', desc: 'Ejecuta la instalación en modo silencioso (Silent) en segundo plano.' },
    ],
    examQuestion: {
      question:
        '¿Por qué es fundamental añadir el parámetro "/S" al desplegar un instalador en el puesto de un empleado que está trabajando?',
      options: [
        'Para que el programa se instale en modo Seguro de Windows.',
        'Para realizar una instalación silenciosa (sin ventanas emergentes) evitando interrumpir al usuario.',
        'Para comprobar si el archivo tiene virus antes de abrirlo.',
      ],
      correctIndex: 1,
      explanation:
        'El parámetro /S (Silent) suprime los cuadros de diálogo del asistente gráfico, ejecutando la instalación de forma transparente.',
    },
  },
  4: {
    missionId: 4,
    moduleCode: 'MF0219_2',
    moduleName: 'Administración de Procesos y Recursos del Sistema',
    conceptTitle: 'Diagnóstico de Cuellos de Botella y Finalización Forzada de Procesos',
    summary:
      'Cuando un proceso entra en un bucle infinito o sufre una fuga de memoria (Memory Leak), acapara el tiempo de CPU (99%) y bloquea la interfaz gráfica. La línea de comandos permite identificar su PID y finalizarlo de inmediato.',
    technicalDeepDive: [
      'Cada programa en ejecución recibe un identificador único llamado PID (Process Identifier) asignado por el kernel del sistema operativo.',
      'El comando "tasklist" muestra todos los procesos activos, su nombre de imagen, su PID y la memoria RAM consumida.',
      'En "taskkill /F /IM bucle.exe", el parámetro "/F" fuerza la terminación inmediata (enviando la señal de cierre a nivel de kernel) y "/IM" especifica el nombre de la imagen ejecutable (también puede usarse "/PID 4812").',
    ],
    keyCommands: [
      { cmd: 'tasklist', desc: 'Enumera todos los procesos en ejecución junto con su PID y uso de memoria.' },
      { cmd: 'taskkill /F /IM bucle.exe', desc: 'Fuerza (/F) el cierre del proceso por su nombre de imagen (/IM).' },
      { cmd: 'taskkill /F /PID 4812', desc: 'Fuerza (/F) el cierre del proceso indicando su número PID exacto.' },
    ],
    examQuestion: {
      question:
        'En el comando "taskkill /F /IM bucle.exe", ¿qué función cumple el modificador "/F"?',
      options: [
        'Busca el archivo en el disco duro (Find).',
        'Fuerza la terminación inmediata del proceso bloqueado sin esperar confirmación de la ventana.',
        'Formatea la memoria caché del procesador.',
      ],
      correctIndex: 1,
      explanation:
        '/F (Force) obliga al sistema operativo a terminar el proceso inmediatamente aunque no responda a mensajes normales de cierre.',
    },
  },
  5: {
    missionId: 5,
    moduleCode: 'MF0220_2',
    moduleName: 'Resolución de Incidencias en Redes Locales (DHCP)',
    conceptTitle: 'Conflicto de Direcciones IPv4 y Ciclo DORA del Protocolo DHCP',
    summary:
      'Si dos equipos en la misma subred poseen idéntica dirección IPv4 (ej. 192.168.1.50), se produce una colisión en las tablas ARP y ambos pierden conectividad. Renovar la concesión DHCP asigna una IP libre del rango.',
    technicalDeepDive: [
      'El protocolo DHCP opera en 4 fases conocidas como DORA: Discover (el cliente busca servidor), Offer (el servidor ofrece una IP), Request (el cliente la solicita) y Acknowledge (el servidor confirma la concesión).',
      'Al ejecutar "ipconfig /release", el cliente envía un paquete DHCPRELEASE al servidor y su interfaz queda temporalmente en 0.0.0.0.',
      'Al ejecutar "ipconfig /renew", el cliente inicia un nuevo ciclo DHCP y obtiene una dirección IPv4 libre de conflictos (192.168.1.105).',
    ],
    keyCommands: [
      { cmd: 'ipconfig /all', desc: 'Muestra la configuración detallada: MAC, servidor DHCP, DNS y tiempos de concesión.' },
      { cmd: 'ipconfig /release', desc: 'Libera la dirección IPv4 actual dejándola en 0.0.0.0.' },
      { cmd: 'ipconfig /renew', desc: 'Solicita al servidor DHCP una nueva concesión IPv4 válida.' },
    ],
    examQuestion: {
      question:
        '¿Qué dirección IPv4 muestra la tarjeta de red inmediatamente después de ejecutar "ipconfig /release"?',
      options: ['127.0.0.1', '0.0.0.0', '255.255.255.255'],
      correctIndex: 1,
      explanation:
        'Al liberar la concesión DHCP con /release, el adaptador pierde su dirección IPv4 activa y muestra 0.0.0.0 hasta que se renueva.',
    },
  },
  6: {
    missionId: 6,
    moduleCode: 'MF0222_2',
    moduleName: 'Aplicaciones Microinformáticas y Asistencia al Usuario (Helpdesk)',
    conceptTitle: 'Habilidades Blandas (Soft Skills), Escucha Activa y Autorecuperación Ofimática',
    summary:
      'El técnico de soporte (Nivel 1 / Helpdesk) no solo resuelve problemas técnicos: debe gestionar el estrés del usuario mediante empatía, evitando tecnicismos agresivos o respuestas evasivas, y aplicando procedimientos de recuperación de datos.',
    technicalDeepDive: [
      '1. Contención emocional (Empatía): Usar un tono calmado ("Tranquilo, vamos a revisarlo...") reduce la tensión del usuario y facilita su colaboración.',
      '2. Cero culpabilización: Jamás se debe reprochar al usuario no haber pulsado Guardar ("es tu culpa").',
      '3. Solución técnica en suites ofimáticas: Tanto MS Word como LibreOffice guardan copias temporales periódicas (.asd / .bak) accesibles desde Archivo > Información > Administrar documento > Recuperar documentos no guardados.',
    ],
    keyCommands: [
      { cmd: 'Archivo > Información > Autorecuperación', desc: 'Ruta estándar para restaurar copias de seguridad automáticas (.asd).' },
      { cmd: '%AppData%\\Microsoft\\Word\\', desc: 'Directorio local donde suelen almacenarse los archivos temporales de recuperación.' },
    ],
    examQuestion: {
      question:
        'Ante un usuario muy alterado porque se ha cerrado su procesador de textos sin guardar, ¿cuál es la actuación correcta de un técnico de Helpdesk?',
      options: [
        'Explicarle que la memoria RAM es volátil y que es su responsabilidad guardar cada 5 minutos.',
        'Transmitirle tranquilidad con empatía y guiarle a la función de Autorecuperación en Archivo > Información.',
        'Decirle que apague el ordenador inmediatamente.',
      ],
      correctIndex: 1,
      explanation:
        'Combinar empatía (calmar al usuario) con la solución técnica de Autorecuperación resuelve la incidencia y garantiza la calidad del servicio.',
    },
  },
};

export const TIA_568B_PINS = [
  { pin: 1, name: 'Blanco-Naranja', hex: '#FDBA74', stripe: '#EA580C', function: 'TX+ (Datos +)' },
  { pin: 2, name: 'Naranja', hex: '#EA580C', stripe: null, function: 'TX- (Datos -)' },
  { pin: 3, name: 'Blanco-Verde', hex: '#86EFAC', stripe: '#16A34A', function: 'RX+ (Recepción +)' },
  { pin: 4, name: 'Azul', hex: '#2563EB', stripe: null, function: 'BI_D3+ (Gigabit)' },
  { pin: 5, name: 'Blanco-Azul', hex: '#93C5FD', stripe: '#2563EB', function: 'BI_D3- (Gigabit)' },
  { pin: 6, name: 'Verde', hex: '#16A34A', stripe: null, function: 'RX- (Recepción -)' },
  { pin: 7, name: 'Blanco-Marrón', hex: '#D6D3D1', stripe: '#78350F', function: 'BI_D4+ (Gigabit)' },
  { pin: 8, name: 'Marrón', hex: '#78350F', stripe: null, function: 'BI_D4- (Gigabit)' },
];
