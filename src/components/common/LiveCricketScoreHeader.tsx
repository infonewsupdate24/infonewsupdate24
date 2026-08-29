import React, { useState, useEffect } from 'react';
import {
  Trophy,
  ChevronRight,
  X,
  MapPin,
  Calendar,
  Clock,
} from 'lucide-react';
import { CricketMatchScore } from '../../types';
import { LiveScoreAndMandiService } from '../../services/LiveScoreAndMandiService';

export const LiveCricketScoreHeader: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(() =>
    LiveScoreAndMandiService.isCricketBarEnabled()
  );
  const [matches, setMatches] = useState<CricketMatchScore[]>(() =>
    LiveScoreAndMandiService.getMatches()
  );
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setMatches(e.detail);
      }
    };
    const handleToggle = (e: any) => {
      setIsEnabled(e.detail);
    };

    window.addEventListener('infonews:cricket-score-update', handleUpdate);
    window.addEventListener('infonews:cricket-bar-toggle', handleToggle);
    return () => {
      window.removeEventListener('infonews:cricket-score-update', handleUpdate);
      window.removeEventListener('infonews:cricket-bar-toggle', handleToggle);
    };
  }, []);

  if (!isEnabled) return null;

  const activeMatch = matches[activeMatchIndex] || matches[0];
  if (!activeMatch) return null;

  // 1. IF NO MATCH IS CURRENTLY LIVE -> SHOW CLEAN UPCOMING FIXTURE BANNER
  if (!activeMatch.isLive) {
    return (
      <div className="bg-slate-900 border-y border-slate-800 text-white text-xs px-4 py-2 select-none shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1 rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-black text-amber-400 uppercase tracking-wider">
              <Calendar className="h-3 w-3 text-amber-400" />
              <span>आगामी सामना (UPCOMING)</span>
            </span>

            <span className="text-[11px] text-slate-300 font-bold">
              {activeMatch.tournament}:
            </span>

            <span className="font-bold text-white flex items-center gap-1">
              <span>{activeMatch.team1.flag} {activeMatch.team1.name}</span>
              <span className="text-slate-500 font-normal">वि.</span>
              <span>{activeMatch.team2.flag} {activeMatch.team2.name}</span>
            </span>

            <span className="text-[11px] text-slate-400 hidden sm:inline flex items-center gap-1">
              &bull; <Clock className="h-3 w-3 text-slate-400" /> {activeMatch.team2.score} ({activeMatch.venue})
            </span>
          </div>

          <span className="text-[10px] text-slate-500 font-medium">
            (सध्या कोणताही थेट सामना चालू नाही)
          </span>
        </div>
      </div>
    );
  }

  // 2. IF MATCH IS ACTUALLY LIVE -> SHOW LIVE SCORE STRIP
  return (
    <>
      <div className="bg-slate-900 border-y border-slate-800 text-white text-xs px-4 py-2 select-none shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Match Info & Live Score */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Indicator Pill */}
            <div className="flex items-center gap-1.5 rounded-full bg-red-950 border border-red-600 px-2.5 py-0.5 text-[10px] font-black text-red-400 uppercase tracking-wider shadow-xs">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE MATCH</span>
            </div>

            {/* Tournament & Teams */}
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <span className="text-[11px] text-amber-400 font-medium hidden md:inline">
                {activeMatch.tournament} &bull;
              </span>

              {/* Team 1 */}
              <div className="flex items-center gap-1">
                <span>{activeMatch.team1.flag}</span>
                <span>{activeMatch.team1.shortName}</span>
                <span className="font-mono text-slate-400">{activeMatch.team1.score}</span>
              </div>

              <span className="text-slate-500 font-mono">वि.</span>

              {/* Team 2 */}
              <div className="flex items-center gap-1">
                <span>{activeMatch.team2.flag}</span>
                <span className="text-amber-400 font-extrabold">{activeMatch.team2.shortName}</span>
                <span className="font-mono text-emerald-400 font-black">
                  {activeMatch.team2.score} ({activeMatch.team2.overs})
                </span>
              </div>
            </div>

            {/* Match Status */}
            <span className="hidden sm:inline-block text-[11px] text-amber-300 font-medium truncate max-w-xs">
              &bull; {activeMatch.currentStatus}
            </span>
          </div>

          {/* Right Action: Open Scorecard */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsScorecardOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1 text-[11px] font-black text-white transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <span>स्कोअरकार्ड (Scorecard)</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Scorecard Modal */}
      {isScorecardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 text-white shadow-2xl overflow-hidden border border-slate-700 flex flex-col max-h-[90vh]">
            <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-start justify-between">
              <div>
                <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                  LIVE MATCH
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {activeMatch.matchTitle}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-red-500" />
                  <span>{activeMatch.venue}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsScorecardOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeMatch.team1.flag}</span>
                    <span className="font-bold text-white">{activeMatch.team1.name}</span>
                  </div>
                  <span className="text-lg font-black font-mono text-slate-200">
                    {activeMatch.team1.score}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeMatch.team2.flag}</span>
                    <span className="font-bold text-amber-400">{activeMatch.team2.name}</span>
                  </div>
                  <span className="text-lg font-black font-mono text-emerald-400">
                    {activeMatch.team2.score}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-center text-amber-300 font-bold">
                {activeMatch.currentStatus}
              </div>
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsScorecardOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                बंद करा
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
