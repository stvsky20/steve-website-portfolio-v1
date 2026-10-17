"""Bake seamless, project-authored renderer data; no external artwork required."""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / 'assets' / 'environment'
ROOT.mkdir(parents=True, exist_ok=True)


def noise(size, cells, seed):
    rng = np.random.default_rng(seed)
    lattice = rng.random((cells, cells))
    pos = np.arange(size) * cells / size
    base = pos.astype(int)
    frac = pos - base
    smooth = frac * frac * (3 - 2 * frac)
    a = lattice[base[:, None], base[None, :]]
    b = lattice[base[:, None], (base[None, :] + 1) % cells]
    c = lattice[(base[:, None] + 1) % cells, base[None, :]]
    d = lattice[(base[:, None] + 1) % cells, (base[None, :] + 1) % cells]
    return (a * (1 - smooth) + b * smooth) * (1 - smooth[:, None]) + (c * (1 - smooth) + d * smooth) * smooth[:, None]


cloud = sum(noise(1024, 32 * 2**i, 71 + i) * .5**(i + 1) for i in range(5))
Image.fromarray(np.uint8(np.clip(cloud, 0, 1) * 255)).save(ROOT / 'cloud-density.png', optimize=True)

v, u = np.mgrid[:512, :512] * (2 * np.pi / 512)
sx = -.051 * np.cos(5 * u) - .037 * np.cos(8 * (u - v))
sz = .034 * np.cos(3 * v)
grain = noise(512, 96, 99) - .5
chop = noise(512, 112, 100)
data = np.stack([.5 + (sx + grain * .06) / .4, .5 + (sz + grain * .06) / .4, chop], axis=-1)
assert np.isfinite(data).all() and data.min() >= 0 and data.max() <= 1
Image.fromarray(np.uint8(data * 255)).save(ROOT / 'water-detail.png', optimize=True)
for asset in ROOT.glob('*.png'):
    print(f'{asset.name}: {asset.stat().st_size:,} bytes')
