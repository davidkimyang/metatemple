import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const code=fs.readFileSync('public/temple/renderer.js','utf8');
assert(/new MetaPresence\(\s*ig,\s*ol\)/.test(code));assert(!code.includes('new bE('));assert(!code.includes('wss://sansa-realtime'));assert(!code.includes('https://xvwhzwnrrrnebdlgleqg.supabase.co'));assert(!code.includes('1002-7657-4757'));assert(!code.includes('qr.kakaopay.com/FYgMG5o7J'));assert(!code.includes('buymeacoffee.com/sansatemple'));
assert(/return s;?\s*}/.test(code)&&/capacity:\s*hi/.test(code));assert(/hi\s*=\s*100/.test(code));
const assets=JSON.parse(fs.readFileSync('public/temple/asset-manifest.json','utf8'));for(const a of assets){const file=fs.readFileSync('public'+a.source);assert.equal(crypto.createHash('sha256').update(file).digest('hex'),a.sha256,a.source);}
for(const file of ['temple-chant-review-v1.mp3','moonlight/beyond-the-self.mp3','moonlight/diamond-sutra.mp3','moonlight/lotus-sutra.mp3','moonlight/thousand-hands.mp3'])assert(fs.statSync('public/audio/'+file).size>10000);
console.log('PASS: isolated metatemple transport, no reference payment targets, 100-person capacity, 27 exact asset hashes, original chant and four music tracks');
