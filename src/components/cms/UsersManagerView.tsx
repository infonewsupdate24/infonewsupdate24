import {
  AlertCircle,
  Building,
  Check,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Key,
  Layers,
  Lock,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Square,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FirebaseAuthService } from '../../services/FirebaseAuthService';
import { FirestoreNewsService } from '../../services/FirestoreNewsService';
import { Permission, UserProfile, UserRole, UserStatus } from '../../types';
import { ROLE_PERMISSIONS } from '../../utils/rbac';

// Preset Avatars for Newsroom Staff
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

// Maharashtra Districts & Bureaus
const BUREAUS = [
  'गडचिरोली (मुख्य ब्युरो)',
  'अहेरी / सुरजागड ब्युरो',
  'चामोर्शी ब्युरो',
  'कुरखेडा / आरमोरी ब्युरो',
  'देसाईगंज / वडसा ब्युरो',
  'मुंबई (मंत्रालय व राज्य ब्युरो)',
  'नागपूर (विदर्भ ब्युरो)',
  'पुणे (पश्चिम महाराष्ट्र ब्युरो)',
  'नाशिक (उत्तर महाराष्ट्र ब्युरो)',
  'छत्रपती संभाजीनगर (मराठवाडा ब्युरो)',
  'अमरावती ब्युरो',
  'सोलापूर ब्युरो',
  'कोल्हापूर ब्युरो',
  'नवी दिल्ली (राष्ट्रीय ब्युरो)',
];

interface PermissionCategory {
  id: string;
  title: string;
  badge: string;
  color: string;
  permissions: {
    key: Permission;
    label: string;
    description: string;
  }[];
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'editorial',
    title: '📝 १. बातम्या व संपादकीय (Editorial)',
    badge: 'Editorial',
    color: 'border-red-200 bg-red-50/40 text-red-950',
    permissions: [
      { key: 'post.create', label: 'नवीन बातमी लिहिणे (Create Post)', description: 'ड्राफ्ट बातमी तयार करण्याचे अधिकार' },
      { key: 'post.edit_own', label: 'स्वतःची बातमी संपादित करणे (Edit Own)', description: 'स्वतः लिहिलेल्या लेखात बदल करणे' },
      { key: 'post.edit', label: 'इतरांच्या बातम्या संपादित करणे (Edit Any)', description: 'सर्व वार्ताहरांचे लेख बदलणे' },
      { key: 'post.submit', label: 'रिव्ह्यूसाठी पाठवणे (Submit for Review)', description: 'संपादकाकडे मंजुरीसाठी पाठवणे' },
      { key: 'post.review', label: 'तपासणी व सुधारणा मागवणे (Review & Notes)', description: 'बातमी तपासून नोट्स देणे' },
      { key: 'post.approve', label: 'बातमी मंजूर करणे (Approve Post)', description: 'प्रकाशनयोग्य ठरवणे' },
      { key: 'post.publish', label: 'थेट पोर्टलवर प्रसिद्ध करणे (Publish Live)', description: 'मुख्य पोर्टलवर बातमी लाईव्ह करणे' },
      { key: 'post.delete_own', label: 'स्वतःची बातमी हटवणे (Delete Own)', description: 'स्वतःचा ड्राफ्ट काढणे' },
      { key: 'post.delete', label: 'कोणतीही बातमी कायमची हटवणे (Delete Any)', description: 'पोर्टलवरून कोणतीही बातमी नष्ट करणे' },
      { key: 'comments.manage', label: 'वाचक प्रतिक्रिया तपासणे (Comments)', description: 'कॉमेंट्स मंजूर किंवा स्पॅम करणे' },
    ],
  },
  {
    id: 'media',
    title: '🖼️ २. मीडिया लायब्ररी (Media & Assets)',
    badge: 'Media',
    color: 'border-cyan-200 bg-cyan-50/40 text-cyan-950',
    permissions: [
      { key: 'media.upload', label: 'फोटो व व्हिडिओ अपलोड (Upload Media)', description: 'लायब्ररीमध्ये नवीन फोटो लोड करणे' },
      { key: 'media.manage', label: 'संपूर्ण मीडिया लायब्ररी व्यवस्थापन (Manage Media)', description: 'इतरांचे फोटो एडिट/डिलीट करणे' },
    ],
  },
  {
    id: 'taxonomy_seo',
    title: '🗂️ ३. वर्गवारी, टॅग्ज व SEO (Taxonomy & Pages)',
    badge: 'Taxonomy',
    color: 'border-purple-200 bg-purple-50/40 text-purple-950',
    permissions: [
      { key: 'category.manage', label: 'Categories वर्गवारी व्यवस्थापन', description: 'नवीन कॅटेगरीज जोडणे किंवा बदलणे' },
      { key: 'tag.manage', label: 'Tags व्यवस्थापन', description: 'SEO टॅग्ज तयार करणे व नियंत्रित करणे' },
      { key: 'page.manage', label: 'Pages स्थिर पाने व्यवस्थापन', description: 'About Us, Contact, Legal पेजेस' },
      { key: 'seo.manage', label: 'Rank Math SEO Suite वापरणे', description: 'SEO स्कोर व मेटा टॅग्ज ऑप्टिमायझेशन' },
    ],
  },
  {
    id: 'monetization',
    title: '💰 ४. कमाई व जाहिराती (Monetization & Ads)',
    badge: 'Monetization',
    color: 'border-emerald-200 bg-emerald-50/40 text-emerald-950',
    permissions: [
      { key: 'advertisement.manage', label: 'Google AdSense व व्यापारी जाहिराती', description: 'बॅनर जाहिराती, दर व स्लॉट नियंत्रित करणे' },
    ],
  },
  {
    id: 'admin_design',
    title: '⚙️ ५. प्रशासन, डिझाइन व सेटिंग्ज (Administration & Security)',
    badge: 'Admin',
    color: 'border-amber-200 bg-amber-50/40 text-amber-950',
    permissions: [
      { key: 'user.manage', label: 'इतर बातमीदार व युझर्स व्यवस्थापन', description: 'नवीन पत्रकार जोडणे व अधिकार देणे' },
      { key: 'appearance.manage', label: 'होमपेज लेआउट बिल्डर व डिझाइन', description: 'होमपेजवरील ब्लॉक्स ड्रॅग-अँड-ड्रॉप करणे' },
      { key: 'theme.manage', label: 'थीम, रंग व कस्टमायझर', description: 'फॉन्ट, रंग व लेआउट बदलणे' },
      { key: 'menu.manage', label: 'हेडर व फुटर मेनू रचना', description: 'नेव्हिगेशन मेनू बदलणे' },
      { key: 'settings.manage', label: 'ग्लोबल CMS व सर्व्हर सेटिंग्ज', description: 'सुरक्षा, मेंटेनन्स व API' },
      { key: 'analytics.view', label: 'वाचक आकडेवारी व अहवाल पाहणे', description: 'ट्रॅफिक व परफॉर्मन्स आकडेवारी' },
      { key: 'logs.view', label: 'सिस्टीम ॲक्टिव्हिटी लॉग पाहणे', description: 'सर्व पत्रकारांच्या हालचालींची नोंद' },
    ],
  },
];

const ALL_SYSTEM_PERMISSION_KEYS: Permission[] = PERMISSION_CATEGORIES.flatMap((c) =>
  c.permissions.map((p) => p.key)
);

export const UsersManagerView: React.FC = () => {
  const { allUsers, currentUser, switchUser, addUser, updateUser, deleteUser, approveUser, rejectUser } = useAuth();
  const { posts, setCmsView } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [bureauFilter, setBureauFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('REPORTER');
  const [formStatus, setFormStatus] = useState<UserStatus>('ACTIVE');
  const [formDesignation, setFormDesignation] = useState('');
  const [formLocation, setFormLocation] = useState('गडचिरोली (मुख्य ब्युरो)');
  const [formBio, setFormBio] = useState('');
  const [formAvatar, setFormAvatar] = useState(PRESET_AVATARS[0]);

  // Granular Permissions State
  const [formPermissions, setFormPermissions] = useState<Permission[]>([]);

  // Feedback Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSyncAllToCloud = async () => {
    setIsSyncingCloud(true);
    try {
      const res = await FirestoreNewsService.syncAllUsersToCloud(allUsers);
      if (res.error) {
        showNotification('error', `Firebase Sync त्रुटी: ${res.error}`);
      } else {
        showNotification('success', `⚡ सर्व ${res.count} वापरकर्ते Firebase क्लाउड डेटाबेसवर (Live) सेव्ह झाले!`);
      }
    } catch (err: any) {
      showNotification('error', 'क्लाउड सिंक अयशस्वी झाले.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Approve Pending User (Super Admin Action)
  const handleApproveUser = async (user: UserProfile) => {
    try {
      if (approveUser) {
        await approveUser(user.id);
      } else {
        updateUser(user.id, { status: 'ACTIVE' });
      }
      showNotification('success', `✅ "${user.name}" (${user.role}) यांचे खाते सुपर ॲडमिनद्वारे यशस्वीरित्या मंजूर व सक्रिय करण्यात आले! आता ते थेट लॉगिन करू शकतात.`);
    } catch (e: any) {
      showNotification('error', 'मंजुरी देताना त्रुटी आली.');
    }
  };

  // Reject / Delete Pending User
  const handleRejectPendingUser = async (user: UserProfile) => {
    if (window.confirm(`तुम्हाला खात्री आहे का की "${user.name}" यांची नोंदणी विनंती नाकारायची (Reject) आहे?`)) {
      try {
        if (rejectUser) {
          await rejectUser(user.id);
        } else {
          deleteUser(user.id);
        }
        showNotification('success', `❌ "${user.name}" यांची नोंदणी विनंती नाकारून हटवण्यात आली.`);
      } catch (e) {
        showNotification('error', 'विनंती हटवताना त्रुटी आली.');
      }
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('staff@123');
    setFormPhone('');
    setFormRole('REPORTER');
    setFormStatus('ACTIVE');
    setFormDesignation('जिल्हा विशेष प्रतिनिधी');
    setFormLocation('गडचिरोली (मुख्य ब्युरो)');
    setFormBio('');
    setFormAvatar(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
    setFormPermissions(ROLE_PERMISSIONS['REPORTER'] || []);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: UserProfile) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword(user.password || 'staff@123');
    setFormPhone(user.phone || '');
    setFormRole(user.role);
    setFormStatus(user.status || 'ACTIVE');
    setFormDesignation(user.designation || '');
    setFormLocation(user.location || 'गडचिरोली (मुख्य ब्युरो)');
    setFormBio(user.bio || '');
    setFormAvatar(user.avatar || PRESET_AVATARS[0]);
    // Load custom permissions or fall back to standard role permissions
    setFormPermissions(user.customPermissions || ROLE_PERMISSIONS[user.role] || []);
    setIsModalOpen(true);
  };

  // When Role changes in the form dropdown
  const handleRoleChange = (newRole: UserRole) => {
    setFormRole(newRole);
    // Auto populate permissions for the selected role
    setFormPermissions(ROLE_PERMISSIONS[newRole] || []);
  };

  // Toggle single permission checkbox
  const handleTogglePermission = (permKey: Permission) => {
    setFormPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  // Reset to Role Defaults
  const handleResetToRoleDefaults = () => {
    const defaults = ROLE_PERMISSIONS[formRole] || [];
    setFormPermissions(defaults);
    showNotification('success', `रोल "${formRole}" च्या मानक परवानग्या लोड केल्या.`);
  };

  // Grant All Permissions
  const handleGrantAll = () => {
    setFormPermissions(ALL_SYSTEM_PERMISSION_KEYS);
    showNotification('success', '⚡ सर्व परवानग्या निवडल्या गेल्या.');
  };

  // Clear All Permissions
  const handleClearAll = () => {
    setFormPermissions([]);
    showNotification('success', 'सर्व परवानग्या काढल्या गेल्या.');
  };

  // Save User (Create / Update)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showNotification('error', 'कृपया नाव आणि ईमेल प्रविष्ट करा.');
      return;
    }

    const assignedPassword = formPassword.trim() || 'staff@123';

    if (editingUserId) {
      updateUser(editingUserId, {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        password: assignedPassword,
        role: formRole,
        status: formStatus,
        designation: formDesignation.trim(),
        location: formLocation,
        bio: formBio.trim(),
        avatar: formAvatar,
        customPermissions: formPermissions,
      });
      showNotification('success', `वापरकर्ता "${formName}" ची माहिती, पासवर्ड व अधिकार यशस्वीरित्या अपडेट झाले!`);
    } else {
      addUser({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        password: assignedPassword,
        role: formRole,
        status: formStatus,
        designation: formDesignation.trim() || 'वार्ताहर',
        location: formLocation,
        bio: formBio.trim(),
        avatar: formAvatar,
        customPermissions: formPermissions,
      });

      // Also attempt to register in Firebase Auth for real cloud authentication
      try {
        await FirebaseAuthService.registerWithEmail(formEmail.trim(), assignedPassword, {
          name: formName.trim(),
          role: formRole,
          phone: formPhone.trim(),
          location: formLocation,
          status: formStatus,
          designation: formDesignation.trim(),
        });
      } catch (e) {
        console.log('Firebase background user registration note:', e);
      }

      showNotification('success', `नवीन बातमीदार "${formName}" (${formStatus}) पासवर्ड (${assignedPassword}) सह जोडला गेला!`);
    }

    setIsModalOpen(false);
  };

  // Toggle User Active / Suspended Status
  const handleToggleStatus = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      showNotification('error', 'तुम्ही स्वतःचे खाते निष्क्रिय करू शकत नाही.');
      return;
    }
    const newStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    updateUser(user.id, { status: newStatus });
    showNotification(
      'success',
      `"${user.name}" यांचे खाते आता ${newStatus === 'ACTIVE' ? 'सक्रिय (Active)' : 'स्थगित (Suspended)'} करण्यात आले.`
    );
  };

  // Delete User with confirmation
  const handleDeleteUser = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      showNotification('error', 'तुम्ही स्वतःचे खाते हटवू शकत नाही.');
      return;
    }
    if (window.confirm(`तुम्हाला खात्री आहे का की "${user.name}" यांचे खाते कायमचे हटवायचे आहे?`)) {
      deleteUser(user.id);
      showNotification('success', `"${user.name}" यांचे खाते हटवण्यात आले.`);
    }
  };

  // Calculate posts published by each user
  const getUserPostCount = (userName: string) => {
    return posts.filter(
      (p) => p.authorName?.toLowerCase() === userName.toLowerCase() && p.status === 'PUBLISHED'
    ).length;
  };

  // Pending Approval Users
  const pendingUsers = useMemo(() => {
    return allUsers.filter((u) => u.status === 'PENDING');
  }, [allUsers]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      // Role Filter
      if (roleFilter !== 'ALL' && user.role !== roleFilter) return false;

      // Status Filter
      if (statusFilter !== 'ALL' && (user.status || 'ACTIVE') !== statusFilter) return false;

      // Bureau Filter
      if (bureauFilter !== 'ALL' && user.location !== bureauFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = user.name.toLowerCase().includes(q);
        const matchEmail = user.email.toLowerCase().includes(q);
        const matchLocation = user.location?.toLowerCase().includes(q);
        const matchPhone = user.phone?.includes(q);
        return matchName || matchEmail || matchLocation || matchPhone;
      }

      return true;
    });
  }, [allUsers, roleFilter, statusFilter, bureauFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = allUsers.length;
    const active = allUsers.filter((u) => (u.status || 'ACTIVE') === 'ACTIVE').length;
    const pending = allUsers.filter((u) => u.status === 'PENDING').length;
    const reporters = allUsers.filter(
      (u) => u.role === 'REPORTER' || u.role === 'VIDEO_REPORTER' || u.role === 'PHOTOGRAPHER'
    ).length;
    const editors = allUsers.filter((u) => u.role === 'EDITOR' || u.role === 'SUB_EDITOR').length;
    const admins = allUsers.filter((u) => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').length;
    return { total, active, pending, reporters, editors, admins };
  }, [allUsers]);

  // STRICT SUPER ADMIN BARRIER: If current user is not Super Admin, lock this screen completely
  if (currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-3xl border border-red-200 shadow-xl text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto ring-8 ring-red-50/50">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <div>
          <span className="rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase px-3 py-1 border border-red-200">
            🔒 Super Admin Exclusive
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2">
            वापरकर्ते व अधिकार व्यवस्थापन प्रतिबंधित (Access Denied)
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            वापरकर्ते जोडणे, त्यांची पदे बदलणे (उदा. Reporter चा Editor करणे) आणि वैयक्तिक परवानग्या (Permissions) नियंत्रित करण्याचे अधिकार **फक्त मुख्य प्रशासकासाठीच (Super Admin)** राखीव आहेत.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setCmsView('dashboard')}
            className="rounded-xl bg-slate-900 hover:bg-black text-white px-5 py-2 text-xs font-bold shadow-md transition cursor-pointer"
          >
            मुख्य डॅशबोर्डवर जा
          </button>
          <button
            type="button"
            onClick={() => setCmsView('user_profile')}
            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            माझे प्रोफाइल पहा
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            वापरकर्ते व बातमीदार व्यवस्थापक (Users & Permissions Directory)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            InfoNewsUpdate24 च्या सर्व वार्ताहर, उपसंपादक, तालुका प्रतिनिधी व मुख्य संपादकांचे अधिकार व्यवस्थापन करा.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncAllToCloud}
            disabled={isSyncingCloud}
            className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-900 shadow-2xs transition disabled:opacity-50 cursor-pointer"
            title="सर्व वापरकर्ते Firebase क्लाउड डेटाबेसमध्ये अपलोड करा"
          >
            <RefreshCw className={`h-4 w-4 text-amber-700 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>{isSyncingCloud ? 'सिंक होत आहे...' : '⚡ Firebase Sync'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCmsView('user_profile')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4 text-slate-600" />
            <span>My Profile & RBAC</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>नवीन बातमीदार जोडा (Add New User)</span>
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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block uppercase">एकूण कर्मचारी</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{metrics.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 block uppercase">सक्रिय खाती (Active)</span>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{metrics.active}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs flex items-center justify-between transition ${
          metrics.pending > 0
            ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/30'
            : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className={`text-[11px] font-bold block uppercase ${
              metrics.pending > 0 ? 'text-amber-800' : 'text-slate-400'
            }`}>
              ⏳ मंजुरी प्रलंबित
            </span>
            <p className={`text-2xl font-black mt-0.5 ${
              metrics.pending > 0 ? 'text-amber-700 animate-pulse' : 'text-slate-700'
            }`}>
              {metrics.pending}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            metrics.pending > 0 ? 'bg-amber-200/80 text-amber-900' : 'bg-slate-100 text-slate-400'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-600 block uppercase">वार्ताहर / ब्युरो</span>
            <p className="text-2xl font-black text-blue-700 mt-0.5">{metrics.reporters}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Newspaper className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-600 block uppercase">संपादकीय मंडळ</span>
            <p className="text-2xl font-black text-purple-700 mt-0.5">{metrics.editors}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Edit className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* DEDICATED SUPER ADMIN APPROVAL DESK (When pending registrations exist) */}
      {pendingUsers.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/80 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>प्रलंबित नोंदणी विनंत्या (Pending Registrations Approval Desk)</span>
                  <span className="rounded-full bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 shadow-2xs">
                    {pendingUsers.length} नवीन विनंत्या
                  </span>
                </h2>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  नवीन नोंदणी केलेल्या वापरकर्त्यांना सुपर ॲडमिनच्या मंजुरीशिवाय (Super Admin Approval) पोर्टल अथवा CMS मध्ये लॉगिन करता येणार नाही.
                </p>
              </div>
            </div>
          </div>

          {/* Pending Users Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {pendingUsers.map((pUser) => (
              <div
                key={pUser.id}
                className="bg-white rounded-xl border border-amber-200 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={pUser.avatar || PRESET_AVATARS[0]}
                    alt={pUser.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{pUser.name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{pUser.email}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="rounded bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
                        {pUser.role}
                      </span>
                      {pUser.location && (
                        <span className="rounded bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-red-500" />
                          <span className="truncate max-w-[100px]">{pUser.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {pUser.phone && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
                    <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="font-mono">{pUser.phone}</span>
                  </div>
                )}

                {/* Approval Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleApproveUser(pUser)}
                    className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-1.5 px-2 text-xs font-bold shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>मंजूर करा (Approve)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(pUser)}
                    className="rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 p-1.5 text-xs font-bold transition cursor-pointer"
                    title="अधिकार व पद संपादित करा"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRejectPendingUser(pUser)}
                    className="rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 p-1.5 text-xs font-bold transition cursor-pointer"
                    title="नोंदणी नाकारा व हटवा"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Role Simulation Switcher Bar */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400 shrink-0" />
          <div>
            <p className="text-xs font-bold">
              सध्याचे सक्रिय लॉगिन:{' '}
              <span className="text-yellow-400 font-mono font-black">{currentUser.name}</span> ({currentUser.role})
            </p>
            <p className="text-[10px] text-slate-400">
              इतर बातमीदार किंवा संपादकांच्या अधिकारात जाऊन चाचणी घेण्यासाठी खालील बटणावर क्लिक करा:
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {allUsers.slice(0, 4).map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                switchUser(u.id);
                showNotification('success', `⚡ आता तुम्ही "${u.name}" (${u.role}) म्हणून कार्य करत आहात.`);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                currentUser.id === u.id
                  ? 'bg-yellow-400 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <img src={u.avatar} alt={u.name} className="w-3.5 h-3.5 rounded-full object-cover" />
              <span>{u.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search, Filter & Bureau Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="नाव, ईमेल, जिल्हा किंवा फोन नंबरने शोधा..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden focus:border-red-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 font-bold focus:border-red-500 focus:outline-none"
          >
            <option value="ALL">सर्व भूमिका (All Roles)</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="EDITOR">Chief Editor</option>
            <option value="SUB_EDITOR">Sub-Editor</option>
            <option value="REPORTER">Reporter / Bureau</option>
            <option value="VIDEO_REPORTER">Video Reporter</option>
            <option value="PHOTOGRAPHER">Photographer</option>
            <option value="USER">Public User</option>
          </select>

          {/* Bureau / District Filter */}
          <select
            value={bureauFilter}
            onChange={(e) => setBureauFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 font-bold focus:border-red-500 focus:outline-none"
          >
            <option value="ALL">सर्व ब्युरो / जिल्हे</option>
            {BUREAUS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 font-bold focus:border-red-500 focus:outline-none"
          >
            <option value="ALL">सर्व स्थिती (All Status)</option>
            <option value="PENDING">⏳ मंजुरी प्रलंबित (Pending Approval)</option>
            <option value="ACTIVE">सक्रिय (Active)</option>
            <option value="SUSPENDED">स्थगित (Suspended)</option>
            <option value="INACTIVE">निष्क्रिय (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-4">पत्रकार / वापरकर्ता</th>
                <th className="p-4">भूमिका (Role)</th>
                <th className="p-4">जिल्हा / ब्युरो</th>
                <th className="p-4">अधिकार (Permissions)</th>
                <th className="p-4 text-center">प्रसिद्ध बातम्या</th>
                <th className="p-4">स्थिती</th>
                <th className="p-4 text-right">कृती (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-30 text-slate-500" />
                    <p className="font-bold text-slate-700">कोणताही वापरकर्ता सापडला नाही.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  const postCount = getUserPostCount(user.name);
                  const isPending = user.status === 'PENDING';
                  const isActive = (user.status || 'ACTIVE') === 'ACTIVE';
                  const userPermCount = user.customPermissions
                    ? user.customPermissions.length
                    : (ROLE_PERMISSIONS[user.role] || []).length;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCurrent ? 'bg-red-50/30' : isPending ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className={`w-10 h-10 rounded-full object-cover border-2 shadow-2xs shrink-0 ${
                              isPending ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-200'
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                              {isCurrent && (
                                <span className="rounded bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2">
                                  YOU
                                </span>
                              )}
                              {isPending && (
                                <span className="rounded bg-amber-100 text-amber-900 text-[9px] font-black px-1.5 py-0.2 border border-amber-300">
                                  मंजुरी आवश्यक
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {user.designation || 'संपादकीय मंडळ'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Selector */}
                      <td className="p-4">
                        <select
                          value={user.role}
                          disabled={isCurrent}
                          onChange={(e) => {
                            const newRole = e.target.value as UserRole;
                            updateUser(user.id, {
                              role: newRole,
                              customPermissions: ROLE_PERMISSIONS[newRole] || [],
                            });
                            showNotification('success', `"${user.name}" यांची भूमिका बदलून "${newRole}" करण्यात आली.`);
                          }}
                          className={`text-[11px] font-bold rounded-lg border px-2 py-1 outline-none transition cursor-pointer disabled:cursor-not-allowed ${
                            user.role === 'SUPER_ADMIN'
                              ? 'bg-red-50 text-red-800 border-red-300'
                              : user.role === 'ADMIN'
                              ? 'bg-orange-50 text-orange-800 border-orange-300'
                              : user.role === 'EDITOR'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : user.role === 'SUB_EDITOR'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                              : user.role === 'REPORTER'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : user.role === 'VIDEO_REPORTER'
                              ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                              : user.role === 'PHOTOGRAPHER'
                              ? 'bg-teal-50 text-teal-800 border-teal-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="SUPER_ADMIN">👑 Super Admin</option>
                          <option value="ADMIN">🛡️ Admin</option>
                          <option value="EDITOR">✍️ Chief Editor</option>
                          <option value="SUB_EDITOR">📑 Sub-Editor</option>
                          <option value="REPORTER">🎤 Reporter</option>
                          <option value="VIDEO_REPORTER">📹 Video Reporter</option>
                          <option value="PHOTOGRAPHER">📷 Photographer</option>
                          <option value="USER">👤 Public User (No CMS)</option>
                        </select>
                      </td>

                      {/* Bureau / Location */}
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-slate-700 font-semibold">
                          <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          <span>{user.location || 'महाराष्ट्र'}</span>
                        </div>
                      </td>

                      {/* Active Permissions Count */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] border ${
                            userPermCount >= 15
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : userPermCount >= 8
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : userPermCount > 0
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{userPermCount} / {ALL_SYSTEM_PERMISSION_KEYS.length} अधिकार</span>
                        </span>
                      </td>

                      {/* Published Posts */}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs">
                          {postCount}
                        </span>
                      </td>

                      {/* Status Toggle / Badge */}
                      <td className="p-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <Clock className="w-2.5 h-2.5" />
                            <span>प्रलंबित (Pending)</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            disabled={isCurrent}
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition cursor-pointer disabled:cursor-not-allowed ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {isActive ? '● Active' : '✕ Suspended'}
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If Pending, Show Quick Approve Button */}
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleApproveUser(user)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer"
                              title="नोंदणी त्वरित मंजूर व सक्रिय करा"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>मंजूर करा</span>
                            </button>
                          )}

                          {/* Simulate Login (only if not pending) */}
                          {!isPending && (
                            <button
                              type="button"
                              onClick={() => {
                                switchUser(user.id);
                                showNotification('success', `⚡ "${user.name}" म्हणून स्विच झाले!`);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-yellow-50 hover:text-yellow-700 transition cursor-pointer"
                              title="या बातमीदाराच्या भूमिकेत लॉगिन करा (Simulate)"
                            >
                              <Zap className="h-4 w-4 text-amber-500" />
                            </button>
                          )}

                          {/* Edit & Configure Permissions */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                            title="माहिती व अधिकार संपादन करा"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            disabled={isCurrent}
                            onClick={() => (isPending ? handleRejectPendingUser(user) : handleDeleteUser(user))}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 transition disabled:opacity-30 cursor-pointer"
                            title={isPending ? 'नोंदणी नाकारा व हटवा' : 'खाते हटवा'}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal with Custom Permissions Matrix */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-red-600" />
                <h3 className="text-base font-black text-slate-900">
                  {editingUserId ? 'बातमीदार माहिती व अधिकार संपादन करा' : 'नवीन बातमीदार व अधिकार जोडा'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
              {/* SECTION A: PROFILE DETAILS */}
              <div className="space-y-4">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <User className="w-4 h-4 text-red-600" />
                  <span>वैयक्तिक माहिती व न्यूजरूम पद (Profile & Role)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      पूर्ण नाव (Full Name) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="उदा. राहुल देशमुख"
                      className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      ईमेल पत्ता (Email) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="rahul@infonewsupdate24.com"
                      className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      व्हॉट्सॲप / मोबाईल नंबर
                    </label>
                    <input
                      type="tel"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+91 98XXXXXXXX"
                      className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      लॉगिन पासवर्ड (Login Password) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="किमान ६ अक्षरे"
                        className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 pr-8 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      न्यूजरूम भूमिका (Role) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                      className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-bold focus:bg-white focus:border-red-500 outline-none"
                    >
                      <option value="REPORTER">🎤 वार्ताहर / तालुका प्रतिनिधी (Reporter)</option>
                      <option value="SUB_EDITOR">📑 उपसंपादक (Sub-Editor)</option>
                      <option value="EDITOR">✍️ मुख्य संपादक (Chief Editor)</option>
                      <option value="VIDEO_REPORTER">📹 व्हिडिओ पत्रकार (Video Journalist)</option>
                      <option value="PHOTOGRAPHER">📷 फोटो पत्रकार (Photojournalist)</option>
                      <option value="ADMIN">🛡️ प्रशासक (Admin)</option>
                      <option value="SUPER_ADMIN">👑 मुख्य प्रशासक (Super Admin)</option>
                      <option value="USER">👤 वाचक / सामान्य नागरिक (Public User - No CMS)</option>
                    </select>
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      मराठी पदनाम (Designation)
                    </label>
                    <input
                      type="text"
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                      placeholder="उदा. गडचिरोली जिल्हा विशेष प्रतिनिधी"
                      className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                    />
                  </div>

                  {/* Bureau Location */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      जिल्हा / ब्युरो कार्यालय (Bureau)
                    </label>
                    <select
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-900 font-bold focus:bg-white focus:border-red-500 outline-none"
                    >
                      {BUREAUS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
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
                        onClick={() => setFormAvatar(avUrl)}
                        className={`w-11 h-11 rounded-full object-cover cursor-pointer border-2 transition ${
                          formAvatar === avUrl
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
                    संक्षिप्त परिचय (Bio)
                  </label>
                  <textarea
                    rows={2}
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="पत्रकाराचा अनुभव व कार्यक्षेत्र..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-900 focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">खात्याची स्थिती (Status)</label>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="ACTIVE"
                        checked={formStatus === 'ACTIVE'}
                        onChange={() => setFormStatus('ACTIVE')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-emerald-700">सक्रिय (Active - थेट लॉगिन)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="PENDING"
                        checked={formStatus === 'PENDING'}
                        onChange={() => setFormStatus('PENDING')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-bold text-amber-700">⏳ प्रलंबित मंजुरी (Pending Approval)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="SUSPENDED"
                        checked={formStatus === 'SUSPENDED'}
                        onChange={() => setFormStatus('SUSPENDED')}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="font-bold text-red-700">स्थगित (Suspended - लॉगिन बंद)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION B: GRANULAR CUSTOM PERMISSIONS MATRIX */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-red-600" />
                      <span>🔐 वैयक्तिक परवानग्या व अधिकार (Custom Permissions Matrix)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      या विशिष्ट बातमीदाराला कोणते अधिकार द्यायचे ते निवडा ({formPermissions.length} / {ALL_SYSTEM_PERMISSION_KEYS.length} Granted).
                    </p>
                  </div>

                  {/* Helper Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleResetToRoleDefaults}
                      className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                      title="निवडलेल्या रोलच्या मानक परवानग्या लोड करा"
                    >
                      🔄 रोलनुसार भरा
                    </button>
                    <button
                      type="button"
                      onClick={handleGrantAll}
                      className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg transition"
                    >
                      ⚡ सर्व अधिकार
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-2.5 py-1 text-[10px] font-bold bg-red-50 text-red-800 hover:bg-red-100 rounded-lg transition"
                    >
                      ❌ सर्व काढा
                    </button>
                  </div>
                </div>

                {/* Categorized Permissions Grid */}
                <div className="space-y-4">
                  {PERMISSION_CATEGORIES.map((cat) => {
                    const catPermKeys = cat.permissions.map((p) => p.key);
                    const selectedInCat = catPermKeys.filter((k) => formPermissions.includes(k)).length;
                    const allInCatSelected = selectedInCat === catPermKeys.length;

                    return (
                      <div key={cat.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                        {/* Category Header */}
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <span className="font-black text-slate-900 text-xs">{cat.title}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (allInCatSelected) {
                                setFormPermissions((prev) => prev.filter((k) => !catPermKeys.includes(k)));
                              } else {
                                setFormPermissions((prev) => Array.from(new Set([...prev, ...catPermKeys])));
                              }
                            }}
                            className="text-[10px] font-bold text-red-600 hover:text-red-800"
                          >
                            {allInCatSelected ? 'सर्व अनटिक करा' : 'सर्व निवडा'} ({selectedInCat}/{catPermKeys.length})
                          </button>
                        </div>

                        {/* Permission Checkboxes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {cat.permissions.map((perm) => {
                            const isChecked = formPermissions.includes(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition cursor-pointer select-none ${
                                  isChecked
                                    ? 'bg-white border-red-300 text-slate-900 shadow-2xs'
                                    : 'bg-white/60 border-slate-200 text-slate-500 opacity-80 hover:opacity-100'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.key)}
                                  className="mt-0.5 w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className={`font-bold block leading-snug ${isChecked ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {perm.label}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                                    {perm.description}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between sticky bottom-0 bg-white py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 px-6 py-2.5 font-black text-white shadow-md cursor-pointer transition"
                >
                  <Check className="h-4 w-4" />
                  <span>{editingUserId ? 'माहिती व अधिकार सेव्ह करा' : 'बातमीदार नोंदणी करा'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
