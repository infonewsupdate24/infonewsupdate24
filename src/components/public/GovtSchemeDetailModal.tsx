import React, { useEffect } from 'react';
import {
  X,
  FileText,
  ExternalLink,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  Building,
  Award,
  Sparkles,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { GovtSchemeOrJob } from '../../types';
import { GovtSchemeService } from '../../services/GovtSchemeService';

interface GovtSchemeDetailModalProps {
  scheme: GovtSchemeOrJob | null;
  onClose: () => void;
}

export const GovtSchemeDetailModal: React.FC<GovtSchemeDetailModalProps> = ({
  scheme,
  onClose,
}) => {
  useEffect(() => {
    if (scheme) {
      GovtSchemeService.incrementViews(scheme.id);
    }
  }, [scheme]);

  if (!scheme) return null;

  const handleShare = () => {
    const url = GovtSchemeService.generateWhatsAppShareUrl(scheme);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200 text-slate-900 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-amber-400 text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                {scheme.type === 'SCHEME'
                  ? 'शासकीय योजना'
                  : scheme.type === 'JOB'
                  ? 'नोकरी व भरती'
                  : 'शासन निर्णय (GR)'}
              </span>
              <span className="text-xs text-blue-200 font-bold">
                {scheme.department}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black leading-snug font-serif">
              {scheme.title}
            </h3>

            {scheme.grNumberOrAdvtNo && (
              <span className="text-[11px] font-mono text-slate-300 block">
                {scheme.grNumberOrAdvtNo}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* 1. Benefits Highlight Card */}
          <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-amber-600" />
              योजनेचा मुख्य लाभ / वेतन श्रेणी (Key Benefits)
            </span>
            <div className="text-base sm:text-lg font-black text-amber-950 font-serif">
              {scheme.benefitsOrPayScale}
            </div>
            <div className="text-[11px] text-amber-900 font-medium">
              ⏰ स्थिती: <strong>{scheme.lastDateOrStatus}</strong> &bull; प्रसिद्ध: {scheme.publishedDate}
            </div>
          </div>

          {/* 2. Summary */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900">
              योजनेबद्दल सविस्तर माहिती:
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {scheme.summary}
            </p>
          </div>

          {/* 3. Eligibility & Documents 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Eligibility */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <h5 className="font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>पात्रता निकष (Eligibility)</span>
              </h5>
              <ul className="space-y-1.5 text-slate-700">
                {scheme.eligibility.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Documents */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <h5 className="font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>आवश्यक कागदपत्रे (Documents)</span>
              </h5>
              <ul className="space-y-1.5 text-slate-700">
                {scheme.documentsRequired.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>WhatsApp वर शेअर करा</span>
          </button>

          <div className="flex items-center gap-2">
            {scheme.grPdfDownloadUrl && (
              <a
                href={scheme.grPdfDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 px-4 py-2.5 font-bold text-xs transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4 text-red-600" />
                <span>अधिकृत GR / PDF</span>
              </a>
            )}

            <a
              href={scheme.officialApplyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-black text-xs shadow-md shadow-blue-200 transition-all cursor-pointer"
            >
              <span>अधिकृत अर्ज करा</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
