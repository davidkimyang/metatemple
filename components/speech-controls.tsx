"use client";
import {useEffect,useRef,useState} from 'react';
import {MessageCircle,Eye,EyeOff,Send,X} from 'lucide-react';
import {dictionaries,type Locale} from '@/lib/i18n';
import {speechText} from '@/lib/speech-i18n';
import {SPEECH_LIMIT} from '@/lib/speech';
declare global {interface Window {metatempleChat?:{send:(message:string)=>Promise<{ok:boolean;error?:string}>;canSend:()=>boolean};}}
export default function SpeechControls({locale}:{locale:Locale}){
 const t=speechText(locale),input=useRef<HTMLInputElement>(null),composing=useRef(false),busy=useRef(false);
 const[open,setOpen]=useState(false),[draft,setDraft]=useState(''),[visible,setVisible]=useState(true),[connected,setConnected]=useState(false),[sending,setSending]=useState(false),[error,setError]=useState('');
 useEffect(()=>{
  let shown=true;try{shown=localStorage.getItem('metatemple:speech-visible')!=='false';}catch{}
  setVisible(shown);document.documentElement.dataset.speechVisible=String(shown);
  const status=()=>setConnected(window.metatempleChat?.canSend()??false);status();window.addEventListener('metatemple:chat-status',status);
  const key=(e:KeyboardEvent)=>{const target=e.target as HTMLElement;if(e.key!=='Enter'||e.isComposing||e.repeat||e.ctrlKey||e.metaKey||e.altKey||document.querySelector('dialog[open]')||target?.closest('input,textarea,select,button,a,[role="button"],[contenteditable=true]'))return;e.preventDefault();e.stopPropagation();setOpen(true);};
  window.addEventListener('keydown',key,true);
  return()=>{window.removeEventListener('metatemple:chat-status',status);window.removeEventListener('keydown',key,true);delete document.documentElement.dataset.speechVisible;};
 },[]);
 useEffect(()=>{if(open){window.dispatchEvent(new Event('metatemple:typing'));input.current?.focus();}},[open]);
 const toggle=()=>{const next=!visible;setVisible(next);document.documentElement.dataset.speechVisible=String(next);try{localStorage.setItem('metatemple:speech-visible',String(next));}catch{}};
 const close=()=>{setOpen(false);setError('');input.current?.blur();};
 async function send(){if(composing.current||busy.current||!connected||!draft.trim())return;busy.current=true;setSending(true);setError('');try{const r=await window.metatempleChat?.send(draft);if(r?.ok){setDraft('');close();}else setError(r?.error==='rate-limit'?t.slow:t.error);}catch{setError(t.error);}finally{busy.current=false;setSending(false);}}
 return <div className="meta-speech-controls" translate="no">
  <div className="meta-speech-tools">
   <button type="button" className="meta-speech-trigger" aria-label={t.say} aria-expanded={open} aria-controls="meta-speech-composer" title={`${t.say} · Enter`} onClick={()=>{setOpen(!open);setError('');}}><MessageCircle size={19}/><span>{t.say}</span></button>
   <button type="button" className="meta-speech-visibility" aria-label={visible?t.hide:t.show} title={visible?t.hide:t.show} aria-pressed={!visible} onClick={toggle}>{visible?<Eye size={19}/>:<EyeOff size={19}/>}</button>
  </div>
  {open&&<form id="meta-speech-composer" className="meta-speech-composer" data-meta-composer onSubmit={e=>{e.preventDefault();void send();}} onKeyDown={e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Enter'&&(e.nativeEvent.isComposing||composing.current))e.preventDefault();}}>
   <div className="meta-speech-input-row"><MessageCircle size={19}/><input ref={input} value={draft} maxLength={SPEECH_LIMIT*2} onChange={e=>{setDraft(Array.from(e.target.value).slice(0,SPEECH_LIMIT).join(''));setError('');}} onCompositionStart={()=>{composing.current=true;}} onCompositionEnd={()=>{composing.current=false;}} placeholder={t.placeholder} aria-label={t.placeholder} aria-describedby="meta-speech-hint" autoComplete="off" enterKeyHint="send" dir="auto"/>
    <button type="submit" disabled={!connected||sending||!draft.trim()} aria-label={t.send} title={t.send}><Send size={19}/></button><button type="button" aria-label={dictionaries[locale].close} title={dictionaries[locale].close} onClick={close}><X size={19}/></button></div>
   <div id="meta-speech-hint" className="meta-speech-hint"><span role="status">{error||(!connected?t.waiting:t.hint)}</span><span>{Array.from(draft).length}/{SPEECH_LIMIT}</span></div>
  </form>}
 </div>;
}
