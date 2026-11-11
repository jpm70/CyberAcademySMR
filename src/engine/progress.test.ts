import { describe, expect, test } from 'bun:test';
import {
  DEFAULT_PROGRESS,
  PROGRESS_STORAGE_KEY,
  calculateGrade,
  clearProgress,
  loadProgress,
  sanitizeProgress,
  saveProgress,
} from './progress';

const memoryStorage = () => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => (data.has(k) ? (data.get(k) as string) : null),
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
};

describe('sanitizeProgress', () => {
  test('sin datos devuelve el progreso por defecto', () => {
    expect(sanitizeProgress(null)).toEqual({ ...DEFAULT_PROGRESS });
    expect(sanitizeProgress('basura')).toEqual({ ...DEFAULT_PROGRESS });
  });

  test('descarta misiones inexistentes, duplicadas o de otro tipo y las ordena', () => {
    const p = sanitizeProgress({ completedMissions: [5, 1, 1, 9, 0, '3', 2.5, 6] });
    expect(p.completedMissions).toEqual([1, 5, 6]);
  });

  test('la misión actual fuera de rango vuelve a la 1', () => {
    expect(sanitizeProgress({ currentMission: 7 }).currentMission).toBe(1);
    expect(sanitizeProgress({ currentMission: '4' }).currentMission).toBe(1);
    expect(sanitizeProgress({ currentMission: 4 }).currentMission).toBe(4);
  });

  test('solo acepta insignias conocidas', () => {
    const p = sanitizeProgress({ unlockedAchievements: ['boot_surgeon', 'hacker_supremo', 'boot_surgeon', 3] });
    expect(p.unlockedAchievements).toEqual(['boot_surgeon']);
  });

  test('los booleanos solo son true si se guardaron como true', () => {
    const p = sanitizeProgress({ cableConectado: 'true', mbrFixed: 1, bootFixed: true });
    expect(p.cableConectado).toBe(false);
    expect(p.mbrFixed).toBe(false);
    expect(p.bootFixed).toBe(true);
  });

  test('pistas negativas o no numéricas cuentan como 0', () => {
    expect(sanitizeProgress({ hintsUsedCount: -3 }).hintsUsedCount).toBe(0);
    expect(sanitizeProgress({ hintsUsedCount: Number.NaN }).hintsUsedCount).toBe(0);
    expect(sanitizeProgress({ hintsUsedCount: 2.7 }).hintsUsedCount).toBe(2);
  });

  test('un test no puede estar aprobado y suspendido a la vez', () => {
    const p = sanitizeProgress({ completedQuizzes: [1, 2], failedQuizzes: [2, 3] });
    expect(p.completedQuizzes).toEqual([1, 2]);
    expect(p.failedQuizzes).toEqual([3]);
  });

  test('recorta nombres de alumno desmesurados', () => {
    expect(sanitizeProgress({ studentName: 'x'.repeat(500) }).studentName).toHaveLength(80);
  });
});

describe('load/save/clear', () => {
  test('guarda y recupera una partida a medias', () => {
    const storage = memoryStorage();
    const snapshot = {
      ...DEFAULT_PROGRESS,
      currentMission: 3,
      completedMissions: [1, 2],
      completedQuizzes: [1],
      failedQuizzes: [2],
      cableConectado: true,
      usbRecogido: true,
      usbInsertado: true,
      mbrFixed: true,
      bootFixed: true,
      studentName: 'Ada Lovelace',
    };
    saveProgress(snapshot, storage);
    expect(storage.data.has(PROGRESS_STORAGE_KEY)).toBe(true);
    expect(loadProgress(storage)).toEqual(snapshot);
  });

  test('un JSON corrupto no rompe la carga', () => {
    const storage = memoryStorage();
    storage.setItem(PROGRESS_STORAGE_KEY, '{no es json');
    expect(loadProgress(storage)).toEqual({ ...DEFAULT_PROGRESS });
  });

  test('un almacenamiento bloqueado no lanza excepciones', () => {
    const broken = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceeded');
      },
      removeItem: () => {
        throw new Error('SecurityError');
      },
    };
    expect(loadProgress(broken)).toEqual({ ...DEFAULT_PROGRESS });
    expect(() => saveProgress({ ...DEFAULT_PROGRESS }, broken)).not.toThrow();
    expect(() => clearProgress(broken)).not.toThrow();
  });

  test('clearProgress borra la partida', () => {
    const storage = memoryStorage();
    saveProgress({ ...DEFAULT_PROGRESS, completedMissions: [1] }, storage);
    clearProgress(storage);
    expect(loadProgress(storage).completedMissions).toEqual([]);
  });
});

describe('calculateGrade', () => {
  test('0 sin nada, 10 con todo', () => {
    expect(calculateGrade([], [])).toBe('0.0');
    expect(calculateGrade([1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6])).toBe('10.0');
  });

  test('las 6 misiones sin tests dan 8,4', () => {
    expect(calculateGrade([1, 2, 3, 4, 5, 6], [])).toBe('8.4');
  });

  test('los duplicados no inflan la nota', () => {
    expect(calculateGrade([1, 1, 1, 1, 1, 1, 1, 1], [2, 2, 2])).toBe(calculateGrade([1], [2]));
  });
});
