from pathlib import Path
import json,struct
root=Path(__file__).resolve().parents[2]
records=[]
for name in ['bedroom','street','graffiti','climb','night']:
 p=root/'assets'/'studio'/f'{name}-plate.png'
 data=p.read_bytes();assert data[:8]==b'\x89PNG\r\n\x1a\n'
 width,height=struct.unpack('>II',data[16:24]);assert width>=1600 and height>=900
 records.append({'name':name,'width':width,'height':height,'bytes':len(data)})
assert (root/'blender'/'sunflower-studio.blend').stat().st_size>15_000_000,'Packed studio Blender source missing'
print(json.dumps(records,indent=2));print('PASS: all five full-resolution plates and packed Blender source exist')
