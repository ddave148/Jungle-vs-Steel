import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Terminal, Shield, Trees, Skull, Radio, Crosshair, Sparkles } from 'lucide-react';

interface ActionLogProps {
  entries: LogEntry[];
}

export const ActionLog: React.FC<ActionLogProps> = ({ entries }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'DEPLOY': return <Crosshair className="w-3 h-3 text-sky-400" />;
      case 'TACTIC': return <Radio className="w-3 h-3 text-amber-400" />;
      case 'TRAP': return <Skull className="w-3 h-3 text-rose-400" />;
      case 'RECON': return <Sparkles className="w-3 h-3 text-teal-400" />;
      case 'COMBAT': return <Shield className="w-3 h-3 text-orange-400" />;
      case 'ZONE_CLAIM': return <Trees className="w-3 h-3 text-emerald-400" />;
      case 'AMMO': return <Radio className="w-3 h-3 text-yellow-400" />;
      case 'PASS': return <Terminal className="w-3 h-3 text-white/40" />;
      default: return <Terminal className="w-3 h-3 text-white/40" />;
    }
  };

  return (
    <div className="panel-bg w-full rounded-lg p-3 flex flex-col h-[180px] shadow-2xl border-white/10">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="stencil">Telemetry & Dispatch Log</span>
        </div>
        <span className="text-[9px] font-mono text-white/30 tracking-wider uppercase">
          Live Feed &bull; 1968
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs select-text">
        {entries.length === 0 ? (
          <div className="text-white/30 italic text-[10px] py-4 text-center">
            Initializing tactical telemetry. Awaiting field operations...
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`p-1.5 rounded flex items-start gap-2 transition-all leading-tight ${
                entry.highlight
                  ? 'bg-amber-950/30 border border-amber-500/40 text-amber-200'
                  : entry.faction === 'US'
                  ? 'bg-blue-950/30 text-blue-200 border-l-2 border-blue-500'
                  : entry.faction === 'NLF'
                  ? 'bg-green-950/30 text-green-200 border-l-2 border-green-500'
                  : 'bg-white/5 text-white/80 border-l-2 border-white/20'
              }`}
            >
              <div className="mt-0.5 shrink-0">{getLogIcon(entry.type)}</div>
              <div className="flex-1">
                <span className="text-[9px] text-white/30 mr-1.5">
                  [{entry.timestamp} | R{entry.round}]
                </span>
                <span className="text-[11px] font-sans">{entry.message}</span>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
