import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  X,
  Filter,
  Terminal,
  Trash2,
  Cpu,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

export type AuditCategory =
  | 'HARDWARE'
  | 'BOOT'
  | 'SOFTWARE'
  | 'PROCESOS'
  | 'RED_DHCP'
  | 'SISTEMA';

export type AuditSeverity = 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventId: string;
  category: AuditCategory;
  severity: AuditSeverity;
  action: string;
  details: string;
  missionId: number;
}

export interface SystemStateSnapshot {
  cableConectado: boolean;
  usbRecogido?: boolean;
  usbInsertado: boolean;
  mbrFixed: boolean;
  bootFixed: boolean;
  antivirusInstalado: boolean;
  procesoTerminado: boolean;
  ipLiberada: boolean;
  ipRenovada: boolean;
}

interface CpuSamplePoint {
  time: string;
  cpu: number;
  stateLabel: string;
}

interface TerminalAuditPanelProps {
  entries: AuditLogEntry[];
  systemState: SystemStateSnapshot;
  onClose: () => void;
  onPrintToTerminal: () => void;
  onClearAuditLog: () => void;
}

const createInitialCpuHistory = (procesoTerminado: boolean): CpuSamplePoint[] => {
  const now = Date.now();
  const points: CpuSamplePoint[] = [];
  for (let i = 15; i >= 0; i--) {
    const t = new Date(now - i * 1000).toLocaleTimeString('es-ES', {
      hour12: false,
      minute: '2-digit',
      second: '2-digit',
    });
    const baseCpu = procesoTerminado
      ? 6 + ((i * 3) % 7)
      : 97 + ((i * 2) % 4);
    points.push({
      time: t,
      cpu: Math.min(100, baseCpu),
      stateLabel: procesoTerminado ? 'Nominal (Sin bucle.exe)' : 'bucle.exe (PID 4812)',
    });
  }
  return points;
};

export const TerminalAuditPanel: React.FC<TerminalAuditPanelProps> = ({
  entries,
  systemState,
  onClose,
  onPrintToTerminal,
  onClearAuditLog,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | AuditCategory>('ALL');
  const [cpuHistory, setCpuHistory] = useState<CpuSamplePoint[]>(() =>
    createInitialCpuHistory(systemState.procesoTerminado)
  );

  // Actualización en tiempo real de la curva de uso de CPU (muestra el antes y después de matar bucle.exe)
  useEffect(() => {
    const updateSample = () => {
      const timeLabel = new Date().toLocaleTimeString('es-ES', {
        hour12: false,
        minute: '2-digit',
        second: '2-digit',
      });

      const nextCpu = systemState.procesoTerminado
        ? Math.floor(5 + Math.random() * 9) // 5% - 13% cuando bucle.exe ha sido terminado
        : Math.floor(96 + Math.random() * 5); // 96% - 100% cuando bucle.exe está activo

      setCpuHistory((prev) => [
        ...prev.slice(-17),
        {
          time: timeLabel,
          cpu: nextCpu,
          stateLabel: systemState.procesoTerminado
            ? 'Nominal (bucle.exe terminado)'
            : 'Crítico (bucle.exe PID 4812)',
        },
      ]);
    };

    // Empujar una muestra inmediata cuando cambia el estado de procesoTerminado para ver la caída al instante
    updateSample();

    const interval = window.setInterval(updateSample, 1000);
    return () => window.clearInterval(interval);
  }, [systemState.procesoTerminado]);

  const currentCpuValue =
    cpuHistory.length > 0
      ? cpuHistory[cpuHistory.length - 1].cpu
      : systemState.procesoTerminado
      ? 8
      : 99;

  const filteredEntries =
    selectedCategory === 'ALL'
      ? entries
      : entries.filter((item) => item.category === selectedCategory);

  const renderSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-[9px] font-mono font-bold">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            OK
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-950/90 border border-amber-500/60 text-amber-300 text-[9px] font-mono font-bold">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
            WARN
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-950/90 border border-rose-500/60 text-rose-300 text-[9px] font-mono font-bold">
            <ShieldAlert className="w-2.5 h-2.5 text-rose-400" />
            CRIT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-sky-950/90 border border-sky-500/60 text-sky-300 text-[9px] font-mono font-bold">
            <Info className="w-2.5 h-2.5 text-sky-400" />
            INFO
          </span>
        );
    }
  };

  const lineStrokeColor = systemState.procesoTerminado ? '#34D399' : '#FB7185';

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-2 top-8 bottom-9 w-[295px] sm:w-[350px] z-40 bg-slate-950/98 border-2 border-amber-400/90 rounded-xl shadow-[0_12px_35px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-slate-100"
    >
      {/* Cabecera del Panel de Auditoría Flotante */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/60 to-slate-900 px-2.5 py-1.5 border-b border-amber-500/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-display font-bold text-[11px] text-amber-300 tracking-wide">
            Auditoría de Eventos SMR ({entries.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrintToTerminal}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[9px] font-mono text-sky-300 cursor-pointer"
            title="Volcar registro de auditoría en la salida del terminal (comando audit)"
          >
            <Terminal className="w-2.5 h-2.5" />
            <span>Volcar CMD</span>
          </button>
          <button
            type="button"
            onClick={onClearAuditLog}
            className="p-0.5 rounded bg-slate-800 hover:bg-rose-950 border border-slate-700 text-slate-400 hover:text-rose-300 cursor-pointer"
            title="Limpiar registro de auditoría"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            title="Cerrar panel de auditoría flotante"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Resumen en tiempo real de estados críticos del Sistema Virtual */}
      <div className="px-2.5 py-1.5 bg-slate-900/90 border-b border-slate-800 grid grid-cols-3 gap-1 text-[9px] font-mono shrink-0">
        <div
          className={`px-1.5 py-0.5 rounded border flex items-center justify-between ${
            systemState.cableConectado
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <span>Rack RJ45:</span>
          <strong>{systemState.cableConectado ? 'ON' : 'OFF'}</strong>
        </div>
        <div
          className={`px-1.5 py-0.5 rounded border flex items-center justify-between ${
            systemState.mbrFixed && systemState.bootFixed
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : systemState.usbInsertado
              ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
              : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}
        >
          <span>Arranque:</span>
          <strong>
            {systemState.mbrFixed && systemState.bootFixed
              ? 'OK'
              : systemState.usbInsertado
              ? 'USB'
              : 'ERR'}
          </strong>
        </div>
        <div
          className={`px-1.5 py-0.5 rounded border flex items-center justify-between ${
            systemState.antivirusInstalado
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}
        >
          <span>AV /S:</span>
          <strong>{systemState.antivirusInstalado ? 'OK' : 'PEND'}</strong>
        </div>
        <div
          className={`px-1.5 py-0.5 rounded border flex items-center justify-between ${
            systemState.procesoTerminado
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <span>CPU Load:</span>
          <strong>{currentCpuValue}%</strong>
        </div>
        <div
          className={`px-1.5 py-0.5 rounded border flex items-center justify-between col-span-2 ${
            systemState.ipRenovada
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : systemState.ipLiberada
              ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
              : 'bg-slate-900 border-slate-700 text-slate-300'
          }`}
        >
          <span>DHCP IPv4:</span>
          <strong>
            {systemState.ipRenovada
              ? '192.168.1.105'
              : systemState.ipLiberada
              ? '0.0.0.0'
              : '192.168.1.50'}
          </strong>
        </div>
      </div>

      {/* Widget en Tiempo Real de Uso de CPU con Gráfica de Línea (Recharts) */}
      <div className="px-2.5 py-1.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between gap-1 mb-1 font-mono text-[9px]">
          <div className="flex items-center gap-1 min-w-0">
            <Cpu
              className={`w-3 h-3 shrink-0 ${
                systemState.procesoTerminado ? 'text-emerald-400' : 'text-rose-400 animate-pulse'
              }`}
            />
            <span className="font-bold text-slate-200 truncate">
              Monitor CPU (Tiempo Real)
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`px-1.5 py-0.2 rounded border font-bold ${
                systemState.procesoTerminado
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
              }`}
            >
              {systemState.procesoTerminado
                ? `bucle.exe: OFF (${currentCpuValue}%)`
                : `bucle.exe: PID 4812 (${currentCpuValue}%)`}
            </span>
          </div>
        </div>

        <div className="h-[68px] w-full bg-slate-900/90 border border-slate-800/90 rounded-lg px-1 pt-1 pb-0.5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cpuHistory} margin={{ top: 4, right: 6, left: -26, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 8, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                tick={{ fontSize: 8, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: systemState.procesoTerminado ? '#10B981' : '#F43F5E',
                  borderRadius: '6px',
                  padding: '3px 6px',
                  fontSize: '9px',
                  fontFamily: 'monospace',
                }}
                labelStyle={{ color: '#94A3B8', fontSize: '8px' }}
                formatter={(value) => [`${value}%`, 'Uso CPU']}
              />
              <ReferenceLine y={85} stroke="#F59E0B" strokeDasharray="3 3" strokeOpacity={0.6} />
              <Line
                type="monotone"
                dataKey="cpu"
                stroke={lineStrokeColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: lineStrokeColor }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-1 flex items-center justify-between text-[8px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Activity className="w-2.5 h-2.5 text-amber-400" />
            {systemState.procesoTerminado
              ? 'Impacto: Carga liberada tras taskkill /F /IM bucle.exe'
              : 'Impacto: Saturación 99% por bucle.exe (Usa taskkill)'}
          </span>
          <span className="text-amber-300/90">Umbral: 85%</span>
        </div>
      </div>

      {/* Barra de filtros por categoría técnica */}
      <div className="px-2 py-1 bg-slate-950 border-b border-slate-800 flex items-center gap-1 overflow-x-auto shrink-0">
        <Filter className="w-2.5 h-2.5 text-slate-400 shrink-0" />
        {(
          [
            { id: 'ALL', label: 'Todos' },
            { id: 'HARDWARE', label: 'Rack/HW' },
            { id: 'BOOT', label: 'Boot' },
            { id: 'SOFTWARE', label: 'Soft /S' },
            { id: 'PROCESOS', label: 'CPU' },
            { id: 'RED_DHCP', label: 'Red/IP' },
            { id: 'SISTEMA', label: 'Sistema' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === tab.id
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista cronológica de eventos críticos auditados */}
      <div className="flex-1 p-2 overflow-y-auto space-y-1.5 font-mono text-[10px]">
        {filteredEntries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-6 px-3">
            <ClipboardList className="w-5 h-5 mb-1 opacity-50" />
            <span>No hay eventos registrados en esta categoría.</span>
          </div>
        ) : (
          filteredEntries.map((item) => (
            <div
              key={item.id}
              className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-0.5 transition-colors"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {renderSeverityBadge(item.severity)}
                  <span className="text-[9px] text-amber-300/90 font-bold shrink-0">
                    [{item.eventId}]
                  </span>
                  <span className="text-[9px] text-slate-400 shrink-0">M{item.missionId}</span>
                </div>
                <span className="text-[9px] text-slate-400 shrink-0">{item.timestamp}</span>
              </div>
              <div className="font-sans font-bold text-[11px] text-white leading-snug">
                {item.action}
              </div>
              <div className="text-[10px] text-slate-300 leading-tight break-words">
                {item.details}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
