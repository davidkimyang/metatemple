from pathlib import Path
import json,urllib.request,hashlib,concurrent.futures,subprocess
root=Path(__file__).resolve().parents[2]/'public'
manifest=json.loads((Path(__file__).resolve().parents[2]/'reference/vendor/asset-manifest.json').read_text())
def asset(a):
 p=root/a['source'].lstrip('/');p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists() and hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256']:return
 data=subprocess.check_output(['curl','-L','--fail','--silent','--show-error','--max-time','60','https://sansa-assets.wlsdnjs0529.workers.dev'+a['path']])
 assert hashlib.sha256(data).hexdigest()==a['sha256'],a['source'];p.write_bytes(data)
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:list(ex.map(asset,manifest))
extra=['/audio/temple-chant-review-v1.mp3','/audio/temple-chant-review-v1.license.txt','/audio/moonlight/beyond-the-self.mp3','/audio/moonlight/diamond-sutra.mp3','/audio/moonlight/lotus-sutra.mp3','/audio/moonlight/thousand-hands.mp3','/audio/moonlight/beyond-the-self-cover.jpg','/audio/moonlight/diamond-sutra-cover.jpg','/audio/moonlight/lotus-sutra-cover.jpg','/audio/moonlight/thousand-hands-cover.jpg']
def extra_asset(path):
 p=root/path.lstrip('/');p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(subprocess.check_output(['curl','-L','--fail','--silent','--show-error','--max-time','60','https://sansatemple.com'+path]))
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:list(ex.map(extra_asset,extra))
(root/'temple'/'asset-manifest.json').write_text(json.dumps(manifest,indent=2))
print('Verified',len(manifest),'3D assets and',len(extra),'chant files')
