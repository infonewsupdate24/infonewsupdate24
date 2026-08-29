import React, { useState, useEffect } from 'react';
import {
  Radio,
  Plus,
  Save,
  Trash2,
  Pin,
  Clock,
  Flame,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
  FileText,
  Image as ImageIcon,
  Edit,
} from 'lucide-react';
import {
  LiveBlogService,
  LiveBlogEvent,
  LiveBlogUpdateItem,
} from '../../services/LiveBlogService';

export const LiveBlogManagerView: React.FC = () => {
  const [liveBlog, setLiveBlog] = useState<LiveBlogEvent | null>(() =>
    LiveBlogService.getActiveLiveBlog()
  );
  const [toastMessage, setToastMessage] = useState<string>('');

  // Fast Update Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newBadge, setNewBadge] = useState<string>('मोठी आघाडी');
  const [newAuthor, setNewAuthor] = useState<string>('विशेष प्रतिनिधी, गडचिरोली');
  const [newImage, setNewImage] = useState<string>('');
  const [newIsPinned, setNewIsPinned] = useState<boolean>(false);
  const [newIsBreaking, setNewIsBreaking] = useState<boolean>(true);
  const [newCustomTime, setNewCustomTime] = useState<string>('');

  // Event Settings State
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventCategory, setEventCategory] = useState<string>('');
  const [eventStatus, setEventStatus] = useState<'LIVE' | 'PAUSED' | 'CONCLUDED'>('LIVE');
  const [eventHighlightsText, setEventHighlightsText] = useState<string>('');

  useEffect(() => {
    if (liveBlog) {
      setEventTitle(liveBlog.title);
      setEventCategory(liveBlog.category);
      setEventStatus(liveBlog.status);
      setEventHighlightsText(liveBlog.keyHighlights.join('\n'));
    }
  }, [liveBlog]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handlePostNewUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('कृपया मथळा व बातमी मजकूर दोन्ही भरा.');
      return;
    }

    const currentFormattedTime =
      newCustomTime.trim() ||
      new Date().toLocaleTimeString('mr-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

    LiveBlogService.addUpdateToActiveBlog({
      timestamp: currentFormattedTime,
      title: newTitle,
      content: newContent,
      badge: newBadge,
      author: newAuthor,
      image: newImage.trim() || undefined,
      isPinned: newIsPinned,
      isBreaking: newIsBreaking,
    });

    setLiveBlog(LiveBlogService.getActiveLiveBlog());
    setNewTitle('');
    setNewContent('');
    setNewImage('');
    setNewCustomTime('');
    setNewIsPinned(false);
    showToast('⚡ नवीन लाईव्ह अपडेट यशस्वीरीत्या प्रसिद्ध झाला!');
  };

  const handleSaveEventSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveBlog) return;

    const highlightsArray = eventHighlightsText
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    const updated: LiveBlogEvent = {
      ...liveBlog,
      title: eventTitle,
      category: eventCategory,
      status: eventStatus,
      keyHighlights: highlightsArray,
      updatedAt: 'आत्ताच अपडेट झाले',
    };

    LiveBlogService.updateBlogDetails(updated);
    setLiveBlog(LiveBlogService.getActiveLiveBlog());
    showToast('✅ थेट वार्तापत्र मुख्य माहिती सेव्ह झाली!');
  };

  const handleDeleteUpdate = (id: string) => {
    if (!liveBlog) return;
    if (confirm('तुम्हाला हा थेट अपडेट काढून टाकायचा आहे का?')) {
      LiveBlogService.deleteUpdate(liveBlog.id, id);
      setLiveBlog(LiveBlogService.getActiveLiveBlog());
      showToast('🗑️ अपडेट काढून टाकला.');
    }
  };

  const handleTogglePin = (id: string) => {
    if (!liveBlog) return;
    LiveBlogService.togglePinUpdate(liveBlog.id, id);
    setLiveBlog(LiveBlogService.getActiveLiveBlog());
    showToast('📌 पिन स्थिती बदलली.');
  };

  const handleResetDefaults = () => {
    if (confirm('मूळ डिफॉल्ट लाईव्ह ब्लॉग डेटावर रिसेट करायचे आहे का?')) {
      LiveBlogService.resetToDefault();
      setLiveBlog(LiveBlogService.getActiveLiveBlog());
      showToast('🔄 मूळ डिफॉल्ट डेटा पुनर्संचयित झाला.');
    }
  };

  if (!liveBlog) return null;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-3 text-xs font-black shadow-2xl animate-slideUp">
          <Check className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-linear-to-r from-red-900 via-slate-900 to-amber-950 p-6 text-white shadow-xl border border-red-800/40">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white font-black shadow-lg">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight font-serif">
                लाईव्ह ब्लॉग व मिनिट-टू-मिनिट वार्ता नियंत्रण
              </h1>
              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white animate-pulse">
                🔴 Active Desk
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              निवडणूक निकाल, मोठी संमेलने व आपत्कालीन घडामोडींचे दर मिनिटाचे अपडेट्स थेट प्रसिद्ध करा
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 text-xs font-bold transition-all border border-slate-700 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>डिफॉल्ट रिसेट</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT 7 COLS: FAST 1-CLICK POST NEW UPDATE FORM */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handlePostNewUpdate}
            className="rounded-3xl border-2 border-red-600/30 bg-white p-6 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <Flame className="h-4 w-4 text-red-600 animate-pulse" />
                <span>नवीन मिनिट-टू-मिनिट अपडेट त्वरित प्रसिद्ध करा (Fast Live Post)</span>
              </h3>
              <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                ⚡ Instant Live
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  टाईमस्टॅम्प (Time)
                </label>
                <input
                  type="text"
                  value={newCustomTime}
                  onChange={(e) => setNewCustomTime(e.target.value)}
                  placeholder="उदा. १२:३० PM (रिक्त असल्यास आत्ताची वेळ)"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  बॅज (Badge Tag)
                </label>
                <select
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
                >
                  <option value="मोठी आघाडी">मोठी आघाडी</option>
                  <option value="अधिकृत निकाल">अधिकृत निकाल</option>
                  <option value="ब्रेकिंग न्यूज">ब्रेकिंग न्यूज</option>
                  <option value="प्रशासकीय बंदोबस्त">प्रशासकीय बंदोबस्त</option>
                  <option value="हवामान इशारा">हवामान इशारा</option>
                  <option value="स्थानिक घडामोडी">स्थानिक घडामोडी</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  बातमीदार (Reporter)
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                अपडेटचा मथळा (Live Headline) *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="उदा. अहेरी विधानसभा: दुर्गम भागातील ईव्हीएम मतपेट्यांची मोजणी सुरू..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-black text-slate-900 focus:border-red-600 focus:outline-none font-serif"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                अपडेटचा सविस्तर मजकूर (Live Body Text) *
              </label>
              <textarea
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="या क्षणी घडलेली सविस्तर माहिती..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-red-600 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  फोटो URL (ऐच्छिक)
                </label>
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsPinned}
                    onChange={(e) => setNewIsPinned(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>📌 महत्त्वाचे (Pin on Top)</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsBreaking}
                    onChange={(e) => setNewIsBreaking(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>🔴 ब्रेकिंग अलर्ट</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 text-xs font-black shadow-lg cursor-pointer transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>लाईव्ह अपडेट प्रसिद्ध करा</span>
              </button>
            </div>
          </form>

          {/* Timeline List in CMS */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-600" />
                <span>प्रसिद्ध झालेले थेट अपडेट्स ({liveBlog.updates.length})</span>
              </span>
              <span className="text-xs text-slate-500 font-normal">
                नवीनतम अपडेट्स वर दिसतात
              </span>
            </h3>

            <div className="space-y-3">
              {liveBlog.updates.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-900 text-amber-400 font-mono text-[10px] font-bold px-2 py-0.5">
                        {item.timestamp}
                      </span>
                      {item.badge && (
                        <span className="rounded bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5">
                          {item.badge}
                        </span>
                      )}
                      {item.isPinned && (
                        <span className="text-[10px] font-black text-amber-600 flex items-center gap-0.5">
                          <Pin className="h-3 w-3" /> Pinned
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-black text-slate-900 font-serif">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {item.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTogglePin(item.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        item.isPinned
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                      title={item.isPinned ? 'पिन काढा' : 'पिन करा'}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteUpdate(item.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                      title="काढून टाका"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT 5 COLS: EVENT CONFIGURATION & HIGHLIGHTS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleSaveEventSettings}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
          >
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase">
                <Sliders className="h-4 w-4 text-red-600" />
                <span>थेट वार्तापत्र मुख्य सेटिंग्ज (Live Event Details)</span>
              </h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                लाईव्ह इव्हेंट स्थिती (Status)
              </label>
              <select
                value={eventStatus}
                onChange={(e) =>
                  setEventStatus(e.target.value as 'LIVE' | 'PAUSED' | 'CONCLUDED')
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
              >
                <option value="LIVE">🔴 LIVE (सुरू ठेवा)</option>
                <option value="PAUSED">⏸️ PAUSED (तात्पुरते थांबवा)</option>
                <option value="CONCLUDED">⏹️ CONCLUDED (संपन्न / पूर्ण)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                इव्हेंटचे मुख्य शीर्षक (Main Live Event Title) *
              </label>
              <textarea
                rows={2}
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none font-serif"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                कॅटेगरी / श्रेणी (Category Tag)
              </label>
              <input
                type="text"
                value={eventCategory}
                onChange={(e) => setEventCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 block">
                महत्त्वाचे ठळक मुद्दे (Key Highlights - १ प्रति ओळ)
              </label>
              <textarea
                rows={4}
                value={eventHighlightsText}
                onChange={(e) => setEventHighlightsText(e.target.value)}
                placeholder="प्रत्येक ओळीवर १ ठळक मुद्दा लिहा..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-red-600 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-black shadow-md cursor-pointer transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                <span>इव्हेंट तपशील सेव्ह करा</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
