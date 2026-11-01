export const ROOM_CAPACITY = 100;
export const ROOMS = Array.from({length:7},(_,index)=>({id:index===0?"maru":`maru-${String(index+1).padStart(2,"0")}`,number:index+1,capacity:ROOM_CAPACITY}));
export const validRoom=(id:unknown):id is string=>typeof id==="string"&&ROOMS.some(r=>r.id===id);
export const RESERVED_CUSHIONS=[12,15,17,18,32,37];
