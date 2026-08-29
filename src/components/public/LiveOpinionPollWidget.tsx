import React, { useState, useEffect, useMemo } from 'react';
import {
  Vote,
  CheckCircle2,
  Share2,
  Users,
  Sparkles,
  ExternalLink,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Poll, PollService } from '../../services/PollService';

export const LiveOpinionPollWidget: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>(() => PollService.getActivePolls());
  const [activePollIndex, setActivePollIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setPolls(PollService.getActivePolls());
    };
    window.addEventListener('infonews:polls-updated', handleUpdate);
    window.addEventListener('infonews:poll-vote-updated', handleUpdate);
    return () => {
      window.removeEventListener('infonews:polls-updated', handleUpdate);
      window.removeEventListener('infonews:poll-vote-updated', handleUpdate);
    };
  }, []);

  const activePoll = polls[activePollIndex] || polls[0];
  const userVotedOptionId = useMemo(() => {
    return activePoll ? PollService.getUserVotedOption(activePoll.id) : null;
  }, [activePoll]);

  if (!activePoll) return null;

  const hasVoted = Boolean(userVotedOptionId);

  const handleVoteSubmit = () => {
    if (!selectedOptionId) {
      alert('कृपया आधी एक पर्याय निवडा.');
      return;
    }
    PollService.submitVote(activePoll.id, selectedOptionId);
    setToastMsg('तुमचे मत यशस्वीरीत्या नोंदवले गेले!');
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleShareWhatsApp = () => {
    const votedOption = activePoll.options.find((o) => o.id === userVotedOptionId);
    const url = PollService.generateWhatsAppShareUrl(activePoll, votedOption?.text);
    window.open(url, '_blank');
    setToastMsg('WhatsApp शेअर लिंक उघडली!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white p-5 sm:p-7 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-600 px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1">
              <Vote className="h-3.5 w-3.5" />
              LIVE OPINION POLL
            </span>
            <span className="text-xs font-bold text-indigo-300">
              {activePoll.category}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white mt-1 font-serif">
            🗳️ आजची थेट जनमत चाचणी (Daily Reader Poll)
          </h3>
        </div>

        {/* Poll Switcher Tabs if multiple polls exist */}
        {polls.length > 1 && (
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            {polls.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePollIndex(idx);
                  setSelectedOptionId(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePollIndex === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                कौल #{idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Poll Question */}
      <div className="space-y-1">
        <h4 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
          {activePoll.question}
        </h4>
        <span className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
          <Users className="h-3.5 w-3.5 text-indigo-400" />
          <span>एकूण <strong>{activePoll.totalVotes.toLocaleString('mr-IN')}</strong> वाचकांनी मत नोंदवले आहे.</span>
        </span>
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {activePoll.options.map((option) => {
          const isVotedChoice = userVotedOptionId === option.id;
          const isSelected = selectedOptionId === option.id;
          const percentage =
            activePoll.totalVotes > 0
              ? Math.round((option.votes / activePoll.totalVotes) * 100)
              : 0;

          if (hasVoted) {
            // VOTED STATE: Animated Result Bar
            return (
              <div
                key={option.id}
                className={`relative overflow-hidden rounded-2xl border p-3.5 transition-all ${
                  isVotedChoice
                    ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50'
                    : 'border-slate-700/80 bg-slate-800/60'
                }`}
              >
                {/* Background Progress Fill */}
                <div
                  className={`absolute top-0 bottom-0 left-0 opacity-20 transition-all duration-1000 ${
                    option.color || 'bg-indigo-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isVotedChoice ? (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-slate-950">
                        <Check className="h-3.5 w-3.5 font-black" />
                      </span>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-500 shrink-0" />
                    )}
                    <span
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isVotedChoice ? 'text-emerald-300' : 'text-slate-200'
                      }`}
                    >
                      {option.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="text-xs text-slate-400">
                      ({option.votes.toLocaleString('mr-IN')} मते)
                    </span>
                    <span className="text-sm sm:text-base font-black text-white">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          // NOT VOTED YET: Interactive Radio Selection
          return (
            <div
              key={option.id}
              onClick={() => setSelectedOptionId(option.id)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/60 shadow-md ring-2 ring-indigo-400/30'
                  : 'border-slate-700/80 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-600'
                      : 'border-slate-500 bg-slate-900'
                  }`}
                >
                  {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-100">
                  {option.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-indigo-500/20">
        {!hasVoted ? (
          <button
            type="button"
            onClick={handleVoteSubmit}
            disabled={!selectedOptionId}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs font-black transition-all cursor-pointer ${
              selectedOptionId
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Vote className="h-4 w-4" />
            <span>आपले मत नोंदवा (Submit Vote)</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>तुमचे मत यशस्वीरीत्या नोंदवले गेले आहे.</span>
          </div>
        )}

        {/* WhatsApp Share Button */}
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-4 py-2.5 text-xs font-black text-white shadow-md transition-all cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>हे जनमत WhatsApp वर शेअर करा</span>
        </button>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-slideUp">
          <Check className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
