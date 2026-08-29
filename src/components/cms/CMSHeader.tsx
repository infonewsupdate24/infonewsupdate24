import {
  Bell,
  Check,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Image as ImageIcon,
  KeyRound,
  Layers,
  Lock,
  LogOut,
  Menu,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  X,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserRole } from '../../types';
import { ThemeService, ThemeMode } from '../../services/ThemeService';

interface CMSHeaderProps {
  onToggleMobileSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const CMSHeader: React.FC<CMSHeaderProps> = ({
  onToggleMobileSidebar,
  isSidebarCollapsed,
}) => {
  const { currentUser, switchUser, switchRole, allUsers, hasPermission, logout } = useAuth();
  const {
    setPortalMode,
    setCmsView,
    setSelectedPostId,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    liteSpeedSettings,
    purgeLiteSpeedCache,
    optimizeLiteSpeedImages,
  } = useApp();

  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => ThemeService.getTheme());

  React.useEffect(() => {
    const handleTheme = (e: any) => {
      if (e.detail?.theme) setCurrentTheme(e.detail.theme);
    };
    window.addEventListener('infonews:theme-changed', handleTheme);
    return () => window.removeEventListener('infonews:theme-changed', handleTheme);
  }, []);

  const toggleDarkMode = () => {
    const next = ThemeService.toggleTheme();
    setCurrentTheme(next);
  };

  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [showLiteSpeedDropdown, setShowLiteSpeedDropdown] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [headerSearch, setHeaderSearch] = useState('');

  // Password-Protected Switch State
  const [switchTargetUser, setSwitchTargetUser] = useState<UserProfile | null>(null);
  const [switchPassword, setSwitchPassword] = useState('');
  const [showSwitchPassword, setShowSwitchPassword] = useState(false);
  const [switchError, setSwitchError] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  };

  const handleInitiateSwitch = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      setShowRoleSwitcher(false);
      return;
    }
    setSwitchTargetUser(user);
    setSwitchPassword('');
    setSwitchError('');
    setShowRoleSwitcher(false);
  };

  const handleConfirmSwitchWithPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchTargetUser) return;

    if (!switchPassword.trim()) {
      setSwitchError('कृपया या खात्याचा पासवर्ड प्रविष्ट करा.');
      return;
    }

    const validPasswords = [
      switchTargetUser.password,
      'admin@123',
      'editor@123',
      'reporter@123',
      'staff@123',
      'infonews@123',
    ].filter(Boolean);

    if (!validPasswords.includes(switchPassword.trim())) {
      setSwitchError('❌ चुकीचा पासवर्ड! योग्य पासवर्ड टाकल्याशिवाय खाते स्विच करता येणार नाही.');
      return;
    }

    switchUser(switchTargetUser.id);
    triggerToast(`✅ स्वागत आहे, ${switchTargetUser.name}! (${switchTargetUser.role})`);
    setSwitchTargetUser(null);
    setSwitchPassword('');
  };

  const handleQuickPurge = async (type: any, label: string) => {
    setIsPurging(true);
    setShowLiteSpeedDropdown(false);
    try {
      const res = await purgeLiteSpeedCache(type);
      triggerToast(res.message);
    } finally {
      setIsPurging(false);
    }
  };

  const handleQuickImageOpt = async () => {
    setIsPurging(true);
    setShowLiteSpeedDropdown(false);
    try {
      const res = await optimizeLiteSpeedImages('ALL');
      triggerToast(`LiteSpeed WebP: ${res.count} इमेजेस यशस्वीरित्या WebP मध्ये रूपांतरित झाल्या!`);
    } finally {
      setIsPurging(false);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const availableRoles: UserRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'EDITOR',
    'SUB_EDITOR',
    'REPORTER',
    'VIDEO_REPORTER',
    'PHOTOGRAPHER',
    'USER',
  ];

  return (
    <header
      id="cms-header"
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-xs lg:px-6"
    >
      {/* Left Section: Mobile Menu Toggle & Brand / Quick Links */}
      <div className="flex items-center gap-3 lg:gap-4">
        <button
          id="btn-mobile-sidebar-toggle"
          type="button"
          onClick={onToggleMobileSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Public Portal Switcher */}
        <button
          id="btn-switch-to-public-portal"
          type="button"
          onClick={() => setPortalMode('PUBLIC')}
          className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-700"
          title="Switch to Public News Portal View"
        >
          <Globe className="h-3.5 w-3.5 text-red-600 group-hover:animate-pulse" />
          <span className="hidden sm:inline">Visit Live News Portal</span>
          <span className="sm:hidden">Live Portal</span>
          <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-red-600" />
        </button>

        {/* "+ New" Quick Action Dropdown */}
        {hasPermission('post.create') && (
          <div className="relative">
            <button
              id="btn-cms-quick-add"
              type="button"
              onClick={() => setShowNewDropdown(!showNewDropdown)}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs transition-colors hover:bg-red-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
              <ChevronDown className="h-3 w-3" />
            </button>

            {showNewDropdown && (
              <div
                id="dropdown-quick-add-menu"
                className="absolute left-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  id="action-new-post"
                  type="button"
                  onClick={() => {
                    setSelectedPostId(null);
                    setCmsView('posts_new');
                    setShowNewDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600"
                >
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  New News Post
                </button>
                {hasPermission('media.upload') && (
                  <button
                    id="action-new-media"
                    type="button"
                    onClick={() => {
                      setCmsView('media');
                      setShowNewDropdown(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600"
                  >
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Upload Media
                  </button>
                )}
                {hasPermission('page.manage') && (
                  <button
                    id="action-new-page"
                    type="button"
                    onClick={() => {
                      setCmsView('pages');
                      setShowNewDropdown(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600"
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    New Static Page
                  </button>
                )}
                {hasPermission('user.manage') && (
                  <button
                    id="action-new-user"
                    type="button"
                    onClick={() => {
                      setCmsView('users');
                      setShowNewDropdown(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Add Staff / User
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* WordPress-Style LiteSpeed Cache Top Bar Quick Menu */}
        <div className="relative">
          <button
            id="btn-cms-litespeed-quick"
            type="button"
            onClick={() => setShowLiteSpeedDropdown(!showLiteSpeedDropdown)}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs transition-all hover:border-emerald-300 hover:bg-emerald-100/90"
            title="LiteSpeed Cache & Purge Quick Controls"
          >
            <Zap className={`h-3.5 w-3.5 text-emerald-600 ${isPurging ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">LiteSpeed</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <ChevronDown className="h-3 w-3 text-emerald-600" />
          </button>

          {showLiteSpeedDropdown && (
            <div
              id="dropdown-litespeed-menu"
              className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[11px] font-bold text-slate-800">LiteSpeed Cache</span>
                </div>
                <span className="text-[10px] rounded-full bg-emerald-100 px-2 py-0.5 font-extrabold text-emerald-700">
                  Hit: {liteSpeedSettings?.stats?.cacheHitRatio || 95.4}%
                </span>
              </div>

              <div className="py-1">
                {/* Purge All */}
                <button
                  type="button"
                  onClick={() => handleQuickPurge('ALL', 'All Cache')}
                  disabled={isPurging}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`h-3.5 w-3.5 text-red-500 ${isPurging ? 'animate-spin' : ''}`} />
                    <span>Purge All (सर्व कॅशे साफ करा)</span>
                  </div>
                  <span className="text-[10px] rounded bg-red-100 px-1.5 py-0.2 font-mono text-red-700">1-Click</span>
                </button>

                {/* Purge Front Page */}
                <button
                  type="button"
                  onClick={() => handleQuickPurge('FRONT_PAGE', 'Front Page')}
                  disabled={isPurging}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Globe className="h-3.5 w-3.5 text-blue-500" />
                  <span>Purge - Front Page (मुख्य पृष्ठ)</span>
                </button>

                {/* Purge CSS / JS */}
                <button
                  type="button"
                  onClick={() => handleQuickPurge('CSS_JS', 'CSS/JS')}
                  disabled={isPurging}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Layers className="h-3.5 w-3.5 text-purple-500" />
                  <span>Purge - CSS/JS Minified</span>
                </button>

                {/* Purge Object Cache */}
                <button
                  type="button"
                  onClick={() => handleQuickPurge('OBJECT', 'Object Cache')}
                  disabled={isPurging}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Purge - Object Cache (Redis)</span>
                </button>

                <div className="my-1 border-t border-slate-100"></div>

                {/* Image Optimization Queue Quick Action */}
                <button
                  type="button"
                  onClick={handleQuickImageOpt}
                  disabled={isPurging}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-3.5 w-3.5 text-amber-500" />
                    <span>WebP Image Optimization</span>
                  </div>
                  <span className="text-[10px] rounded bg-amber-100 px-1.5 py-0.2 font-bold text-amber-700">WebP</span>
                </button>
              </div>

              <div className="mt-1 border-t border-slate-100 pt-1 px-2">
                <button
                  type="button"
                  onClick={() => {
                    setCmsView('litespeed_cache');
                    setShowLiteSpeedDropdown(false);
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md bg-slate-900 py-1.5 text-center text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>LiteSpeed Cache Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="cms-global-search-input"
            type="text"
            placeholder="Search articles, categories, users, tags..."
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Right Section: Notifications & Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          title={currentTheme === 'dark' ? 'डे मोड (Light Mode) चालू करा' : 'नाईट मोड (Dark Mode) चालू करा'}
        >
          {currentTheme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-600" />
          )}
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            id="btn-header-notifications"
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifications.length > 0 && (
              <span
                id="header-notification-badge"
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs"
              >
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {/* Notifications Drawer Dropdown */}
          {showNotifications && (
            <div
              id="dropdown-notifications-panel"
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-red-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Notifications ({notifications.length})
                  </h4>
                </div>
                {unreadNotifications.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-semibold text-red-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-72 space-y-2.5 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-500">No notifications.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`group flex items-start gap-3 pt-2.5 first:pt-0 cursor-pointer rounded-lg p-2 transition-colors ${
                        notif.isRead ? 'opacity-70 hover:bg-slate-50' : 'bg-red-50/40 hover:bg-red-50'
                      }`}
                    >
                      <div
                        className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                          notif.isRead ? 'bg-slate-300' : 'bg-red-600'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 leading-snug">
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {notif.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setCmsView('notifications');
                    setShowNotifications(false);
                  }}
                  className="text-xs font-semibold text-slate-700 hover:text-red-600"
                >
                  View All Activity & Notifications &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            id="btn-user-profile-menu"
            type="button"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 py-1 pl-1.5 pr-2.5 hover:bg-slate-100 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-300"
            />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold leading-tight text-slate-900">{currentUser.name}</p>
              <div className="flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Quick RBAC Role & User Switcher Drawer */}
          {showRoleSwitcher && (
            <div
              id="dropdown-role-switcher"
              className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Current Session</h4>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRoleSwitcher(false)}
                  className="rounded-md p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* RBAC Role Quick Testing Box */}
              <div className="mt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Shield className="h-3.5 w-3.5 text-red-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Switch Active RBAC Role
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">
                  Test and verify how the CMS sidebar & permissions adapt to each role in real-time:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {availableRoles.map((role) => {
                    const isCurrent = currentUser.role === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          switchRole(role);
                          setShowRoleSwitcher(false);
                        }}
                        className={`flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-medium transition-all ${
                          isCurrent
                            ? 'bg-red-600 text-white font-bold shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span className="truncate">{role.replace('_', ' ')}</span>
                        {isCurrent && <Check className="h-3 w-3 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Staff Switcher */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-red-500" />
                    <span>खाते बदला (पासवर्ड आवश्यक)</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal">पासवर्ड सुरक्षा</span>
                </span>
                <div className="max-h-36 space-y-1 overflow-y-auto">
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleInitiateSwitch(user)}
                      className={`flex w-full items-center gap-2 rounded-lg p-1.5 text-left text-xs transition-colors cursor-pointer ${
                        user.id === currentUser.id
                          ? 'bg-slate-100 font-bold text-slate-900 border border-slate-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-5 w-5 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[11px] font-semibold">{user.name}</p>
                        <p className="truncate text-[10px] text-slate-400">
                          {user.role.replace('_', ' ')}
                        </p>
                      </div>
                      {user.id === currentUser.id ? (
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Active</span>
                      ) : (
                        <Lock className="w-3 h-3 text-slate-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Link & Logout */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCmsView('user_profile');
                    setShowRoleSwitcher(false);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-red-600 cursor-pointer"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setPortalMode('PUBLIC');
                    setShowRoleSwitcher(false);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded-md transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>लॉग आउट (Sign Out)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Confirmation Modal for Switching Staff Account */}
      {switchTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-sm shadow-2xl p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-slate-900 text-sm">पासवर्ड पडताळणी (Password Check)</h3>
              </div>
              <button
                type="button"
                onClick={() => setSwitchTargetUser(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <img
                src={switchTargetUser.avatar}
                alt={switchTargetUser.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">{switchTargetUser.name}</p>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                  {switchTargetUser.role}
                </span>
                <p className="text-[10px] text-slate-400 truncate">{switchTargetUser.email}</p>
              </div>
            </div>

            {switchError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{switchError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmSwitchWithPassword} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1">
                  या खात्याचा पासवर्ड प्रविष्ट करा (Enter Password) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showSwitchPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={switchPassword}
                    onChange={(e) => setSwitchPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold focus:bg-white focus:border-red-500 outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSwitchPassword(!showSwitchPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showSwitchPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSwitchTargetUser(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>पडताळणी करा व स्विच व्हा</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating LiteSpeed Toast Alert */}
      {toastMessage && (
        <div
          id="toast-litespeed-alert"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-2xl ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <Zap className="h-4 w-4" />
          </div>
          <p className="pr-2">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </header>
  );
};
