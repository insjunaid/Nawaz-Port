"""
Photo pipeline for the portfolio (the About portrait).

    python scripts/process_photos.py            # uses the cached mask when present
    python scripts/process_photos.py --remask   # re-run rembg segmentation

Steps:
  1. Segment the person with rembg (BiRefNet portrait model).
  2. Refine alpha: lift the floor (kills faint wall haze), choke hard edges by
     ~1px, keep hair soft.
  3. Decontaminate edge colours with pymatting's foreground estimation, so no
     bright background bleeds into the hair or shoulder edge (= no halo).
  4. Trim to the subject's bounding box.
  5. Export the clean, natural-colour transparent PNG (assets/processed/).
  6. Warm grade + soft directional gold rim light → web WebP (2 widths) + PNG.

Requirements: pip install "rembg[cpu]" pillow numpy scipy
On Windows with long paths, set NUMBA_CACHE_DIR to a short folder first.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets"
PROCESSED = SRC / "processed"
WEB = ROOT / "public" / "images"

# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------
PHOTOS = {
    # About: striped shirt, indoor, soft frontal light.
    "nawaz-2": {
        "out": "nawaz-about",
        "widths": [780, 520],  # trimmed source is ~790px wide
        "light_dir": (-0.6, -0.8),
        "rim_strength": 0.7,
        "grade_mix": 0.3,
    },
}

# Theme colours (match src/index.css)
GOLD_HOT = np.array([255, 214, 140]) / 255

# Grade ramp: luminance -> colour. Shadows sink into ink-emerald,
# mids turn bronze, highlights become warm off-white.
RAMP = [
    (0.00, (8, 12, 13)),
    (0.22, (22, 34, 30)),
    (0.45, (92, 78, 56)),
    (0.68, (186, 146, 92)),
    (0.86, (232, 206, 162)),
    (1.00, (250, 242, 226)),
]
LUMA = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)


# ---------------------------------------------------------------------------
# Cutout
# ---------------------------------------------------------------------------
def load_rgb(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("RGB")).astype(np.float32) / 255


def segment(name: str, remask: bool) -> np.ndarray:
    """Return the raw alpha matte (float 0..1), cached in assets/processed."""
    cache = PROCESSED / f"{name}-mask.png"
    if cache.exists() and not remask:
        return np.asarray(Image.open(cache)).astype(np.float32) / 255

    from rembg import new_session, remove  # imported lazily: heavy

    session = new_session("birefnet-portrait")
    mask = remove(Image.open(SRC / f"{name}.jpg").convert("RGB"), session=session, only_mask=True)
    mask.save(cache)
    return np.asarray(mask).astype(np.float32) / 255


def refine_alpha(a: np.ndarray) -> np.ndarray:
    """Remove haze and choke hard edges without crunching soft hair."""
    a = np.clip((a - 0.10) / (0.92 - 0.10), 0, 1)  # levels: haze out, solid in
    eroded = ndimage.grey_erosion(a, size=(3, 3))  # ~1px choke…
    a = a * 0.35 + eroded * 0.65  # …blended so wispy hair survives
    a = ndimage.gaussian_filter(a, 0.6)
    a[a < 0.02] = 0
    return a


def decontaminate(img: np.ndarray, a: np.ndarray) -> np.ndarray:
    """Estimate true foreground colour at the edges (removes background bleed)."""
    from pymatting import estimate_foreground_ml

    fg = np.clip(estimate_foreground_ml(img.astype(np.float64), a.astype(np.float64)), 0, 1).astype(np.float32)
    # Belt and braces: edge pixels may never be brighter than nearby solid pixels.
    lum = fg @ LUMA
    ref = ndimage.maximum_filter(np.where(a > 0.97, lum, 0), size=13)
    edge = (a > 0) & (a < 0.97)
    over = np.where(edge & (lum > ref + 0.02), (ref + 0.02) / np.maximum(lum, 1e-4), 1.0)
    return fg * over[..., None]


def bbox(a: np.ndarray, pad: int = 12):
    ys, xs = np.where(a > 0.02)
    h, w = a.shape
    return max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, w), h


# ---------------------------------------------------------------------------
# Look
# ---------------------------------------------------------------------------
def grade(fg: np.ndarray, mix: float) -> np.ndarray:
    """Warm duotone grade blended with a warmed, desaturated original."""
    lum = fg @ LUMA
    lum_c = np.clip(lum, 0, 1)
    lum_c = lum_c * lum_c * (3 - 2 * lum_c) * 0.65 + lum_c * 0.35  # gentle S-curve
    xs = np.array([s[0] for s in RAMP])
    cols = np.array([s[1] for s in RAMP], dtype=np.float32) / 255
    duo = np.stack([np.interp(lum_c, xs, cols[:, c]) for c in range(3)], axis=-1)
    warm = (fg * 0.7 + lum[..., None] * 0.3) * np.array([1.06, 1.0, 0.86], dtype=np.float32)
    return np.clip(warm * (1 - mix) + duo * mix, 0, 1)


def rim_light(rgb: np.ndarray, a: np.ndarray, light_dir, strength: float) -> np.ndarray:
    """Soft gold light on the light-facing edges only (screen blend), fading inward."""
    soft = ndimage.gaussian_filter(a, 2.5)
    gy, gx = np.gradient(soft)
    mag = np.hypot(gx, gy)
    nx, ny = -gx / (mag + 1e-6), -gy / (mag + 1e-6)  # outward normal
    facing = np.clip(nx * light_dir[0] + ny * light_dir[1], 0, 1) ** 2.2
    edge = (mag > 0.004).astype(np.float32)
    facing = ndimage.gaussian_filter(facing * edge, 6) / (ndimage.gaussian_filter(edge, 6) + 1e-4)
    falloff = np.exp(-ndimage.distance_transform_edt(a > 0.5) / 9.0)
    rim = np.clip(falloff * facing * strength * 0.55, 0, 1)[..., None]
    return 1 - (1 - rgb) * (1 - rim * GOLD_HOT)


def save_rgba(rgb: np.ndarray, a: np.ndarray, path: Path, width: int | None = None, fmt="WEBP", **kw):
    data = np.dstack([np.broadcast_to(rgb, (*a.shape, 3)), a])
    im = Image.fromarray((np.clip(data, 0, 1) * 255 + 0.5).astype(np.uint8), "RGBA")
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(path, fmt, **kw)
    return im.size


# ---------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--remask", action="store_true", help="re-run rembg segmentation")
    args = parser.parse_args()

    PROCESSED.mkdir(parents=True, exist_ok=True)
    WEB.mkdir(parents=True, exist_ok=True)
    meta = {}

    for name, cfg in PHOTOS.items():
        print(f"> {name}")
        img = load_rgb(SRC / f"{name}.jpg")
        a = refine_alpha(segment(name, args.remask))
        fg = decontaminate(img, a)

        x0, y0, x1, y1 = bbox(a)
        a, fg = a[y0:y1, x0:x1], fg[y0:y1, x0:x1]

        # 1. Natural-colour transparent master.
        save_rgba(fg, a, PROCESSED / f"{name}-cutout.png", fmt="PNG", optimize=True)

        # 2. Graded + rim-lit web versions.
        graded = rim_light(grade(fg, cfg["grade_mix"]), a, cfg["light_dir"], cfg["rim_strength"])
        sizes = []
        for w in cfg["widths"]:
            sizes.append(save_rgba(graded, a, WEB / f"{cfg['out']}-{w}.webp", w, "WEBP", quality=82, method=6))
        save_rgba(graded, a, WEB / f"{cfg['out']}.png", cfg["widths"][1], "PNG", optimize=True)


        meta[cfg["out"]] = {"width": sizes[0][0], "height": sizes[0][1]}
        print(f"   saved {cfg['out']} {sizes}")

    (WEB / "images.json").write_text(json.dumps(meta, indent=2))


if __name__ == "__main__":
    main()
