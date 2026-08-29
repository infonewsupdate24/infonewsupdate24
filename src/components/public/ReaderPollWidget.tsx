import React, { useEffect, useState } from 'react';
import { CheckCircle, Flame, PieChart, RefreshCw, Share2, Vote } from 'lucide-react';
import { Poll, PollService } from '../../services/PollService';

export const ReaderPollWidget: React.FC = () => {
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userVoted, setUserVoted] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const loadPoll = () => {
    const poll = PollService.getActivePoll();
    setActivePoll(poll);
    if (poll) {
      const voted = PollService.getUserVotedOption(poll.id);
      setUserVoted(voted);
    }
  };

  useEffect(() => {
    loadPoll();
  }, []);

  if (!activePoll) return null;

  const handleVote = () => {
    if (!selectedOption || !activePoll || isSubmitting) return;
    setIsSubmitting(true);

    const res = PollService.submitVote(activePoll.id, selectedOption);
    if (res.success && res.poll) {
      setActivePoll(res.poll);
      setUserVoted(selectedOption);
    }
    setIsSubmitting(false);
  };

  const handleSharePoll = () => {
    const shareText = `📊 *InfoNewsUpdate24 जनमत चाचणी*\n\n❓ ${activePoll.question}\n\nआपले मत नोंदवण्यासाठी भेट द्या:\n${window.location.href}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div
      id="reader-poll-widget"
      className="rounded-2xl border-2 border-red-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <Vote className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-red-600">
                दैनिक जनमत चाचणी
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                LIVE
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-800">वाचकांचे मत (Daily Reader Poll)</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSharePoll}
          title="Share Poll to WhatsApp"
          className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Share2 className="h-3 w-3" />
          <span>{copiedShare ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      {/* Category Pill & Question */}
      <div className="mt-3.5 space-y-2">
        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
          {activePoll.category}
        </span>
        <h4 className="text-sm font-black text-slate-900 leading-snug">
          {activePoll.question}
        </h4>
      </div>

      {/* Voting Area */}
      <div className="mt-4 space-y-2.5">
        {activePoll.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isUserVote = userVoted === option.id;
          const percentage =
            activePoll.totalVotes > 0
              ? Math.round((option.votes / activePoll.totalVotes) * 100)
              : 0;

          if (userVoted) {
            // Results Mode
            return (
              <div
                key={option.id}
                className={`relative overflow-hidden rounded-xl border p-3 text-xs transition-all ${
                  isUserVote
                    ? 'border-red-500 bg-red-50/40 font-bold text-red-950'
                    : 'border-slate-200 bg-slate-50/70 text-slate-800'
                }`}
              >
                {/* Background Progress Bar */}
                <div
                  className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
                    isUserVote ? 'bg-red-200/60' : 'bg-slate-200/60'
                  }`}
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative z-10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isUserVote && <CheckCircle className="h-4 w-4 text-red-600 shrink-0" />}
                    <span className="font-semibold">{option.text}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono">
                    <span className="text-[11px] font-bold text-slate-700">{percentage}%</span>
                    <span className="text-[10px] text-slate-400">({option.votes})</span>
                  </div>
                </div>
              </div>
            );
          }

          // Active Input Voting Mode
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOption(option.id)}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs font-semibold transition-all ${
                isSelected
                  ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-600/20'
                  : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span>{option.text}</span>
              <span
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-red-600 bg-red-600 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Bar / Vote Submission */}
      {!userVoted ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <PieChart className="h-3.5 w-3.5 text-slate-400" />
            <span>एकूण मते: {activePoll.totalVotes.toLocaleString()}</span>
          </div>

          <button
            type="button"
            onClick={handleVote}
            disabled={!selectedOption || isSubmitting}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Vote className="h-3.5 w-3.5" />
            <span>मत नोंदवा (Vote Now)</span>
          </button>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
          <span className="flex items-center gap-1 font-bold text-emerald-700">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            आपले मत नोंदवले गेले आहे!
          </span>
          <span className="font-mono text-slate-500">
            एकूण: {activePoll.totalVotes.toLocaleString()} मते
          </span>
        </div>
      )}
    </div>
  );
};
