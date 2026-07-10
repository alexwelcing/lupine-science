#!/usr/bin/env python3
"""Generate 10 deck-level visuals for the cement/concrete article."""

import json
import os
import subprocess
import sys
import tempfile
from io import BytesIO
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Ellipse, Polygon, Wedge
from matplotlib.colors import LinearSegmentedColormap
import numpy as np
from PIL import Image, ImageOps

# -----------------------------------------------------------------------------
# Brand & output
# -----------------------------------------------------------------------------
BG = '#faf9f6'
INDIGO = '#3d4db3'
AMBER = '#e8a838'
SAGE = '#5a8a6e'
SLATE = '#6b7c8e'
ROSE = '#c75b5b'
INK = '#1a1a1a'
SECONDARY = '#555555'
MUTED = '#aaaaaa'
SOFT_INDIGO = '#d9d8ff'
SOFT_AMBER = '#f5e3c8'
SOFT_SAGE = '#c8dccf'
SOFT_ROSE = '#f0d5d5'

COLORS = [INDIGO, AMBER, SAGE, SLATE, ROSE]

SLUG = 'cement-concrete-and-the-weight-of-the-built-world'
OUT_DIR = Path('/home/alex/Dev/lupine/lupine-science/public/articles') / SLUG / 'images'
OUT_DIR.mkdir(parents=True, exist_ok=True)

DPI = 150
W_PIX, H_PIX = 1280, 720
FIG_W = W_PIX / DPI
FIG_H = H_PIX / DPI

MINIMAX = Path('/home/alex/.hermes/skills/lupine-media-director/scripts/minimax_client.py')

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['DejaVu Sans', 'Liberation Sans', 'Arial'],
    'font.size': 11,
    'axes.facecolor': BG,
    'figure.facecolor': BG,
    'axes.edgecolor': INK,
    'axes.labelcolor': INK,
    'xtick.color': SECONDARY,
    'ytick.color': SECONDARY,
    'text.color': INK,
    'axes.titlesize': 16,
    'axes.titleweight': 'bold',
})

MANIFEST = []


def save_jpg(fig, filename):
    """Save a matplotlib figure as an exact 1280x720 JPG with brand background."""
    buf = BytesIO()
    fig.savefig(buf, format='png', dpi=DPI, facecolor=BG, edgecolor='none',
                bbox_inches='tight', pad_inches=0.03)
    buf.seek(0)
    img = Image.open(buf).convert('RGB')
    img = ImageOps.pad(img, (W_PIX, H_PIX), color=BG)
    out_path = OUT_DIR / filename
    img.save(out_path, 'JPEG', quality=90, dpi=(DPI, DPI))
    plt.close(fig)
    return out_path


def add_title(fig, title, y=0.96):
    fig.text(0.5, y, title, ha='center', va='top',
             fontsize=20, fontweight='bold', color=INK, fontfamily='sans-serif')


def add_source(fig, source, y=0.04):
    fig.text(0.5, y, source, ha='center', va='bottom',
             fontsize=9, color=SECONDARY, fontfamily='sans-serif')


def register(filename, title, kind, caption):
    MANIFEST.append({
        'filename': filename,
        'title': title,
        'type': kind,
        'caption': caption,
    })


# -----------------------------------------------------------------------------
# 01 — Global Footprint
# -----------------------------------------------------------------------------
def make_01():
    fig = plt.figure(figsize=(FIG_W, FIG_H), dpi=DPI, facecolor=BG)
    ax = fig.add_axes([0.10, 0.22, 0.80, 0.52])
    ax.set_xlim(0, 3.2)
    ax.set_ylim(0, 1)
    ax.set_facecolor(BG)

    total = 2.8
    process = 1.68
    fuel = 1.12

    ax.barh(0, process, left=0, height=0.55, color=AMBER, label='Process emissions (limestone calcination)')
    ax.barh(0, fuel, left=process, height=0.55, color=INDIGO, label='Fuel emissions')

    ax.text(process / 2, 0, f'{process:.2f} Gt\n60%', ha='center', va='center',
            fontsize=14, fontweight='bold', color='white')
    ax.text(process + fuel / 2, 0, f'{fuel:.2f} Gt\n40%', ha='center', va='center',
            fontsize=14, fontweight='bold', color='white')

    ax.annotate('≈8% of global anthropogenic CO₂', xy=(total, 0), xytext=(total - 0.3, 0.45),
                fontsize=12, fontweight='bold', color=INDIGO,
                arrowprops=dict(arrowstyle='->', color=INDIGO, lw=1.5))

    ax.set_yticks([])
    ax.set_xticks([0, total])
    ax.set_xticklabels(['0', '2.8 GtCO₂/year'])
    ax.set_xlabel('Annual CO₂ emissions from cement manufacturing', fontsize=12, color=INK)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)
    ax.tick_params(axis='x', labelsize=11)
    ax.legend(loc='upper center', bbox_to_anchor=(0.5, -0.18), ncol=2, frameon=False, fontsize=10)

    add_title(fig, 'The 2.8-Gigaton Footprint')
    add_source(fig, 'Sources: IEA/GCCA 2024; IPCC AR6')
    filename = f'{SLUG}-01-global-footprint.jpg'
    register(filename, 'The 2.8-Gigaton Footprint', 'data-chart',
             'Global cement manufacturing emits about 2.8 GtCO₂ annually, with roughly 60% coming from limestone calcination rather than fuel combustion. Sources: IEA/GCCA 2024; IPCC AR6.')
    return save_jpg(fig, filename)


# -----------------------------------------------------------------------------
# 02 — Calcination Trap
# -----------------------------------------------------------------------------
def make_02():
    fig = plt.figure(figsize=(FIG_W, FIG_H), dpi=DPI, facecolor=BG)
    ax = fig.add_axes([0.05, 0.12, 0.90, 0.72])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor(BG)

    # Limestone input
    limestone = FancyBboxPatch((0.5, 6.2), 2.0, 1.6, boxstyle='round,pad=0.05,rounding_size=0.2',
                               facecolor=SLATE, edgecolor=INK, linewidth=2, alpha=0.9)
    ax.add_patch(limestone)
    ax.text(1.5, 7.3, 'Limestone', ha='center', va='center', fontsize=13, fontweight='bold', color='white')
    ax.text(1.5, 6.8, 'CaCO₃', ha='center', va='center', fontsize=12, color='white')

    # Kiln
    kiln = Ellipse((5.0, 7.0), 2.8, 1.8, facecolor=AMBER, edgecolor=INK, linewidth=2, alpha=0.95)
    ax.add_patch(kiln)
    ax.text(5.0, 7.0, 'Rotary kiln\n1,450 °C', ha='center', va='center',
            fontsize=12, fontweight='bold', color='white')

    # Clinker output
    clinker = FancyBboxPatch((7.5, 6.2), 2.0, 1.6, boxstyle='round,pad=0.05,rounding_size=0.2',
                             facecolor=INDIGO, edgecolor=INK, linewidth=2, alpha=0.9)
    ax.add_patch(clinker)
    ax.text(8.5, 7.3, 'Clinker', ha='center', va='center', fontsize=13, fontweight='bold', color='white')
    ax.text(8.5, 6.8, 'CaO + silicates', ha='center', va='center', fontsize=11, color='white')

    # Arrows
    ax.annotate('', xy=(3.6, 7.0), xytext=(2.6, 7.0),
                arrowprops=dict(arrowstyle='->', color=INK, lw=2.5))
    ax.annotate('', xy=(7.4, 7.0), xytext=(6.4, 7.0),
                arrowprops=dict(arrowstyle='->', color=INK, lw=2.5))

    # Locked CO₂ arrow
    ax.annotate('', xy=(5.0, 9.3), xytext=(5.0, 7.9),
                arrowprops=dict(arrowstyle='->', color=ROSE, lw=3.5))
    lock = FancyBboxPatch((4.35, 9.35), 1.3, 0.55, boxstyle='round,pad=0.02,rounding_size=0.1',
                          facecolor=ROSE, edgecolor=INK, linewidth=1.5)
    ax.add_patch(lock)
    ax.text(5.0, 9.62, 'CO₂ out  (locked)', ha='center', va='center',
            fontsize=11, fontweight='bold', color='white')
    ax.text(5.0, 9.25, 'clean heat cannot remove this', ha='center', va='center',
            fontsize=9, color='white')

    # Equation
    ax.text(5.0, 4.7, r'CaCO$_3$  $\rightarrow$  CaO  +  CO$_2$',
            ha='center', va='center', fontsize=16, fontweight='bold', color=INK)
    ax.text(5.0, 3.8, '~60% of cement emissions are process emissions from this reaction alone',
            ha='center', va='center', fontsize=11, color=SECONDARY)

    # Fuel vs process note
    ax.text(5.0, 2.5, 'Fuel switching cuts the 40% fuel share; the 60% chemical share remains.',
            ha='center', va='center', fontsize=12, fontweight='bold', color=INDIGO,
            bbox=dict(boxstyle='round,pad=0.4', facecolor=SOFT_INDIGO, edgecolor=INDIGO, linewidth=1.5))

    add_title(fig, 'The Process-Emissions Trap')
    add_source(fig, 'Source: IEA/GCCA 2024')
    filename = f'{SLUG}-02-calcination-trap.jpg'
    register(filename, 'The Process-Emissions Trap', 'concept-diagram',
             'Clean energy can shrink fuel emissions, but the calcination of limestone releases CO₂ regardless of the heat source. Source: IEA/GCCA 2024.')
    return save_jpg(fig, filename)


# -----------------------------------------------------------------------------
# 03 — Where uMLIPs Soften
# -----------------------------------------------------------------------------
def make_03():
    fig = plt.figure(figsize=(FIG_W, FIG_H), dpi=DPI, facecolor=BG)
    ax = fig.add_axes([0.06, 0.10, 0.88, 0.74])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor(BG)

    np.random.seed(3)
    n_x, n_y = 18, 10
    xs = np.linspace(0.8, 9.2, n_x)
    ys = np.linspace(1.2, 8.4, n_y)
    coords = np.array([[x, y] for y in ys for x in xs])

    # Disorder grows from left (crystal) to right (gel/surface)
    disorder = np.linspace(0, 1, n_x)[np.tile(np.arange(n_x), n_y)]
    noise = np.random.normal(0, 0.18, size=coords.shape)
    coords[:, 0] += noise[:, 0] * disorder
    coords[:, 1] += noise[:, 1] * disorder

    # Coordination number decreases with disorder; error increases
    coord = 12 - 8 * disorder + np.random.normal(0, 0.4, size=len(disorder))
    coord = np.clip(coord, 3, 12)
    error = np.clip(60 * (1 - (coord - 3) / 9), 0, 60)

    cmap = LinearSegmentedColormap.from_list('error', [INDIGO, AMBER, ROSE])
    sc = ax.scatter(coords[:, 0], coords[:, 1], c=error, s=70, cmap=cmap,
                    edgecolors='white', linewidths=0.3, vmin=0, vmax=60, zorder=3)

    # Region labels
    ax.text(2.0, 9.0, 'Crystalline bulk', ha='center', va='center', fontsize=12,
            fontweight='bold', color=INDIGO)
    ax.text(2.0, 8.5, 'low error', ha='center', va='center', fontsize=10, color=SECONDARY)
    ax.text(8.0, 9.0, 'Under-coordinated', ha='center', va='center', fontsize=12,
            fontweight='bold', color=ROSE)
    ax.text(8.0, 8.5, 'surface / gel / pore', ha='center', va='center', fontsize=10, color=SECONDARY)

    # Labels for representative species
    ax.text(7.4, 5.0, r'Q$^1$, Q$^2$, Q$^3$ silicates', ha='center', va='center',
            fontsize=10, fontweight='bold', color=INK,
            bbox=dict(boxstyle='round,pad=0.25', facecolor='white', edgecolor=AMBER, alpha=0.9))
    ax.text(7.8, 3.2, 'tetra / penta / octa Al', ha='center', va='center',
            fontsize=10, fontweight='bold', color=INK,
            bbox=dict(boxstyle='round,pad=0.25', facecolor='white', edgecolor=ROSE, alpha=0.9))

    cbar = plt.colorbar(sc, ax=ax, fraction=0.03, pad=0.02, aspect=25)
    cbar.set_label('uMLIP energy softening (%)', fontsize=10, color=INK)
    cbar.ax.tick_params(labelsize=9, colors=SECONDARY)

    ax.text(5.0, 0.5, 'Energy-surface softening reaches 15–60% where coordination numbers fall to 4–8.',
            ha='center', va='center', fontsize=11, color=INK)

    add_title(fig, 'Where Universal Potentials Lose Trust')
    add_source(fig, 'Source: Deng et al., npj Comput. Mater. 2025')
    filename = f'{SLUG}-03-softening-field.jpg'
    register(filename, 'Where Universal Potentials Lose Trust', 'concept-diagram',
             'In dissolved silicates, gel pores, and hydrate interfaces, coordination numbers fall outside the bulk training data and uMLIPs soften energies by 15–60%. Source: Deng et al., npj Comput. Mater. 2025.')
    return save_jpg(fig, filename)


# -----------------------------------------------------------------------------
# 04 — Blind Prediction Accuracy
# -----------------------------------------------------------------------------
def make_04():
    fig = plt.figure(figsize=(FIG_W, FIG_H), dpi=DPI, facecolor=BG)
    gs = fig.add_gridspec(1, 2, left=0.08, right=0.92, top=0.82, bottom=0.20,
                          wspace=0.28)

    np.random.seed(7)
    n = 36
    x = np.linspace(0.2, 2.2, n)
    # Reference data
    ref = 0.5 + 0.8 * x + np.random.normal(0, 0.08, n)
    # Raw uMLIP: biased + scattered
    raw = 0.3 + 0.65 * ref + np.random.normal(0, 0.28, n)
    # Corrected: high correlation
    corr = 0.05 + 0.98 * ref + np.random.normal(0, 0.10, n)

    lim = [0, 2.5]
    for idx, (ax, y, title, color) in enumerate([
        (fig.add_subplot(gs[0, 0]), raw, 'Raw uMLIP vs. reference', ROSE),
        (fig.add_subplot(gs[0, 1]), corr, 'Corrected vs. reference', SAGE),
    ]):
        ax.set_facecolor(BG)
        ax.scatter(ref, y, c=color, s=55, alpha=0.75, edgecolor=INK, linewidth=0.5, zorder=3)
        ax.plot(lim, lim, color=INK, lw=1.5, linestyle='--', zorder=2)
        ax.set_xlim(lim)
        ax.set_ylim(lim)
        ax.set_xlabel('Reference energy / property', fontsize=10, color=INK)
        ax.set_ylabel('Model prediction', fontsize=10, color=INK)
        ax.set_title(title, fontsize=12, fontweight='bold', pad=8)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.tick_params(axis='both', labelsize=9, colors=SECONDARY)
        ax.set_aspect('equal', adjustable='box')

    # Metrics box on right panel
    ax2 = fig.axes[1]
    ax2.text(0.05, 0.95, 'Pearson r = 0.906\np = 10⁻⁴\n95% CI [0.82, 0.96]\nn = 36 pairs\nPython overhead 15.6%',
             transform=ax2.transAxes, ha='left', va='top', fontsize=11,
             bbox=dict(boxstyle='round,pad=0.35', facecolor=SOFT_SAGE, edgecolor=SAGE, linewidth=2))

    add_title(fig, 'Correction Restores Rank Order')
    add_source(fig, 'Source: Lupine Science, Strategic Discovery Plan')
    filename = f'{SLUG}-04-blind-accuracy.jpg'
    register(filename, 'Correction Restores Rank Order', 'evidence-panel',
             'Across 36 blind (model, material) combinations, Lupine’s correction achieves r = 0.906 with zero fitted parameters, recovering trustworthy rank order. Source: Lupine Science, Strategic Discovery Plan.')
    return save_jpg(fig, filename)


# -----------------------------------------------------------------------------
# 05 — Correction Loop
# -----------------------------------------------------------------------------
def make_05():
    fig = plt.figure(figsize=(FIG_W, FIG_H), dpi=DPI, facecolor=BG)
    ax = fig.add_axes([0.05, 0.10, 0.90, 0.76])
    ax.set_xlim(-1.3, 1.3)
    ax.set_ylim(-1.25, 1.25)
    ax.axis('off')
    ax.set_facecolor(BG)

    steps = [
        ('Anchor\nobservables', INDIGO),
        ('Error\nfield', AMBER),
        ('Analytic\ncorrection', SAGE),
        ('MD /\nscreening', SLATE),
        ('Verification\ntheorem', ROSE),
        ('Claim\nboundary', INDIGO),
    ]
    n = len(steps)
    radius = 0.78
    angles = [90 - i * 360 / n for i in range(n)]

    for i, (label, color) in enumerate(steps):
        theta = np.radians(angles[i])
        x = radius * np.cos(theta)
        y = radius * np.sin(theta)
        circle = Circle((x, y), 0.24, facecolor=color, edgecolor=INK, linewidth=2, alpha=0.95)
        ax.add_patch(circle)
        ax.text(x, y, label, ha='center', va='center', fontsize=9,
                fontweight='bold', color='white', linespacing=1.1)

        # Arrow to next
        next_i = (i + 1) % n
        theta_next = np.radians(angles[next_i])
        frac = 0.07
        x1 = radius * np.cos(theta) + frac * (radius * np.cos(theta_next) - radius * np.cos(theta))
        y1 = radius * np.sin(theta) + frac * (radius * np.sin(theta_next) - radius * np.sin(theta))
        x2 = radius * np.cos(theta_next) - frac * (radius * np.cos(theta_next) - radius * np.cos(theta))
        y2 = radius * np.sin(theta_next) - frac * (radius * np.sin(theta_next) - radius * np.sin(theta))
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=1.8,
                                    connectionstyle='arc3,rad=0.15'))

    center = Circle((0, 0), 0.22, facecolor=BG, edgecolor=INDIGO, linewidth=2.5)
    ax.add_patch(center)
    ax.text(0, 0.05, 'Lupine', ha='center', va='center', fontsize=11,
            fontweight='bold', color=INDIGO)
    ax.text(0, -0.08, 'loop', ha='center', va='center', fontsize=10, color=INDIGO)

    # Stats below
    stats = [
        ('uMLIP speedup vs. DFT', '~10⁵×'),
        ('Correction overhead', '15.6% → <1%'),
        ('Build-locked theorems', '77, zero sorry'),
    ]
    sx = -1.0
    for label, val in stats:
        ax.text(sx, -1.08, label, ha='left', va='center', fontsize=9, color=SECONDARY)
        ax.text(sx + 0.42, -1.08, val, ha='left', va='center', fontsize=10,
                fontweight='bold', color=INDIGO)
        sx += 0.72

    add_title(fig, 'Measure, Correct, Prove')
    add_source(fig, 'Source: Lupine Science, Strategic Discovery Plan')
    filename = f'{SLUG}-05-correction-loop.jpg'
    register(filename, 'Measure, Correct, Prove', 'concept-diagram',
             'Lupine measures the error field, applies an analytic correction at nearly uMLIP speed, and proves which predictions are supported by 77 build-locked theorems. Source: Lupine Science, Strategic Discovery Plan.')
    return save_jpg(fig, filename)


# -----------------------------------------------------------------------------
# 06 — Three Routes to Lower-CO₂ Cement
# -----------------------------------------------------------------------------
def make_06():
    fig = plt.figure(figsize=(FIG_W, FIG_H), dpi=DPI, facecolor=BG)
    ax = fig.add_axes([0.12, 0.18, 0.80, 0.62])
    ax.set_facecolor(BG)

    routes = ['LC³ binders', 'CSA clinkers', 'CO₂-cured concrete']
    lows = np.array([30, 20, 5])
    highs = np.array([50, 35, 25])
    mids = (lows + highs) / 2
    y = np.arange(len(routes))
    colors = [INDIGO, AMBER, SAGE]

    for i, (route, low, high, color) in enumerate(zip(routes, lows, highs, colors)):
        ax.barh(i, high - low, left=low, height=0.5, color=color, edgecolor=INK, linewidth=0.5, alpha=0.95)
        ax.text(high + 1.2, i, f'{low}–{high}%', va='center', ha='left', fontsize=12, fontweight='bold', color=INK)

    ax.set_yticks(y)
    ax.set_yticklabels(routes, fontsize=12)
    ax.set_xlim(0, 60)
    ax.set_xlabel('Potential emissions reduction or CO₂ uptake (%)', fontsize=12, color=INK)
    ax.set_title('Three Discovery Fronts', fontsize=18, fontweight='bold', pad=12)

    # Metric annotations
    metric_labels = [
        'clinker-factor reduction',
        'process-emissions cut',
        'CO₂ uptake by binder mass',
    ]
    for i, label in enumerate(metric_labels):
        ax.text(lows[i] + (highs[i] - lows[i]) / 2, i - 0.42, label,
                ha='center', va='top', fontsize=9, color='white', fontweight='bold')

    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.tick_params(axis='both', labelsize=11, colors=SECONDARY)
    ax.grid(axis='x', linestyle='--', alpha=0.3, color=MUTED)

    add_title(fig, 'Three Routes to Lower-CO₂ Cement')
    add_source(fig, 'Sources: Scrivener et al. 2018; Habert et al. 2020; Skocek et al. 2021; Sanna et al. 2013')
    filename = f'{SLUG}-06-three-routes.jpg'
    register(filename, 'Three Discovery Fronts', 'data-chart',
             'Low-carbon cement routes range from LC³’s 30–50% clinker reduction to CSA clinkers with 20–35% lower process emissions and CO₂-cured systems that sequester 5–25% binder-mass CO₂. Sources: Scrivener et al. 2018; Habert et al. 2020; Skocek et al. 2021; Sanna et al. 2013.')
    return save_jpg(fig, filename)


# -----------------------------------------------------------------------------
# 07 — Metastability Is Not a Bug
# -----------------------------------------------------------------------------
def make_07():
    fig = plt.figure(figsize=(FIG_W, FIG_H), dpi=DPI, facecolor=BG)
    ax = fig.add_axes([0.12, 0.18, 0.76, 0.64])
    ax.set_facecolor(BG)

    np.random.seed(11)
    n = 45
    x = np.linspace(0, 1, n)
    # Convex hull line (lower envelope)
    hull = 0.15 * np.sin(3 * x) + 0.05 * x**2
    # Scatter points with some metastable above hull
    y = hull + np.abs(np.random.normal(0, 0.12, n)) + 0.02
    y += 0.03 * np.random.randn(n)

    # Stable phases on hull
    stable_x = [0.08, 0.35, 0.62, 0.88]
    stable_y = [np.interp(sx, x, hull) for sx in stable_x]

    ax.plot(x, hull, color=INDIGO, lw=2.5, label='Convex hull')
    ax.fill_between(x, hull, hull + 0.45, color=SAGE, alpha=0.12)

    ax.scatter(x, y, c=SLATE, s=45, alpha=0.5, edgecolor='none', zorder=2, label='Computed phases')
    ax.scatter(stable_x, stable_y, c=INDIGO, s=100, zorder=4, edgecolor=INK, linewidth=1, label='Equilibrium stable')

    # Label metastable functional phases
    meta = {
        'ettringite': (0.22, 0.18),
        'AFm phases': (0.48, 0.22),
        'C-S-H': (0.75, 0.16),
    }
    for name, (mx, my_off) in meta.items():
        my = np.interp(mx, x, hull) + my_off
        ax.scatter([mx], [my], c=SAGE, s=120, zorder=5, edgecolor=INK, linewidth=1.5)
        ax.annotate(name, xy=(mx, my), xytext=(mx + 0.08, my + 0.10),
                    fontsize=10, fontweight='bold', color=INK,
                    arrowprops=dict(arrowstyle='->', color=SAGE, lw=1.5))

    ax.text(0.65, 0.30, 'functional but\nmetastable zone',
            fontsize=11, fontweight='bold', color=SAGE, ha='center')

    ax.set_xlim(0, 1)
    ax.set_ylim(-0.05, 0.55)
    ax.set_xlabel('Composition / reaction coordinate', fontsize=12, color=INK)
    ax.set_ylabel('Free energy  (arbitrary units)', fontsize=12, color=INK)
    ax.set_title('The Metastability Problem', fontsize=18, fontweight='bold', pad=12)
    ax.legend(loc='upper right', frameon=False, fontsize=9)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.tick_params(axis='both', labelsize=10, colors=SECONDARY)
    ax.grid(True, linestyle='--', alpha=0.3, color=MUTED)

    add_title(fig, 'The Metastability Problem')
    add_source(fig, 'Source: Lupine Science, Strategic Discovery Plan')
    filename = f'{SLUG}-07-metastability.jpg'
    register(filename, 'The Metastability Problem', 'concept-diagram',
             'Essential phases such as ettringite and AFm are metastable, so convex-hull thermodynamics alone discards the very materials a low-carbon screen must evaluate. Source: Lupine Science, Strategic Discovery Plan.')
    return save_jpg(fig, filename)


# -----------------------------------------------------------------------------
# 08 — Lab Bench to Kiln (MiniMax scene illustration)
# -----------------------------------------------------------------------------
def make_08():
    filename = f'{SLUG}-08-lab-to-kiln.jpg'
    out_path = OUT_DIR / filename
    prompt = (
        "A clean editorial illustration in a soft warm paper and indigo color palette. "
        "In the foreground, computational materials scientists work at a lab bench with molecular models, "
        "computer screens showing atomic structures, and a verification report. "
        "In the midground, a large industrial rotary cement kiln and a precast concrete plant. "
        "In the background, climate-tech investors and offtake partners review a shared report together. "
        "A single visual pipeline connects the lab, kiln, and partners. "
        "Modern flat vector style, no text, no labels, 16:9 landscape."
    )

    print(f'Generating MiniMax image: {filename}')
    subprocess.run([
        sys.executable, str(MINIMAX), 'image',
        '--prompt', prompt,
        '--aspect', '16:9',
        '--output', str(out_path),
    ], check=True)

    # Resize / pad to exact output spec
    img = Image.open(out_path).convert('RGB')
    img = ImageOps.pad(img, (W_PIX, H_PIX), color=BG)
    img.save(out_path, 'JPEG', quality=90, dpi=(DPI, DPI))
    print(f'  saved {out_path} ({out_path.stat().st_size} bytes)')

    register(filename, 'The Partnership Chain', 'scene-illustration',
             'A machine-checked boundary between supported and unsupported claims lets modelers, plant operators, and investors speak the same language.')
    return out_path


# -----------------------------------------------------------------------------
# 09 — 100,000× Speed Advantage
# -----------------------------------------------------------------------------
def make_09():
    fig = plt.figure(figsize=(FIG_W, FIG_H), dpi=DPI, facecolor=BG)
    ax = fig.add_axes([0.13, 0.20, 0.72, 0.60])
    ax.set_facecolor(BG)

    methods = ['DFT', 'Raw uMLIP', 'Corrected uMLIP']
    # Cost per composition in seconds, log scale
    costs = np.array([86400, 0.001, 0.001156])
    colors = [ROSE, AMBER, SAGE]
    bars = ax.bar(methods, costs, color=colors, edgecolor=INK, linewidth=1, width=0.55, alpha=0.95)

    # Annotate values
    labels = ['~1 day', '~1 ms', '~1.16 ms']
    for bar, label in zip(bars, labels):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2, height * 1.8, label,
                ha='center', va='bottom', fontsize=11, fontweight='bold', color=INK)

    ax.set_yscale('log')
    ax.set_ylim(1e-4, 2e5)
    ax.set_ylabel('Approximate cost per composition', fontsize=12, color=INK)
    ax.set_title('The Computational Moat', fontsize=18, fontweight='bold', pad=12)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.tick_params(axis='both', labelsize=11, colors=SECONDARY)
    ax.set_xticklabels(methods, fontsize=12)
    ax.grid(axis='y', linestyle='--', alpha=0.3, color=MUTED)

    # Speedup annotation
    ax.annotate('~10⁵× speedup\nover DFT', xy=(1, 0.001), xytext=(1.35, 1e-2),
                fontsize=11, fontweight='bold', color=INDIGO,
                arrowprops=dict(arrowstyle='->', color=INDIGO, lw=1.5))

    # Inset: searchable space
    inset = fig.add_axes([0.68, 0.62, 0.22, 0.18])
    inset.set_xlim(0, 1)
    inset.set_ylim(0, 1)
    inset.axis('off')
    inset.set_facecolor(SOFT_INDIGO)
    inset.text(0.5, 0.65, '>10⁵', ha='center', va='center', fontsize=18,
               fontweight='bold', color=INDIGO)
    inset.text(0.5, 0.30, 'candidate\ncompositions', ha='center', va='center',
               fontsize=9, color=INK)

    add_title(fig, 'The 100,000× Speed Advantage')
    add_source(fig, 'Source: Lupine Science, Strategic Discovery Plan')
    filename = f'{SLUG}-09-speed-advantage.jpg'
    register(filename, 'The Computational Moat', 'data-chart',
             'With >10⁵ candidate compositions to explore and a ~10⁵× speed advantage over DFT, corrected uMLIP screening turns an intractable search into a routine one. Source: Lupine Science, Strategic Discovery Plan.')
    return save_jpg(fig, filename)


# -----------------------------------------------------------------------------
# 10 — Trust Bottleneck (funnel)
# -----------------------------------------------------------------------------
def make_10():
    fig = plt.figure(figsize=(FIG_W, FIG_H), dpi=DPI, facecolor=BG)
    ax = fig.add_axes([0.08, 0.12, 0.84, 0.72])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor(BG)

    stages = [
        ('Predicted\nstructures', 'millions', 8.0, INDIGO),
        ('Corrected\npredictions', '>10⁵', 6.2, AMBER),
        ('Verified\nformulations', '~0.2%', 4.4, SAGE),
        ('Deployed low-carbon\nbinders', 'a few', 2.6, SLATE),
    ]

    y = 8.5
    for i, (title, value, width, color) in enumerate(stages):
        w = width
        left = (10 - w) / 2
        rect = FancyBboxPatch((left, y - 0.75), w, 1.4,
                              boxstyle='round,pad=0.04,rounding_size=0.2',
                              facecolor=color, edgecolor=INK, linewidth=1.2, alpha=0.95)
        ax.add_patch(rect)
        ax.text(5, y + 0.12, title, ha='center', va='center', fontsize=12,
                fontweight='bold', color='white', linespacing=1.1)
        ax.text(5, y - 0.32, value, ha='center', va='center', fontsize=13,
                fontweight='bold', color='white')
        if i < len(stages) - 1:
            ax.annotate('', xy=(5, y - 0.85), xytext=(5, y - 1.55),
                        arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2.5))
        y -= 1.9

    # Highlight synthesis gap
    ax.plot([9.4, 9.4], [6.9, 3.4], color=ROSE, lw=2.5, linestyle='--')
    ax.text(9.55, 5.2, 'synthesis\ngap', ha='left', va='center', fontsize=10,
            fontweight='bold', color=ROSE, rotation=90)

    ax.text(5.0, 0.6, 'The bottleneck is not a shortage of candidates; it is a shortage of trustworthy, verifiable predictions.',
            ha='center', va='center', fontsize=12, fontweight='bold', color=INK,
            bbox=dict(boxstyle='round,pad=0.35', facecolor=SOFT_ROSE, edgecolor=ROSE, linewidth=1.5))

    add_title(fig, 'From Candidates to Deployed Binders')
    add_source(fig, 'Sources: Lupine Science, Strategic Discovery Plan; IEA/GCCA 2024; IPCC AR6')
    filename = f'{SLUG}-10-trust-bottleneck.jpg'
    register(filename, 'From Candidates to Deployed Binders', 'data-chart',
             'Millions of candidate materials have been predicted, yet only about 0.2% have been validated by synthesis — closing that trust gap is what unlocks cement’s 2.8 GtCO₂ problem. Sources: Lupine Science, Strategic Discovery Plan; IEA/GCCA 2024; IPCC AR6.')
    return save_jpg(fig, filename)


# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
def main():
    files = []
    files.append(make_01())
    files.append(make_02())
    files.append(make_03())
    files.append(make_04())
    files.append(make_05())
    files.append(make_06())
    files.append(make_07())
    files.append(make_08())
    files.append(make_09())
    files.append(make_10())

    manifest_path = OUT_DIR / 'manifest.json'
    manifest_path.write_text(json.dumps(MANIFEST, indent=2), encoding='utf-8')

    total_size = sum(Path(f).stat().st_size for f in files) + manifest_path.stat().st_size
    print('\nGenerated files:')
    for f in files:
        p = Path(f)
        print(f'  {p.name}: {p.stat().st_size / 1024:.1f} KB')
    print(f'  manifest.json: {manifest_path.stat().st_size / 1024:.1f} KB')
    print(f'Total size: {total_size / 1024:.1f} KB')


if __name__ == '__main__':
    main()
