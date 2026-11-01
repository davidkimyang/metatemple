"use client";
import {useEffect,useRef,useState} from 'react';
import {Pencil,X} from 'lucide-react';
import {dictionaries,type Locale} from '@/lib/i18n';
import {profileText} from '@/lib/profile-i18n';
import {cleanNickname,NICKNAME_LIMIT} from '@/public/temple/profile-name.js';
declare global {interface Window{metatempleProfile?:{getName:()=>string;automaticName:()=>string;canSave:()=>boolean;setName:(name:string)=>Promise<{ok:boolean}>};}}
export default function ProfileControls({locale}:{locale:Locale}){
 const t=profileText(locale),dialog=useRef<HTMLDialogElement>(null),input=useRef<HTMLInputElement>(null),busy=useRef(false),composing=useRef(false);
 const[open,setOpen]=useState(false),[name,setName]=useState(''),[automatic,setAutomatic]=useState(''),[connected,setConnected]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const status=()=>setConnected(window.metatempleProfile?.canSave()??false);const show=()=>{document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(d=>d.close());setName(window.metatempleProfile?.getName()||'');setAutomatic(window.metatempleProfile?.automaticName()||'');setError('');status();setOpen(true);};window.addEventListener('metatemple:edit-name',show);window.addEventListener('metatemple:profile-status',status);return()=>{window.removeEventListener('metatemple:edit-name',show);window.removeEventListener('metatemple:profile-status',status);};},[]);
 useEffect(()=>{if(open){dialog.current?.showModal();window.dispatchEvent(new Event('metatemple:typing'));input.current?.focus();input.current?.select();}else if(dialog.current?.open)dialog.current.close();},[open]);
 async function save(value=name){if(busy.current||composing.current||!connected)return;const normalized=cleanNickname(value);if(normalized===null){setError(t.invalid);return;}busy.current=true;setSaving(true);setError('');try{const r=await window.metatempleProfile?.setName(normalized);if(r?.ok)setOpen(false);else setError(t.error);}catch{setError(t.error);}finally{busy.current=false;setSaving(false);}}
 return <dialog ref={dialog} className="meta-profile-dialog" translate="no" aria-labelledby="meta-profile-title" onCancel={e=>{if(saving)e.preventDefault();else setOpen(false);}} onClick={e=>{if(e.target===e.currentTarget&&!saving)setOpen(false);}}>
  <header><h2 id="meta-profile-title"><Pencil size={18}/>{t.edit}</h2><button type="button" disabled={saving} aria-label={dictionaries[locale].close} onClick={()=>setOpen(false)}><X size={20}/></button></header>
  <form onSubmit={e=>{e.preventDefault();void save();}} onKeyDown={e=>{e.stopPropagation();if(e.key==='Enter'&&(e.nativeEvent.isComposing||composing.current))e.preventDefault();}}>
   <label htmlFor="meta-nickname">{t.nickname}</label><input id="meta-nickname" ref={input} value={name} maxLength={NICKNAME_LIMIT*2} placeholder={automatic} autoComplete="nickname" dir="auto" onChange={e=>{setName(e.target.value);setError('');}} onCompositionStart={()=>{composing.current=true;}} onCompositionEnd={()=>{composing.current=false;}} aria-describedby="meta-profile-hint" aria-invalid={Array.from(name).length>NICKNAME_LIMIT}/>
   <div className="meta-profile-counter">{Array.from(name).length}/{NICKNAME_LIMIT}</div><p id="meta-profile-hint">{t.hint}</p><p className="meta-profile-status" role="status">{error||(!connected?t.waiting:'')}</p>
   <footer><button type="button" className="meta-profile-reset" disabled={saving||!connected} onClick={()=>void save('')}>{t.reset}</button><button type="submit" className="meta-profile-save" disabled={saving||!connected||cleanNickname(name)===null}>{t.save}</button></footer>
  </form>
 </dialog>;
}
