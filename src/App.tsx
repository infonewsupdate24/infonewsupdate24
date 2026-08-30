/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { PublicPortalView } from './components/public/PublicPortalView';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// ⚡ Dynamic Lazy Imports for CMS Admin Modules (Dramatically reduces initial JS payload for public readers)
const CMSLayout = lazy(() =>
  import('./components/cms/CMSLayout').then((m) => ({ default: m.CMSLayout }))
);
const DashboardView = lazy(() =>
  import('./components/cms/DashboardView').then((m) => ({ default: m.DashboardView }))
);
const PostsListView = lazy(() =>
  import('./components/cms/PostsListView').then((m) => ({ default: m.PostsListView }))
);
const PostEditorView = lazy(() =>
  import('./components/cms/PostEditorView').then((m) => ({ default: m.PostEditorView }))
);
const CategoryManagerView = lazy(() =>
  import('./components/cms/CategoryManagerView').then((m) => ({ default: m.CategoryManagerView }))
);
const TagManagerView = lazy(() =>
  import('./components/cms/TagManagerView').then((m) => ({ default: m.TagManagerView }))
);
const MediaLibraryView = lazy(() =>
  import('./components/cms/MediaLibraryView').then((m) => ({ default: m.MediaLibraryView }))
);
const PageManagerView = lazy(() =>
  import('./components/cms/PageManagerView').then((m) => ({ default: m.PageManagerView }))
);
const SocialMediaManagerView = lazy(() =>
  import('./components/cms/SocialMediaManagerView').then((m) => ({ default: m.SocialMediaManagerView }))
);
const UsersManagerView = lazy(() =>
  import('./components/cms/UsersManagerView').then((m) => ({ default: m.UsersManagerView }))
);
const UserProfileView = lazy(() =>
  import('./components/cms/UserProfileView').then((m) => ({ default: m.UserProfileView }))
);
const BreakingTickerManagerView = lazy(() =>
  import('./components/cms/BreakingTickerManagerView').then((m) => ({ default: m.BreakingTickerManagerView }))
);
const LivePollsManagerView = lazy(() =>
  import('./components/cms/LivePollsManagerView').then((m) => ({ default: m.LivePollsManagerView }))
);
const LiveCricketAndMandiManagerView = lazy(() =>
  import('./components/cms/LiveCricketAndMandiManagerView').then((m) => ({ default: m.LiveCricketAndMandiManagerView }))
);
const AIVoiceSettingsView = lazy(() =>
  import('./components/cms/AIVoiceSettingsView').then((m) => ({ default: m.AIVoiceSettingsView }))
);
const AdvertisementManagerView = lazy(() =>
  import('./components/cms/AdvertisementManagerView').then((m) => ({ default: m.AdvertisementManagerView }))
);
const MerchantAdBookingManagerView = lazy(() =>
  import('./components/cms/MerchantAdBookingManagerView').then((m) => ({ default: m.MerchantAdBookingManagerView }))
);
const EPaperManagerView = lazy(() =>
  import('./components/cms/EPaperManagerView').then((m) => ({ default: m.EPaperManagerView }))
);
const WebPushManagerView = lazy(() =>
  import('./components/cms/WebPushManagerView').then((m) => ({ default: m.WebPushManagerView }))
);
const PWAManagerView = lazy(() =>
  import('./components/cms/PWAManagerView').then((m) => ({ default: m.PWAManagerView }))
);
const WhatsAppChannelManagerView = lazy(() =>
  import('./components/cms/WhatsAppChannelManagerView').then((m) => ({ default: m.WhatsAppChannelManagerView }))
);
const WhatsAppBulletinManagerView = lazy(() =>
  import('./components/cms/WhatsAppBulletinManagerView').then((m) => ({ default: m.WhatsAppBulletinManagerView }))
);
const WebStoriesManagerView = lazy(() =>
  import('./components/cms/WebStoriesManagerView').then((m) => ({ default: m.WebStoriesManagerView }))
);
const LiveWeatherManagerView = lazy(() =>
  import('./components/cms/LiveWeatherManagerView').then((m) => ({ default: m.LiveWeatherManagerView }))
);
const CitizenNewsDeskManagerView = lazy(() =>
  import('./components/cms/CitizenNewsDeskManagerView').then((m) => ({ default: m.CitizenNewsDeskManagerView }))
);
const GovtSchemesManagerView = lazy(() =>
  import('./components/cms/GovtSchemesManagerView').then((m) => ({ default: m.GovtSchemesManagerView }))
);
const PanchangManagerView = lazy(() =>
  import('./components/cms/PanchangManagerView').then((m) => ({ default: m.PanchangManagerView }))
);
const GadchiroliSpotlightManagerView = lazy(() =>
  import('./components/cms/GadchiroliSpotlightManagerView').then((m) => ({ default: m.GadchiroliSpotlightManagerView }))
);
const LiveBlogManagerView = lazy(() =>
  import('./components/cms/LiveBlogManagerView').then((m) => ({ default: m.LiveBlogManagerView }))
);
const NewsletterManagerView = lazy(() =>
  import('./components/cms/NewsletterManagerView').then((m) => ({ default: m.NewsletterManagerView }))
);
const HomepageLayoutBuilderView = lazy(() =>
  import('./components/cms/HomepageLayoutBuilderView').then((m) => ({ default: m.HomepageLayoutBuilderView }))
);
const GoogleSearchConsoleSettingsView = lazy(() =>
  import('./components/cms/GoogleSearchConsoleSettingsView').then((m) => ({ default: m.GoogleSearchConsoleSettingsView }))
);
const RankMathSEOSuiteView = lazy(() =>
  import('./components/cms/RankMathSEOSuiteView').then((m) => ({ default: m.RankMathSEOSuiteView }))
);
const LiteSpeedCacheView = lazy(() =>
  import('./components/cms/LiteSpeedCacheView').then((m) => ({ default: m.LiteSpeedCacheView }))
);
const WordPressAndUrlImporterView = lazy(() =>
  import('./components/cms/WordPressAndUrlImporterView').then((m) => ({ default: m.WordPressAndUrlImporterView }))
);
const BillingManagerView = lazy(() =>
  import('./components/cms/BillingManagerView').then((m) => ({ default: m.BillingManagerView }))
);
const GlobalSettingsManagerView = lazy(() =>
  import('./components/cms/GlobalSettingsManagerView').then((m) => ({ default: m.GlobalSettingsManagerView }))
);
const SecurityCenterView = lazy(() =>
  import('./components/cms/SecurityCenterView').then((m) => ({ default: m.SecurityCenterView }))
);
const PressCardManagerView = lazy(() =>
  import('./components/cms/PressCardManagerView').then((m) => ({ default: m.PressCardManagerView }))
);
const GenericModuleView = lazy(() =>
  import('./components/cms/GenericModuleView').then((m) => ({ default: m.GenericModuleView }))
);

const MainRouter: React.FC = () => {
  const { portalMode, cmsView } = useApp();
  const { currentUser, isLoggedIn } = useAuth();

  // Strict Security Gate:
  // CMS Dashboard requires an authenticated session with staff role (SUPER_ADMIN, ADMIN, EDITOR, SUB_EDITOR, REPORTER, etc.)
  // Unauthenticated visitors, guests, and regular readers ('USER') are NEVER allowed into the CMS Dashboard
  const isStaffAuthenticated =
    isLoggedIn &&
    currentUser &&
    currentUser.role !== 'USER' &&
    (currentUser.status || 'ACTIVE') === 'ACTIVE';

  if (portalMode === 'PUBLIC' || !isStaffAuthenticated) {
    return <PublicPortalView />;
  }

  // If in CMS Dashboard Mode
  const renderCmsContent = () => {
    switch (cmsView) {
      case 'dashboard':
        return <DashboardView />;
      case 'posts_all':
        return <PostsListView />;
      case 'posts_new':
      case 'posts_edit':
        return <PostEditorView />;
      case 'categories':
        return <CategoryManagerView />;
      case 'tags':
        return <TagManagerView />;
      case 'media':
        return <MediaLibraryView />;
      case 'pages':
        return <PageManagerView />;
      case 'social_media':
        return <SocialMediaManagerView />;
      case 'users':
        return <UsersManagerView />;
      case 'user_profile':
        return <UserProfileView />;
      case 'breaking_ticker':
        return <BreakingTickerManagerView />;
      case 'polls':
        return <LivePollsManagerView />;
      case 'cricket_mandi':
        return <LiveCricketAndMandiManagerView />;
      case 'ai_voice':
        return <AIVoiceSettingsView />;
      case 'advertisements':
        return <AdvertisementManagerView />;
      case 'merchant_ads':
        return <MerchantAdBookingManagerView />;
      case 'epaper':
        return <EPaperManagerView />;
      case 'web_push':
        return <WebPushManagerView />;
      case 'pwa':
        return <PWAManagerView />;
      case 'whatsapp_hub':
        return <WhatsAppChannelManagerView />;
      case 'whatsapp_bulletin':
        return <WhatsAppBulletinManagerView />;
      case 'web_stories':
        return <WebStoriesManagerView />;
      case 'weather':
        return <LiveWeatherManagerView />;
      case 'citizen_news':
        return <CitizenNewsDeskManagerView />;
      case 'govt_schemes':
        return <GovtSchemesManagerView />;
      case 'panchang':
        return <PanchangManagerView />;
      case 'gadchiroli_spotlight':
        return <GadchiroliSpotlightManagerView />;
      case 'live_blog':
        return <LiveBlogManagerView />;
      case 'newsletter':
        return <NewsletterManagerView />;
      case 'homepage_layout':
        return <HomepageLayoutBuilderView />;
      case 'google_search_console':
        return <GoogleSearchConsoleSettingsView />;
      case 'seo':
        return <RankMathSEOSuiteView />;
      case 'litespeed_cache':
        return <LiteSpeedCacheView />;
      case 'importer':
        return <WordPressAndUrlImporterView />;
      case 'billing':
        return <BillingManagerView />;
      case 'settings':
        return <GlobalSettingsManagerView />;
      case 'security':
        return <SecurityCenterView />;
      case 'press_cards':
        return <PressCardManagerView />;
      default:
        return <GenericModuleView view={cmsView} />;
    }
  };

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-3">
          <div className="h-10 w-10 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400">सुरक्षित ॲडमिन पॅनेल लोड होत आहे...</p>
        </div>
      }
    >
      <CMSLayout>{renderCmsContent()}</CMSLayout>
    </Suspense>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AppErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AppErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          for (const r of regs) r.unregister();
        });
      }
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) caches.delete(name);
        });
      }
    } catch {}
    window.location.replace('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-center shadow-xl space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <span className="text-2xl">📰</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">InfoNewsUpdate24</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              पेज लोड होताना तात्पुरती अडचण आली आहे. खालील बटण दाबून कॅश पूर्ण साफ करून ताज्या बातम्या उघडा.
            </p>
            {this.state.error && (
              <div className="text-left bg-slate-100 p-3 rounded-xl text-[11px] text-red-700 font-mono overflow-auto max-h-32 border border-slate-200">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              🔄 कॅश साफ करून ताज्या बातम्या उघडा (Clean Cache & Open Portal)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <MainRouter />
        </AppProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
