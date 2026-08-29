import React, { useState, useEffect } from 'react';
import {
  Mail,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Bell,
  ArrowRight,
  Send,
  Coffee,
  Smartphone,
  Check,
} from 'lucide-react';
import {
  NewsletterSubscriptionService,
  NewsletterSettings,
} from '../../services/NewsletterSubscriptionService';

export const NewsletterSubscriptionWidget: React.FC = () => {
  const [settings, setSettings] = useState<NewsletterSettings>(() =>
    NewsletterSubscriptionService.getSettings()
  );
  const [subType, setSubType] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
  const [contactInput, setContactInput] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('गडचिरोली');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(NewsletterSubscriptionService.getSettings());
    };
    window.addEventListener('infonews:newsletter-updated', handleUpdate);
    return () =>
      window.removeEventListener('infonews:newsletter-updated', handleUpdate);
  }, []);

  if (!settings.isEnabled) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const val = contactInput.trim();
    if (!val) {
      setErrorMessage(
        subType === 'EMAIL'
          ? 'कृपया आपला वैध ईमेल पत्ता भरा.'
          : 'कृपया आपला १० अंकी व्हॉट्सॲप क्रमांक भरा.'
      );
      return;
    }

    if (subType === 'EMAIL') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setErrorMessage('कृपया योग्य स्वरूपातील ईमेल भरा (उदा. name@example.com)');
        return;
      }
    } else {
      const phoneDigits = val.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setErrorMessage('कृपया वैध १० अंकी मोबाईल क्रमांक भरा.');
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      NewsletterSubscriptionService.subscribe(val, subType, selectedDistrict);
      setIsSubmitting(false);
      setIsSubscribed(true);
    }, 600);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-linear-to-br from-slate-950 via-slate-900 to-amber-950/40 p-6 sm:p-10 shadow-2xl text-white my-8 animate-fadeIn">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* ========================================================================= */}
        {/* LEFT 6 COLS: HEADLINE, HIGHLIGHTS, BENEFITS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500/20 border border-amber-400/50 px-3 py-1 text-[11px] font-black uppercase text-amber-300 flex items-center gap-1.5 shadow-xs animate-pulse">
              <Coffee className="h-3.5 w-3.5 text-amber-400" />
              <span>सकाळी ८:०० वाजता मोफत वृत्तसेवा</span>
            </span>
            <span className="text-xs text-slate-400 font-bold hidden sm:inline">
              • ५०,०००+ वाचक जोडले आहेत
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight leading-snug">
              {settings.sectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed text-justify">
              {settings.sectionSubtitle}
            </p>
          </div>

          {/* Benefits Bullet List */}
          <div className="space-y-2.5 pt-2">
            {settings.benefitPoints.map((point, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Check className="h-3 w-3" />
                </div>
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-800">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>१००% मोफत • कोणताही स्पॅम नाही • कधीही १-क्लिक अनसबस्क्राइब करा</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT 6 COLS: INTERACTIVE SUBSCRIPTION CARD */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-slate-700/80 bg-slate-900/95 p-6 sm:p-8 shadow-2xl space-y-6">
            {!isSubscribed ? (
              <>
                {/* Mode Selector Tabs (Email vs WhatsApp) */}
                <div className="flex items-center rounded-2xl bg-slate-950 p-1.5 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setSubType('EMAIL');
                      setErrorMessage('');
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      subType === 'EMAIL'
                        ? 'bg-linear-to-r from-red-600 to-amber-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    <span>📧 ईमेल न्यूजलेटर</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubType('WHATSAPP');
                      setErrorMessage('');
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      subType === 'WHATSAPP'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>📲 व्हॉट्सॲप बुलेटिन</span>
                  </button>
                </div>

                {/* Subscription Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      {subType === 'EMAIL' ? 'आपला ईमेल पत्ता:' : 'आपला व्हॉट्सॲप मोबाईल नंबर:'}
                    </label>
                    <div className="relative">
                      {subType === 'EMAIL' ? (
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      ) : (
                        <Smartphone className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                      )}
                      <input
                        type={subType === 'EMAIL' ? 'email' : 'tel'}
                        value={contactInput}
                        onChange={(e) => setContactInput(e.target.value)}
                        placeholder={
                          subType === 'EMAIL'
                            ? 'उदा. apnamail@gmail.com'
                            : 'उदा. ९८२२१ ४४५५०'
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-950/90 pl-10 pr-4 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      आपला जिल्हा / तालुका निवडा (स्थानिक वार्तांसाठी):
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/90 px-3.5 py-2.5 text-xs font-bold text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      <option value="गडचिरोली">🚩 गडचिरोली जिल्हा (सर्व १२ तालुके)</option>
                      <option value="अहेरी">📍 अहेरी तालुका</option>
                      <option value="आरमोरी">🌾 आरमोरी तालुका</option>
                      <option value="चामोर्शी">📍 चामोर्शी तालुका</option>
                      <option value="देसाईगंज">🚆 देसाईगंज (वडसा)</option>
                      <option value="भामरागड">🏥 भामरागड (हेमलकसा)</option>
                      <option value="नागपूर">🏛️ नागपूर</option>
                      <option value="चंद्रपूर">🐅 चंद्रपूर</option>
                      <option value="पुणे">🎓 पुणे</option>
                      <option value="मुंबई">🏢 मुंबई</option>
                      <option value="सर्व महाराष्ट्र">🚩 संपूर्ण महाराष्ट्र व देश</option>
                    </select>
                  </div>

                  {errorMessage && (
                    <p className="text-xs font-bold text-red-400 bg-red-950/50 p-2.5 rounded-xl border border-red-800 animate-shake">
                      ⚠️ {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-linear-to-r from-amber-500 via-red-600 to-amber-600 hover:brightness-110 text-white py-3 px-5 text-xs sm:text-sm font-black shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? (
                      <span>नोंदणी होत आहे...</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        <span>मोफत दररोज सकाळी ८ वाजता मिळवा</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success Screen */
              <div className="text-center py-6 space-y-4 animate-scaleUp">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 shadow-xl">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-white font-serif">
                    🎉 आपले सबस्क्रिप्शन यशस्वी झाले आहे!
                  </h3>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    आता दररोज सकाळी ८:०० वाजता <strong>{contactInput}</strong> वर दैनिक प्रभात वृत्तपत्र व ठळक घडामोडी पाठवल्या जातील.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <a
                    href={settings.officialChannelUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-black shadow-lg transition-colors cursor-pointer"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>अधिकृत WhatsApp चॅनल जॉईन करा (५०K+ सदस्य)</span>
                  </a>

                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubscribed(false);
                        setContactInput('');
                      }}
                      className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      दुसऱ्या नंबर/ईमेलने सबस्क्राइब करा
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
