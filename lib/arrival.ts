export const ARRIVAL_PHASES=['opening','assets','rendering','ready','error'] as const;
export type ArrivalPhase=typeof ARRIVAL_PHASES[number];
export function nextArrivalPhase(current:ArrivalPhase,event:unknown):ArrivalPhase{
 if(typeof event!=='string'||!ARRIVAL_PHASES.includes(event as ArrivalPhase))return current;
 if(current==='error')return current;
 if(event==='error')return 'error';
 return ARRIVAL_PHASES.indexOf(event as ArrivalPhase)>ARRIVAL_PHASES.indexOf(current)?event as ArrivalPhase:current;
}
export function arrivalHall(room:unknown){const match=typeof room==='string'?room.match(/^maru-0([2-7])$/):null;return match?Number(match[1]):1;}
