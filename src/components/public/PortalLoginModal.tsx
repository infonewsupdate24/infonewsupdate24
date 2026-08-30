import {
  AlertCircle,
  Check,
  CheckCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Key,
  KeyRound,
  Layers,
  Lock,
  Mail,
  Phone,
  QrCode,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FirebaseAuthService } from '../../services/FirebaseAuthService';
import { UserProfile, UserRole } from '../../types';

interface PortalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PortalLoginModal: React.FC<PortalLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { allUsers, currentUser, switchUser } = useAuth();
  const { setPortalMode } = useApp();

  const [activeLoginTab, setActiveLoginTab] = useState<'STAFF' | 'READER'>('STAFF');
  
  // Login Form States
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Handle Secure Staff Login
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanIdentifier = emailOrPhone.trim();
    if (!cleanIdentifier) {
      setErrorMessage('कृपया आपला नोंदणीकृत ईमेल पत्ता किंवा युझरनेम प्रविष्ट करा.');
      return;
    }

    if (!password) {
      setErrorMessage('कृपया आपला पासवर्ड प्रविष्ट करा.');
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate via Firebase Cloud Authentication
      const authRes = await FirebaseAuthService.loginWithEmail(cleanIdentifier, password);
      if (authRes.success && authRes.profile) {
        const userProfile = authRes.profile;
        if (userProfile.status === 'ACTIVE') {
          switchUser(userProfile.id);
          setSuccessMessage(`✅ ऑथेंटिकेशन यशस्वी! स्वागत आहे, ${userProfile.name}!`);
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
            if (userProfile.role !== 'USER') setPortalMode('CMS');
          }, 600);
          return;
        } else {
          setErrorMessage('⛔ तुमचे खाते सक्रिय नाही. कृपया प्रशासकाशी संपर्क साधा.');
        }
      } else {
        setErrorMessage(authRes.error || '❌ चुकीचे क्रेडेंशियल्स किंवा खाते अस्तित्वात नाही.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'लॉगिन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In with Strict Verification Gate & Pre-Registered Profile Requirement
  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const res = await FirebaseAuthService.loginWithGoogle();
      if (res.success && res.profile) {
        switchUser(res.profile.id);
        setSuccessMessage(`✅ Google द्वारे (${res.profile.name}) लॉगिन यशस्वी!`);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 800);
      } else {
        setErrorMessage(res.error || 'आपले खाते प्रणालीमध्ये नोंदणीकृत नाही. कृपया प्रशासकाशी संपर्क साधा.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google लॉगिन अयशस्वी झाले किंवा रद्द केले गेले.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-150 my-auto">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex items-center justify-center font-black text-base shadow-md">
              24
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide leading-tight">
                Info<span className="text-yellow-400">News</span>Update24
              </h2>
              <p className="text-[11px] text-red-100 font-medium">
                सुरक्षित ऑथेंटिकेशन व पासवर्ड प्रणाली (Secure Access)
              </p>
            </div>
          </div>

          {/* Golden Shimmer Strip */}
          <div className="h-1 w-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 absolute bottom-0 left-0" />
        </div>

        {/* Role Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => { setActiveLoginTab('STAFF'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2.5 text-center flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
              activeLoginTab === 'STAFF'
                ? 'border-red-600 bg-white text-red-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>संपादक व बातमीदार (Staff Desk)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveLoginTab('READER'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2.5 text-center flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
              activeLoginTab === 'READER'
                ? 'border-red-600 bg-white text-red-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-blue-600" />
            <span>अधिकृत वाचक (Reader)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2 font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2 font-bold animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ================= TAB 1: STAFF LOGIN ================= */}
          {activeLoginTab === 'STAFF' && (
            <div className="space-y-4">
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ईमेल पत्ता (Staff Email)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="उदा. admin@infonewsupdate24.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">
                      पासवर्ड (Password) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">पासवर्ड आवश्यक आहे</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 text-red-600 rounded"
                    />
                    <span>माझे लॉगिन लक्षात ठेवा</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('पासवर्ड रीसेट करण्यासाठी कृपया मुख्य संपादकांशी किंवा ॲडमिनशी संपर्क साधा.')}
                    className="font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    पासवर्ड विसरलात?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>पडताळणी होत आहे...</span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>सुरक्षित लॉगिन करा (Verify & Login)</span>
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-center text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>प्रशासक-नियंत्रित सुरक्षित ऑथेंटिकेशन</span>
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 2: READER LOGIN ================= */}
          {activeLoginTab === 'READER' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-sm">वाचक व नागरिक सदस्य लॉगिन</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  फक्त मुख्य प्रशासकांनी आधीपासून नोंदणीकृत केलेल्या अधिकृत सदस्यांनाच प्रवेश दिला जातो.
                </p>
              </div>

              {/* Google 1-Click Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google द्वारे सुरक्षित लॉगिन करा</span>
              </button>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-[11px] text-left">
                🔒 <strong>टीप:</strong> नवीन वाचक खाते नोंदणीसाठी प्रशासकीय पडताळणी आवश्यक आहे. अनोंदणीकृत खात्यांना थेट लॉगिन दिले जात नाही.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

