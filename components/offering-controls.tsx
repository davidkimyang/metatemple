"use client";
import {useEffect,useRef,useState} from 'react';
import {LockKeyhole,X} from 'lucide-react';
import {dictionaries,type Locale} from '@/lib/i18n';
import {offeringText} from '@/lib/offering-i18n';
import {OFFERINGS,type OfferingId} from '@/lib/offerings';

export default function OfferingControls({locale}:{locale:Locale}){
 const dialog=useRef<HTMLDialogElement>(null),[open,setOpen]=useState(false),[selected,setSelected]=useState<OfferingId|null>(null),t=offeringText(locale);
 useEffect(()=>{const show=()=>{document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(d=>d.close());setSelected(null);setOpen(true);};window.addEventListener('metatemple:offering',show);return()=>window.removeEventListener('metatemple:offering',show);},[]);
 useEffect(()=>{if(open){dialog.current?.showModal();window.dispatchEvent(new Event('metatemple:typing'));}else dialog.current?.close();},[open]);
 return <dialog ref={dialog} className="meta-offering-dialog" translate="no" aria-labelledby="meta-offering-title" aria-describedby="meta-offering-description" onClose={()=>setOpen(false)} onCancel={()=>setOpen(false)} onClick={e=>{if(e.target===e.currentTarget)setOpen(false);}} onKeyDown={e=>e.stopPropagation()}>
  <header><span className="meta-offering-brand">metatemple</span><button type="button" autoFocus aria-label={dictionaries[locale].close} onClick={()=>setOpen(false)}><X size={20}/></button></header>
  <div className="meta-offering-bowl" aria-hidden="true">🍚</div>
  <h2 id="meta-offering-title">{t.title}</h2><p id="meta-offering-description" className="meta-offering-intro">{t.intro}</p>
  <fieldset><legend>{t.choose}</legend><div className="meta-offering-amounts">{OFFERINGS.map(item=><label key={item.id} className={selected===item.id?'is-selected':''}><input type="radio" name="rice-offering" value={item.id} checked={selected===item.id} onChange={()=>setSelected(item.id)}/><strong>${Number(item.value)}</strong><small>USD</small></label>)}</div></fieldset>
  <div className="meta-offering-note"><LockKeyhole size={16} aria-hidden="true"/><p>{t.pending}</p></div>
  <button type="button" className="meta-offering-paypal" disabled aria-describedby="meta-offering-status">PayPal <span>· {t.soon}</span></button>
  <p id="meta-offering-status" className="meta-offering-status">{t.noCharge}</p>
  <footer><p>{t.free}</p><a href="/credits" target="_blank" rel="noopener noreferrer">{t.credits}</a></footer>
 </dialog>;
}
