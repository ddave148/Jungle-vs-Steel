import React from 'react';
import { History, X, Shield, Trees, Compass, Crosshair, Award } from 'lucide-react';

interface HistoricalDossierModalProps {
  onClose: () => void;
}

export const HistoricalDossierModal: React.FC<HistoricalDossierModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0c0d0c] border border-white/15 rounded-lg p-5 sm:p-7 shadow-2xl text-[#d1d5db] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#141614] border border-white/10 flex items-center justify-center">
              <History className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="stencil text-xl font-bold uppercase tracking-wider text-white">
                Historical Context & Asymmetry Dossier
              </h2>
              <p className="text-xs text-white/50 font-mono">
                Military Dynamics of the Vietnam War (1965–1975) &bull; Tactical Asymmetry Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2 text-xs leading-relaxed text-white/80">
          <div className="panel-bg p-4 rounded-lg border-l-4 border-emerald-400">
            <h3 className="stencil text-sm font-bold text-emerald-300 mb-1">
              The Physics of Asymmetric Warfare
            </h3>
            <p>
              The Vietnam War was defined by a profound contrast in military doctrine, technological capability, and strategic operational objectives. <strong className="text-white">Jungle vs. Steel</strong> abstracts these historical dynamics into a tactical card duel between conventional mechanized firepower and guerrilla concealment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* US Doctrine */}
            <div className="panel-bg p-4 rounded-lg border-l-4 border-blue-500 space-y-2">
              <div className="flex items-center gap-2 us-accent">
                <Shield className="w-4 h-4 text-blue-400" />
                <h4 className="stencil text-sm font-bold">United States Armed Forces</h4>
              </div>
              <p className="text-[11px] text-white/70">
                <strong>Doctrine: "Search and Destroy" & Firepower Superiority</strong>
              </p>
              <p className="text-[11px] text-white/70">
                Relying on immense logistical depth, the US deployed air cavalry (UH-1 Huey helicopters), sustained automatic fire (M60 Machine Guns), and massive artillery firebases to dominate conventional engagements.
              </p>
              <div className="bg-black/40 p-2.5 rounded border border-blue-500/20 text-[10px] space-y-1">
                <div>&bull; <strong>UH-1 Iroquois "Huey":</strong> Provided aerial recon and rapid troop insertion.</div>
                <div>&bull; <strong>M102 105mm Artillery:</strong> Delivered devastating suppression strikes.</div>
                <div>&bull; <strong>C-130 Hercules Logistics:</strong> Enabled rapid ammo & materiel supply surges.</div>
              </div>
            </div>

            {/* NLF Doctrine */}
            <div className="panel-bg p-4 rounded-lg border-r-4 border-green-500 space-y-2 text-right">
              <div className="flex items-center justify-end gap-2 nlf-accent">
                <h4 className="stencil text-sm font-bold">National Liberation Front (NLF / Viet Cong)</h4>
                <Trees className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-[11px] text-white/70">
                <strong>Doctrine: "Clinging to the Belt" & Insurgency</strong>
              </p>
              <p className="text-[11px] text-white/70">
                The NLF counteracted superior American tech by leveraging environmental familiarity, concealment, and subterranean labyrinth tunnels (such as Củ Chi and the Iron Triangle).
              </p>
              <div className="bg-black/40 p-2.5 rounded border border-green-500/20 text-[10px] space-y-1 text-left">
                <div>&bull; <strong>Punji Bamboo Traps:</strong> Concealed area denial that halted patrols.</div>
                <div>&bull; <strong>RPG-7 Rocket Teams:</strong> Close-range ambushes nullifying armor advantages.</div>
                <div>&bull; <strong>Củ Chi Tunnel Networks:</strong> Allowed guerrilla cells to vanish and strike anywhere.</div>
              </div>
            </div>
          </div>

          {/* Historical Sectors */}
          <div className="panel-bg p-4 rounded-lg border-t border-white/10 space-y-2">
            <h4 className="stencil text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              The Battle Sectors of the Game
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-black/40 p-2.5 rounded border border-white/5">
                <span className="stencil font-bold text-white block">Zone A: Hill 875</span>
                <span className="text-[10px] text-white/40 block mb-1">Dak To &bull; Central Highlands</span>
                <p className="text-white/70">Steep jungle terrain where heavy artillery and brutal entrenched combat decided tactical control.</p>
              </div>
              <div className="bg-black/40 p-2.5 rounded border border-white/5">
                <span className="stencil font-bold text-white block">Zone B: Iron Triangle</span>
                <span className="text-[10px] text-white/40 block mb-1">Bình Dương &bull; Dense Jungle</span>
                <p className="text-white/70">The epicentre of NLF subterranean tunnel warfare and intense ambushes near Saigon.</p>
              </div>
              <div className="bg-black/40 p-2.5 rounded border border-white/5">
                <span className="stencil font-bold text-white block">Zone C: Mekong Delta</span>
                <span className="text-[10px] text-white/40 block mb-1">Southern Vietnam &bull; Riverways</span>
                <p className="text-white/70">A labyrinth of mangrove swamps, canals, and riverine patrols contesting agricultural resources.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
