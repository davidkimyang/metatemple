// Shared product identifiers. A checkout must resolve prices on the server.
export const OFFERINGS = Object.freeze([
 {id:'rice-1',value:'1.00',currency:'USD'},
 {id:'rice-5',value:'5.00',currency:'USD'},
 {id:'rice-10',value:'10.00',currency:'USD'},
] as const);
export type OfferingId = typeof OFFERINGS[number]['id'];
export function offeringFor(id:unknown){return OFFERINGS.find(item=>item.id===id)??null;}
