import { useEffect, useState } from 'react';
import { refreshPublishedHomepage } from '../services/PublishedHomepage';

export function HomepageSyncNotice() {
  const [pending,setPending] = useState(false);
  const [retrying,setRetrying] = useState(false);
  useEffect(() => {
    const listener = (event:Event) => setPending(!(event as CustomEvent<boolean>).detail);
    window.addEventListener('infonews:homepage-sync-status',listener);
    return () => window.removeEventListener('infonews:homepage-sync-status',listener);
  },[]);
  if (!pending) return null;
  return <div role="status" className="fixed bottom-4 left-4 right-4 z-[100] rounded-xl border border-amber-400 bg-amber-50 p-4 text-sm text-amber-950 shadow-lg">
    बदल सुरक्षित जतन झाले आहेत. सार्वजनिक होमपेज अपडेट होणे बाकी आहे.
    <button className="ml-3 rounded bg-amber-900 px-3 py-2 text-white disabled:opacity-50" disabled={retrying} onClick={async()=>{
      setRetrying(true);
      await refreshPublishedHomepage();
      setRetrying(false);
    }}>{retrying ? 'अपडेट करत आहे…' : 'होमपेज अपडेट पुन्हा करा'}</button>
  </div>;
}
