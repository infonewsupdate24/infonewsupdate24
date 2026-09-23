import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase';
import { getCardAdmin, listCardAdmins, saveCardAdmin } from '../../services/PressCardService';
import { PressCardManagerContent } from './PressCardManagerView';

export function IndependentPressCardAdmin() {
  const [admin,setAdmin] = useState<Awaited<ReturnType<typeof getCardAdmin>>|null>(null);
  const [loading,setLoading] = useState(true),[error,setError] = useState(''),[email,setEmail] = useState(''),[password,setPassword] = useState('');
  const [admins,setAdmins] = useState<Awaited<ReturnType<typeof listCardAdmins>>>([]);
  const [newAdmin,setNewAdmin] = useState({uid:'',name:'',role:'ISSUER' as const,active:true});
  useEffect(() => {
    let generation = 0;
    const unsubscribe = onAuthStateChanged(auth, async user => {
      const current = ++generation; setAdmin(null); setLoading(true); setError('');
      try { if (user) { const value = await getCardAdmin(); if (current === generation) setAdmin(value); } }
      catch(e) { if (current === generation) setError(e instanceof Error ? e.message : 'Login पडताळता आले नाही.'); }
      finally { if (current === generation) setLoading(false); }
    });
    return () => { ++generation; unsubscribe(); };
  },[]);
  const run = async (fn:()=>Promise<unknown>) => { setLoading(true);setError('');try{await fn();}catch(e){setError(e instanceof Error ? e.message : 'क्रिया पूर्ण झाली नाही.');}finally{setLoading(false);} };
  return <main className="min-h-screen bg-slate-100 p-4 sm:p-8"><div className="max-w-6xl mx-auto space-y-6">
    <header className="rounded-xl bg-slate-950 p-5 text-white flex flex-wrap gap-4 justify-between"><a href="/" className="font-bold">INFO NEWS UPDATE 24 — ID Card Admin</a>{auth.currentUser && <button onClick={()=>void run(()=>signOut(auth))}>Logout</button>}</header>
    <p className="text-sm text-slate-600">कार्ड व्यवस्थापनासाठी स्वतंत्र अधिकृत प्रवेश. येथे दिलेली परवानगी बातम्यांच्या CMS परवानगीपेक्षा वेगळी आहे.</p>
    {error && <p role="alert" className="p-4 bg-amber-100 rounded-xl">{error}</p>}
    {!admin && <section className="mx-auto max-w-md bg-white rounded-xl p-6 space-y-4">
      <h1 className="text-xl font-bold">अधिकृत Admin login</h1>
      <form className="space-y-4" onSubmit={e=>{e.preventDefault();void run(()=>signInWithEmailAndPassword(auth,email,password));}}>
        <label className="block">Email<input className="block w-full border rounded p-3" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
        <label className="block">Password<input className="block w-full border rounded p-3" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>
        <button disabled={loading} className="bg-slate-900 text-white rounded px-5 py-3 disabled:opacity-50">Login</button>
      </form>
      <button disabled={loading} className="border rounded px-5 py-3" onClick={()=>void run(()=>signInWithPopup(auth,googleProvider))}>Google ने login करा</button>
      {loading && <p role="status">प्रवेश तपासत आहोत…</p>}
    </section>}
    {admin && <><p className="text-sm">Login: {admin.name} ({admin.role})</p><PressCardManagerContent admin={true}/>
      {admin.role === 'OWNER' && <section className="bg-white rounded-xl p-5 space-y-4"><h2 className="font-bold">कार्ड Admin परवानग्या</h2>
        <p className="text-sm">फक्त विश्वासार्ह कर्मचाऱ्याचा Firebase User UID वापरा. परवानगी बंद केल्यावर त्या खात्याच्या पुढील कार्ड क्रिया थांबतात.</p>
        <button disabled={loading} className="underline" onClick={()=>void run(async()=>setAdmins(await listCardAdmins()))}>Admin यादी उघडा</button>
        {admins.map(a=><div key={a.uid} className="flex gap-3 border-t py-3"><span className="flex-1">{a.name} — {a.role} — {a.active ? 'ACTIVE' : 'DISABLED'}</span>{a.role !== 'OWNER' && <button disabled={loading} className="underline" onClick={()=>void run(async()=>{await saveCardAdmin({...a,active:!a.active});setAdmins(await listCardAdmins());})}>{a.active ? 'प्रवेश बंद करा' : 'प्रवेश सुरू करा'}</button>}</div>)}
        <form className="flex flex-wrap gap-3" onSubmit={e=>{e.preventDefault();void run(async()=>{await saveCardAdmin(newAdmin);setAdmins(await listCardAdmins());setNewAdmin({uid:'',name:'',role:'ISSUER',active:true});});}}><input aria-label="Firebase User UID" placeholder="Firebase User UID" required maxLength={128} value={newAdmin.uid} onChange={e=>setNewAdmin({...newAdmin,uid:e.target.value})} className="border rounded p-3"/><input aria-label="Admin नाव" placeholder="Admin नाव" required maxLength={150} value={newAdmin.name} onChange={e=>setNewAdmin({...newAdmin,name:e.target.value})} className="border rounded p-3"/><button disabled={loading} className="bg-slate-900 text-white rounded p-3">कार्ड व्यवस्थापन प्रवेश द्या</button></form>
      </section>}
    </>}
  </div></main>;
}
