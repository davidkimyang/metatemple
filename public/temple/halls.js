export const HALLS=Object.freeze([
 {number:1,id:'maru',name:'Original temple',colors:['#394c3c','#bea677'],reference:null},
 {number:2,id:'maru-02',name:'Amber sanctuary',colors:['#47352d','#f4ab41'],reference:'warm-timber'},
 {number:3,id:'maru-03',name:'Cherry blossom temple',colors:['#823e5d','#ee9cc7'],reference:'cherry-water'},
 {number:4,id:'maru-04',name:'Moonlit lantern courtyard',colors:['#243953','#ef693f'],reference:'blue-night'},
 {number:5,id:'maru-05',name:'Forest wheel sanctuary',colors:['#374d3c','#cdb365'],reference:'forest-wheel'},
 {number:6,id:'maru-06',name:'Golden lantern temple',colors:['#76512d','#f9c257'],reference:'golden-lanterns'},
 {number:7,id:'maru-07',name:'Lotus water garden',colors:['#637e64','#e4a497'],reference:'lotus-courtyard'},
].map(Object.freeze));
export const hallFor=id=>HALLS.find(h=>h.id===id)||HALLS[0];
export function decorateHallChoice(button,number){
 const hall=HALLS[number-1];if(!hall)return;
 let caption=button.querySelector?.('.meta-hall-theme');
 if(!caption){caption=document.createElement('small');caption.className='meta-hall-theme';caption.setAttribute('translate','no');button.append(caption);button.style.setProperty('--hall-accent',hall.colors[1]);button.dataset.hall=String(number);}
 const name=window.metatempleConfig?.hallName?.(number)||hall.name;
 if(caption.textContent!==name)caption.textContent=name;
}
