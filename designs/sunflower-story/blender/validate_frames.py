from pathlib import Path
import hashlib,json
from PIL import Image,ImageChops
root=Path(__file__).resolve().parent.parent
results=[]
for name in ['bedroom','street','graffiti','climb','night']:
 files=[root/'assets'/'frames'/f'{name}-{i:02}.jpg' for i in range(12)]
 assert all(p.exists() for p in files), f'Missing camera frames: {name}'
 assert len({hashlib.sha256(p.read_bytes()).hexdigest() for p in files})==12, f'Duplicate motion frames: {name}'
 for p in files:
  with Image.open(p) as im: assert im.size==(1120,700), f'Wrong dimensions: {p}'
 with Image.open(files[0]) as a,Image.open(files[-1]) as b:
  assert ImageChops.difference(a,b).getbbox(), f'No camera movement: {name}'
 results.append({'location':name,'frames':12,'bytes':sum(p.stat().st_size for p in files)})
print(json.dumps(results,indent=2))
print('PASS: 60 complete, distinct camera frames at 1120 x 700')
