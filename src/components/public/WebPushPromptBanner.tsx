import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Check,
  ChevronRight,
  Flame,
  Radio,
  Volume2,
  X,
} from 'lucide-react';
import {
  WebPushNotificationService,
  DEFAULT_WEB_PUSH_SETTINGS,
} from '../../services/WebPushNotificationService';
import { WebPushNotification } from '../../types';

export const WebPushPromptBanner: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [activeBreakingAlert, setActiveBreakingAlert] = useState<WebPushNotification | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (WebPushNotificationService.isSupported()) {
      setPermission(Notification.permission);

      // Auto-prompt after 4 seconds if default and not dismissed
      const dismissed = sessionStorage.getItem('infonews_push_prompt_dismissed');
      if (Notification.permission === 'default' && !dismissed) {
        const timer = setTimeout(() => {
          setIsPromptOpen(true);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }

    // Listen to custom global breaking push alerts
    const handleBreakingAlert = (e: any) => {
      if (e.detail) {
        setActiveBreakingAlert(e.detail);
      }
    };

    window.addEventListener('infonews:breaking-push-alert', handleBreakingAlert);
    return () => window.removeEventListener('infonews:breaking-push-alert', handleBreakingAlert);
  }, []);

  const handleSubscribe = async () => {
    const granted = await WebPushNotificationService.requestPermission();
    if (granted) {
      setPermission('granted');
      setIsPromptOpen(false);
      setToastMsg('✅ ब्रेकिंग न्यूज नोटिफिकेशन्स सुरू झाले!');
      setTimeout(() => setToastMsg(''), 4000);
    } else {
      setIsPromptOpen(false);
    }
  };

  const handleDismiss = () => {
    setIsPromptOpen(false);
    sessionStorage.setItem('infonews_push_prompt_dismissed', 'true');
  };

  return (
    <>
      {/* 1. IN-APP BREAKING NEWS SLIDE-DOWN TOAST BANNER */}
      {activeBreakingAlert && (
        <div className="fixed top-4 inset-x-4 z-50 mx-auto max-w-xl animate-slideDown shadow-2xl">
          <div className="rounded-2xl border-2 border-red-500 bg-slate-900 text-white p-4 shadow-red-950/50 backdrop-blur-md flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white font-black animate-pulse shadow-md">
                <Flame className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    🔴 ब्रेकिंग न्यूज अलर्ट
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">आत्ताच</span>
                </div>
                <h4 className="text-sm font-black text-white leading-snug">
                  {activeBreakingAlert.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {activeBreakingAlert.body}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveBreakingAlert(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. POLITE SLIDE-UP SUBSCRIPTION PROMPT MODAL / CARD */}
      {isPromptOpen && permission === 'default' && (
        <div className="fixed bottom-6 inset-x-4 sm:left-auto sm:right-6 z-50 max-w-md animate-slideUp">
          <div className="rounded-2xl border border-red-500/50 bg-slate-900/98 p-5 text-white shadow-2xl backdrop-blur-md space-y-3.5 ring-1 ring-red-500/30">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white font-bold shadow-lg shadow-red-900/50">
                  <BellRing className="h-6 w-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    {DEFAULT_WEB_PUSH_SETTINGS.promptTitleMarathi}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {DEFAULT_WEB_PUSH_SETTINGS.promptSubtitleMarathi}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                नंतर आठवण करा
              </button>
              <button
                type="button"
                onClick={handleSubscribe}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 px-4 py-2 text-xs font-black text-white shadow-lg shadow-red-900/40 transition-all cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                <span>चालू करा (Allow Alerts)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. FLOATING RED NOTIFICATION BELL ICON (Quick Subscribe / Status) */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          type="button"
          onClick={() => {
            if (permission === 'granted') {
              setToastMsg('🔔 तुम्ही ब्रेकिंग न्यूज नोटिफिकेशन्ससाठी आधीच नोंदणीकृत आहात!');
              setTimeout(() => setToastMsg(''), 3000);
            } else {
              handleSubscribe();
            }
          }}
          className={`group flex items-center gap-2 rounded-full p-3 shadow-xl transition-all active:scale-95 cursor-pointer ${
            permission === 'granted'
              ? 'bg-slate-900 border border-slate-700 text-emerald-400 hover:border-emerald-500'
              : 'bg-red-600 text-white hover:bg-red-700 shadow-red-900/50 animate-pulse'
          }`}
          title={
            permission === 'granted'
              ? 'ब्रेकिंग नोटिफिकेशन्स सक्रिय आहेत'
              : 'ब्रेकिंग नोटिफिकेशन्स सुरू करा'
          }
        >
          {permission === 'granted' ? (
            <Bell className="h-5 w-5 text-emerald-400" />
          ) : (
            <BellRing className="h-5 w-5 text-white" />
          )}
          <span className="hidden group-hover:inline text-xs font-bold px-1 text-white">
            {permission === 'granted' ? 'अलर्ट सुरू आहेत' : 'ब्रेकिंग अलर्ट मिळवा'}
          </span>
        </button>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-slideUp">
          <Check className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  );
};
