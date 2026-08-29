import {
  Activity,
  BarChart3,
  Bell,
  Building,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  CloudSun,
  CreditCard,
  FileText,
  Flame,
  FolderTree,
  Globe,
  Headphones,
  IdCard,
  Image,
  Landmark,
  LayoutDashboard,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  Newspaper,
  Palette,
  PanelTop,
  Percent,
  PlusCircle,
  Puzzle,
  Radio,
  Receipt,
  Search,
  Send,
  Settings,
  Share2,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sun,
  Tag,
  Trophy,
  UserCheck,
  Users,
  Vote,
  Wheat,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { CmsView, useApp } from '../../context/AppContext';
import { useAuth, usePermissions } from '../../context/AuthContext';
import { Permission, UserRole } from '../../types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  view?: CmsView;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  minRoles?: UserRole[];
  badge?: number | string;
  badgeColor?: string;
  children?: {
    id: string;
    label: string;
    view: CmsView;
    icon?: React.ComponentType<{ className?: string }>;
    permission?: Permission;
    minRoles?: UserRole[];
  }[];
}

interface NavSection {
  id: string;
  title: string;
  minRoles?: UserRole[];
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { hasPermission, role } = usePermissions();
  const { currentUser } = useAuth();
  const { cmsView, setCmsView, setSelectedPostId, notifications, comments } = useApp();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    posts: true,
    users: false,
    appearance: false,
  });

  const toggleSection = (key: string) => {
    if (isCollapsed) return;
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const pendingCommentsCount = comments.filter((c) => c.status === 'PENDING').length || 0;
  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length || 0;

  // Strict Role-Based Categorized Navigation Definition
  const navSections: NavSection[] = useMemo(() => {
    return [
      // 1. Overview
      {
        id: 'overview',
        title: 'डॅशबोर्ड',
        items: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            view: 'dashboard',
            icon: LayoutDashboard,
          },
        ],
      },

      // 2. Editorial & Newsroom (बातमी व संपादकीय)
      {
        id: 'editorial',
        title: 'बातमी व संपादकीय',
        items: [
          {
            id: 'posts',
            label: 'Posts',
            icon: Newspaper,
            permission: 'post.create',
            children: [
              { id: 'posts_all', label: 'All Posts (सर्व बातम्या)', view: 'posts_all', icon: FileText },
              { id: 'posts_new', label: 'Add New (नवीन बातमी)', view: 'posts_new', icon: PlusCircle, permission: 'post.create' },
              { id: 'posts_import', label: 'WP / URL Importer', view: 'importer', icon: Globe, permission: 'post.create', minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
            ],
          },
          {
            id: 'live_blog',
            label: '🔴 लाईव्ह ब्लॉग (Live Blog)',
            view: 'live_blog',
            icon: Radio,
            badge: 'Live',
            badgeColor: 'bg-red-600 text-white animate-pulse',
            permission: 'post.create',
          },
          {
            id: 'web_stories',
            label: 'वेब स्टोरीज (Web Stories)',
            view: 'web_stories',
            icon: Sparkles,
            badge: 'Google',
            badgeColor: 'bg-gradient-to-r from-red-600 to-amber-600 text-white',
            permission: 'post.create',
          },
          {
            id: 'citizen_news',
            label: 'वाचक पत्रकार (Citizen News)',
            view: 'citizen_news',
            icon: Users,
            badge: 'Tips',
            badgeColor: 'bg-red-600 text-white',
            permission: 'post.review',
            minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'],
          },
          {
            id: 'comments',
            label: 'Comments (प्रतिक्रिया)',
            view: 'comments',
            icon: MessageSquare,
            permission: 'comments.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'],
            badge: pendingCommentsCount > 0 ? pendingCommentsCount : undefined,
            badgeColor: 'bg-red-600',
          },
        ],
      },

      // 3. Media & Content Assets (मीडिया व सामग्री)
      {
        id: 'media_section',
        title: 'मीडिया व सामग्री',
        items: [
          {
            id: 'media',
            label: 'Media Library (फोटो/व्हिडिओ)',
            view: 'media',
            icon: Image,
            permission: 'media.upload',
          },
          {
            id: 'social_media',
            label: 'सोशल मीडिया व रील्स',
            view: 'social_media',
            icon: Share2,
            badge: 'Reels',
            badgeColor: 'bg-gradient-to-r from-pink-600 to-purple-600 text-white',
            permission: 'media.upload',
          },
          {
            id: 'epaper',
            label: 'डिजिटल ई-पेपर (E-Paper)',
            view: 'epaper',
            icon: Newspaper,
            badge: 'PDF',
            badgeColor: 'bg-red-600 text-white',
            minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'],
          },
          {
            id: 'ai_voice',
            label: 'AI Voice Anchors',
            view: 'ai_voice',
            icon: Headphones,
            badge: '12 Voices',
            badgeColor: 'bg-blue-600 text-white',
            minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'],
          },
        ],
      },

      // 4. Local Services (स्थानिक व जनसेवा)
      {
        id: 'local_services',
        title: 'स्थानिक व जनसेवा',
        items: [
          {
            id: 'govt_schemes',
            label: 'शासकीय योजना व GR',
            view: 'govt_schemes',
            icon: Landmark,
            badge: 'GRs',
            badgeColor: 'bg-blue-600 text-white',
          },
          {
            id: 'cricket_mandi',
            label: 'कृषी बाजारभाव (APMC Mandi)',
            view: 'cricket_mandi',
            icon: Wheat,
            badge: 'APMC',
            badgeColor: 'bg-amber-600 text-white',
          },
          {
            id: 'weather',
            label: 'थेट हवामान (Live Weather)',
            view: 'weather',
            icon: CloudSun,
            badge: 'IMD',
            badgeColor: 'bg-sky-600 text-white',
          },
          {
            id: 'panchang',
            label: 'दैनिक पंचांग व राशीभविष्य',
            view: 'panchang',
            icon: Sun,
            badge: 'Auto',
            badgeColor: 'bg-amber-600 text-white',
          },
          {
            id: 'gadchiroli_spotlight',
            label: '🚩 गडचिरोली १२ तालुके',
            view: 'gadchiroli_spotlight',
            icon: Flame,
            badge: 'Spotlight',
            badgeColor: 'bg-red-600 text-white',
          },
          {
            id: 'polls',
            label: 'जनमत चाचणी (Polls)',
            view: 'polls',
            icon: Vote,
            badge: 'Live',
            badgeColor: 'bg-emerald-600 text-white',
          },
        ],
      },

      // 5. Distribution & Alerts (प्रसारण व अलर्ट्स) - Editor & Admin only
      {
        id: 'distribution',
        title: 'प्रसारण व अलर्ट्स',
        minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'],
        items: [
          {
            id: 'whatsapp_hub',
            label: 'व्हॉट्सॲप कम्युनिटी (Hub)',
            view: 'whatsapp_hub',
            icon: MessageCircle,
            badge: '50K+',
            badgeColor: 'bg-emerald-600 text-white',
            minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
          },
          {
            id: 'whatsapp_bulletin',
            label: 'दैनिक बातमीपत्र (Daily Digest)',
            view: 'whatsapp_bulletin',
            icon: Send,
            badge: '1-Click',
            badgeColor: 'bg-emerald-600 text-white',
            minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
          },
          {
            id: 'web_push',
            label: 'पुश नोटिफिकेशन्स (Web Push)',
            view: 'web_push',
            icon: Bell,
            badge: 'Alerts',
            badgeColor: 'bg-red-600 text-white',
            minRoles: ['SUPER_ADMIN', 'ADMIN'],
          },
          {
            id: 'newsletter',
            label: 'वृत्तपत्र न्यूजलेटर (Email)',
            view: 'newsletter',
            icon: Mail,
            badge: 'Auto',
            badgeColor: 'bg-amber-600 text-white',
            minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
          },
          {
            id: 'pwa',
            label: 'मोबाईल ॲप (PWA App)',
            view: 'pwa',
            icon: Smartphone,
            badge: 'App',
            badgeColor: 'bg-red-600 text-white',
            minRoles: ['SUPER_ADMIN', 'ADMIN'],
          },
        ],
      },

      // 6. Monetization & Billing (कमाई व बिलिंग) - Super Admin & Admin only
      {
        id: 'monetization',
        title: 'कमाई व बिलिंग',
        minRoles: ['SUPER_ADMIN', 'ADMIN'],
        items: [
          {
            id: 'advertisements',
            label: 'Google AdSense & जाहिराती',
            view: 'advertisements',
            icon: Percent,
            permission: 'advertisement.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN'],
          },
          {
            id: 'merchant_ads',
            label: 'व्यापारी जाहिराती (UPI Bookings)',
            view: 'merchant_ads',
            icon: CreditCard,
            badge: 'UPI',
            badgeColor: 'bg-amber-600 text-white',
            permission: 'advertisement.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN'],
          },
          {
            id: 'billing',
            label: 'बिल बुक व इनव्हॉइस (Bill Book)',
            view: 'billing',
            icon: Receipt,
            badge: '₹ GST',
            badgeColor: 'bg-emerald-600 text-white',
            permission: 'advertisement.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN'],
          },
        ],
      },

      // 7. Administration & Design (प्रशासन व डिझाइन) - Admin & Editor with permissions
      {
        id: 'administration',
        title: 'प्रशासन व डिझाइन',
        minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'],
        items: [
          {
            id: 'homepage_layout',
            label: 'होमपेज लेआउट (Drag & Drop)',
            view: 'homepage_layout',
            icon: LayoutDashboard,
            badge: 'Builder',
            badgeColor: 'bg-indigo-600 text-white',
            permission: 'appearance.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
          },
          {
            id: 'pages',
            label: 'Pages (स्थिर पाने)',
            view: 'pages',
            icon: FileText,
            permission: 'page.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
          },
          {
            id: 'categories',
            label: 'Categories (वर्गवारी)',
            view: 'categories',
            icon: FolderTree,
            permission: 'category.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
          },
          {
            id: 'tags',
            label: 'Tags (SEO टॅग्ज)',
            view: 'tags',
            icon: Tag,
            permission: 'tag.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
          },
          {
            id: 'users',
            label: 'Users & बातमीदार डिरेक्टरी',
            view: 'users',
            icon: Users,
            permission: 'user.manage',
            minRoles: ['SUPER_ADMIN'],
          },
          {
            id: 'litespeed_cache',
            label: 'LiteSpeed Cache (LSCache)',
            view: 'litespeed_cache',
            icon: Zap,
            badge: '6.1',
            badgeColor: 'bg-emerald-600 text-white',
            permission: 'settings.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN'],
          },
          {
            id: 'google_search_console',
            label: 'Search Console & Sitemaps',
            view: 'google_search_console',
            icon: Globe,
            badge: 'GSC',
            badgeColor: 'bg-emerald-600 text-white',
            permission: 'settings.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN'],
          },
          {
            id: 'seo',
            label: 'Rank Math SEO Suite',
            view: 'seo',
            icon: Search,
            permission: 'seo.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
          },
          {
            id: 'settings',
            label: 'Global Settings (सेटिंग्ज)',
            view: 'settings',
            icon: Settings,
            permission: 'settings.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN'],
          },
          {
            id: 'security',
            label: 'सायबर सुरक्षा व ऑडिट लॉग',
            view: 'security',
            icon: ShieldAlert,
            badge: '98%',
            badgeColor: 'bg-emerald-600 text-white',
            permission: 'settings.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN'],
          },
          {
            id: 'press_cards',
            label: 'डिजिटल पत्रकार ओळखपत्र (Press Card)',
            view: 'press_cards',
            icon: IdCard,
            badge: 'QR Card',
            badgeColor: 'bg-red-600 text-white',
            permission: 'user.manage',
            minRoles: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SUB_EDITOR'],
          },
        ],
      },
    ];
  }, [hasPermission, role, pendingCommentsCount, unreadNotifsCount]);

  // Filter sections and items strictly based on current user role & permissions
  const visibleSections = useMemo(() => {
    const userRole = currentUser?.role || 'REPORTER';

    return navSections
      .filter((sec) => {
        // Section role check
        if (sec.minRoles && !sec.minRoles.includes(userRole)) return false;
        return true;
      })
      .map((sec) => {
        const filteredItems = sec.items.filter((item) => {
          // Role check
          if (item.minRoles && !item.minRoles.includes(userRole)) return false;
          // Permission check
          if (item.permission && !hasPermission(item.permission)) return false;
          return true;
        });

        return {
          ...sec,
          items: filteredItems,
        };
      })
      .filter((sec) => sec.items.length > 0);
  }, [navSections, currentUser?.role, hasPermission]);

  const handleItemClick = (item: NavItem) => {
    if (item.children && item.children.length > 0) {
      toggleSection(item.id);
      if (!isCollapsed && item.children[0]?.view) {
        if (item.children[0].view === 'posts_new') setSelectedPostId(null);
        setCmsView(item.children[0].view);
      }
    } else if (item.view) {
      if (item.view === 'posts_new') setSelectedPostId(null);
      setCmsView(item.view);
      if (onCloseMobile) onCloseMobile();
    }
  };

  const handleSubItemClick = (view: CmsView) => {
    if (view === 'posts_new') setSelectedPostId(null);
    setCmsView(view);
    if (onCloseMobile) onCloseMobile();
  };

  const isCurrentView = (item: NavItem): boolean => {
    if (item.view && cmsView === item.view) return true;
    if (item.children && item.children.some((c) => c.view === cmsView)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="cms-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#1e293b] text-slate-200 transition-all duration-300 ease-in-out border-r border-slate-800 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } shadow-none`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-slate-800/80 bg-[#16202e]">
          <div
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
            onClick={() => setCmsView('dashboard')}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white font-extrabold shadow-md">
              <span className="text-base tracking-tight font-black">24</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black tracking-tight text-white uppercase flex items-center gap-1">
                  <span className="text-white">info</span>
                  <span className="text-red-500 font-extrabold">News</span>
                </span>
                <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase -mt-0.5">
                  UPDATE24 CMS
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Current User Role Pill */}
        {!isCollapsed && (
          <div className="px-3 py-2 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-bold text-slate-200 truncate">{currentUser?.name}</span>
            </div>
            <span className="rounded bg-slate-800 px-2 py-0.5 font-bold text-[10px] text-yellow-400 border border-slate-700">
              {currentUser?.role}
            </span>
          </div>
        )}

        {/* Navigation List Organized by Sections */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
          {visibleSections.map((section, sIdx) => (
            <div key={section.id} className="space-y-1">
              {/* Section Header */}
              {!isCollapsed ? (
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    {section.title}
                  </span>
                </div>
              ) : (
                sIdx > 0 && <hr className="border-slate-800 my-2" />
              )}

              {/* Section Items */}
              {section.items.map((item) => {
                const active = isCurrentView(item);
                const isExpanded = expandedSections[item.id] || active;
                const hasKids = item.children && item.children.length > 0;
                const Icon = item.icon;

                return (
                  <div key={item.id} className="relative group">
                    <button
                      id={`nav-item-${item.id}`}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                        active
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            active ? 'text-white' : 'text-slate-400 group-hover:text-red-400'
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate text-left">{item.label}</span>
                        )}
                      </div>

                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 ml-2">
                          {item.badge !== undefined && (
                            <span
                              className={`rounded-full px-1.5 py-0.2 text-[9px] font-black text-white ${
                                item.badgeColor || 'bg-red-600'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          {hasKids && (
                            <ChevronDown
                              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-white' : ''
                              }`}
                            />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Submenu Children */}
                    {!isCollapsed && hasKids && isExpanded && (
                      <div className="mt-1 ml-4 pl-3 border-l border-slate-700/70 space-y-0.5 animate-in fade-in duration-150">
                        {item.children
                          ?.filter((child) => {
                            if (child.minRoles && !child.minRoles.includes(currentUser?.role || 'REPORTER')) return false;
                            if (child.permission && !hasPermission(child.permission)) return false;
                            return true;
                          })
                          .map((child) => {
                            const childActive = cmsView === child.view;
                            const SubIcon = child.icon;
                            return (
                              <button
                                key={child.id}
                                id={`subnav-${child.id}`}
                                type="button"
                                onClick={() => handleSubItemClick(child.view)}
                                className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                                  childActive
                                    ? 'bg-slate-800 text-red-400 font-bold'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                }`}
                              >
                                {SubIcon && (
                                  <SubIcon
                                    className={`h-3.5 w-3.5 shrink-0 ${
                                      childActive ? 'text-red-400' : 'text-slate-400 group-hover:text-slate-300'
                                    }`}
                                  />
                                )}
                                <span className="truncate">{child.label}</span>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Collapse Trigger */}
        <div className="shrink-0 border-t border-slate-800/80 p-2 bg-[#16202e]">
          <button
            id="btn-collapse-sidebar"
            type="button"
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
