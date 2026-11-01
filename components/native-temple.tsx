"use client";
import {useEffect,useReducer,useRef,useState} from 'react';
import {X,Check,Search} from 'lucide-react';
import {dictionaries,languages,localizedName,validLocale,type Locale} from '@/lib/i18n';
import {translateReference} from '@/lib/reference-locale';
import SpeechControls from './speech-controls';
import ProfileControls from './profile-controls';
import OfferingControls from './offering-controls';
import {offeringText} from '@/lib/offering-i18n';
import {profileText} from '@/lib/profile-i18n';
import {hallName,hallDescription} from '@/lib/hall-i18n';
import {speechText} from '@/lib/speech-i18n';
import {createReferenceDomWriter} from '@/lib/reference-dom';
import ArrivalScreen from './arrival-screen';
import {nextArrivalPhase,arrivalHall} from '@/lib/arrival';
declare global {interface Window{metatempleConfig?:{profileText:(key:string)=>string;hallName:(number:number)=>string;speechText:(key:string)=>string;name:(id:string)=>string;translate:(value:string)=>string;setText:(target:Node,value:unknown)=>unknown;setAttribute:(target:Element,name:string,value:unknown)=>void};__metatempleDispose?:()=>void;__metatempleScene?:()=>unknown;}}
export default function NativeTemple({initialLocale='en',initialRoom='maru'}:{initialLocale?:Locale;initialRoom?:string}){
 const root=useRef<HTMLDivElement>(null),localeRef=useRef<Locale>(initialLocale),dialog=useRef<HTMLDialogElement>(null),translateAll=useRef(()=>{});
 const[locale,setLocale]=useState<Locale>(initialLocale),[open,setOpen]=useState(false),[query,setQuery]=useState('');const t=dictionaries[locale];
 const[loadPhase,dispatchLoad]=useReducer(nextArrivalPhase,'opening'),[bootVisible,setBootVisible]=useState(true),[hall,setHall]=useState(arrivalHall(initialRoom));const ready=loadPhase==='ready';
 useEffect(()=>{if(!ready){setBootVisible(true);return;}const timer=setTimeout(()=>setBootVisible(false),450);return()=>clearTimeout(timer);},[ready]);
 useEffect(()=>{
  const loading=(event:Event)=>dispatchLoad((event as CustomEvent).detail);window.addEventListener('metatemple:load',loading);
  const param=new URL(location.href).searchParams.get('lang');let saved:string|null=null;try{saved=localStorage.getItem('metatemple:language');}catch{}const initial=validLocale(param)?param:validLocale(saved)?saved:'en';localeRef.current=initial;setLocale(initial);document.documentElement.lang=initial;document.title='metatemple';
  const tr=(value:string)=>value==='공양미 보태기'?offeringText(localeRef.current).title:value==='어느 서버에서도 같은 법당을 이용할 수 있어요.'?hallDescription(localeRef.current):translateReference(value,localeRef.current);
  const writer=createReferenceDomWriter(tr);
  window.metatempleConfig={profileText:key=>profileText(localeRef.current)[key as keyof ReturnType<typeof profileText>]||key,hallName:number=>hallName(number,localeRef.current),speechText:key=>speechText(localeRef.current)[key as keyof ReturnType<typeof speechText>]||key,setText:writer.setText,setAttribute:writer.setAttribute,name:id=>localizedName(id,localeRef.current).replace(/ · \d+$/,''),translate:tr};
  const records=new WeakMap<Node,{source:string;result:string}>(),attributeRecords=new WeakMap<Element,Map<string,{source:string;result:string}>>();
  let stopped=false,queued=false,observer:MutationObserver;const options:MutationObserverInit={subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','alt','placeholder']};const translate=()=>{if(stopped||!root.current)return;observer?.disconnect();writer.retranslate();const scope=root.current;const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);let n:Node|null;while((n=walker.nextNode())){if(n.parentElement?.closest('script,style,[translate="no"]'))continue;const value=n.nodeValue||'',old=records.get(n),source=old&&old.result===value?old.source:value,result=tr(source);records.set(n,{source,result});if(value!==result)n.nodeValue=result;}
   for(const el of scope.querySelectorAll('[aria-label],[title],[alt],[placeholder]')){let map=attributeRecords.get(el);if(!map){map=new Map();attributeRecords.set(el,map);}for(const attr of ['aria-label','title','alt','placeholder']){if(el.closest('[translate="no"]'))continue;const value=el.getAttribute(attr);if(value===null)continue;const old=map.get(attr),source=old&&old.result===value?old.source:value,result=tr(source);map.set(attr,{source,result});if(value!==result)el.setAttribute(attr,result);}}
   const number=Number(scope.querySelector('#game-room-number')?.textContent);if(number>=1&&number<=7)setHall(old=>old===number?old:number);
   const tools=scope.querySelector('.game-tools .liquid-nav-source');if(tools&&!tools.querySelector('.meta-language-trigger')){const button=document.createElement('button');button.className='tool meta-language-trigger';button.setAttribute('aria-label',dictionaries[localeRef.current].language);button.setAttribute('title',dictionaries[localeRef.current].language);button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>';button.addEventListener('click',()=>setOpen(true));tools.insertBefore(button,tools.firstChild);}
   const languageButton=scope.querySelector('.meta-language-trigger');if(languageButton&&languageButton.getAttribute('aria-label')!==dictionaries[localeRef.current].language)languageButton.setAttribute('aria-label',dictionaries[localeRef.current].language);if(languageButton&&languageButton.getAttribute('title')!==dictionaries[localeRef.current].language)languageButton.setAttribute('title',dictionaries[localeRef.current].language);
   const people=scope.querySelector('#people-dialog');if(people&&!people.querySelector('.meta-profile-trigger')){const button=document.createElement('button');button.type='button';button.className='meta-profile-trigger';button.addEventListener('click',()=>window.dispatchEvent(new Event('metatemple:edit-name')));const header=people.querySelector('header');if(header)people.insertBefore(button,header.nextSibling);else people.appendChild(button);}
   const profileButton=people?.querySelector('.meta-profile-trigger'),edit=profileText(localeRef.current).edit;if(profileButton&&profileButton.textContent!==edit)profileButton.textContent=edit;
   if(!stopped)observer?.observe(scope,options);
  };translateAll.current=translate;
  observer=new MutationObserver(()=>{if(!queued){queued=true;setTimeout(()=>{queued=false;translate();},16);}});observer.observe(root.current!,options);
  const css=document.createElement('link');css.rel='stylesheet';css.href='/temple/game.css';document.head.appendChild(css);
  const script=document.createElement('script');script.type='module';script.src='/temple/renderer.js?mount='+crypto.randomUUID();script.dataset.metatemple='true';script.onerror=()=>{if(!stopped)dispatchLoad('error');};css.onload=()=>{if(!stopped){dispatchLoad('assets');document.body.appendChild(script);}};css.onerror=()=>{if(!stopped)dispatchLoad('error');};
  return()=>{stopped=true;window.removeEventListener('metatemple:load',loading);observer.disconnect();window.__metatempleDispose?.();writer.clear();delete window.__metatempleDispose;delete window.metatempleConfig;script.remove();css.remove();};
 },[]);
 useEffect(()=>{localeRef.current=locale;document.documentElement.lang=locale;try{localStorage.setItem('metatemple:language',locale);}catch{}const url=new URL(location.href);url.searchParams.set('lang',locale);history.replaceState(null,'',url);translateAll.current();window.dispatchEvent(new Event('metatemple:locale'));},[locale]);
 useEffect(()=>{if(open){setQuery('');dialog.current?.showModal();}else if(dialog.current?.open)dialog.current.close();},[open]);
 return <><div id="app" ref={root} inert={!ready} aria-hidden={!ready}/>{bootVisible&&<ArrivalScreen locale={locale} hall={hall} phase={loadPhase} onLanguage={()=>setOpen(true)}/ >}{ready&&<SpeechControls locale={locale}/>}<ProfileControls locale={locale}/><OfferingControls locale={locale}/><dialog ref={dialog} className="meta-language-dialog" aria-labelledby="meta-language-title" onCancel={()=>setOpen(false)} onClick={e=>{if(e.target===e.currentTarget)setOpen(false);}}><header><h2 id="meta-language-title">{t.language}</h2><button aria-label={t.close} onClick={()=>setOpen(false)}><X size={20}/></button></header><label className="meta-language-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.language} aria-label={t.language}/></label><div className="meta-language-grid">{languages.filter(l=>l.join(' ').toLowerCase().includes(query.toLowerCase())).map(([code,native,english])=><button key={code} lang={code} className={code===locale?'selected':''} onClick={()=>{setLocale(code);setOpen(false);}}><span><strong>{native}</strong><small>{english}</small></span>{code===locale?<Check size={18}/>:<span>{code.toUpperCase()}</span>}</button>)}</div></dialog></>;
}
