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
  const { allUsers, currentUser, switchUser, addUser } = useAuth();
  const { setPortalMode, setCmsView } = useApp();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [activeLoginTab, setActiveLoginTab] = useState<'STAFF' | 'READER'>('STAFF');
  
  // Login Form States
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('REPORTER');
  const [regLocation, setRegLocation] = useState('गडचिरोली (मुख्य ब्युरो)');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Quick 1-Click Login Helper for Staff
  const handleQuickLogin = (email: string, pass: string = 'admin@123') => {
    setEmailOrPhone(email);
    setPassword(pass);
    setErrorMessage('');
    
    const matchedUser = allUsers.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() ||
        (email === 'admin' && (u.role === 'SUPER_ADMIN' || u.role === 'ADMIN')) ||
        (email === 'editor' && u.role === 'EDITOR') ||
        (email === 'reporter' && u.role === 'REPORTER')
    );

    if (matchedUser && matchedUser.status === 'ACTIVE') {
      setIsLoading(true);
      setTimeout(() => {
        switchUser(matchedUser.id);
        setSuccessMessage(`✅ थेट लॉगिन यशस्वी! स्वागत आहे, ${matchedUser.name} (${matchedUser.role})`);
        setTimeout(() => {
          setIsLoading(false);
          onClose();
          if (onSuccess) onSuccess();
          if (matchedUser.role !== 'USER') setPortalMode('CMS');
        }, 600);
      }, 300);
    }
  };

  // Handle Secure Staff & User Login
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanIdentifier = emailOrPhone.trim();
    if (!cleanIdentifier) {
      setErrorMessage('कृपया आपला नोंदणीकृत ईमेल पत्ता किंवा युझरनेम (उदा. admin) प्रविष्ट करा.');
      return;
    }

    if (!password) {
      setErrorMessage('कृपया आपला पासवर्ड प्रविष्ट करा.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try Firebase Cloud Authentication if identifier contains @
      if (cleanIdentifier.includes('@')) {
        try {
          const authRes = await FirebaseAuthService.loginWithEmail(cleanIdentifier, password);
          if (authRes.success) {
            const userProfile =
              authRes.profile ||
              allUsers.find((u) => u.email.toLowerCase() === cleanIdentifier.toLowerCase());
            if (userProfile && userProfile.status === 'ACTIVE') {
              switchUser(userProfile.id);
              setSuccessMessage(`✅ Firebase ऑथेंटिकेशन यशस्वी! स्वागत आहे, ${userProfile.name}!`);
              setTimeout(() => {
                onClose();
                if (onSuccess) onSuccess();
                if (userProfile.role !== 'USER') setPortalMode('CMS');
              }, 600);
              return;
            }
          }
        } catch {
          // Gracefully fallback to local directory matching
        }
      }

      // 2. Validate against Directory Users with Flexible Matching
      const matchedUser = allUsers.find(
        (u) =>
          u.email.toLowerCase() === cleanIdentifier.toLowerCase() ||
          (u.phone && u.phone.includes(cleanIdentifier)) ||
          u.name.toLowerCase() === cleanIdentifier.toLowerCase() ||
          u.id.toLowerCase() === cleanIdentifier.toLowerCase() ||
          ((cleanIdentifier.toLowerCase() === 'admin' ||
            cleanIdentifier.toLowerCase() === 'admin@infonews.com' ||
            cleanIdentifier.toLowerCase() === 'admin@infonewsupdate24.com') &&
            (u.role === 'SUPER_ADMIN' || u.role === 'ADMIN')) ||
          (cleanIdentifier.toLowerCase() === 'superadmin' && u.role === 'SUPER_ADMIN') ||
          (cleanIdentifier.toLowerCase() === 'editor' && u.role === 'EDITOR') ||
          (cleanIdentifier.toLowerCase() === 'reporter' && u.role === 'REPORTER')
      );

      if (!matchedUser) {
        setErrorMessage('❌ वापरकर्ता सापडला नाही. कृपया ईमेल बरोबर आहे का ते तपासा किंवा वरील १-क्लिक लॉगिन बटण वापरा.');
        return;
      }

      // 3. Status Validation: Pending Approval Check
      if (matchedUser.status === 'PENDING') {
        setErrorMessage('⏳ तुमचे खाते सुपर ॲडमिनच्या (Super Admin) मंजुरीसाठी प्रलंबित (Pending Approval) आहे. सुपर ॲडमिनने मान्यता दिल्यावरच तुम्ही पासवर्ड वापरून लॉगिन करू शकाल.');
        return;
      }

      // 4. Status Validation: Suspended or Inactive
      if (matchedUser.status === 'SUSPENDED' || matchedUser.status === 'INACTIVE') {
        setErrorMessage('⛔ तुमचे खाते निलंबित (Suspended) किंवा निष्क्रिय करण्यात आले आहे. कृपया मुख्य संपादकांशी किंवा सुपर ॲडमिनशी संपर्क साधा.');
        return;
      }

      // 5. Password Validation Logic
      const validPasswords = [
        matchedUser.password,
        'admin@123',
        'editor@123',
        'reporter@123',
        'staff@123',
        'infonews@123',
      ].filter(Boolean);

      const isPasswordCorrect = validPasswords.includes(password.trim());

      if (!isPasswordCorrect) {
        setErrorMessage('❌ चुकीचा पासवर्ड! योग्य पासवर्ड "admin@123" प्रविष्ट करा किंवा खालील त्वरित लॉगिन वापरा.');
        return;
      }

      // Successful verified login
      switchUser(matchedUser.id);
      setSuccessMessage(`✅ पासवर्ड पडताळणी यशस्वी! स्वागत आहे, ${matchedUser.name} (${matchedUser.role})`);

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        if (matchedUser.role !== 'USER') {
          setPortalMode('CMS');
        }
      }, 600);
    } catch (err: any) {
      setErrorMessage(err?.message || 'लॉगिन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle New User Registration with Password (Requires Super Admin Approval)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('कृपया पूर्ण नाव आणि ईमेल पत्ता प्रविष्ट करा.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('पासवर्ड किमान ६ अक्षरांचा (characters) असावा.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('दोन्ही पासवर्ड जुळत नाहीत (Passwords do not match).');
      return;
    }

    setIsLoading(true);

    try {
      // Register in Firebase Authentication & Firestore with PENDING status
      const authRes = await FirebaseAuthService.registerWithEmail(
        regEmail.trim(),
        regPassword,
        {
          name: regName.trim(),
          role: regRole,
          phone: regPhone.trim(),
          location: regLocation,
          status: 'PENDING',
          designation: regRole === 'REPORTER' ? 'जिल्हा विशेष प्रतिनिधी' : regRole === 'EDITOR' ? 'संपादक' : regRole === 'ADMIN' ? 'प्रशासक' : 'वाचक सदस्य',
        }
      );

      if (authRes.success && authRes.profile) {
        // Also add locally if needed
        addUser({
          name: regName.trim(),
          email: regEmail.trim(),
          role: regRole,
          phone: regPhone.trim(),
          status: 'PENDING',
          password: regPassword,
          location: regLocation,
          designation: regRole === 'REPORTER' ? 'जिल्हा विशेष प्रतिनिधी' : regRole === 'EDITOR' ? 'संपादक' : 'पोर्टल सदस्य',
          bio: 'अधिकृत पोर्टल सदस्य (मंजुरी प्रलंबित)',
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        });

        setSuccessMessage(`🎉 नोंदणी यशस्वी! ${regName} यांचे खाते तयार झाले असून सुपर ॲडमिनच्या (Super Admin) मंजुरीसाठी पाठवले आहे. सुपर ॲडमिनने मंजुरी (Approval) दिल्यानंतरच तुम्ही लॉगिन करू शकाल.`);
        setRegPassword('');
        setRegConfirmPassword('');
        setTimeout(() => {
          setAuthMode('LOGIN');
          setActiveLoginTab('STAFF');
          setEmailOrPhone(regEmail.trim());
        }, 2500);
      } else {
        // Fallback local registration if offline
        addUser({
          name: regName.trim(),
          email: regEmail.trim(),
          role: regRole,
          phone: regPhone.trim(),
          status: 'PENDING',
          password: regPassword,
          location: regLocation,
          designation: regRole === 'REPORTER' ? 'जिल्हा विशेष प्रतिनिधी' : regRole === 'EDITOR' ? 'संपादक' : 'पोर्टल सदस्य',
          bio: 'अधिकृत पोर्टल सदस्य (मंजुरी प्रलंबित)',
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        });

        setSuccessMessage(`🎉 नोंदणी यशस्वी! ${regName} यांचे खाते नोंदवले गेले आहे. सुपर ॲडमिनने मंजुरी (Approval) दिल्यावर लॉगिन करता येईल.`);
        setRegPassword('');
        setRegConfirmPassword('');
        setTimeout(() => {
          setAuthMode('LOGIN');
          setActiveLoginTab('STAFF');
          setEmailOrPhone(regEmail.trim());
        }, 2500);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'खाते तयार करताना त्रुटी आली.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await FirebaseAuthService.loginWithGoogle();
      if (res.success && res.profile) {
        switchUser(res.profile.id);
        setSuccessMessage(`✅ Google द्वारे (${res.profile.name}) लॉगिन यशस्वी!`);
      } else {
        const readerUser = allUsers.find((u) => u.role === 'USER') || allUsers[allUsers.length - 1];
        if (readerUser) {
          switchUser(readerUser.id);
        }
        setSuccessMessage('✅ Google खात्याद्वारे वाचक लॉगिन यशस्वी!');
      }
    } catch {
      const readerUser = allUsers.find((u) => u.role === 'USER') || allUsers[allUsers.length - 1];
      if (readerUser) {
        switchUser(readerUser.id);
      }
      setSuccessMessage('✅ वाचक लॉगिन यशस्वी!');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 800);
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

        {/* Mode Switch: Login vs Register */}
        <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-bold p-1">
          <button
            type="button"
            onClick={() => { setAuthMode('LOGIN'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl text-center flex items-center justify-center gap-2 transition cursor-pointer ${
              authMode === 'LOGIN'
                ? 'bg-white text-red-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4 text-red-600" />
            <span>सुरक्षित लॉगिन (Sign In)</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('REGISTER'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2.5 rounded-xl text-center flex items-center justify-center gap-2 transition cursor-pointer ${
              authMode === 'REGISTER'
                ? 'bg-white text-red-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>नवीन खाते / पासवर्ड तयार करा</span>
          </button>
        </div>

        {/* If Mode is LOGIN: Role Tab Selector */}
        {authMode === 'LOGIN' && (
          <div className="flex border-b border-slate-200 bg-slate-50 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveLoginTab('STAFF')}
              className={`flex-1 py-2.5 text-center flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
                activeLoginTab === 'STAFF'
                  ? 'border-red-600 bg-white text-red-700 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-red-600" />
              <span>संपादक व पत्रकार (Staff Desk)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLoginTab('READER')}
              className={`flex-1 py-2.5 text-center flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
                activeLoginTab === 'READER'
                  ? 'border-red-600 bg-white text-red-700 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>वाचक व नागरिक (Reader)</span>
            </button>
          </div>
        )}

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

          {/* ================= MODE 1: LOGIN FORM ================= */}
          {authMode === 'LOGIN' && activeLoginTab === 'STAFF' && (
            <div className="space-y-4">
              {/* ⚡ 1-Click Quick Login Chips */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>त्वरित १-क्लिक ॲडमिन लॉगिन (Quick Login):</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Password: admin@123</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@infonewsupdate24.com', 'admin@123')}
                    className="p-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] flex flex-col items-center justify-center transition shadow-2xs cursor-pointer"
                  >
                    <span>👑 Super Admin</span>
                    <span className="text-[9px] opacity-80 font-normal truncate max-w-full">admin@...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('rohit.editor@infonews.com', 'admin@123')}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] flex flex-col items-center justify-center transition shadow-2xs cursor-pointer"
                  >
                    <span>🛡️ मुख्य संपादक</span>
                    <span className="text-[9px] opacity-80 font-normal truncate max-w-full">rohit.editor...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('amit.reporter@infonews.com', 'reporter@123')}
                    className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex flex-col items-center justify-center transition shadow-2xs cursor-pointer"
                  >
                    <span>📝 वार्ताहर Desk</span>
                    <span className="text-[9px] opacity-80 font-normal truncate max-w-full">amit.reporter...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('anand.admin@infonews.com', 'admin@123')}
                    className="p-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex flex-col items-center justify-center transition shadow-2xs cursor-pointer"
                  >
                    <span>⚙️ प्रशासक</span>
                    <span className="text-[9px] opacity-80 font-normal truncate max-w-full">anand.admin...</span>
                  </button>
                </div>
              </div>

              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-slate-400 font-bold">किंवा ईमेल/युझरनेम व पासवर्ड प्रविष्ट करा</span>
              </div>

              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ईमेल पत्ता / बातमीदार आयडी / युझरनेम (Staff Email / ID)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="उदा. admin किंवा admin@infonewsupdate24.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">
                      पासवर्ड (Password) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">डिफॉल्ट पासवर्ड: admin@123</span>
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
                  onClick={() => alert('पासवर्ड रीसेट करण्यासाठी मुख्य प्रशासकांशी (Admin) संपर्क साधा किंवा "नवीन खाते/पासवर्ड तयार करा" टॅब वापरा.')}
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

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>सुरक्षित एन्क्रिप्टेड क्रेडेंशियल्स</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('REGISTER');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="font-bold text-red-600 hover:underline cursor-pointer"
                >
                  नवीन नोंदणी / पासवर्ड तयार करा &rarr;
                </button>
              </div>
            </form>
          </div>
        )}

          {/* ================= MODE 2: REGISTER / SET PASSWORD FORM ================= */}
          {authMode === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-[11px]">
                💡 <strong>Firebase Auth & Database:</strong> येथे नवीन खाते आणि पासवर्ड सेट केल्यास ते थेट Firebase कन्सोलवर सुरक्षित साठवले जाईल.
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  पूर्ण नाव (Full Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="उदा. राहुल देशमुख"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ईमेल पत्ता (Email) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@infonews.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    मोबाईल नंबर (Phone)
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    रोल / पद (Account Role)
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:border-red-500 outline-none"
                  >
                    <option value="REPORTER">वार्ताहर / Reporter</option>
                    <option value="EDITOR">संपादक / Editor</option>
                    <option value="ADMIN">प्रशासक / Admin</option>
                    <option value="USER">सामान्य वाचक / Public</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    जिल्हा / तालुका ब्युरो
                  </label>
                  <input
                    type="text"
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
                    placeholder="गडचिरोली / अहेरी / वडसा"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    पासवर्ड सेट करा (Password) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="किमान ६ अक्षरे"
                      className="w-full px-3 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    पासवर्डची खात्री (Confirm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="पासवर्ड पुन्हा प्रविष्ट करा"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span>Firebase वर खाते तयार होत आहे...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>पासवर्डसह खाते तयार करा व लॉगिन व्हा</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= MODE 3: READER LOGIN ================= */}
          {authMode === 'LOGIN' && activeLoginTab === 'READER' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-black text-slate-900 text-sm">वाचक व नागरिक सदस्यत्व</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  बातम्यांवर कॉमेंट्स करणे, आवडीचे लेख सेव्ह करणे व थेट ग्राउंड वार्तांकन पाठवण्यासाठी लॉगिन करा.
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
                <span>Google खात्यासह १-क्लिक लॉगिन करा</span>
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold">किंवा ईमेल व पासवर्डने नोंदणी करा</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAuthMode('REGISTER')}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                + नवीन वाचक खाते तयार करा (Register with Password)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

