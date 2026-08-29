import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  Check,
  CheckCircle,
  Database,
  Download,
  FileText,
  FolderTree,
  Globe,
  Headphones,
  Image as ImageIcon,
  MessageSquare,
  Palette,
  Percent,
  Plus,
  Puzzle,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Vote,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { CmsView, useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Poll, PollService } from '../../services/PollService';
import { HeaderSettingsView } from './HeaderSettingsView';
import { BreakingTickerManagerView } from './BreakingTickerManagerView';
import { LiteSpeedCacheView } from './LiteSpeedCacheView';
import { MediaLibraryView } from './MediaLibraryView';
import { TagManagerView } from './TagManagerView';
import { MenuManagerView } from './MenuManagerView';
import { WordPressAndUrlImporterView } from './WordPressAndUrlImporterView';
import { AdvertisementManagerView } from './AdvertisementManagerView';
import { EPaperManagerView } from './EPaperManagerView';
import { WebPushManagerView } from './WebPushManagerView';
import { PWAManagerView } from './PWAManagerView';
import { LiveCricketAndMandiManagerView } from './LiveCricketAndMandiManagerView';
import { WhatsAppChannelManagerView } from './WhatsAppChannelManagerView';
import { WhatsAppBulletinManagerView } from './WhatsAppBulletinManagerView';
import { MerchantAdBookingManagerView } from './MerchantAdBookingManagerView';
import { LivePollsManagerView } from './LivePollsManagerView';
import { WebStoriesManagerView } from './WebStoriesManagerView';
import { LiveWeatherManagerView } from './LiveWeatherManagerView';
import { CitizenNewsDeskManagerView } from './CitizenNewsDeskManagerView';
import { GovtSchemesManagerView } from './GovtSchemesManagerView';
import { PanchangManagerView } from './PanchangManagerView';
import { GoogleVoiceAnchorSelector } from '../public/GoogleVoiceAnchorSelector';
import {
  AIVoiceService,
  GOOGLE_CONVERSATIONAL_VOICES,
  GoogleVoiceAnchor,
} from '../../services/AIVoiceService';

interface GenericModuleViewProps {
  view: CmsView;
}

export const GenericModuleView: React.FC<GenericModuleViewProps> = ({ view }) => {
  const {
    media,
    uploadMedia,
    deleteMedia,
    comments,
    updateCommentStatus,
    ads,
    updateAd,
    addAd,
    modules,
    toggleModule,
    pages,
    notifications,
    activityLogs,
    themeSettings,
    updateThemeSettings,
    aiVoiceSettings,
    updateAIVoiceSettings,
    setCmsView,
    exportDataJson,
    importDataJson,
    resetToDefaultSeed,
    allUsers,
  } = useApp() as any;

  const { currentUser, hasPermission, allUsers: authUsers } = useAuth();
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdPosition, setNewAdPosition] = useState<any>('HEADER');
  const [newAdCode, setNewAdCode] = useState('');
  const [backupMsg, setBackupMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedCmsAnchor, setSelectedCmsAnchor] = useState<GoogleVoiceAnchor>(() =>
    AIVoiceService.getSavedAnchor()
  );
  const [cmsVoiceSpeed, setCmsVoiceSpeed] = useState(1.0);
  const [cmsVoiceLang, setCmsVoiceLang] = useState<'mr' | 'en'>('mr');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 0. LITESPEED CACHE PLUGIN (Enterprise & QUIC.cloud WebP Image Optimization)
  if (view === 'litespeed_cache') {
    return <LiteSpeedCacheView />;
  }

  // 0.05 MERCHANT UPI AD BOOKINGS MANAGER
  if (view === 'merchant_ads') {
    return <MerchantAdBookingManagerView />;
  }

  // 0.1 DIGITAL E-PAPER HUB MANAGER
  if (view === 'epaper') {
    return <EPaperManagerView />;
  }

  // 0.2 WEB PUSH NOTIFICATIONS MANAGER
  if (view === 'web_push') {
    return <WebPushManagerView />;
  }

  // 0.25 LIVE CRICKET & APMC MANDI MANAGER
  if (view === 'cricket_mandi') {
    return <LiveCricketAndMandiManagerView />;
  }

  // 0.3 PWA MOBILE APP MANAGER
  if (view === 'pwa') {
    return <PWAManagerView />;
  }

  // 0.4 WHATSAPP COMMUNITY MANAGER
  if (view === 'whatsapp_hub') {
    return <WhatsAppChannelManagerView />;
  }

  // 0.5 WHATSAPP DAILY BULLETIN GENERATOR
  if (view === 'whatsapp_bulletin') {
    return <WhatsAppBulletinManagerView />;
  }

  // 0.6 GOOGLE WEB STORIES STUDIO
  if (view === 'web_stories') {
    return <WebStoriesManagerView />;
  }

  // 0.7 DAILY PANCHANG & HOROSCOPE STUDIO
  if (view === 'panchang') {
    return <PanchangManagerView />;
  }

  // 1. MEDIA LIBRARY
  if (view === 'media') {
    return <MediaLibraryView />;
  }

  // 1.5 TAGS MANAGEMENT
  if (view === 'tags') {
    return <TagManagerView />;
  }

  // 2. COMMENTS MODERATION
  if (view === 'comments') {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Comments Moderation</h1>
          <p className="text-xs text-slate-500">Approve, flag spam, or moderate reader interactions.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100">
          {comments.map((comment: any) => (
            <div key={comment.id} className="p-4 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-start gap-3">
                <img
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{comment.authorName}</span>
                    <span className="text-slate-400">&lt;{comment.authorEmail}&gt;</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        comment.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                          : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                      }`}
                    >
                      {comment.status}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-700 leading-relaxed">{comment.content}</p>
                  <p className="mt-1 text-[11px] text-slate-400 font-medium">
                    Response to: <strong className="text-slate-700">{comment.postTitle}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {comment.status !== 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => updateCommentStatus(comment.id, 'APPROVED')}
                    className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                )}
                {comment.status !== 'SPAM' && (
                  <button
                    type="button"
                    onClick={() => updateCommentStatus(comment.id, 'SPAM')}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Spam
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2.5 DAILY READER POLLS & SURVEYS
  if (view === 'polls') {
    return <LivePollsManagerView />;
  }

  // 2.6 LIVE MAHARASHTRA WEATHER & RADAR
  if (view === 'weather') {
    return <LiveWeatherManagerView />;
  }

  // 2.7 CITIZEN JOURNALISM & READER NEWS DESK
  if (view === 'citizen_news') {
    return <CitizenNewsDeskManagerView />;
  }

  // 2.8 MAHARASHTRA GOVT SCHEMES & JOB ALERTS
  if (view === 'govt_schemes') {
    return <GovtSchemesManagerView />;
  }

  // 3. ADVERTISEMENT & ADSENSE MANAGER
  if (view === 'advertisements') {
    return <AdvertisementManagerView />;
  }

  // 4. MODULES & PLUGINS
  if (view === 'modules') {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Internal Plugins & Modules</h1>
          <p className="text-xs text-slate-500">Enable or disable newsroom features and monetization add-ons.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod: any) => (
            <div
              key={mod.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                    {mod.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">v{mod.version}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{mod.name}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{mod.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-bold ${
                    mod.isEnabled ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {mod.isEnabled ? 'Active' : 'Disabled'}
                </span>
                <div className="flex items-center gap-2">
                  {mod.id === 'mod-ai-voice' && (
                    <button
                      type="button"
                      onClick={() => setCmsView('ai_voice')}
                      className="rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 text-xs font-bold transition-colors"
                    >
                      व्हॉइस अँकर सेटिंग्ज
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                      mod.isEnabled
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {mod.isEnabled ? 'Deactivate' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dedicated Google Conversational Voices Studio Configuration */}
        <div className="rounded-2xl border border-blue-200 bg-linear-to-b from-white to-blue-50/30 p-6 shadow-sm space-y-5 mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-blue-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700 uppercase">
                    Newsroom Voice Studio
                  </span>
                  <span className="text-xs text-slate-400">&bull; Google Conversational Anchors</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  Default AI Voice Anchor Settings & Testing (12 Voices)
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCmsView('ai_voice')}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Full AI Voice Settings Page</span>
              </button>
            </div>
          </div>

          <GoogleVoiceAnchorSelector
            selectedAnchor={
              GOOGLE_CONVERSATIONAL_VOICES.find((v) => v.id === aiVoiceSettings.anchorId) ||
              GOOGLE_CONVERSATIONAL_VOICES[0]
            }
            onSelectAnchor={(anchor) => {
              updateAIVoiceSettings({ anchorId: anchor.id });
              AIVoiceService.setSavedAnchor(anchor.id);
            }}
            speed={aiVoiceSettings.speed}
            onSpeedChange={(speed) => updateAIVoiceSettings({ speed })}
            lang={aiVoiceSettings.lang}
            onLangChange={(lang) => updateAIVoiceSettings({ lang })}
          />
        </div>
      </div>
    );
  }

  // 5. APPEARANCE & THEME / HEADER SETTINGS / MENUS / TICKER
  if (view === 'breaking_ticker') {
    return <BreakingTickerManagerView />;
  }

  if (view === 'appearance_menus') {
    return <MenuManagerView />;
  }

  if (view === 'appearance_header' || view === 'appearance_customize') {
    return <HeaderSettingsView />;
  }

  if (view === 'appearance_themes') {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Portal Themes & Styling</h1>
          <p className="text-xs text-slate-500">Configure visual themes, brand typography, and header styles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border-2 border-red-600 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">सक्रिय थीम (Active)</span>
              <span className="text-xs font-bold text-slate-400">v2.4.0</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">InfoNews Modern Marathi Red</h3>
            <p className="text-xs text-slate-500 mt-1">High-impact Marathi news portal layout with breaking news ticker and dark navy header.</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-red-600"></div>
              <div className="h-4 w-4 rounded-full bg-[#1e293b]"></div>
              <div className="h-4 w-4 rounded-full bg-[#f8fafc] border border-slate-300"></div>
              <span className="ml-auto text-xs font-bold text-slate-700">Default Brand Palette</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs opacity-80">
            <div className="flex items-center justify-between mb-2">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">पर्यायी थीम</span>
              <span className="text-xs font-bold text-slate-400">v2.1.0</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Classic Newspaper Broadside</h3>
            <p className="text-xs text-slate-500 mt-1">Serif-inspired newspaper layout focusing on deep investigative reporting and long-form articles.</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-amber-700"></div>
              <div className="h-4 w-4 rounded-full bg-stone-900"></div>
              <div className="h-4 w-4 rounded-full bg-[#fcfbf9] border border-slate-300"></div>
              <span className="ml-auto text-xs font-bold text-slate-500">Available</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <HeaderSettingsView />
        </div>
      </div>
    );
  }

  // 6. ACTIVITY LOGS & AUDIT TRAIL
  if (view === 'activity_logs') {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity & Security Logs</h1>
          <p className="text-xs text-slate-500">Immutable audit trail of all editorial state transitions and staff actions.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100 text-xs">
          {activityLogs.map((log: any) => (
            <div key={log.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    {log.userName}{' '}
                    <span className="font-normal text-slate-500">({log.userRole})</span> &bull;{' '}
                    <span className="text-red-600">{log.action}</span>
                  </p>
                  <p className="text-slate-600 mt-0.5">{log.details}</p>
                </div>
              </div>
              <div className="text-right text-slate-400 font-mono text-[11px] shrink-0">
                <p>{log.timestamp}</p>
                {log.ipAddress && <p>IP: {log.ipAddress}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 7. SETTINGS & WORDPRESS / HOSTINGER / LIVE URL IMPORTER
  if (view === 'settings' || view === 'importer') {
    return <WordPressAndUrlImporterView />;
  }

  // DEFAULT / USERS / NOTIFICATIONS FALLBACK
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-xs text-center space-y-3">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Settings className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 capitalize">{view.replace(/_/g, ' ')}</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto">
        This module is actively integrated with InfoNewsUpdate24's centralized state management.
      </p>
    </div>
  );
};

// CMS POLL MANAGER COMPONENT
const CmsPollManager: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('महाराष्ट्र घडामोडी');
  const [options, setOptions] = useState<string[]>(['होय', 'नाही', 'सांगता येत नाही']);
  const [newOptionText, setNewOptionText] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const refreshPolls = () => {
    setPolls(PollService.getPolls());
  };

  useEffect(() => {
    refreshPolls();
  }, []);

  const handleAddOption = () => {
    if (newOptionText.trim() && !options.includes(newOptionText.trim())) {
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
    setOptions(['होय', 'नाही', 'सांगता येत नाही']);
    setSuccessMsg('नवीन जनमत चाचणी यशस्वीरित्या सुरू करण्यात आली!');
    refreshPolls();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleToggle = (id: string) => {
    PollService.togglePollActive(id);
    refreshPolls();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('ही जनमत चाचणी कायमची हटवायची आहे का?')) {
      PollService.deletePoll(id);
      refreshPolls();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Vote className="h-6 w-6 text-red-600" />
            <span>दैनिक जनमत चाचणी व्यवस्थापक (Daily Reader Polls)</span>
          </h1>
          <p className="text-xs text-slate-500">
            वाचकांसाठी जनमत चाचण्या तयार करा, लाईव्ह निकाल तपासा आणि व्यवस्थापित करा.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-600/30">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Create New Poll Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs h-fit text-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Plus className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-bold text-slate-900">नवीन जनमत चाचणी जोडा</h3>
          </div>

          <form onSubmit={handleCreatePoll} className="space-y-3.5">
            <div>
              <label className="font-semibold text-slate-700 mb-1 block">प्रश्न (Poll Question in Marathi)</label>
              <textarea
                rows={3}
                required
                placeholder="उदा. आगामी अर्थसंकल्पातून सर्वसामान्यांना महागाईपासून दिलासा मिळेल का?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 leading-relaxed focus:border-red-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 mb-1 block">प्रवर्ग / श्रेणी (Category)</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-8 w-full rounded-lg border border-slate-200 px-2.5 text-xs text-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 mb-1.5 block">पर्याय (Voting Options)</label>
              <div className="space-y-1.5 mb-2">
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
                      className="h-7 w-full rounded border border-slate-200 px-2 text-xs text-slate-800 focus:outline-hidden"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add extra option input */}
              <div className="flex items-center gap-1.5">
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
                  className="h-7 flex-1 rounded border border-slate-200 px-2 text-xs text-slate-800 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  + जोडा
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors"
            >
              <Vote className="h-3.5 w-3.5" />
              <span>जनमत चाचणी प्रसिद्ध करा</span>
            </button>
          </form>
        </div>

        {/* Existing Polls List with Live Stats */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              सक्रिय आणि मागील जनमत चाचण्या ({polls.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              रिअल-टाइम व्होटिंग आणि टक्केवारी
            </span>
          </div>

          <div className="space-y-4">
            {polls.map((poll) => (
              <div
                key={poll.id}
                className={`rounded-xl border bg-white p-5 shadow-xs space-y-4 transition-all ${
                  poll.isActive ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {poll.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          poll.isActive
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {poll.isActive ? 'सक्रिय (ACTIVE)' : 'बंद (INACTIVE)'}
                      </span>
                    </div>
                    <h4 className="mt-1.5 text-sm font-bold text-slate-900 leading-snug">
                      {poll.question}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(poll.id)}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                        poll.isActive
                          ? 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {poll.isActive ? 'बंद करा' : 'सक्रिय करा'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(poll.id)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="हटवा"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Option Bars & Percentages */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  {poll.options.map((opt) => {
                    const pct =
                      poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                    return (
                      <div key={opt.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{opt.text}</span>
                          <span className="font-mono text-slate-500">
                            {pct}% ({opt.votes} मते)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-red-600 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>एकूण नोंदवलेली मते: <strong className="text-slate-700 font-mono">{poll.totalVotes.toLocaleString()}</strong></span>
                  <span>दिनांक: {new Date(poll.createdAt).toLocaleDateString('mr-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
