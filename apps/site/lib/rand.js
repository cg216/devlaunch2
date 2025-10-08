export function mulberry32(a) { return function() { let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function seededShuffle(arr, seed=1) { const r = mulberry32(seed); const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j = Math.floor(r()* (i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
