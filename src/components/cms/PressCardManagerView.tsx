import {
  AlertCircle,
  Award,
  Barcode,
  Building,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Globe,
  HardDrive,
  IdCard,
  Image as ImageIcon,
  Key,
  Layers,
  Lock,
  Mail,
  MapPin,
  Maximize2,
  Newspaper,
  Phone,
  Plus,
  Printer,
  QrCode,
  Radio,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Search,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserRole } from '../../types';

// Luxury Themes for Press ID Cards
interface CardTheme {
  id: string;
  name: string;
  badge: string;
  frontBg: string;
  headerGradient: string;
  accentBorder: string;
  accentText: string;
  tagColor: string;
  holoGradient: string;
  ribbonColor: string;
  chipColor: string;
}

const CARD_THEMES: CardTheme[] = [
  {
    id: 'crimson_gold',
    name: '🔴 अधिकृत रेड & गोल्ड (Press Standard)',
    badge: 'Official Press',
    frontBg: 'bg-gradient-to-b from-white via-slate-50 to-red-50/30',
    headerGradient: 'bg-gradient-to-r from-red-800 via-red-600 to-red-900',
    accentBorder: 'border-red-600',
    accentText: 'text-red-700',
    tagColor: 'bg-red-600 text-white',
    holoGradient: 'from-amber-300 via-yellow-400 to-amber-600',
    ribbonColor: 'bg-red-700',
    chipColor: 'from-yellow-300 to-amber-500',
  },
  {
    id: 'obsidian_platinum',
    name: '⚫ ऑब्सिडियन ब्लॅक & प्लॅटिनम (Investigative Special)',
    badge: 'Investigative',
    frontBg: 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white',
    headerGradient: 'bg-gradient-to-r from-black via-slate-800 to-black',
    accentBorder: 'border-slate-600',
    accentText: 'text-yellow-400',
    tagColor: 'bg-yellow-500 text-black',
    holoGradient: 'from-cyan-300 via-blue-400 to-indigo-500',
    ribbonColor: 'bg-slate-900',
    chipColor: 'from-slate-200 to-slate-400',
  },
  {
    id: 'royal_navy',
    name: '🔵 रॉयल नेव्ही & विधीमंडळ (Ministry & Crime Bureau)',
    badge: 'Accredited',
    frontBg: 'bg-gradient-to-b from-white via-slate-50 to-blue-50/40',
    headerGradient: 'bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950',
    accentBorder: 'border-blue-700',
    accentText: 'text-blue-800',
    tagColor: 'bg-blue-800 text-white',
    holoGradient: 'from-sky-300 via-blue-400 to-blue-600',
    ribbonColor: 'bg-blue-900',
    chipColor: 'from-yellow-300 to-amber-500',
  },
  {
    id: 'executive_gold',
    name: '🟡 एक्झिक्युटिव्ह गोल्ड (Chief Editor / Bureau Chief)',
    badge: 'Executive',
    frontBg: 'bg-gradient-to-b from-amber-50/30 via-white to-amber-50/50',
    headerGradient: 'bg-gradient-to-r from-amber-950 via-yellow-800 to-amber-900',
    accentBorder: 'border-amber-500',
    accentText: 'text-amber-800',
    tagColor: 'bg-amber-700 text-white',
    holoGradient: 'from-yellow-200 via-amber-400 to-yellow-500',
    ribbonColor: 'bg-amber-900',
    chipColor: 'from-yellow-200 to-yellow-500',
  },
];

export const PressCardManagerView: React.FC = () => {
  const { allUsers, currentUser } = useAuth();
  const { siteSettings } = useApp();

  // Selected User State
  const [selectedUserId, setSelectedUserId] = useState<string>(
    allUsers.find((u) => u.role === 'REPORTER' || u.role === 'SUPER_ADMIN')?.id || allUsers[0]?.id || 'u-1'
  );

  const activeUser = useMemo(() => {
    return allUsers.find((u) => u.id === selectedUserId) || allUsers[0];
  }, [allUsers, selectedUserId]);

  // Card Appearance State
  const [cardThemeId, setCardThemeId] = useState<string>('crimson_gold');
  const [cardLayout, setCardLayout] = useState<'PORTRAIT_SMART' | 'LANDSCAPE_BADGE'>('PORTRAIT_SMART');
  const [showLanyardRibbon, setShowLanyardRibbon] = useState(true);
  const [showSmartChip, setShowSmartChip] = useState(true);
  const [showHologram, setShowHologram] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false); // 3D Card Flip Toggle

  // Editable Card Data State
  const [cardNameMarathi, setCardNameMarathi] = useState(activeUser?.name || 'कोमल दौलतराव डहागावकर');
  const [cardNameEnglish, setCardNameEnglish] = useState(activeUser?.name || 'Komal Daulatrao Dahagaonkar');
  const [cardDesignation, setCardDesignation] = useState(activeUser?.designation || 'मुख्य संपादक व संचालक');
  const [cardBureau, setCardBureau] = useState(activeUser?.location || 'गडचिरोली मुख्य ब्युरो');
  const [cardIdNumber, setCardIdNumber] = useState(`INU24-MAH-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [cardBloodGroup, setCardBloodGroup] = useState('O +ve');
  const [cardIssueDate, setCardIssueDate] = useState('०१/०१/२०२६');
  const [cardExpiryDate, setCardExpiryDate] = useState('३१/१२/२०२६');
  const [cardPhone, setCardPhone] = useState(activeUser?.phone || '+91 87999333629');
  const [cardAvatar, setCardAvatar] = useState(activeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');

  // Verification Modal State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const activeTheme = CARD_THEMES.find((t) => t.id === cardThemeId) || CARD_THEMES[0];
  const isDarkCard = cardThemeId === 'obsidian_platinum';

  // Handle User Change
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    const u = allUsers.find((user) => user.id === userId);
    if (u) {
      setCardNameMarathi(u.name);
      setCardNameEnglish(u.name);
      setCardDesignation(u.designation || 'वार्ताहर');
      setCardBureau(u.location || 'गडचिरोली ब्युरो');
      setCardPhone(u.phone || '+91 87999333629');
      setCardAvatar(u.avatar);
      setCardIdNumber(`INU24-MAH-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  // Direct Print Trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-md">
              <IdCard className="w-5 h-5" />
            </div>
            प्रोफेशनल डिजिटल पत्रकार ओळखपत्र स्टुडिओ (Dynamic Press ID Studio)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            3D स्मार्ट चिप, होलोग्रॅम सील, स्कॅनेबल QR कोड, बारकोड व PVC CR80 स्टँडर्डसह हाय-रिझोल्यूशन ओळखपत्र जनरेटर.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-2 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <RotateCw className="h-4 w-4 text-slate-600" />
            <span>कार्ड फिरवा ({isFlipped ? 'समोरची बाजू पहा' : 'मागील बाजू पहा'})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVerificationModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3.5 py-2 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <QrCode className="h-4 w-4 text-emerald-600" />
            <span>QR ऑनलाईन पडताळणी चाचणी (Live Scan)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:bg-red-900 px-4 py-2 text-xs font-black text-white shadow-md transition cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>१-क्लिक PVC कार्ड प्रिंट करा</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border print:hidden ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: DYNAMIC STUDIO CONTROLS */}
        <div className="lg:col-span-5 space-y-5 print:hidden">
          {/* Staff Selector & Theme Engine */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-black text-slate-900 flex items-center gap-1.5 text-sm">
              <UserCheck className="w-4 h-4 text-red-600" />
              <span>१. बातमीदार व थीम निवडा (Journalist & Theme Engine)</span>
            </h3>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                पत्रकार / कर्मचारी निवडा
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => handleSelectUser(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-900 font-bold focus:bg-white focus:border-red-500 outline-none cursor-pointer"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.designation || u.role} ({u.location || 'ब्युरो'})
                  </option>
                ))}
              </select>
            </div>

            {/* Luxury Theme Selector */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">
                प्रीमियम कार्ड थीम (Color & Material Preset)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CARD_THEMES.map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setCardThemeId(th.id)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                      cardThemeId === th.id
                        ? 'border-red-600 bg-red-50 text-red-950 shadow-xs ring-1 ring-red-500'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full ${th.ribbonColor} shrink-0`} />
                    <span className="text-[11px] truncate">{th.name.split(' ')[1] || th.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Visual Feature Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="font-bold text-slate-700 block">डायनॅमिक सुरक्षा घटक (Visual Security Elements)</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSmartChip}
                    onChange={(e) => setShowSmartChip(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="font-semibold text-[11px]">💳 EMV स्मार्ट चिप</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHologram}
                    onChange={(e) => setShowHologram(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="font-semibold text-[11px]">✨ होलोग्रॅम सील</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLanyardRibbon}
                    onChange={(e) => setShowLanyardRibbon(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="font-semibold text-[11px]">🎗️ लॅनयार्ड फीत</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBarcode}
                    onChange={(e) => setShowBarcode(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="font-semibold text-[11px]">📊 बारकोड स्ट्रिप</span>
                </label>
              </div>
            </div>
          </div>

          {/* Live Card Data Editor */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-black text-slate-900 flex items-center gap-1.5 text-sm">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>२. ओळखपत्र माहिती सानुकूलित करा (Live Data Editor)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  नाव (मराठी)
                </label>
                <input
                  type="text"
                  value={cardNameMarathi}
                  onChange={(e) => setCardNameMarathi(e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-bold text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Name (English)
                </label>
                <input
                  type="text"
                  value={cardNameEnglish}
                  onChange={(e) => setCardNameEnglish(e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-bold text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  प्रेस कार्ड नंबर (ID No.)
                </label>
                <input
                  type="text"
                  value={cardIdNumber}
                  onChange={(e) => setCardIdNumber(e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  रक्तगट (Blood Group)
                </label>
                <select
                  value={cardBloodGroup}
                  onChange={(e) => setCardBloodGroup(e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-bold text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                >
                  <option value="A +ve">A +ve</option>
                  <option value="B +ve">B +ve</option>
                  <option value="O +ve">O +ve</option>
                  <option value="AB +ve">AB +ve</option>
                  <option value="A -ve">A -ve</option>
                  <option value="B -ve">B -ve</option>
                  <option value="O -ve">O -ve</option>
                  <option value="AB -ve">AB -ve</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  मराठी पदनाम (Designation)
                </label>
                <input
                  type="text"
                  value={cardDesignation}
                  onChange={(e) => setCardDesignation(e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-semibold text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  जिल्हा / ब्युरो कार्यालय (Bureau Location)
                </label>
                <input
                  type="text"
                  value={cardBureau}
                  onChange={(e) => setCardBureau(e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-semibold text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  जारी तारीख (Issue Date)
                </label>
                <input
                  type="text"
                  value={cardIssueDate}
                  onChange={(e) => setCardIssueDate(e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-semibold text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  वैध मुदत (Valid Thru)
                </label>
                <input
                  type="text"
                  value={cardExpiryDate}
                  onChange={(e) => setCardExpiryDate(e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 font-bold text-emerald-700 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  फोटो URL (Photo URL)
                </label>
                <input
                  type="url"
                  value={cardAvatar}
                  onChange={(e) => setCardAvatar(e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D REALISTIC INTERACTIVE CARD PREVIEW */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800 text-white space-y-6 relative overflow-hidden">
            {/* Ambient Lighting Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 relative z-10 print:hidden">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3D Realistic PVC Smart Card Studio (CR80 Standard)</span>
                </span>
                <h3 className="text-sm font-black text-white mt-0.5">
                  {cardNameMarathi} &bull; {cardDesignation}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{isFlipped ? 'समोरची बाजू (Front)' : 'मागील बाजू (Back)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>प्रिंट करा</span>
                </button>
              </div>
            </div>

            {/* Lanyard Ribbon Strap Graphic */}
            {showLanyardRibbon && (
              <div className="flex flex-col items-center justify-center -mb-8 relative z-20 pointer-events-none select-none">
                <div className={`w-14 h-12 ${activeTheme.ribbonColor} rounded-t-lg shadow-lg flex items-center justify-center border-x-2 border-slate-900/40 relative`}>
                  <div className="text-[7px] font-black text-white tracking-widest uppercase rotate-90 opacity-80 whitespace-nowrap">
                    PRESS 24
                  </div>
                </div>
                {/* Metal Clip Ring */}
                <div className="w-8 h-5 bg-gradient-to-b from-slate-400 via-slate-200 to-slate-500 rounded-sm shadow-md border border-slate-600 -mt-1 flex items-center justify-center">
                  <div className="w-4 h-2 bg-slate-800 rounded-xs" />
                </div>
              </div>
            )}

            {/* DUAL SIDE / 3D FLIPPABLE CONTAINER */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4 relative z-10">
              {/* ===================== SIDE A: FRONT SIDE ===================== */}
              <div
                className={`w-[320px] h-[500px] ${activeTheme.frontBg} rounded-2xl shadow-2xl border-2 ${
                  isDarkCard ? 'border-slate-700' : 'border-slate-300'
                } overflow-hidden flex flex-col justify-between relative select-none transition-transform duration-300 hover:scale-[1.01]`}
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                {/* Lanyard Punch Hole at Top */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-slate-900/80 rounded-full border border-slate-400/40 z-30 flex items-center justify-center shadow-inner" />

                {/* Top Header Band */}
                <div className={`${activeTheme.headerGradient} text-white pt-6 pb-3 px-3 text-center relative shrink-0 shadow-md`}>
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-white text-red-600 flex items-center justify-center font-black text-sm shadow-md">
                      24
                    </div>
                    <div className="text-left">
                      <span className="font-black text-xs tracking-wider uppercase block leading-none">
                        Info<span className="text-yellow-400">News</span>Update24
                      </span>
                      <span className="text-[7.5px] text-red-100 font-semibold block tracking-tight mt-0.5 opacity-90">
                        महाराष्ट्र शासन डिजिटल मीडिया नोंदणीकृत वृत्तसंस्था
                      </span>
                    </div>
                  </div>

                  {/* Holographic Strip */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${activeTheme.holoGradient} absolute bottom-0 left-0`} />
                </div>

                {/* Card Body with Guilloche Pattern Background */}
                <div className="p-4 flex-1 flex flex-col items-center justify-between text-center relative">
                  {/* Subtle Security Micro-print Guilloche Wave */}
                  <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none bg-repeat"
                    style={{
                      backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                      backgroundSize: '8px 8px',
                    }}
                  />

                  {/* Top Bar: ID No, Smart Chip & PRESS Badge */}
                  <div className="w-full flex items-center justify-between relative z-10 px-1">
                    {/* EMV Gold Smart Chip */}
                    {showSmartChip ? (
                      <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 border border-amber-600 shadow-xs flex flex-col justify-around p-0.5">
                        <div className="h-0.5 w-full bg-amber-700/40 rounded-full" />
                        <div className="h-0.5 w-3/4 bg-amber-700/40 rounded-full" />
                        <div className="h-0.5 w-full bg-amber-700/40 rounded-full" />
                      </div>
                    ) : (
                      <span className="font-mono font-black text-[9px] text-slate-400">
                        {cardIdNumber}
                      </span>
                    )}

                    {/* Official PRESS Holographic Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className="bg-gradient-to-r from-red-600 to-red-700 text-white font-black text-[11px] tracking-widest px-3 py-0.5 rounded-full uppercase shadow-md border border-red-400">
                        PRESS
                      </span>
                    </div>
                  </div>

                  {/* Journalist Photo with Double Gold/Crimson Ring */}
                  <div className="relative my-2 z-10">
                    <img
                      src={cardAvatar}
                      alt={cardNameMarathi}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl ring-3 ring-red-600"
                    />

                    {/* Hologram Stamp on Photo Corner */}
                    {showHologram && (
                      <div
                        className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-tr ${activeTheme.holoGradient} border-2 border-white shadow-lg flex items-center justify-center animate-pulse`}
                        title="Official Holographic Security Seal"
                      >
                        <Award className="w-4 h-4 text-slate-900 stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  {/* Journalist Name & Designation */}
                  <div className="relative z-10">
                    <h2 className={`text-base font-black leading-tight ${isDarkCard ? 'text-white' : 'text-slate-950'}`}>
                      {cardNameMarathi}
                    </h2>
                    <span className="text-[10px] font-bold text-slate-400 block tracking-wide font-sans">
                      {cardNameEnglish}
                    </span>
                    <span className="text-[11px] font-black text-red-600 block mt-1 font-serif">
                      {cardDesignation}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-0.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-500" />
                      <span>{cardBureau}</span>
                    </span>
                  </div>

                  {/* Key Metadata Table */}
                  <div className={`w-full grid grid-cols-3 gap-1 p-2 rounded-xl border text-[9px] text-left relative z-10 ${
                    isDarkCard ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-white/80 border-slate-200 text-slate-700 shadow-2xs'
                  }`}>
                    <div>
                      <span className="text-slate-400 block text-[8px]">प्रेस आयडी:</span>
                      <strong className="font-mono font-black truncate block">{cardIdNumber.slice(-8)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[8px]">रक्तगट:</span>
                      <strong className="font-black text-red-600 block">{cardBloodGroup}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[8px]">वैध मुदत:</span>
                      <strong className="font-black text-emerald-700 block">{cardExpiryDate}</strong>
                    </div>
                  </div>

                  {/* Authorized Signatory & Barcode Band */}
                  <div className="w-full flex items-end justify-between px-2 pt-2 border-t border-slate-200/80 relative z-10">
                    <div className="text-left">
                      <span className="text-[7.5px] text-slate-400 block">जारी दिनांक:</span>
                      <span className="text-[8.5px] font-bold text-slate-700 dark:text-slate-300">{cardIssueDate}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-serif italic font-black text-red-700 dark:text-red-400 text-[10px] block leading-none">
                        Sachin M.
                      </span>
                      <span className="text-[7.5px] font-bold text-slate-500 block border-t border-slate-300 mt-0.5 pt-0.5">
                        मुख्य संपादक (Editor)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===================== SIDE B: BACK SIDE (LEGAL CLAUSE & QR) ===================== */}
              <div
                className={`w-[320px] h-[500px] bg-white text-slate-900 rounded-2xl shadow-2xl border-2 border-slate-300 overflow-hidden flex flex-col justify-between p-4 text-center select-none relative transition-transform duration-300 hover:scale-[1.01]`}
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                {/* Lanyard Punch Hole at Top */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-slate-900/80 rounded-full border border-slate-400/40 z-30 flex items-center justify-center shadow-inner" />

                {/* Back Top Legal Header */}
                <div className="pt-4">
                  <div className="flex items-center justify-center gap-1.5 text-red-600 font-black text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>अधिकृत पोलीस व प्रशासन विनंती</span>
                  </div>
                  <p className="text-[8.5px] text-slate-700 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left font-medium">
                    "सदर ओळखपत्रधारक <strong>InfoNewsUpdate24</strong> चे अधिकृत प्रतिनिधी असून त्यांना वृत्तसंकलन, मुलाखती, फोटो/व्हिडिओ वार्तांकनासाठी सर्व शासकीय अधिकारी, पोलीस प्रशासन व नागरिकांनी सहकार्य करावे ही नम्र विनंती."
                  </p>
                </div>

                {/* Scannable Dynamic QR Code Box */}
                <div className="flex flex-col items-center justify-center my-auto p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="w-24 h-24 bg-white p-1.5 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://infonewsupdate24.com/verify-reporter/${activeUser.id}`}
                      alt="Reporter QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[8px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    ● स्कॅन करून ऑनलाईन पडताळणी करा
                  </span>
                </div>

                {/* Barcode & Security Strip */}
                {showBarcode && (
                  <div className="w-full flex flex-col items-center justify-center px-2">
                    <div className="w-full h-7 bg-slate-900 rounded-sm flex items-center justify-center px-2">
                      <div className="flex items-center gap-[2px] h-4 w-full justify-center">
                        {[...Array(38)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-full bg-white ${i % 3 === 0 ? 'w-1' : i % 2 === 0 ? 'w-[1.5px]' : 'w-[0.75px]'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="font-mono text-[7px] text-slate-400 tracking-widest mt-0.5 font-bold">
                      {cardIdNumber}
                    </span>
                  </div>
                )}

                {/* Office & Legal Accreditation Terms */}
                <div className="space-y-1 text-[7.5px] text-slate-500 border-t border-slate-100 pt-2 text-left">
                  <p>
                    <strong>नोंदणी:</strong> IT Rules 2021 & Digital Media Code of Ethics.
                  </p>
                  <p>
                    <strong>कार्यालय:</strong> मुख्य ब्युरो कार्यालय, पत्रकार भवन, गडचिरोली / मुंबई, महाराष्ट्र.
                  </p>
                  <p className="text-slate-800 font-mono font-bold">
                    हेल्पलाईन: {cardPhone} | editor@infonewsupdate24.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ALL ISSUED PRESS CARDS DIRECTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-red-600" />
              <span>जारी करण्यात आलेली डिजिटल ओळखपत्रे (Issued Press Cards Registry)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              InfoNewsUpdate24 कडून पत्रकारांना वितरीत केलेली सर्व सक्रिय ओळखपत्रे.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1 border border-emerald-200">
              {allUsers.length} ओळखपत्रे तयार
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">पत्रकार नाव व फोटो</th>
                <th className="p-4">प्रेस कार्ड नंबर</th>
                <th className="p-4">भूमिका व पदनाम</th>
                <th className="p-4">जिल्हा / ब्युरो</th>
                <th className="p-4">वैध मुदत</th>
                <th className="p-4">स्थिती</th>
                <th className="p-4 text-right">कृती (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUsers.map((user, idx) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{user.name}</span>
                        <span className="text-[10px] text-slate-400">{user.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono font-bold text-slate-800">
                    INU24-MAH-2026-08{idx + 1}2
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{user.designation || 'वार्ताहर'}</span>
                    <span className="text-[10px] text-red-600 font-bold">{user.role}</span>
                  </td>

                  <td className="p-4 font-semibold text-slate-700">
                    {user.location || 'महाराष्ट्र'}
                  </td>

                  <td className="p-4 font-black text-emerald-700">
                    ३१/१२/२०२६
                  </td>

                  <td className="p-4">
                    <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5">
                      ● Active Verified
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectUser(user.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold transition cursor-pointer"
                        title="कार्ड लोड करा व प्रिंट करा"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR CODE LIVE VERIFICATION SIMULATOR MODAL */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden text-center p-6 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-3 py-1 border border-emerald-200">
                ✅ अधिकृत व प्रमाणित पत्रकार (Active Verified Journalist)
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">{cardNameMarathi}</h3>
              <p className="text-xs font-bold text-red-600">{cardDesignation}</p>
              <p className="text-xs text-slate-500 mt-0.5">{cardBureau}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400">संस्था (Organization):</span>
                <strong className="text-slate-900 font-bold">InfoNewsUpdate24</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400">प्रेस आयडी क्रमांक:</span>
                <strong className="text-slate-900 font-mono font-bold">{cardIdNumber}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-400">वैध मुदत (Validity):</span>
                <strong className="text-emerald-700 font-black">{cardExpiryDate} पर्यंत वैध</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">संपादकीय मंजुरी:</span>
                <strong className="text-blue-700 font-bold">ॲड. सचिन मोरे (मुख्य संपादक)</strong>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              पोलीस व शासकीय अधिकाऱ्यांना QR कोड स्कॅन केल्यावर हीच थेट सुरक्षित पडताळणी स्क्रीन दिसते.
            </p>

            <button
              type="button"
              onClick={() => setIsVerificationModalOpen(false)}
              className="w-full rounded-xl bg-slate-900 hover:bg-black text-white py-2.5 text-xs font-bold shadow-md transition cursor-pointer"
            >
              बंद करा
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
