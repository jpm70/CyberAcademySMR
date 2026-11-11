/**
 * Progreso persistente de CyberAcademy SMR.
 *
 * Se guarda en localStorage para que recargar la página (o cerrar el navegador en el aula)
 * no borre las misiones, los tests ni las insignias. Todo lo que se lee se valida: un valor
 * corrupto o manipulado vuelve al valor por defecto en lugar de romper la partida.
 */

export const PROGRESS_STORAGE_KEY = 'smr_cyberacademy_progress_v2';
export const MISSION_IDS = [1, 2, 3, 4, 5, 6] as const;
export const ACHIEVEMENT_IDS = [
  'expert_debugger',
  'osi_layer1_master',
  'boot_surgeon',
  'stealth_deployer',
  'process_hunter',
  'dhcp_architect',
  'empathy_champion',
  'smr_scholar',
] as const;

export interface ProgressSnapshot {
  currentMission: number;
  completedMissions: number[];
  completedQuizzes: number[];
  /** Tests respondidos mal al primer intento: ya no puntúan aunque luego se elija la buena. */
  failedQuizzes: number[];
  unlockedAchievements: string[];
  hintsUsedCount: number;
  hadGuiErrorInM3: boolean;
  hadHelpdeskMistakeInM6: boolean;
  cableConectado: boolean;
  usbRecogido: boolean;
  usbInsertado: boolean;
  biosUsbPriority: boolean;
  mbrFixed: boolean;
  bootFixed: boolean;
  winReExited: boolean;
  antivirusInstalado: boolean;
  procesoTerminado: boolean;
  ipLiberada: boolean;
  ipRenovada: boolean;
  helpdeskResuelto: boolean;
  studentName: string;
}

export const DEFAULT_PROGRESS: Readonly<ProgressSnapshot> = Object.freeze({
  currentMission: 1,
  completedMissions: [],
  completedQuizzes: [],
  failedQuizzes: [],
  unlockedAchievements: [],
  hintsUsedCount: 0,
  hadGuiErrorInM3: false,
  hadHelpdeskMistakeInM6: false,
  cableConectado: false,
  usbRecogido: false,
  usbInsertado: false,
  biosUsbPriority: false,
  mbrFixed: false,
  bootFixed: false,
  winReExited: false,
  antivirusInstalado: false,
  procesoTerminado: false,
  ipLiberada: false,
  ipRenovada: false,
  helpdeskResuelto: false,
  studentName: '',
});

const BOOLEAN_KEYS = [
  'hadGuiErrorInM3',
  'hadHelpdeskMistakeInM6',
  'cableConectado',
  'usbRecogido',
  'usbInsertado',
  'biosUsbPriority',
  'mbrFixed',
  'bootFixed',
  'winReExited',
  'antivirusInstalado',
  'procesoTerminado',
  'ipLiberada',
  'ipRenovada',
  'helpdeskResuelto',
] as const;

const isMissionId = (value: unknown): value is number =>
  typeof value === 'number' && (MISSION_IDS as readonly number[]).includes(value);

const uniqueMissionList = (value: unknown): number[] =>
  Array.isArray(value) ? [...new Set(value.filter(isMissionId))].sort((a, b) => a - b) : [];

/** Convierte cualquier valor leído del almacenamiento en un progreso válido. */
export function sanitizeProgress(raw: unknown): ProgressSnapshot {
  const base: ProgressSnapshot = {
    ...DEFAULT_PROGRESS,
    completedMissions: [],
    completedQuizzes: [],
    failedQuizzes: [],
    unlockedAchievements: [],
  };
  if (!raw || typeof raw !== 'object') return base;
  const data = raw as Record<string, unknown>;

  const result: ProgressSnapshot = {
    ...base,
    currentMission: isMissionId(data.currentMission) ? data.currentMission : 1,
    completedMissions: uniqueMissionList(data.completedMissions),
    completedQuizzes: uniqueMissionList(data.completedQuizzes),
    failedQuizzes: [],
    unlockedAchievements: Array.isArray(data.unlockedAchievements)
      ? [
          ...new Set(
            data.unlockedAchievements.filter(
              (id): id is string => typeof id === 'string' && (ACHIEVEMENT_IDS as readonly string[]).includes(id)
            )
          ),
        ]
      : [],
    hintsUsedCount:
      typeof data.hintsUsedCount === 'number' && Number.isFinite(data.hintsUsedCount) && data.hintsUsedCount >= 0
        ? Math.floor(data.hintsUsedCount)
        : 0,
    studentName: typeof data.studentName === 'string' ? data.studentName.slice(0, 80) : '',
  };
  // Un test solo puede estar aprobado o suspendido; si aparece en ambos, manda el aprobado
  result.failedQuizzes = uniqueMissionList(data.failedQuizzes).filter((id) => !result.completedQuizzes.includes(id));
  for (const key of BOOLEAN_KEYS) {
    result[key] = data[key] === true;
  }
  return result;
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const defaultStorage = (): StorageLike | null => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
};

export function loadProgress(storage: StorageLike | null = defaultStorage()): ProgressSnapshot {
  try {
    const saved = storage?.getItem(PROGRESS_STORAGE_KEY);
    return sanitizeProgress(saved ? JSON.parse(saved) : null);
  } catch {
    return sanitizeProgress(null);
  }
}

export function saveProgress(snapshot: ProgressSnapshot, storage: StorageLike | null = defaultStorage()): void {
  try {
    storage?.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(sanitizeProgress(snapshot)));
  } catch {
    // Almacenamiento bloqueado (modo privado, cuota llena...): la partida sigue en memoria.
  }
}

export function clearProgress(storage: StorageLike | null = defaultStorage()): void {
  try {
    storage?.removeItem(PROGRESS_STORAGE_KEY);
  } catch {
    // Ignorar
  }
}

/** Nota sobre 10: 1,4 puntos por misión y 1,6 repartidos entre los 6 tests. */
export function calculateGrade(completedMissions: number[], completedQuizzes: number[]): string {
  const missionPoints = uniqueMissionList(completedMissions).length * 1.4;
  const quizPoints = uniqueMissionList(completedQuizzes).length * (1.6 / 6);
  return Math.min(10, missionPoints + quizPoints).toFixed(1);
}
