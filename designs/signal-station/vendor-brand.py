"""Vendor a small, version-pinned subset of IBM Plex and Phosphor assets."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import io, json, tarfile, urllib.request
import xml.etree.ElementTree as ET

assets = Path(__file__).resolve().parent / 'assets'
brand = assets / 'brand'
brand.mkdir(exist_ok=True)
packages = ['@fontsource/ibm-plex-sans', '@fontsource/ibm-plex-mono', '@phosphor-icons/core']
versions = dict(zip(packages, ['5.3.0', '5.3.0', '2.1.1']))
icons = ['arrow-up-right','arrow-down-left','arrow-left','arrow-right','arrow-down','arrow-up','arrow-counter-clockwise','arrow-clockwise','plus','minus','x','play','pause','sliders-horizontal','planet','broadcast','arrows-out-cardinal','eye','eye-slash','compass','rocket-launch','radio','briefcase','check','crosshair']
manifest = {}

def fetch(package):
    request = urllib.request.Request('https://registry.npmjs.org/' + package.replace('/', '%2f') + '/' + versions[package], headers={'User-Agent':'SignalStation/1.0'})
    with urllib.request.urlopen(request, timeout=40) as response:
        data = json.load(response)
    with urllib.request.urlopen(data['dist']['tarball'], timeout=60) as response:
        archive = tarfile.open(fileobj=io.BytesIO(response.read()), mode='r:gz')
    return package, data, archive

for package, data, archive in ThreadPoolExecutor(max_workers=3).map(fetch, packages):
    manifest[package] = {'version':data['version'], 'source':data['dist']['tarball'], 'integrity':data['dist'].get('integrity')}
    members = archive.getmembers()
    if package.startswith('@fontsource/'):
        family = package.split('/')[-1]
        for weight in ([400,500,600] if family.endswith('sans') else [400,500]):
            name = f'{family}-latin-{weight}-normal.woff2'
            member = next(m for m in members if m.name.endswith('/files/' + name))
            content = archive.extractfile(member).read()
            if content[:4] != b'wOF2':
                raise ValueError('Invalid WOFF2 font: ' + name)
            (brand / name).write_bytes(content)
        license_member = next(m for m in members if m.name.rsplit('/',1)[-1] in ['LICENSE','OFL.txt','LICENSE.txt'])
        (brand / (family + '-LICENSE.txt')).write_bytes(archive.extractfile(license_member).read())
    else:
        sprite = ET.Element('svg', {'xmlns':'http://www.w3.org/2000/svg'})
        allowed = {'svg','path','rect','circle','ellipse','line','polyline','polygon','g','defs','clipPath'}
        for name in icons:
            member = next((m for m in members if m.name.endswith('/assets/regular/' + name + '.svg')), None)
            if not member:
                raise ValueError('Phosphor asset missing: ' + name)
            root = ET.fromstring(archive.extractfile(member).read())
            symbol = ET.SubElement(sprite,'symbol',{'id':name,'viewBox':root.get('viewBox','0 0 256 256'),'fill':'currentColor'})
            for element in root.iter():
                element.tag = element.tag.rsplit('}',1)[-1]
                if element.tag not in allowed or any(k.lower().startswith('on') for k in element.attrib):
                    raise ValueError('Unexpected SVG content')
            for child in root:
                symbol.append(child)
        (brand / 'phosphor.svg').write_text(ET.tostring(sprite,encoding='unicode'),encoding='utf-8')
        license_member = next(m for m in members if m.name.rsplit('/',1)[-1] in ['LICENSE','LICENSE.txt'])
        (brand / 'phosphor-LICENSE.txt').write_bytes(archive.extractfile(license_member).read())
    print(package, data['version'])
(brand / 'sources.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print('Vendored 5 WOFF2 fonts and', len(icons), 'Phosphor Regular SVG symbols.')
