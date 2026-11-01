/** Keep original messages for language changes, and commit only final localized values. */
export function createReferenceDomWriter(translate:(source:string)=>string){
 const texts=new Map<Node,string>();
 const attributes=new Map<Element,Map<string,string>>();
 function writeText(target:Node,source:unknown){
  const raw=source==null?'':String(source);
  const protectedText=!!(target.nodeType===1?target as Element:target.parentElement)?.closest?.('[translate="no"]');
  const value=protectedText?raw:translate(raw);
  if(!protectedText&&(/[가-힣]/.test(raw)||raw!==value))texts.set(target,raw);else texts.delete(target);
  const nodes=target.childNodes;
  // textContent also clears nested elements; preserve that behavior on the first write.
  const structured=!!nodes?.length&&(nodes.length>1||target.firstChild?.nodeType!==3);
  if(target.textContent!==value||structured)target.textContent=value;
  return source;
 }
 function writeAttribute(target:Element,name:string,source:unknown){
  const raw=String(source),value=translate(raw);
  let record=attributes.get(target);if(!record){record=new Map();attributes.set(target,record);}record.set(name,raw);
  if(target.getAttribute(name)!==value)target.setAttribute(name,value);
 }
 function retranslate(){
  for(const[target,source]of texts){if(target.isConnected===false){texts.delete(target);continue;}writeText(target,source);}
  for(const[target,record]of attributes){if(target.isConnected===false){attributes.delete(target);continue;}for(const[name,source]of record)writeAttribute(target,name,source);}
 }
 return {setText:writeText,setAttribute:writeAttribute,retranslate,clear(){texts.clear();attributes.clear();}};
}
