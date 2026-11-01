"use client";
import {useEffect,useState} from 'react';
import {Globe2,RotateCcw} from 'lucide-react';
import {dictionaries,languages,type Locale} from '@/lib/i18n';
import {arrivalText} from '@/lib/arrival-i18n';
import type {ArrivalPhase} from '@/lib/arrival';
export default function ArrivalScreen({locale,hall,phase,onLanguage}:{locale:Locale;hall:number;phase:ArrivalPhase;onLanguage:()=>void}){
 const[slow,setSlow]=useState(false),t=arrivalText(locale),base=dictionaries[locale],step=phase==='opening'?0:phase==='assets'?1:2;
 useEffect(()=>{if(phase==='ready'||phase==='error')return;const timer=setTimeout(()=>setSlow(true),12000);return()=>clearTimeout(timer);},[phase]);
 const failed=phase==='error',ready=phase==='ready';
 return <section className={`meta-arrival${ready?' is-ready':''}${failed?' has-error':''}`} aria-label="metatemple" aria-hidden={ready} inert={ready} translate="no">
  <img className="meta-arrival-image" src={`/temple/previews/hall-${hall}.jpg`} alt="" fetchPriority="high" decoding="async"/>
  <div className="meta-arrival-shade"/>
  <header><span className="meta-arrival-wordmark">metatemple<span aria-hidden="true"> · </span></span><button type="button" onClick={onLanguage} aria-haspopup="dialog"><Globe2 size={16}/><span>{languages.find(l=>l[0]===locale)?.[1]}</span><span className="meta-arrival-language-caption">{base.language}</span></button></header>
  <div className="meta-arrival-center">
   <svg className="meta-arrival-mark" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="32" cy="32" r="30" opacity=".24"/><path d="M12 28c8-1 15-6 20-13 5 7 12 12 20 13M17 32h30M22 33v17m20-17v17M17 50h30M28 50V39h8v11M26 23h12"/></svg>
   <h1>metatemple</h1><p className="meta-arrival-tagline">{t.tagline}</p><div className="meta-arrival-divider" aria-hidden="true"/><p className="meta-arrival-invitation">{t.invitation}</p>
  </div>
  <footer><div className="meta-arrival-status" role={failed?'alert':'status'} aria-live="polite" aria-atomic="true"><p>{failed?t.error:t[phase==='opening'?'opening':phase==='assets'?'assets':'rendering']}</p><span className="meta-arrival-track" aria-hidden="true">{[0,1,2].map(n=><i key={n} className={n<=step?'is-reached':''}/>)}</span></div>
   <div className="meta-arrival-help">{(slow||failed)&&<><p>{failed?t.errorHint:t.slow}</p><button type="button" onClick={()=>location.reload()}><RotateCcw size={14}/>{t.retry}</button></>}</div>
  </footer>
 </section>;
}
