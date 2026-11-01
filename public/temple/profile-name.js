export const NICKNAME_LIMIT=20;
export const NICKNAME_STORAGE='metatemple:nickname';
/** @param {unknown} value @returns {string|null} Null means invalid; empty means automatic. */
export function cleanNickname(value){
 if(typeof value!=='string')return null;
 const name=value.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u200b\u200e\u200f\u202a-\u202e\u2066-\u2069]/g,' ').replace(/\s+/g,' ').trim();
 return Array.from(name).length<=NICKNAME_LIMIT?name:null;
}
/** @param {{name:HTMLElement,self:boolean,profileBound?:boolean}} label @param {boolean} self */
export function syncProfileLabel(label,self){
 if(!self)return;
 const edit=window.metatempleConfig?.profileText?.('edit')||'Change name';
 label.name.setAttribute('role','button');label.name.tabIndex=0;label.name.title=edit;
 const description=`${label.name.textContent} · ${edit}`;if(label.name.getAttribute('aria-label')!==description)label.name.setAttribute('aria-label',description);
 if(label.profileBound)return;label.profileBound=true;
 const open=()=>{if(label.self)window.dispatchEvent(new Event('metatemple:edit-name'));};
 label.name.addEventListener('click',e=>{e.stopPropagation();open();});
 label.name.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();open();}});
}
