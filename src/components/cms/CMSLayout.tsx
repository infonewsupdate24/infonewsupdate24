import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CMSHeader } from './CMSHeader';
import { DashboardView } from './DashboardView';
import { Sidebar } from './Sidebar';

interface CMSLayoutProps {
  children?: React.ReactNode;
}

export const CMSLayout: React.FC<CMSLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { cmsView, setCmsView, selectedPostId } = useApp();
  const { currentUser } = useAuth();

  return (
    <div id="cms-shell-root" className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased flex">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        {/* 2.1 CMS Top Header Bar */}
        <div className="no-print">
          <CMSHeader
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        </div>

        {/* 2.2 Breadcrumb / Status Alert Bar */}
        <div className="no-print bg-white border-b border-slate-200/80 px-4 py-2 text-xs flex items-center justify-between text-slate-500">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="font-semibold text-slate-800">InfoNewsUpdate24 CMS</span>
            <span>/</span>
            <span className="capitalize text-slate-600 font-medium">
              {cmsView.replace(/_/g, ' ')}
            </span>
            {selectedPostId && <span className="text-slate-400">({selectedPostId})</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-semibold text-slate-600">
              Logged in as <strong className="text-slate-800">{currentUser.name}</strong> (
              {currentUser.role.replace('_', ' ')})
            </span>
          </div>
        </div>

        {/* 2.3 Main Content Area */}
        <main
          id="cms-main-content-area"
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
        >
          {children || <DashboardView />}
        </main>

        {/* 2.4 Footer */}
        <footer className="no-print border-t border-slate-200 bg-white px-6 py-3 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} InfoNewsUpdate24 CMS. All rights reserved.</span>
          <span className="text-[11px] text-slate-400">
            WordPress-Style Custom News Architecture &bull; RBAC v2.4
          </span>
        </footer>
      </div>
    </div>
  );
};
