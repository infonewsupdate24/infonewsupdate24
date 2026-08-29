import React, { useState, useEffect, useMemo } from 'react';
import {
  Landmark,
  Award,
  ChevronRight,
  ExternalLink,
  Download,
  Share2,
  FileText,
  Briefcase,
  Users,
  HeartHandshake,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { GovtSchemeOrJob, SchemeCategory } from '../../types';
import { GovtSchemeService } from '../../services/GovtSchemeService';
import { GovtSchemeDetailModal } from './GovtSchemeDetailModal';

export const GovtSchemesFeedWidget: React.FC = () => {
  const [schemes, setSchemes] = useState<GovtSchemeOrJob[]>(() =>
    GovtSchemeService.getSchemes()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalScheme, setActiveModalScheme] =
    useState<GovtSchemeOrJob | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setSchemes(GovtSchemeService.getSchemes());
    };
    window.addEventListener('infonews:govt-schemes-updated', handleUpdate);
    return () =>
      window.removeEventListener('infonews:govt-schemes-updated', handleUpdate);
  }, []);

  const filteredSchemes = useMemo(() => {
    if (selectedCategory === 'ALL') return schemes;
    return schemes.filter((s) => s.category === selectedCategory);
  }, [schemes, selectedCategory]);

  const CATEGORY_TABS = [
    { id: 'ALL', label: 'सर्व योजना व भरती' },
    { id: 'WOMEN_CHILD', label: '👩 महिला व बालविकास' },
    { id: 'FARMERS', label: '🌾 शेतकरी योजना' },
    { id: 'EMPLOYMENT', label: '👮 नोकरी व भरती' },
    { id: 'HEALTH', label: '🏥 आरोग्य व उपचार' },
    { id: 'STUDENTS', label: '🎓 विद्यार्थी स्कॉलरशिप' },
  ];

  return (
    <>
      <div className="space-y-4 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 p-5 sm:p-7 shadow-sm">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-blue-600 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-sm">
              <Landmark className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
                महाराष्ट्र शासकीय योजना, GR व भरती केंद्र
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                लाडकी बहीण, नमो शेतकरी, पोलीस भरती आणि अधिकृत GR
              </p>
            </div>
          </div>

          <span className="text-xs text-blue-700 font-bold bg-blue-100 px-3 py-1 rounded-full self-start sm:self-auto">
            अधिकृत GR लिंक्स
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-blue-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Schemes Grid (Responsive 4-Columns across full width) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {filteredSchemes.map((scheme) => (
            <div
              key={scheme.id}
              onClick={() => setActiveModalScheme(scheme)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between cursor-pointer space-y-3"
            >
              <div className="space-y-2.5">
                {/* Top Badge & Dept */}
                <div className="flex items-center justify-between">
                  <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5">
                    {scheme.type === 'SCHEME'
                      ? 'योजना'
                      : scheme.type === 'JOB'
                      ? 'नोकरी भरती'
                      : 'शासन निर्णय'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium font-mono">
                    👁️ {scheme.viewsCount.toLocaleString('mr-IN')}
                  </span>
                </div>

                {/* Scheme Title */}
                <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors font-serif">
                  {scheme.title}
                </h4>

                {/* Highlighted Benefits */}
                <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-2.5 space-y-0.5">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">
                    लाभ / वेतन श्रेणी:
                  </span>
                  <strong className="text-xs text-amber-950 font-serif block">
                    {scheme.benefitsOrPayScale}
                  </strong>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {scheme.summary}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  {scheme.lastDateOrStatus}
                </span>

                <span className="flex items-center gap-1 font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  <span>सविस्तर GR व अर्ज</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Details Modal */}
      {activeModalScheme && (
        <GovtSchemeDetailModal
          scheme={activeModalScheme}
          onClose={() => setActiveModalScheme(null)}
        />
      )}
    </>
  );
};
