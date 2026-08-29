/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AIVoiceSettingsView } from './components/cms/AIVoiceSettingsView';
import { CategoryManagerView } from './components/cms/CategoryManagerView';
import { TagManagerView } from './components/cms/TagManagerView';
import { CMSLayout } from './components/cms/CMSLayout';
import { DashboardView } from './components/cms/DashboardView';
import { GenericModuleView } from './components/cms/GenericModuleView';
import { MediaLibraryView } from './components/cms/MediaLibraryView';
import { PageManagerView } from './components/cms/PageManagerView';
import { PostEditorView } from './components/cms/PostEditorView';
import { PostsListView } from './components/cms/PostsListView';
import { SocialMediaManagerView } from './components/cms/SocialMediaManagerView';
import { UserProfileView } from './components/cms/UserProfileView';
import { UsersManagerView } from './components/cms/UsersManagerView';
import { BreakingTickerManagerView } from './components/cms/BreakingTickerManagerView';
import { LiveCricketAndMandiManagerView } from './components/cms/LiveCricketAndMandiManagerView';
import { AdvertisementManagerView } from './components/cms/AdvertisementManagerView';
import { MerchantAdBookingManagerView } from './components/cms/MerchantAdBookingManagerView';
import { EPaperManagerView } from './components/cms/EPaperManagerView';
import { WebPushManagerView } from './components/cms/WebPushManagerView';
import { PWAManagerView } from './components/cms/PWAManagerView';
import { WhatsAppChannelManagerView } from './components/cms/WhatsAppChannelManagerView';
import { WhatsAppBulletinManagerView } from './components/cms/WhatsAppBulletinManagerView';
import { LivePollsManagerView } from './components/cms/LivePollsManagerView';
import { WebStoriesManagerView } from './components/cms/WebStoriesManagerView';
import { LiveWeatherManagerView } from './components/cms/LiveWeatherManagerView';
import { CitizenNewsDeskManagerView } from './components/cms/CitizenNewsDeskManagerView';
import { GovtSchemesManagerView } from './components/cms/GovtSchemesManagerView';
import { PanchangManagerView } from './components/cms/PanchangManagerView';
import { GadchiroliSpotlightManagerView } from './components/cms/GadchiroliSpotlightManagerView';
import { LiveBlogManagerView } from './components/cms/LiveBlogManagerView';
import { NewsletterManagerView } from './components/cms/NewsletterManagerView';
import { HomepageLayoutBuilderView } from './components/cms/HomepageLayoutBuilderView';
import { GoogleSearchConsoleSettingsView } from './components/cms/GoogleSearchConsoleSettingsView';
import { RankMathSEOSuiteView } from './components/cms/RankMathSEOSuiteView';
import { LiteSpeedCacheView } from './components/cms/LiteSpeedCacheView';
import { WordPressAndUrlImporterView } from './components/cms/WordPressAndUrlImporterView';
import { BillingManagerView } from './components/cms/BillingManagerView';
import { GlobalSettingsManagerView } from './components/cms/GlobalSettingsManagerView';
import { SecurityCenterView } from './components/cms/SecurityCenterView';
import { PressCardManagerView } from './components/cms/PressCardManagerView';
import { PublicPortalView } from './components/public/PublicPortalView';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

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

  return <CMSLayout>{renderCmsContent()}</CMSLayout>;
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainRouter />
      </AppProvider>
    </AuthProvider>
  );
}
