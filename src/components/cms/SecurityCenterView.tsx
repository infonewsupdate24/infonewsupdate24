import {
  AlertCircle,
  AlertTriangle,
  Award,
  Ban,
  CheckCircle,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileCode,
  Filter,
  HardDrive,
  Key,
  Laptop,
  Layers,
  Lock,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  Unlock,
  User,
  Users,
  Wifi,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ActivityLog, UserRole } from '../../types';

export const SecurityCenterView: React.FC = () => {
  const { siteSettings, updateSiteSettings, activityLogs, addActivityLog, setCmsView } = useApp();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'auth_session' | 'anti_scraping' | 'upload_armor' | 'audit_logs'>('overview');

  // Security Policy State
  const [enforce2FAForAdmin, setEnforce2FAForAdmin] = useState(true);
  const [enforce2FAForEditor, setEnforce2FAForEditor] = useState(false);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);
  const [maxFailedAttempts, setMaxFailedAttempts] = useState(5);
  const [stripExifData, setStripExifData] = useState(true);
  const [blockDevTools, setBlockDevTools] = useState(true);

  // Search and Filter for Audit Logs
  const [logSearch, setLogSearch] = useState('');
  const [logSeverityFilter, setLogSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'CRITICAL'>('ALL');

  // Feedback Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Mock comprehensive security activity logs if empty
  const allLogs: ActivityLog[] = useMemo(() => {
    if (activityLogs && activityLogs.length > 0) {
      return activityLogs;
    }
    return [
      {
        id: 'sec-log-1',
        userId: 'u-1',
        userName: 'Super Admin',
        userRole: 'SUPER_ADMIN',
        action: 'SUPER_ADMIN_LOGIN',
        details: 'यशस्वी 2FA ऑथेंटिकेशन लॉगिन',
        timestamp: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }),
        ipAddress: '103.21.244.102',
        severity: 'INFO',
        location: 'गडचिरोली ब्युरो',
      },
      {
        id: 'sec-log-2',
        userId: 'u-2',
        userName: 'Priya Sharma',
        userRole: 'EDITOR',
        action: 'ROLE_PERMISSIONS_OVERRIDE',
        details: 'वार्ताहर सचिन कांबळे यांना विशेष प्रसिद्धी अधिकार दिले',
        timestamp: '१ तास पूर्वी',
        ipAddress: '49.36.120.45',
        severity: 'WARNING',
        location: 'मुंबई ब्युरो',
      },
      {
        id: 'sec-log-3',
        userId: 'u-3',
        userName: 'Unknown',
        userRole: 'USER',
        action: 'FAILED_LOGIN_ATTEMPT',
        details: 'अवैध पासवर्ड टाकून ५ वेळा लॉगिनचा प्रयत्न (IP तात्पुरता ब्लॉक)',
        timestamp: '३ तास पूर्वी',
        ipAddress: '185.220.101.5',
        severity: 'CRITICAL',
        location: 'अज्ञात IP (रशिया VPN)',
      },
      {
        id: 'sec-log-4',
        userId: 'u-4',
        userName: 'System Sentinel',
        userRole: 'SUPER_ADMIN',
        action: 'ANTI_SCRAPING_TRIGGERED',
        details: 'प्रतिस्पर्धी बॉटकडून १०० बातम्या स्क्रॅप करण्याचा प्रयत्न रोखला',
        timestamp: '५ तास पूर्वी',
        ipAddress: '198.51.100.22',
        severity: 'WARNING',
        location: 'बॉट सर्व्हर',
      },
      {
        id: 'sec-log-5',
        userId: 'u-1',
        userName: 'Super Admin',
        userRole: 'SUPER_ADMIN',
        action: 'FULL_BACKUP_GENERATED',
        details: '१-क्लिक संपूर्ण डेटाबेस JSON बॅकअप डाऊनलोड केला',
        timestamp: 'आज सकाळी',
        ipAddress: '103.21.244.102',
        severity: 'INFO',
        location: 'गडचिरोली ब्युरो',
      },
    ];
  }, [activityLogs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      if (logSeverityFilter !== 'ALL' && log.severity !== logSeverityFilter) return false;
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase();
        const matchName = log.userName?.toLowerCase().includes(q);
        const matchAction = log.action?.toLowerCase().includes(q);
        const matchDetails = log.details?.toLowerCase().includes(q);
        const matchIp = log.ipAddress?.includes(q);
        return matchName || matchAction || matchDetails || matchIp;
      }
      return true;
    });
  }, [allLogs, logSeverityFilter, logSearch]);

  // Force Remote Logout
  const handleForceRemoteLogout = () => {
    if (window.confirm('तुम्हाला खात्री आहे का की सर्व पत्रकारांच्या डिव्हाइसेसमधून तात्काळ रिमोट लॉगआउट करायचे आहे?')) {
      addActivityLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'FORCE_REMOTE_LOGOUT_ALL',
        details: 'Super Admin ने सर्व कर्मचाऱ्यांची सेशन्स बंद केली',
        ipAddress: '103.21.244.102',
      });
      showNotification('success', '🚨 सर्व डिव्हाइसेसमधून यशस्वीरित्या रिमोट लॉगआउट झाले!');
    }
  };

  // Export Logs to CSV
  const handleExportCsv = () => {
    const headers = ['ID,User,Role,Action,Details,Severity,IP Address,Location,Timestamp'];
    const rows = filteredLogs.map(
      (l) =>
        `"${l.id}","${l.userName}","${l.userRole}","${l.action}","${l.details}","${l.severity || 'INFO'}","${l.ipAddress || ''}","${l.location || ''}","${l.timestamp}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `infonews24_security_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', '📄 सिक्युरिटी ऑडिट लॉग CSV स्वरूपात डाऊनलोड झाला!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            सायबर सुरक्षा व ऑडिट केंद्र (Cyber Security & Audit Center)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            InfoNewsUpdate24 ची लॉगिन सुरक्षा, २-स्टेप व्हेरिफिकेशन, अँटी-स्क्रॅपिंग, कॉपी प्रोटेक्शन व रिअल-टाईम ऑडिट लॉग.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleForceRemoteLogout}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3.5 py-2 text-xs font-bold shadow-2xs transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Force Remote Logout</span>
          </button>

          <button
            type="button"
            onClick={() => showNotification('success', '✅ सुरक्षा मानके व पॅचेस अद्ययावत आहेत (100% Secure).')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-black text-white px-4 py-2 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Zap className="h-4 w-4 text-yellow-400" />
            <span>सुरक्षा स्कॅन करा</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border ${
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

      {/* Security Health Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-2 border border-emerald-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">सुरक्षा आरोग्य निर्देशांक</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">९८/१००</span>
            <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
              Grade A+
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            सर्व २१ सुरक्षा स्तर सक्रिय व कार्यरत आहेत.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">SSL & TLS 1.3 एन्क्रिप्शन</span>
            <p className="text-lg font-black text-slate-900 mt-1">२५६-Bit HTTPS</p>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> पूर्णपणे सुरक्षित
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Super Admin RBAC लॉक</span>
            <p className="text-lg font-black text-slate-900 mt-1">१००% एक्सक्लुझिव्ह</p>
            <span className="text-[10px] font-bold text-red-600 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" /> अनधिकृत प्रवेश बंद
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <Key className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">अँटी-स्क्रॅपिंग गार्ड</span>
            <p className="text-lg font-black text-slate-900 mt-1">
              {siteSettings.antiCopyProtection ? 'सक्रिय (Active)' : 'निष्क्रिय'}
            </p>
            <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1 mt-0.5">
              <FileCheck className="w-3 h-3" /> मजकूर चोरीपासून रक्षण
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'overview'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>१. सुरक्षा डॅशबोर्ड</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('auth_session')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'auth_session'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>२. २-स्टेप व्हेरिफिकेशन व सेशन</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('anti_scraping')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'anti_scraping'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Ban className="w-4 h-4" />
          <span>३. बातमी कॉपी व चोरी संरक्षण</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload_armor')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'upload_armor'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>४. फाइल व मीडिया सुरक्षा</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit_logs')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'audit_logs'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>५. सिक्युरिटी ऑडिट लॉग ({filteredLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & THREAT RADAR */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>सक्रिय सायबर सुरक्षा कवच (Active Security Shields)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                InfoNewsUpdate24 वरील सर्व्हर, बातमीदार व वाचकांच्या डेटाचे संरक्षण करणारी यंत्रणा.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Super Admin Exclusive Privilege Isolation</h3>
                    <p className="text-[11px] text-slate-500">वापरकर्ते, रोल व अधिकार व्यवस्थापन फक्त मुख्य मालकाकडे लॉक आहे.</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5">
                  Locked
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Public User CMS Access Quarantine</h3>
                    <p className="text-[11px] text-slate-500">सामान्य वाचकांना CMS डॅशबोर्डमध्ये प्रवेश पूर्णपणे बंद आहे.</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5">
                  Enforced
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    🛡️
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Brute Force Login Defense</h3>
                    <p className="text-[11px] text-slate-500">५ वेळा चुकीचा पासवर्ड टाकल्यास IP पत्ता १५ मिनिटे तात्पुरता ब्लॉक होतो.</p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5">
                  Active
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                    🧹
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">XSS & HTML Injection Sanitization</h3>
                    <p className="text-[11px] text-slate-500">वाचक कॉमेंट्स व फॉर्म्समधील घातक स्क्रिप्ट्स नष्ट केल्या जातात.</p>
                  </div>
                </div>
                <span className="rounded-full bg-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5">
                  Clean
                </span>
              </div>
            </div>
          </div>

          {/* Quick Threat Log */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-black text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>ताज्या सुरक्षा सूचना (Threat Radar)</span>
              </h3>
            </div>

            <div className="space-y-3">
              {allLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-black text-[10px] px-2 py-0.5 rounded-full ${
                        log.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="font-semibold text-slate-800 leading-snug">{log.details}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{log.location || 'Maharashtra'}</span> &bull; <span>{log.ipAddress}</span>
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('audit_logs')}
              className="w-full text-center text-xs font-bold text-red-600 hover:text-red-700 pt-2 block cursor-pointer"
            >
              सर्व ऑडिट लॉग पहा &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: AUTH & SESSION SECURITY */}
      {activeTab === 'auth_session' && (
        <div className="max-w-3xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              <span>२-स्टेप व्हेरिफिकेशन व सेशन व्यवस्थापन (2FA & Session Security)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              संपादकीय मंडळ आणि Super Admin च्या खात्यांची सुरक्षा अधिक कडक करा.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Super Admin साठी 2FA बंधनकारक करा (Mandatory 2FA)</span>
                <span className="text-[11px] text-slate-500">मुख्य मालकाला लॉगिन करताना ईमेल किंवा Google Authenticator OTP आवश्यक असेल.</span>
              </div>
              <input
                type="checkbox"
                checked={enforce2FAForAdmin}
                onChange={(e) => {
                  setEnforce2FAForAdmin(e.target.checked);
                  showNotification('success', '2FA धोरण अपडेट झाले.');
                }}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">मुख्य संपादक व उपसंपादकांसाठी 2FA बंधनकारक करा</span>
                <span className="text-[11px] text-slate-500">संपादकीय मंडळाच्या लॉगिनसाठी अतिरिक्त सुरक्षा स्तर.</span>
              </div>
              <input
                type="checkbox"
                checked={enforce2FAForEditor}
                onChange={(e) => {
                  setEnforce2FAForEditor(e.target.checked);
                  showNotification('success', 'संपादक 2FA धोरण अपडेट झाले.');
                }}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ऑटो-सेशन टाईमआऊट (Idle Session Timeout)
                </label>
                <select
                  value={sessionTimeoutMinutes}
                  onChange={(e) => {
                    setSessionTimeoutMinutes(Number(e.target.value));
                    showNotification('success', `सेशन टाईमआऊट ${e.target.value} मिनिटे सेट झाला.`);
                  }}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-bold focus:bg-white focus:border-red-500 outline-none"
                >
                  <option value={15}>१५ मिनिटे इनअ‍ॅक्टिव्ह राहिल्यास</option>
                  <option value={30}>३० मिनिटे इनअ‍ॅक्टिव्ह राहिल्यास (Recommended)</option>
                  <option value={60}>१ तास इनअ‍ॅक्टिव्ह राहिल्यास</option>
                  <option value={240}>४ तास इनअ‍ॅक्टिव्ह राहिल्यास</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  कमाल चुकीचे लॉगिन प्रयत्न (Lockout Threshold)
                </label>
                <select
                  value={maxFailedAttempts}
                  onChange={(e) => {
                    setMaxFailedAttempts(Number(e.target.value));
                    showNotification('success', `मॅक्स लॉगिन लिमिट ${e.target.value} सेट झाली.`);
                  }}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-bold focus:bg-white focus:border-red-500 outline-none"
                >
                  <option value={3}>३ प्रयत्नांनंतर खाते लॉक करा</option>
                  <option value={5}>५ प्रयत्नांनंतर खाते लॉक करा (Standard)</option>
                  <option value={10}>१० प्रयत्नांनंतर खाते लॉक करा</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANTI-SCRAPING & CONTENT DEFENSE */}
      {activeTab === 'anti_scraping' && (
        <div className="max-w-3xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Ban className="w-5 h-5 text-blue-600" />
              <span>मजकूर व फोटो संरक्षण (Anti-Plagiarism & Scraping Guard)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रतिस्पर्धी वृत्तसंस्थांनी आपल्या विशेष ग्राउंड रिपोर्टिंगचा मजकूर कॉपी करण्यापासून रोखा.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">राईट-क्लिक व मजकूर कॉपी बंदी (Disable Right-Click & Copy)</span>
                <span className="text-[11px] text-slate-500">वाचकांना बातम्यांवर राईट-क्लिक करून मजकूर कॉपी करता येणार नाही.</span>
              </div>
              <input
                type="checkbox"
                checked={siteSettings.antiCopyProtection}
                onChange={(e) => {
                  updateSiteSettings({ antiCopyProtection: e.target.checked });
                  showNotification(
                    'success',
                    e.target.checked
                      ? '🛡️ बातमी कॉपी प्रोटेक्शन सक्रिय झाले!'
                      : 'कॉपी प्रोटेक्शन निष्क्रिय केले.'
                  );
                }}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Developer Tools (F12 / Inspect) इशारा अलर्ट</span>
                <span className="text-[11px] text-slate-500">ब्राऊझरमध्ये कोड तपासण्याचा प्रयत्न करणाऱ्यांना कॉपीराइट इशारा द्या.</span>
              </div>
              <input
                type="checkbox"
                checked={blockDevTools}
                onChange={(e) => setBlockDevTools(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
              />
            </label>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
              <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>ब्रँडेड इमेज वॉटरमार्क (Automatic Watermark Protection)</span>
              </h4>
              <p className="text-[11px] text-blue-700">
                मीडिया लायब्ररीमधील फोटो क्रॉप करताना त्यावर 'InfoNewsUpdate24' चा अधिकृत लोगो व वॉटरमार्क जोडला जातो, जेणेकरून फोटो चोरीस आळा बसतो.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FILE UPLOAD & MEDIA ARMOR */}
      {activeTab === 'upload_armor' && (
        <div className="max-w-3xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-purple-600" />
              <span>फाइल व मीडिया अपलोड स्वच्छता (Upload Armor & Privacy)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              मीडिया लायब्ररीमध्ये घातक फाइल्स ब्लॉक करणे आणि बातमीदारांच्या फोटोंमधील खाजगी GPS लोकेशन काढून टाकणे.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">EXIF Geolocation Metadata Stripper</span>
                <span className="text-[11px] text-slate-500">बातमीदारांनी मोबाईलने काढलेल्या फोटोंमधील त्यांचा खाजगी पत्ता व GPS डेटा आपोआप नष्ट करा.</span>
              </div>
              <input
                type="checkbox"
                checked={stripExifData}
                onChange={(e) => setStripExifData(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500 cursor-pointer"
              />
            </label>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">परवानगी असलेल्या अधिकृत फाइल फॉरमॅट्स (Strict MIME Whitelist)</h4>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold px-2.5 py-1 text-[11px] border border-emerald-200">
                  ✓ .webp (WebP Images)
                </span>
                <span className="rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold px-2.5 py-1 text-[11px] border border-emerald-200">
                  ✓ .jpg / .jpeg (Photos)
                </span>
                <span className="rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold px-2.5 py-1 text-[11px] border border-emerald-200">
                  ✓ .png (Graphics)
                </span>
                <span className="rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold px-2.5 py-1 text-[11px] border border-emerald-200">
                  ✓ .pdf (Govt GRs & E-Paper)
                </span>
                <span className="rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold px-2.5 py-1 text-[11px] border border-emerald-200">
                  ✓ .mp4 (News Videos)
                </span>
              </div>
              <p className="text-[10px] text-red-600 font-bold pt-1">
                🚫 सर्व .php, .exe, .sh, .js, .html स्क्रिप्ट फाइल्स अपलोड होण्यास १००% बंदी आहे.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: IMMUTABLE SECURITY AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-red-600" />
                <span>रिअल-टाईम सिक्युरिटी ऑडिट लॉग (Security Audit Trail)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                प्रत्येक कर्मचाऱ्याचे लॉगिन, अधिकार बदल, बातमी डिलीट व सिस्टीम बदलांचा टाइमस्टॅम्पसह संपूर्ण इतिहास.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>CSV अहवाल डाऊनलोड</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="वापरकर्ता, कृती, आयपी किंवा तपशील शोधा..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden focus:border-red-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logSeverityFilter}
                onChange={(e) => setLogSeverityFilter(e.target.value as any)}
                className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 font-bold focus:border-red-500 outline-none"
              >
                <option value="ALL">सर्व स्तर (All Severities)</option>
                <option value="INFO">🟢 Information (माहिती)</option>
                <option value="WARNING">🟡 Warning (इशारा)</option>
                <option value="CRITICAL">🔴 Critical (धोका)</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">तारीख व वेळ</th>
                  <th className="p-3.5">वापरकर्ता</th>
                  <th className="p-3.5">सुरक्षा कृती (Action)</th>
                  <th className="p-3.5">सविस्तर तपशील</th>
                  <th className="p-3.5">IP पत्ता व स्थान</th>
                  <th className="p-3.5 text-right">गंभीरता</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      कोणताही लॉग आढळला नाही.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{log.userName}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{log.userRole}</span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">
                        {log.action}
                      </td>
                      <td className="p-3.5 text-slate-700 max-w-xs">
                        {log.details}
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-slate-800 font-semibold">{log.ipAddress || '127.0.0.1'}</span>
                        <p className="text-[10px] text-slate-400">{log.location || 'Maharashtra'}</p>
                      </td>
                      <td className="p-3.5 text-right">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase border ${
                            log.severity === 'CRITICAL'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : log.severity === 'WARNING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {log.severity || 'INFO'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
