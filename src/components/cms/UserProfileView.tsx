import {
  AlertCircle,
  Award,
  BarChart3,
  Building,
  Check,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Key,
  Layers,
  Lock,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  User,
  UserCheck,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Permission, UserRole } from '../../types';
import { ROLE_PERMISSIONS } from '../../utils/rbac';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

const ALL_SYSTEM_PERMISSIONS: { key: Permission; label: string; group: string; desc: string }[] = [
  { key: 'post.create', label: 'Create New Posts (नवीन बातमी तयार करणे)', group: 'Editorial', desc: 'बातम्यांचे मसुदे तयार करण्याचे अधिकार' },
  { key: 'post.edit', label: 'Edit Any Post (इतरांच्या बातम्या संपादित करणे)', group: 'Editorial', desc: 'सर्व पत्रकारांच्या बातम्यांमध्ये बदल करण्याचे अधिकार' },
  { key: 'post.edit_own', label: 'Edit Own Posts (स्वतःच्या बातम्या संपादित करणे)', group: 'Editorial', desc: 'स्वतः लिहिलेल्या बातमीत बदल करणे' },
  { key: 'post.submit', label: 'Submit for Review (रिव्ह्यूसाठी पाठवणे)', group: 'Editorial', desc: 'संपादकाकडे बातमी तपासणीसाठी पाठवणे' },
  { key: 'post.review', label: 'Review & Correction (तपासणी व सुधारणा)', group: 'Editorial', desc: 'बातमी तपासून सुधारणा मागवणे' },
  { key: 'post.approve', label: 'Approve Posts (बातमी मंजूर करणे)', group: 'Editorial', desc: 'प्रकाशनयोग्य ठरवणे' },
  { key: 'post.publish', label: 'Publish to Public Portal (थेट प्रकाशित करणे)', group: 'Editorial', desc: 'मुख्य पोर्टलवर बातमी लाईव्ह करणे' },
  { key: 'post.delete', label: 'Delete Any Post (कोणतीही बातमी हटवणे)', group: 'Editorial', desc: 'पोर्टलवरून बातमी कायमची काढून टाकणे' },
  { key: 'category.manage', label: 'Manage Categories (कॅटेगरी व्यवस्थापन)', group: 'Taxonomy', desc: 'नवीन वर्गवारी जोडणे किंवा बदलणे' },
  { key: 'tag.manage', label: 'Manage Tags (टॅग्ज व्यवस्थापन)', group: 'Taxonomy', desc: 'SEO टॅग्ज नियंत्रित करणे' },
  { key: 'media.upload', label: 'Upload Media (फोटो/व्हिडिओ अपलोड)', group: 'Media', desc: 'लायब्ररीमध्ये मीडिया फाइल्स लोड करणे' },
  { key: 'media.manage', label: 'Manage Shared Media (मीडिया लायब्ररी)', group: 'Media', desc: 'इतरांचे फोटो एडिट/डिलीट करणे' },
  { key: 'page.manage', label: 'Manage Pages (स्थिर पाने व्यवस्थापन)', group: 'Administration', desc: 'About, Privacy Policy, Contact पेजेस तयार करणे' },
  { key: 'menu.manage', label: 'Configure Navigation Menus (मेन्यू रचना)', group: 'Appearance', desc: 'हेडर व फुटर मेन्यू व्यवस्थापित करणे' },
  { key: 'theme.manage', label: 'Theme & Appearance (थीम व लेआउट)', group: 'Appearance', desc: 'होमपेज लेआउट व डिझाईन बदलणे' },
  { key: 'advertisement.manage', label: 'AdSense & Ads Manager (जाहिरात व्यवस्थापन)', group: 'Monetization', desc: 'गुगल अ‍ॅडसेन्स व स्पॉन्सर्ड जाहिराती' },
  { key: 'seo.manage', label: 'Advanced SEO Suite (SEO टूल वापरणे)', group: 'SEO', desc: 'Rank Math व मेटा डेटा ऑप्टिमाइझ करणे' },
  { key: 'user.manage', label: 'Manage Users & Permissions (वापरकर्ते व्यवस्थापन)', group: 'Administration', desc: 'नवीन बातमीदार जोडणे व रोल देणे' },
  { key: 'settings.manage', label: 'Global CMS Settings (सर्व सेटिंग्ज)', group: 'Administration', desc: 'पोर्टलचे मुख्य नियम व API सेटिंग्ज' },
  { key: 'comments.manage', label: 'Moderate Comments (प्रतिक्रिया तपासणे)', group: 'Editorial', desc: 'वाचकांच्या प्रतिक्रिया मंजूर/हटवणे' },
  { key: 'analytics.view', label: 'View Analytics & Reports (आकडेवारी पाहणे)', group: 'Administration', desc: 'वाचकांची संख्या व ट्रॅफिक आकडेवारी' },
];

export const UserProfileView: React.FC = () => {
  const { currentUser, switchRole, updateCurrentUserProfile } = useAuth();
  const { posts, setCmsView, setPublicActivePostSlug, setPortalMode } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'permissions' | 'my_articles' | 'roles_hierarchy' | 'security'>('profile');

  // Edit Profile Form State
  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [designation, setDesignation] = useState(currentUser.designation || 'संपादकीय प्रतिनिधी');
  const [location, setLocation] = useState(currentUser.location || 'गडचिरोली (मुख्य ब्युरो)');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);

  // Social handles
  const [socialTwitter, setSocialTwitter] = useState(currentUser.socialTwitter || '');
  const [socialFacebook, setSocialFacebook] = useState(currentUser.socialFacebook || '');
  const [socialInstagram, setSocialInstagram] = useState(currentUser.socialInstagram || '');
  const [socialWhatsApp, setSocialWhatsApp] = useState(currentUser.socialWhatsApp || '');

  // Custom Permissions Override
  const [customPerms, setCustomPerms] = useState<Permission[]>(
    currentUser.customPermissions || ROLE_PERMISSIONS[currentUser.role] || []
  );

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      designation: designation.trim(),
      location,
      bio: bio.trim(),
      avatar,
      socialTwitter: socialTwitter.trim(),
      socialFacebook: socialFacebook.trim(),
      socialInstagram: socialInstagram.trim(),
      socialWhatsApp: socialWhatsApp.trim(),
    });
    showNotification('success', '✅ प्रोफाइल व बायलाईन माहिती यशस्वीरित्या सेव्ह झाली!');
  };

  // Toggle Custom Permission
  const handleTogglePermission = (permKey: Permission) => {
    setCustomPerms((prev) => {
      const exists = prev.includes(permKey);
      const updated = exists ? prev.filter((p) => p !== permKey) : [...prev, permKey];
      updateCurrentUserProfile({ customPermissions: updated });
      return updated;
    });
    showNotification('success', '⚡ परवानग्या त्वरित अपडेट करण्यात आल्या.');
  };

  // Reset Permissions to Default Role Matrix
  const handleResetPermissions = () => {
    const defaultPerms = ROLE_PERMISSIONS[currentUser.role] || [];
    setCustomPerms(defaultPerms);
    updateCurrentUserProfile({ customPermissions: defaultPerms });
    showNotification('success', `रोल "${currentUser.role}" च्या मानक परवानग्या रीसेट केल्या.`);
  };

  // Handle Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showNotification('error', 'नवीन पासवर्ड किमान ६ अक्षरांचा असावा.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('error', 'नवीन पासवर्ड आणि कन्फर्म पासवर्ड जुळत नाहीत.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showNotification('success', '🔒 पासवर्ड यशस्वीरित्या बदलण्यात आला आहे!');
  };

  // User's Articles & Stats
  const myPosts = useMemo(() => {
    return posts.filter(
      (p) => p.authorName?.toLowerCase() === currentUser.name.toLowerCase()
    );
  }, [posts, currentUser.name]);

  const stats = useMemo(() => {
    const published = myPosts.filter((p) => p.status === 'PUBLISHED').length;
    const drafts = myPosts.filter((p) => p.status === 'DRAFT').length;
    const underReview = myPosts.filter((p) => p.status === 'UNDER_REVIEW' || p.status === 'SUBMITTED').length;
    const totalViews = myPosts.reduce((acc, p) => acc + (p.views || 0), 0);
    return { published, drafts, underReview, totalViews };
  }, [myPosts]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            प्रोफाइल, बायलाईन व अधिकार व्यवस्थापक (Profile & Roles)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            आपली पत्रकार प्रोफाइल, बातमीत दिसणारी बायलाईन, RBAC अधिकार आणि प्रसिद्ध झालेल्या बातम्यांचे व्यवस्थापन करा.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCmsView('users')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
          >
            <Users className="h-4 w-4" />
            <span>All Users Directory</span>
          </button>
        </div>
      </div>

      {/* Feedback Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'profile'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>प्रोफाइल व बायलाईन (Profile & Byline)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'permissions'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>अधिकार मॅट्रिक्स (Role Permissions)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my_articles')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'my_articles'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>माझ्या बातम्या ({myPosts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles_hierarchy')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'roles_hierarchy'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>न्यूजरूम पदानुक्रम (Role Hierarchy)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${
            activeTab === 'security'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>सुरक्षा व पासवर्ड (Security)</span>
        </button>
      </div>

      {/* TAB 1: PROFILE & JOURNALIST BYLINE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Edit Profile Form (2 Cols) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-red-600" />
                <span>माहिती संपादन करा (Edit Profile & Byline)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                येथे दिलेली माहिती बातमीच्या शेवटी वाचकांना लेखक परिचय म्हणून दिसेल.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    पूर्ण नाव (Full Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ईमेल (Email Address) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    मराठी पदनाम (Designation / Title)
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="उदा. वरिष्ठ मंत्रालय प्रतिनिधी / जिल्हा ब्युरो चीफ"
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    कार्यक्षेत्र / ब्युरो (Location / Bureau)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="उदा. गडचिरोली / मुंबई"
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    व्हॉट्सॲप / मोबाईल नंबर
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98XXXXXXXX"
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Twitter / X Profile URL
                  </label>
                  <input
                    type="url"
                    value={socialTwitter}
                    onChange={(e) => setSocialTwitter(e.target.value)}
                    placeholder="https://x.com/username"
                    className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-2">
                  प्रोफाइल फोटो (Avatar निवडा)
                </label>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((avUrl, idx) => (
                    <img
                      key={idx}
                      src={avUrl}
                      alt="Avatar"
                      onClick={() => setAvatar(avUrl)}
                      className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 transition ${
                        avatar === avUrl
                          ? 'border-red-600 ring-2 ring-red-400 scale-105'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  संक्षिप्त पत्रकार परिचय (Author Bio)
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="उदा. पत्रकारितेचा १० वर्षांचा अनुभव. राजकीय व ग्रामीण घडामोडींचे अभ्यासक..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-2.5 text-xs font-black text-white shadow-md cursor-pointer transition"
                >
                  <Save className="w-4 h-4" />
                  <span>बदल सेव्ह करा (Save Profile)</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Col: Live Journalist Byline Card Preview */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-red-600" />
                  <span>बातमीत दिसणारी Byline (Live Preview)</span>
                </h3>
                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold">
                  ✓ Verified Journalist
                </span>
              </div>

              {/* Journalist Box as it appears in public news article */}
              <div className="bg-gradient-to-br from-slate-50 to-orange-50/40 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                      <span>{name || 'राहुल देशमुख'}</span>
                      <Award className="w-3.5 h-3.5 text-red-600" />
                    </h4>
                    <p className="text-[11px] font-semibold text-red-700">
                      {designation || 'जिल्हा विशेष प्रतिनिधी'}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{location || 'गडचिरोली'}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic border-t border-slate-200/60 pt-2">
                  "{bio || 'स्थानिक घडामोडी, शेतकरी समस्या आणि प्रशासकीय निर्णयांवर अचूक वार्तांकन.'}"
                </p>

                {/* Social links */}
                <div className="flex items-center gap-2 pt-1">
                  {phone && (
                    <a
                      href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-lg shadow-2xs hover:bg-emerald-700"
                    >
                      <span>💬 बातमीची टीप पाठवा</span>
                    </a>
                  )}
                  {socialTwitter && (
                    <a
                      href={socialTwitter}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-900 text-white px-2 py-1 rounded-lg"
                    >
                      <span>X / Twitter</span>
                    </a>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                💡 वरील कार्ड पोर्टलवरील प्रत्येक प्रसिद्ध झालेल्या बातमीच्या शेवटी वाचकांना दिसते.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                माझी पत्रकारिता कामगिरी (My Stats)
              </h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase">प्रसिद्ध बातम्या</span>
                  <span className="text-xl font-black text-emerald-400">{stats.published}</span>
                </div>
                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase">एकूण व्ह्यूज</span>
                  <span className="text-xl font-black text-yellow-400">{stats.totalViews.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLE PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                <span>सक्रिय भूमिका व अधिकार मॅट्रिक्स (Active Permissions)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                सध्याची भूमिका: <span className="font-bold text-red-600">{currentUser.role}</span> |{' '}
                {customPerms.length} / {ALL_SYSTEM_PERMISSIONS.length} अधिकार उपलब्ध
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetPermissions}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>मानक परवानग्यांवर रीसेट करा</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            प्रत्येक बातमीदार किंवा उपसंपादकाला CMS मधील कोणते टॅब आणि अ‍ॅक्शन्स उपलब्ध असतील हे खालील अधिकारांवर अवलंबून आहे.
            सुपर ॲडमिन विशिष्ट अधिकारांवर क्लिक करून ते ऑन/ऑफ करू शकतात:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_SYSTEM_PERMISSIONS.map((perm) => {
              const isGranted = customPerms.includes(perm.key);
              return (
                <div
                  key={perm.key}
                  onClick={() => handleTogglePermission(perm.key)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer select-none flex flex-col justify-between ${
                    isGranted
                      ? 'bg-emerald-50/50 border-emerald-300 text-slate-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isGranted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="font-bold text-xs">{perm.label}</span>
                    </div>
                    <span className="rounded bg-white/80 border border-slate-200 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-600">
                      {perm.group}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 pl-6">{perm.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MY ARTICLES & PERFORMANCE */}
      {activeTab === 'my_articles' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-red-600" />
                <span>माझ्या सर्व बातम्या व वाचक आकडेवारी ({myPosts.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser.name} यांच्या नावाने प्रकाशित झालेल्या बातम्यांचा इतिहास.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCmsView('posts_new')}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 text-white px-4 py-2 text-xs font-bold hover:bg-red-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>नवीन बातमी लिहा</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase">एकूण बातम्या</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{myPosts.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-xs font-bold text-emerald-700 uppercase">प्रसिद्ध (Published)</span>
              <p className="text-2xl font-black text-emerald-800 mt-1">{stats.published}</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-xs font-bold text-amber-700 uppercase">तपासणीत (Under Review)</span>
              <p className="text-2xl font-black text-amber-800 mt-1">{stats.underReview}</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-xs font-bold text-blue-700 uppercase">एकूण वाचक व्ह्यूज</span>
              <p className="text-2xl font-black text-blue-800 mt-1">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>

          {/* Articles Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">बातमी मथळा (Headline)</th>
                  <th className="p-3.5">स्थिती</th>
                  <th className="p-3.5 text-center">वाचक व्ह्यूज</th>
                  <th className="p-3.5">तारीख</th>
                  <th className="p-3.5 text-right">कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      कोणतीही बातमी उपलब्ध नाही.
                    </td>
                  </tr>
                ) : (
                  myPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-50">
                      <td className="p-3.5 max-w-md">
                        <p className="font-bold text-slate-900 truncate">{post.title}</p>
                        <p className="text-[11px] text-slate-400 font-mono">/news/{post.slug}</p>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            post.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800">
                        {(post.views || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {new Date(post.createdAt).toLocaleDateString('mr-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setPublicActivePostSlug(post.slug);
                            setPortalMode('PUBLIC');
                          }}
                          className="text-emerald-600 hover:text-emerald-800 font-bold text-xs"
                        >
                          बातमी पहा ➔
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ROLE HIERARCHY & COMPARISON */}
      {activeTab === 'roles_hierarchy' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-red-600" />
              <span>InfoNewsUpdate24 न्यूजरूम पदरचना व तुलना (Newsroom Hierarchy)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रत्येक भूमिकेची कर्तव्ये व अधिकारांची सविस्तर तुलना.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Super Admin */}
            <div className="p-5 rounded-2xl border-2 border-red-500 bg-red-50/30 space-y-3">
              <span className="rounded-full bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5">
                👑 Super Admin
              </span>
              <h3 className="font-bold text-slate-900 text-sm">मुख्य प्रशासक</h3>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                <li>सर्व बातम्या लिहिणे, संपादित करणे, प्रसिद्ध करणे व हटवणे.</li>
                <li>नवीन बातमीदार जोडणे व परवानग्या नियंत्रित करणे.</li>
                <li>Google AdSense, बिलिंग व मुख्य सुरक्षा सेटिंग्ज.</li>
              </ul>
            </div>

            {/* Chief Editor */}
            <div className="p-5 rounded-2xl border border-purple-300 bg-purple-50/30 space-y-3">
              <span className="rounded-full bg-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5">
                ✍️ Chief Editor
              </span>
              <h3 className="font-bold text-slate-900 text-sm">मुख्य संपादक</h3>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                <li>सर्व वार्ताहरांच्या बातम्या तपासणे व मंजूर करणे (Approval).</li>
                <li>ब्रेकिंग न्यूज टिकर व होमपेज लेआउट नियंत्रित करणे.</li>
                <li>प्रतिक्रिया तपासणे व वृत्त धोरण सांभाळणे.</li>
              </ul>
            </div>

            {/* Sub Editor */}
            <div className="p-5 rounded-2xl border border-indigo-300 bg-indigo-50/30 space-y-3">
              <span className="rounded-full bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5">
                📑 Sub-Editor
              </span>
              <h3 className="font-bold text-slate-900 text-sm">उपसंपादक</h3>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                <li>वार्ताहरांच्या बातम्यांमधील शुद्धलेखन व मथळे सुधारणे.</li>
                <li>फोटो, टॅग्ज आणि SEO Rank Math ऑप्टिमायझेशन करणे.</li>
                <li>मंजुरीसाठी मुख्य संपादकाकडे पाठवणे.</li>
              </ul>
            </div>

            {/* Reporter / Bureau */}
            <div className="p-5 rounded-2xl border border-blue-300 bg-blue-50/30 space-y-3">
              <span className="rounded-full bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5">
                🎤 Reporter / Bureau
              </span>
              <h3 className="font-bold text-slate-900 text-sm">वार्ताहर / तालुका प्रतिनिधी</h3>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                <li>स्थानिक घडामोडी व घटनांचे तात्काळ वार्तांकन करणे.</li>
                <li>फोटो व व्हिडिओसह बातमी सबमिट करणे (Draft ➔ Submitted).</li>
                <li>स्वतःच्या लेखांचा वाचक प्रतिसाद पाहणे.</li>
              </ul>
            </div>

            {/* Video Journalist */}
            <div className="p-5 rounded-2xl border border-cyan-300 bg-cyan-50/30 space-y-3">
              <span className="rounded-full bg-cyan-600 text-white text-[10px] font-bold px-2.5 py-0.5">
                📹 Video Journalist
              </span>
              <h3 className="font-bold text-slate-900 text-sm">व्हिडिओ पत्रकार</h3>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                <li>व्हिडिओ बातम्या, रील्स आणि ग्राउंड रिपोर्टिंग अपलोड करणे.</li>
                <li>सोशल मीडिया व्हिडिओ मॅनेजमेंट.</li>
              </ul>
            </div>

            {/* Contributor */}
            <div className="p-5 rounded-2xl border border-slate-300 bg-slate-50 space-y-3">
              <span className="rounded-full bg-slate-600 text-white text-[10px] font-bold px-2.5 py-0.5">
                👤 Citizen / Contributor
              </span>
              <h3 className="font-bold text-slate-900 text-sm">मानद / नागरिक पत्रकार</h3>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                <li>स्थानिक समस्या व सूचनांचे लेख लिहून संपादकाकडे पाठवणे.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="max-w-xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-600" />
              <span>सुरक्षा व पासवर्ड व्यवस्थापन (Security & Password)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              आपल्या खात्याचा संकेतशब्द (Password) सुरक्षित ठेवा.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                सध्याचा पासवर्ड (Current Password)
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                नवीन पासवर्ड (New Password)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="किमान ६ अक्षरे"
                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                नवीन पासवर्ड कन्फर्म करा (Confirm Password)
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-black px-6 py-2.5 text-xs font-black text-white shadow-md cursor-pointer transition"
              >
                <Key className="w-4 h-4" />
                <span>पासवर्ड बदला (Update Password)</span>
              </button>
            </div>
          </form>

          {/* 2FA Badge */}
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-emerald-900">2-Factor Authentication (2FA)</span>
                <p className="text-[11px] text-emerald-700">सध्या तुमचे खाते २-स्टेप व्हेरिफिकेशनने सुरक्षित आहे.</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5">
              Active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
