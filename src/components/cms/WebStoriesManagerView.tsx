import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  Eye,
  Layers,
  ExternalLink,
  Smartphone,
  Share2,
  Image as ImageIcon,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { WebStory, WebStorySlide } from '../../types';
import { WebStoryService } from '../../services/WebStoryService';
import { WebStoryPlayerModal } from '../public/WebStoryPlayerModal';

export const WebStoriesManagerView: React.FC = () => {
  const [stories, setStories] = useState<WebStory[]>(() =>
    WebStoryService.getStories()
  );
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [previewStory, setPreviewStory] = useState<WebStory | null>(null);

  // New Story Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('पर्यटन व भ्रमंती');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80'
  );
  const [slides, setSlides] = useState<Omit<WebStorySlide, 'id'>[]>([
    {
      imageUrl:
        'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80',
      title: '१. पहिल्या मुद्द्याचे आकर्षक शीर्षक',
      description: 'येथे या स्लाइडबद्दल २-३ ओळींची संक्षिप्त आणि महत्त्वाची माहिती लिहा.',
      tag: 'हायलाइट',
      ctaText: 'पूर्ण बातमी वाचा',
      ctaUrl: 'https://infonewsupdate24.com',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      title: '२. दुसऱ्या मुद्द्याचे आकर्षक शीर्षक',
      description: 'वाचकांना आकर्षित करणारी माहिती व आकडेवारी.',
      tag: 'विशेष',
    },
  ]);

  const [toastMsg, setToastMsg] = useState('');

  const stats = useMemo(() => {
    const totalViews = stories.reduce((sum, s) => sum + s.viewsCount, 0);
    const publishedCount = stories.filter((s) => s.isPublished).length;
    return { totalViews, publishedCount, totalStories: stories.length };
  }, [stories]);

  const handleAddSlide = () => {
    setSlides([
      ...slides,
      {
        imageUrl:
          'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
        title: `${slides.length + 1}. नवीन स्लाइड शीर्षक`,
        description: 'स्लाइडची संक्षिप्त माहिती.',
        tag: 'अपडेट',
      },
    ]);
  };

  const handleRemoveSlide = (idx: number) => {
    if (slides.length > 1) {
      setSlides(slides.filter((_, i) => i !== idx));
    }
  };

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !coverImage.trim() || slides.length === 0) return;

    const generatedSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-') + `-${Date.now().toString().slice(-4)}`;

    const newStory = WebStoryService.createStory({
      title: title.trim(),
      slug: generatedSlug,
      category,
      coverImage,
      author: 'संपादकीय मंडळ',
      isPublished: true,
      isFeatured: true,
      slides: slides.map((s, i) => ({
        ...s,
        id: `slide-${Date.now()}-${i}`,
      })),
    });

    setStories(WebStoryService.getStories());
    setActiveTab('list');
    setTitle('');
    setSlug('');
    setToastMsg('✅ नवीन Google Web Story यशस्वीरीत्या प्रकाशित झाली!');
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleTogglePublish = (id: string, current: boolean) => {
    const updated = WebStoryService.updateStory(id, { isPublished: !current });
    setStories(updated);
    setToastMsg('स्टोरी स्थिती अपडेट झाली.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDeleteStory = (id: string) => {
    if (confirm('ही वेब स्टोरी कायमची हटवायची आहे का?')) {
      const updated = WebStoryService.deleteStory(id);
      setStories(updated);
      setToastMsg('वेब स्टोरी हटवली.');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-gradient-to-r from-red-600 to-amber-600 px-2.5 py-0.5 text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Google Discover Traffic Engine
            </span>
            <span className="text-xs font-bold text-slate-500">व्हिज्युअल वेब स्टोरीज</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Google Web Stories व्यवस्थापक (Visual Web Stories Studio)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            गुगल डिस्कव्हर व मोबाईल वाचकांसाठी इन्स्टाग्राम स्टोरीजसारख्या ९:१६ व्हिज्युअल बातम्या तयार करा व लाखो ट्रॅफिक मिळवा.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'list' ? 'create' : 'list')}
          className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 px-4 py-2 text-xs font-black text-white shadow-md transition-all cursor-pointer"
        >
          {activeTab === 'list' ? (
            <>
              <Plus className="h-4 w-4" />
              <span>नवीन वेब स्टोरी बनवा</span>
            </>
          ) : (
            <span>सर्व स्टोरीज यादी पहा</span>
          )}
        </button>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            एकूण स्टोरी व्ह्यूज (Total Story Views)
          </span>
          <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
            {stats.totalViews.toLocaleString('mr-IN')}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Google Discover वरील एकत्रित वाचकसंख्या</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            लाईव्ह वेब स्टोरीज (Live Stories)
          </span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
            {stats.publishedCount}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">सध्या पोर्टलवर सक्रिय असणाऱ्या स्टोरीज</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">
            एकूण स्टोरीज
          </span>
          <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">
            {stats.totalStories}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">तयार केलेले सर्व व्हिज्युअल सेट्स</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STORIES LIST */}
      {/* ========================================================================= */}
      {activeTab === 'list' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-red-600" />
              <span>सर्व प्रकाशित वेब स्टोरीज ({stories.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="group relative rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
              >
                {/* 9:16 Thumbnail Container */}
                <div className="relative aspect-9/14 overflow-hidden">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                    <span className="rounded bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-amber-300">
                      {story.category}
                    </span>
                    <span className="rounded bg-red-600 px-2 py-0.5 text-[9px] font-black text-white">
                      {story.slides.length} स्लाइड्स
                    </span>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-2 left-2 right-2 space-y-1">
                    <h4 className="text-xs font-bold text-white line-clamp-3 leading-snug">
                      {story.title}
                    </h4>
                    <span className="text-[10px] text-slate-300 block">
                      👁️ {story.viewsCount.toLocaleString('mr-IN')} व्ह्यूज &bull; {story.publishDate}
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewStory(story)}
                    className="flex items-center gap-1 font-bold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>प्रिव्ह्यू पहा</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(story.id, story.isPublished)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        story.isPublished
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {story.isPublished ? 'Live' : 'Draft'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteStory(story.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
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
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CREATE NEW WEB STORY */}
      {/* ========================================================================= */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateStory} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Story Config & Slides (8 Cols) */}
            <div className="lg:col-span-8 space-y-5">
              {/* General Story Meta */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-red-600" />
                  <span>१. वेब स्टोरीची मुख्य माहिती (Story Title & Category)</span>
                </h3>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    स्टोरीचे मुख्य शीर्षक (Catchy Story Headline in Marathi): *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="उदा. पावसाळ्यात स्वर्गासारखी भासणारी महाराष्ट्रातील ५ प्रमुख पर्यटन स्थळे"
                    className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-900 text-xs focus:border-red-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">प्रवर्ग (Category):</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-slate-800"
                    >
                      <option value="पर्यटन व भ्रमंती">पर्यटन व भ्रमंती</option>
                      <option value="कृषी व शेती विशेष">कृषी व शेती विशेष</option>
                      <option value="आरोग्य व जीवनशैली">आरोग्य व जीवनशैली</option>
                      <option value="टेक व गॅजेट्स">टेक व गॅजेट्स</option>
                      <option value="मनोरंजन व सिनेमा">मनोरंजन व सिनेमा</option>
                      <option value="राजकारण व चालू घडामोडी">राजकारण व चालू घडामोडी</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      कव्हर फोटो लिंक (Cover Image URL): *
                    </label>
                    <input
                      type="url"
                      required
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 font-mono text-slate-900 focus:border-red-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Slide Visual Editor */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-red-600" />
                    <span>२. व्हिज्युअल स्लाइड्स जोडा ({slides.length} स्लाइड्स)</span>
                  </h3>

                  <button
                    type="button"
                    onClick={handleAddSlide}
                    className="flex items-center gap-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>नवीन स्लाइड जोडा</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {slides.map((slide, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span className="font-black text-slate-800 text-xs">
                          स्लाइड #{idx + 1}
                        </span>

                        {slides.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlide(idx)}
                            className="text-slate-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>हटवा</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            स्लाइड इमेज लिंक (9:16 Vertical Image URL):
                          </label>
                          <input
                            type="url"
                            required
                            value={slide.imageUrl}
                            onChange={(e) => {
                              const copy = [...slides];
                              copy[idx].imageUrl = e.target.value;
                              setSlides(copy);
                            }}
                            className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            स्लाइड टॅग (Tag / Badge):
                          </label>
                          <input
                            type="text"
                            value={slide.tag || ''}
                            onChange={(e) => {
                              const copy = [...slides];
                              copy[idx].tag = e.target.value;
                              setSlides(copy);
                            }}
                            placeholder="उदा. निसर्ग सौंदर्य, टीप"
                            className="w-full rounded-lg border border-slate-300 p-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          स्लाइड शीर्षक (Slide Heading):
                        </label>
                        <input
                          type="text"
                          required
                          value={slide.title}
                          onChange={(e) => {
                            const copy = [...slides];
                            copy[idx].title = e.target.value;
                            setSlides(copy);
                          }}
                          className="w-full rounded-lg border border-slate-300 p-2 font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          वर्णन / गोषवारा (Description - 2 lines):
                        </label>
                        <textarea
                          rows={2}
                          value={slide.description || ''}
                          onChange={(e) => {
                            const copy = [...slides];
                            copy[idx].description = e.target.value;
                            setSlides(copy);
                          }}
                          className="w-full rounded-lg border border-slate-300 p-2 text-slate-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
                >
                  रद्द करा
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs shadow-lg shadow-red-200 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Google Web Story प्रकाशित करा</span>
                </button>
              </div>
            </div>

            {/* Right Column: Live Mobile Mockup (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-3xl border-4 border-slate-800 bg-slate-950 p-4 shadow-2xl space-y-3">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block text-center">
                  📱 LIVE 9:16 PREVIEW (स्लाइड #१)
                </span>

                <div className="relative aspect-9/16 rounded-2xl overflow-hidden shadow-inner bg-slate-900 border border-slate-800">
                  <img
                    src={slides[0]?.imageUrl || coverImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="h-1 flex-1 bg-white/40 rounded-full mr-1" />
                    <span className="h-1 flex-1 bg-white/20 rounded-full" />
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 space-y-1 text-white">
                    <span className="rounded bg-red-600 px-2 py-0.5 text-[8px] font-black uppercase">
                      {slides[0]?.tag || 'HIGHLIGHT'}
                    </span>
                    <h4 className="text-xs font-black text-white leading-snug">
                      {slides[0]?.title || title || 'स्टोरी शीर्षक येथे दिसेल'}
                    </h4>
                    <p className="text-[10px] text-slate-300 line-clamp-2">
                      {slides[0]?.description || 'स्लाइडचे वर्णन येथे दिसेल.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Story Player Modal for Preview */}
      {previewStory && (
        <WebStoryPlayerModal
          story={previewStory}
          onClose={() => setPreviewStory(null)}
        />
      )}

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
