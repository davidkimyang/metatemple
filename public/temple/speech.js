import {syncProfileLabel} from './profile-name.js';
// Plain text only: visitor messages must never pass through HTML or UI translation.
const dismissed=new Map();
const text=key=>window.metatempleConfig?.speechText?.(key)||({remove:'Remove my message',dismiss:'Dismiss this message'})[key];
export function syncSpeechLabel(label,visitor,self){
 syncProfileLabel(label,self);
 if(!label.speechElement){
  const bubble=document.createElement('div');bubble.className='meta-speech-bubble';bubble.hidden=true;bubble.setAttribute('translate','no');
  const content=document.createElement('span');content.className='meta-speech-message';content.dir='auto';
  const close=document.createElement('button');close.type='button';close.textContent='×';close.className='meta-speech-dismiss';
  close.addEventListener('click',async e=>{e.stopPropagation();if(label.self){close.disabled=true;try{const r=await window.metatempleChat?.send('');if(!r?.ok){close.title=window.metatempleConfig?.speechText?.('error')||'Please try again';return;}}finally{close.disabled=false;}}else{dismissed.set(label.visitorId,label.speechUntil);bubble.hidden=true;}});
  bubble.append(content,close);label.element.append(bubble);label.speechElement=bubble;label.speechContent=content;label.speechClose=close;
 }
 label.visitorId=visitor.id;label.speechUntil=Number(visitor.speechUntil)||0;
 const message=typeof visitor.speech==='string'?visitor.speech:'';
 if(label.speechContent.textContent!==message)label.speechContent.textContent=message;
 const name=text(self?'remove':'dismiss');if(label.speechClose.getAttribute('aria-label')!==name){label.speechClose.setAttribute('aria-label',name);label.speechClose.title=name;}
 label.speechMessage=message;activeSpeech(label);
 if(dismissed.size>200){for(const[id,until]of dismissed)if(until<Date.now())dismissed.delete(id);}
}
export function activeSpeech(label){
 const active=!!label.speechMessage&&label.speechUntil>Date.now()&&document.documentElement.dataset.speechVisible!=='false'&&dismissed.get(label.visitorId)!==label.speechUntil;
 if(label.speechElement&&label.speechElement.hidden===active)label.speechElement.hidden=!active;
 return active;
}
