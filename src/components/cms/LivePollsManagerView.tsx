import React, { useState, useEffect, useMemo } from 'react';
import {
  Vote,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle,
  Users,
  Share2,
  BarChart3,
  TrendingUp,
  Layers,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  Calendar,
} from 'lucide-react';
import { Poll, PollService } from '../../services/PollService';

export const LivePollsManagerView: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>(() => PollService.getPolls());
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('राजकारण व निवडणूक कौल');
  const [options, setOptions] = useState<string[]>([
    'होय, पूर्णपणे सहमत',
    'नाही, असहमत',
    'सांगता येत नाही / तटस्थ',
  ]);
  const [newOptionText, setNewOptionText] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const refreshPolls = () => {
    setPolls(PollService.getPolls());
  };

  useEffect(() => {
    const handleUpdate = () => {
      refreshPolls();
    };
    window.addEventListener('infonews:polls-updated', handleUpdate);
    window.addEventListener('infonews:poll-vote-updated', handleUpdate);
    return () => {
      window.removeEventListener('infonews:polls-updated', handleUpdate);
      window.removeEventListener('infonews:poll-vote-updated', handleUpdate);
    };
  }, []);

  const stats = useMemo(() => {
    const totalVotes = polls.reduce((sum, p) => sum + p.totalVotes, 0);
    const activeCount = polls.filter((p) => p.isActive).length;
    return { totalVotes, activeCount, totalPolls: polls.length };
  }, [polls]);

  const handleAddOption = () => {
    if (newOptionText.trim()) {
      setOptions([...options, newOptionText.trim()]);
      setNewOptionText('');
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || options.length < 2) return;

    PollService.createPoll({
      question: question.trim(),
      category: category.trim(),
      options: options.map((opt, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        text: opt,
        votes: 0,
      })),
      isActive: true,
    });

    setQuestion('');
    setOptions(['होय, पूर्णपणे सहमत', 'नाही, असहमत', 'सांगता येत नाही / तटस्थ']);
    setToastMsg('✅ नवीन जनमत चाचणी यशस्वीरीत्या तयार केली व लाईव्ह केली!');
    refreshPolls();
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleToggle = (id: string) => {
    const updated = PollService.togglePollActive(id);
    setPolls(updated);
    setToastMsg('जनमत चाचणीची स्थिती बदलली.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleResetVotes = (id: string) => {
    if (confirm('या जनमत चाचणीची सर्व मते रिसेट (Zero) करायची आहेत का?')) {
      const updated = PollService.resetPollVotes(id);
      setPolls(updated);
      setToastMsg('मते रिसेट करण्यात आली.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('ही जनमत चाचणी कायमची हटवायची आहे का?')) {
      const updated = PollService.deletePoll(id);
      setPolls(updated);
      setToastMsg('जनमत चाचणी हटवली.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 text-[11px] font-black text-indigo-800 uppercase tracking-wider flex items-center gap-1">
              <Vote className="h-3.5 w-3.5 text-indigo-600" />
              Interactive Polling Studio
            </span>
            <span className="text-xs font-bold text-slate-500">वाचक जनमत व कौल</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            थेट जनमत चाचणी व निवडणूक कौल व्यवस्थापन (Live Reader Polls)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            महाराष्ट्रातील चालू घडामोडींवर वाचकांचे मत जाणून घेण्यासाठी जनमत चाचण्या तयार करा आणि लाईव्ह निकाल तपासा.
          </p>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            एकूण नोंदवलेली मते (Total Votes)
          </span>
          <span className="text-2xl font-black text-indigo-600 font-mono mt-1 block">
            {stats.totalVotes.toLocaleString('mr-IN')}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">वाचकांनी दिलेली एकूण मते</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            सक्रिय जनमत चाचण्या (Active Polls)
          </span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
            {stats.activeCount}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">वेबसाईटवर सध्या चालू असलेले पोल</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            एकूण पोल यादी (Total Polls)
          </span>
          <span className="text-2xl font-black text-slate-700 font-mono mt-1 block">
            {stats.totalPolls}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">तयार केलेल्या सर्व जनमत चाचण्या</span>
        </div>
      </div>

      {/* 3. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Create Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleCreatePoll}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-xs"
          >
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">नवीन जनमत चाचणी तयार करा</h3>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                प्रश्न (Poll Question in Marathi): *
              </label>
              <textarea
                rows={3}
                required
                placeholder="उदा. महाराष्ट्रातील चालू राजकीय घडामोडींमध्ये आगामी निवडणुकीत कोणता मुद्दा सर्वाधिक निर्णायक ठरेल?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 font-bold leading-relaxed focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                प्रवर्ग / श्रेणी (Category):
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-800 font-bold"
              >
                <option value="राजकारण व निवडणूक कौल">राजकारण व निवडणूक कौल</option>
                <option value="शेतकरी व कृषी विशेष">शेतकरी व कृषी विशेष</option>
                <option value="महाराष्ट्र विकास व पायाभूत">महाराष्ट्र विकास व पायाभूत</option>
                <option value="क्रीडा व क्रिकेट">क्रीडा व क्रिकेट</option>
                <option value="सामाजिक व चालू घडामोडी">सामाजिक व चालू घडामोडी</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-2">
                मतदानाचे पर्याय (Voting Options):
              </label>
              <div className="space-y-2 mb-3">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...options];
                        updated[idx] = e.target.value;
                        setOptions(updated);
                      }}
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        title="हटवा"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Option Field */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="आणखी पर्याय लिहा..."
                  value={newOptionText}
                  onChange={(e) => setNewOptionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  className="flex-1 rounded-xl border border-slate-300 p-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  + जोडा
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                <Vote className="h-4 w-4" />
                <span>जनमत चाचणी सुरू करा (Publish Live Poll)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Polls List & Analytics (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <span>सध्याच्या जनमत चाचण्या व निकाल ({polls.length})</span>
              </h3>
            </div>

            <div className="space-y-4">
              {polls.map((poll) => (
                <div
                  key={poll.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3.5 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2 py-0.5">
                          {poll.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {poll.createdAt}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {poll.question}
                      </h4>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase shrink-0 ${
                        poll.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {poll.isActive ? 'सक्रिय (Live)' : 'बंद (Closed)'}
                    </span>
                  </div>

                  {/* Results Progress Bars */}
                  <div className="space-y-2 pt-1">
                    {poll.options.map((opt) => {
                      const percentage =
                        poll.totalVotes > 0
                          ? Math.round((opt.votes / poll.totalVotes) * 100)
                          : 0;
                      return (
                        <div key={opt.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-800">{opt.text}</span>
                            <span className="font-mono text-slate-600">
                              {percentage}% ({opt.votes.toLocaleString('mr-IN')} मते)
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                opt.color || 'bg-indigo-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-bold text-slate-700">
                      <Users className="h-3.5 w-3.5 text-indigo-600" />
                      <span>एकूण मते: {poll.totalVotes.toLocaleString('mr-IN')}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(poll.id)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-[11px] font-bold cursor-pointer"
                        title={poll.isActive ? 'बंद करा' : 'सक्रिय करा'}
                      >
                        {poll.isActive ? 'बंद करा' : 'चालू करा'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResetVotes(poll.id)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-[11px] font-bold cursor-pointer"
                        title="मते रिसेट करा"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(poll.id)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-red-600 text-[11px] font-bold cursor-pointer"
                        title="हटवा"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-bold shadow-xl animate-slideUp">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
