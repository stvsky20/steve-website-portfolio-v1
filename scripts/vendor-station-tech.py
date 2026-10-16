"""Vendor upstream SVG brand marks; keep provenance beside the assets."""
import concurrent.futures
import json
from pathlib import Path
import urllib.request

root = Path(__file__).resolve().parents[1] / 'designs/signal-station/assets/tech'
root.mkdir(parents=True, exist_ok=True)
devicons = ['java', 'python', 'javascript', 'typescript', 'php', 'html5', 'css3',
            'react', 'tailwindcss', 'mysql', 'supabase', 'wordpress', 'vercel',
            'git', 'github', 'gitlab', 'slack', 'google', 'godot', 'figma', 'firebase', 'vitejs', 'materialui', 'reactrouter']
sources = {name: f'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.17.0/icons/{name}/{name}-original.svg'
           for name in devicons}
sources.update({name: f'https://cdn.jsdelivr.net/npm/simple-icons@16.0.0/icons/{name}.svg'
                for name in ['clickup', 'claude']})
sources['openai'] = 'https://cdn.jsdelivr.net/npm/simple-icons@13.21.0/icons/openai.svg'

def fetch(item):
    name, url = item
    try:
        data = urllib.request.urlopen(url, timeout=30).read()
        if b'<svg' not in data:
            raise ValueError('Not SVG')
        (root / f'{name}.svg').write_bytes(data)
        return name, {'source': url, 'library': 'Devicon (MIT)' if name in devicons else 'Simple Icons (CC0-1.0)'}
    except Exception as error:
        print(f'{name}: {error}')
        return name, None

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        results = dict(pool.map(fetch, sources.items()))
    (root / 'sources.json').write_text(json.dumps({k: v for k, v in results.items() if v}, indent=2))
    for name, url in {
        'DEVICON-LICENSE.txt': 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.17.0/LICENSE',
        'SIMPLE-ICONS-LICENSE.txt': 'https://cdn.jsdelivr.net/npm/simple-icons@16.0.0/LICENSE.md',
    }.items():
        (root / name).write_bytes(urllib.request.urlopen(url, timeout=30).read())
    print(f'Vendored {sum(v is not None for v in results.values())}/{len(sources)} logos')
