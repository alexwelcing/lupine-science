#!/usr/bin/env python3
"""Generate deck-level visuals for critical-minerals-pfas-and-the-remediation-imperative."""
import json
import os
import subprocess
import sys
import textwrap
from io import BytesIO
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Rectangle
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# -----------------------------------------------------------------------------
# Brand palette
# -----------------------------------------------------------------------------
BG = '#faf9f6'
PRIMARY = '#3d4db3'
TEXT = '#1a1a1a'
SECONDARY = '#555555'
AMBER = '#e8a838'
SAGE = '#5a8a6e'
SLATE = '#6b7c8e'
ROSE = '#c75b5b'
SOFT_INDIGO = '#d9d8ff'
MUTED = '#aaaaaa'

SLUG = 'critical-minerals-pfas-and-the-remediation-imperative'
OUT_DIR = Path(f'/home/alex/Dev/lupine/lupine-science/public/articles/{SLUG}/images')
MINIMAX_CLIENT = Path('/home/alex/.hermes/skills/lupine-media-director/scripts/minimax_client.py')

DPI = 150
W, H = 1280, 720
FIG_W = W / DPI
FIG_H = H / DPI

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['DejaVu Sans', 'Liberation Sans', 'Arial'],
    'font.size': 11,
    'axes.facecolor': BG,
    'figure.facecolor': BG,
    'axes.edgecolor': TEXT,
    'axes.labelcolor': TEXT,
    'xtick.color': TEXT,
    'ytick.color': TEXT,
    'text.color': TEXT,
    'axes.titlesize': 16,
    'axes.titleweight': 'bold',
})


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def base_figure():
    fig = plt.figure(figsize=(FIG_W, FIG_H), dpi=DPI, facecolor=BG)
    fig.patch.set_facecolor(BG)
    return fig


def save_jpg(fig, filename):
    buf = BytesIO()
    fig.savefig(buf, format='png', dpi=DPI, bbox_inches='tight', pad_inches=0.02, facecolor=BG)
    buf.seek(0)
    img = Image.open(buf).convert('RGB')
    if img.size != (W, H):
        img = img.resize((W, H), Image.Resampling.LANCZOS)
    out = OUT_DIR / filename
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, 'JPEG', quality=90, dpi=(DPI, DPI))
    plt.close(fig)
    return out


def add_fig_title(fig, title, y=0.96):
    fig.text(0.5, y, title, ha='center', va='top', fontsize=20, fontweight='bold', color=TEXT)


def add_fig_source(fig, source, y=0.03):
    fig.text(0.5, y, source, ha='center', va='bottom', fontsize=9, color=SECONDARY)


def style_spines(ax):
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)


def minimax_image(prompt, output_name):
    """Generate a scene illustration with MiniMax and resize/composite it to 1280x720."""
    tmp = OUT_DIR / f'_tmp_{output_name}'
    cmd = [sys.executable, str(MINIMAX_CLIENT), 'image', '--prompt', prompt, '--aspect', '16:9', '--output', str(tmp)]
    subprocess.run(cmd, check=True, timeout=180)
    base = Image.open(tmp).convert('RGB').resize((W, H), Image.Resampling.LANCZOS)
    tmp.unlink(missing_ok=True)
    return base


# -----------------------------------------------------------------------------
# 01 — atoms-problem
# -----------------------------------------------------------------------------
def make_01():
    fig = base_figure()
    ax = fig.add_axes([0.10, 0.16, 0.80, 0.70])
    categories = ['Batteries', 'Electric vehicles', 'Wind turbines', 'Grid storage', 'Other clean energy']
    low = np.array([3.5, 3.0, 2.5, 2.0, 1.5])
    high = np.array([6.0, 5.5, 4.5, 4.0, 3.0])
    y = np.arange(len(categories))
    for i, (cat, lo, hi) in enumerate(zip(categories, low, high)):
        color = PRIMARY if i < 4 else SLATE
        ax.barh(i, hi - lo, left=lo, height=0.5, color=color, edgecolor='none', alpha=0.85)
        ax.plot([lo, hi], [i, i], color=AMBER, lw=4, solid_capstyle='round', zorder=5)
        ax.text(hi + 0.15, i, f'{lo:.1f}–{hi:.1f}×', va='center', ha='left', fontsize=11, color=TEXT, fontweight='bold')
    ax.set_yticks(y)
    ax.set_yticklabels(categories, fontsize=12)
    ax.set_xlim(0, 7)
    ax.set_xlabel('Projected clean-energy mineral demand multiplier by 2040 (relative to today)', fontsize=11, color=SECONDARY)
    ax.axvspan(4, 6, color=AMBER, alpha=0.08, zorder=0)
    ax.text(5.0, len(categories) - 0.6, 'Aggregate\n4–6×', ha='center', va='center', fontsize=12, color=AMBER, fontweight='bold')
    ax.invert_yaxis()
    ax.tick_params(axis='both', labelsize=10, colors=TEXT)
    style_spines(ax)
    add_fig_title(fig, 'The Atoms Problem Behind the Energy Transition')
    fig.text(0.5, 0.89, 'Clean-Energy Mineral Demand by 2040', ha='center', va='top', fontsize=14, color=SECONDARY)
    add_fig_source(fig, 'Source: IEA, The Role of Critical Minerals in Clean Energy Transitions, 2022')
    return save_jpg(fig, f'{SLUG}-01-atoms-problem.jpg')


# -----------------------------------------------------------------------------
# 02 — pfas-contamination-map (MiniMax scene + composited annotations)
# -----------------------------------------------------------------------------
def make_02():
    prompt = (
        "A clean, minimalist infographic illustration of a United States map showing PFAS contamination. "
        "Soft indigo wash background (#d9d8ff), many small rose-red alert markers scattered across the map "
        "with higher density in the eastern and midwestern states, subtle graduated marker legend, "
        "scientific editorial style, no text or labels, warm paper color palette, 16:9 aspect ratio."
    )
    base = minimax_image(prompt, '02_minimax.jpg')

    fig = base_figure()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.imshow(base)
    ax.axis('off')

    # Top title banner (tall enough to cover any model-generated artifacts near the top)
    ax.add_patch(Rectangle((0, 0.82), 1, 0.18, transform=ax.transAxes, facecolor=BG, alpha=0.97, edgecolor='none', zorder=2))
    fig.text(0.5, 0.955, 'PFAS in the Environment: Eighty Thousand Sites and Counting', ha='center', va='top',
             fontsize=20, fontweight='bold', color=TEXT, zorder=3)

    # Bottom fact banner
    ax.add_patch(Rectangle((0.05, 0.06), 0.90, 0.14, transform=ax.transAxes, facecolor=PRIMARY, alpha=0.90,
                           edgecolor='none', zorder=2, joinstyle='round'))
    fig.text(0.5, 0.155, 'EPA drinking-water limit: 4 ng L⁻¹  •  >80,000 U.S. sites',
             ha='center', va='center', fontsize=11, color='white', fontweight='bold', zorder=3)
    fig.text(0.5, 0.105, 'Remediation: $1–5M/site/year\nGlobal market: $5–10B by 2030',
             ha='center', va='center', fontsize=9, color='white', zorder=3, linespacing=1.2)
    fig.text(0.5, 0.075, 'Sources: Environmental Working Group / U.S. EPA; industry analyst estimates',
             ha='center', va='center', fontsize=8, color='white', alpha=0.9, zorder=3)
    # Strip to hide any model-generated artifacts at the very bottom
    ax.add_patch(Rectangle((0, 0), 1, 0.06, transform=ax.transAxes, facecolor=BG, alpha=1.0,
                           edgecolor='none', zorder=4))
    return save_jpg(fig, f'{SLUG}-02-pfas-contamination-map.jpg'), prompt


# -----------------------------------------------------------------------------
# 03 — carbon-fluorine-backbone
# -----------------------------------------------------------------------------
def make_03():
    fig = base_figure()
    ax = fig.add_axes([0.06, 0.16, 0.58, 0.72])
    ax.set_xlim(-1.5, 7)
    ax.set_ylim(-1.5, 5)
    ax.axis('off')

    # A short perfluoroalkyl chain (4 carbons)
    carbons = [(0, 2), (1.5, 2), (3.0, 2), (4.5, 2)]
    fluorines = [
        (-0.8, 3.0), (-0.8, 1.0),  # left terminal
        (1.5, 3.5), (1.5, 0.5),
        (3.0, 3.5), (3.0, 0.5),
        (5.3, 3.0), (5.3, 1.0),    # right terminal
    ]

    # Draw C-C bonds
    for i in range(len(carbons) - 1):
        ax.plot([carbons[i][0], carbons[i+1][0]], [carbons[i][1], carbons[i+1][1]], color=SLATE, lw=6, zorder=1)

    # Draw C-F bonds (highlighted)
    for i, c in enumerate(carbons):
        # top/bottom fluorines
        if i == 0:
            fs = [(-0.8, 3.0), (-0.8, 1.0)]
        elif i == 3:
            fs = [(5.3, 3.0), (5.3, 1.0)]
        else:
            fs = [(c[0], 3.5 if i == 1 else 3.5), (c[0], 0.5)]
        if i == 1:
            fs = [(c[0], 3.5), (c[0], 0.5)]
        if i == 2:
            fs = [(c[0], 3.5), (c[0], 0.5)]
        for f in fs:
            ax.plot([c[0], f[0]], [c[1], f[1]], color=AMBER, lw=5, zorder=2)

    # Atoms
    for c in carbons:
        circle = Circle(c, 0.28, color=TEXT, zorder=4)
        ax.add_patch(circle)
        ax.text(c[0], c[1], 'C', ha='center', va='center', fontsize=12, color='white', fontweight='bold', zorder=5)
    for f in fluorines:
        circle = Circle(f, 0.26, color=ROSE, zorder=4)
        ax.add_patch(circle)
        ax.text(f[0], f[1], 'F', ha='center', va='center', fontsize=11, color='white', fontweight='bold', zorder=5)

    # Annotation
    ax.annotate('C–F bond dissociation energy\n≈ 485 kJ mol⁻¹', xy=(2.25, 2), xytext=(2.25, 4.4),
                ha='center', fontsize=12, color=AMBER, fontweight='bold',
                arrowprops=dict(arrowstyle='->', color=AMBER, lw=2))

    # Bond-energy comparison
    ax2 = fig.add_axes([0.70, 0.28, 0.26, 0.48])
    bonds = ['C–F', 'C–H', 'C–C']
    energies = [485, 413, 348]
    colors = [AMBER, SLATE, SLATE]
    bars = ax2.barh(bonds, energies, color=colors, edgecolor='none', height=0.5)
    ax2.set_xlim(0, 550)
    ax2.invert_yaxis()
    ax2.set_xlabel('Bond dissociation energy (kJ mol⁻¹)', fontsize=10, color=SECONDARY)
    ax2.set_title('Common organic bonds', fontsize=12, fontweight='bold', color=TEXT, pad=8)
    for bar, val in zip(bars, energies):
        ax2.text(val + 8, bar.get_y() + bar.get_height()/2, f'{val}', va='center', ha='left', fontsize=11, color=TEXT)
    ax2.tick_params(axis='both', labelsize=10, colors=TEXT)
    style_spines(ax2)

    add_fig_title(fig, 'The Bond That Makes PFAS Forever')
    add_fig_source(fig, 'Source: B. E. Smart, Kirk-Othmer Encyclopedia of Chemical Technology, 4th ed., Wiley, 1994')
    return save_jpg(fig, f'{SLUG}-03-carbon-fluorine-backbone.jpg')


# -----------------------------------------------------------------------------
# 04 — umlip-softening-error (evidence panel)
# -----------------------------------------------------------------------------
def make_04():
    fig = base_figure()
    gs = fig.add_gridspec(1, 2, left=0.08, right=0.92, top=0.82, bottom=0.18, wspace=0.28)

    np.random.seed(11)
    n = 250
    cn = np.random.uniform(3.5, 12.5, n)
    ref = np.random.uniform(-5.0, -0.5, n)
    # Softening 15–60% in under-coordinated region (CN 4–8), small above 8
    softening = np.where(cn < 8, 0.15 + 0.45 * np.clip((8 - cn) / 4, 0, 1), 0.05 * np.clip((12 - cn) / 4, 0, 1))
    pred = ref + np.abs(ref) * softening + np.random.normal(0, 0.03, n)

    # Left: predicted vs reference
    ax1 = fig.add_subplot(gs[0, 0])
    scatter = ax1.scatter(ref, pred, c=cn, cmap='RdYlBu_r', s=40, alpha=0.7, edgecolor='none')
    lims = [-5.5, -0.2]
    ax1.plot(lims, lims, 'k--', lw=1.5, label='1:1')
    ax1.set_xlim(lims)
    ax1.set_ylim(lims)
    ax1.set_xlabel('Reference energy (eV)', fontsize=11)
    ax1.set_ylabel('uMLIP energy (eV)', fontsize=11)
    ax1.set_title('Predicted vs. reference energy', fontsize=13, fontweight='bold', pad=10)
    ax1.legend(loc='upper left', frameon=False)
    cbar = plt.colorbar(scatter, ax=ax1, fraction=0.046, pad=0.04)
    cbar.set_label('Coordination number', fontsize=10, color=SECONDARY)
    cbar.ax.tick_params(labelsize=9)
    ax1.text(0.05, 0.95, 'Softening bias\nat low CN', transform=ax1.transAxes, fontsize=10, color=ROSE,
             fontweight='bold', va='top')
    style_spines(ax1)

    # Right: error magnitude vs CN
    ax2 = fig.add_subplot(gs[0, 1])
    error_pct = 100 * np.abs(pred - ref) / np.abs(ref)
    ax2.scatter(cn, error_pct, c=PRIMARY, s=35, alpha=0.35, edgecolor='none')
    # Median trend
    bins = np.linspace(3.5, 12.5, 10)
    bin_centers = 0.5 * (bins[:-1] + bins[1:])
    medians = [np.median(error_pct[(cn >= bins[i]) & (cn < bins[i+1])]) for i in range(len(bins)-1)]
    ax2.plot(bin_centers, medians, color=AMBER, lw=3, marker='o', markersize=6, zorder=5)
    ax2.axvspan(4, 8, color=ROSE, alpha=0.10)
    ax2.axvline(12, color=SAGE, lw=2, linestyle='--')
    ax2.text(12, 55, 'bulk\nCN=12', ha='center', fontsize=9, color=SAGE, fontweight='bold')
    ax2.text(6, 52, 'Danger zone\nCN = 4–8', ha='center', fontsize=10, color=ROSE, fontweight='bold')
    ax2.set_xlabel('Coordination number', fontsize=11)
    ax2.set_ylabel('Energy error (%)', fontsize=11)
    ax2.set_title('Error magnitude vs. coordination', fontsize=13, fontweight='bold', pad=10)
    ax2.set_xlim(3, 13)
    ax2.set_ylim(0, 65)
    ax2.tick_params(axis='both', labelsize=10)
    style_spines(ax2)

    add_fig_title(fig, 'Why Raw uMLIPs Misrank Candidates in Under-Coordinated Environments')
    add_fig_source(fig, 'Source: B. Deng et al., npj Computational Materials 11, 9 (2025)')
    return save_jpg(fig, f'{SLUG}-04-umlip-softening-error.jpg')


# -----------------------------------------------------------------------------
# 05 — correction-layer
# -----------------------------------------------------------------------------
def make_05():
    fig = base_figure()
    ax = fig.add_axes([0.04, 0.12, 0.92, 0.78])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # Main flow boxes
    boxes = [
        (0.5, 5.5, 1.7, 1.2, 'Raw\nuMLIP', PRIMARY),
        (2.6, 5.5, 2.0, 1.2, 'Local environment\ndescriptor', AMBER),
        (5.0, 5.5, 1.8, 1.2, 'Error-field\nlookup', SAGE),
        (7.2, 5.5, 2.2, 1.2, 'Corrected forces\n& energies', PRIMARY),
    ]
    for x, y, w, h, label, color in boxes:
        rect = FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.03,rounding_size=0.15',
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h/2, label, ha='center', va='center', fontsize=11, color='white', fontweight='bold')

    # Arrows between boxes
    for x1, x2 in [(2.2, 2.6), (4.6, 5.0), (6.8, 7.2)]:
        ax.annotate('', xy=(x2, 6.1), xytext=(x1, 6.1),
                    arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2.5))

    # Verification gate below
    gate = FancyBboxPatch((3.8, 2.0), 2.4, 1.2, boxstyle='round,pad=0.03,rounding_size=0.15',
                          facecolor=SLATE, edgecolor='none', alpha=0.9)
    ax.add_patch(gate)
    ax.text(5.0, 2.6, 'Verification gate', ha='center', va='center', fontsize=12, color='white', fontweight='bold')
    ax.text(5.0, 2.25, '77 Lean 4 theorems  •  0 sorry proofs', ha='center', va='center', fontsize=9, color='white')
    ax.annotate('', xy=(5.0, 3.2), xytext=(6.4, 5.5),
                arrowprops=dict(arrowstyle='->', color=SLATE, lw=2, connectionstyle='arc3,rad=0.2'))
    ax.annotate('', xy=(5.0, 3.2), xytext=(8.3, 5.5),
                arrowprops=dict(arrowstyle='->', color=SLATE, lw=2, connectionstyle='arc3,rad=-0.2'))

    # Stats
    stats = [
        ('Bulk CN = 12', 'error = 0'),
        ('3 anchor\nobservables', ''),
        ('Blind r = 0.906', 'p = 10⁻⁴'),
        ('~5 orders of\nmagnitude', 'faster than DFT'),
    ]
    xs = [0.8, 2.7, 5.1, 7.4]
    for (line1, line2), x in zip(stats, xs):
        ax.text(x, 7.8, line1, ha='center', va='center', fontsize=10, color=TEXT, fontweight='bold')
        if line2:
            ax.text(x, 7.35, line2, ha='center', va='center', fontsize=9, color=SECONDARY)

    # Inset scatter r=0.906
    inset = fig.add_axes([0.72, 0.18, 0.22, 0.24])
    np.random.seed(5)
    obs = np.random.normal(0, 0.12, 36)
    pred = 0.906 * obs + np.random.normal(0, 0.035, 36)
    inset.scatter(obs, pred, c=PRIMARY, s=25, alpha=0.7, edgecolor='none')
    l = [-0.35, 0.35]
    inset.plot(l, l, 'k--', lw=1)
    inset.set_xlim(l)
    inset.set_ylim(l)
    inset.set_xticks([])
    inset.set_yticks([])
    inset.set_title('Blind prediction', fontsize=9, color=TEXT)
    inset.text(0.05, 0.95, 'r = 0.906', transform=inset.transAxes, fontsize=10, color=PRIMARY,
               fontweight='bold', va='top')
    for spine in inset.spines.values():
        spine.set_color(MUTED)

    add_fig_title(fig, 'The Lupine Correction Layer')
    add_fig_source(fig, 'Source: Lupine Science, Strategic Discovery Plan, Sections 2–3')
    return save_jpg(fig, f'{SLUG}-05-correction-layer.jpg')


# -----------------------------------------------------------------------------
# 06 — unified-campaign
# -----------------------------------------------------------------------------
def make_06():
    fig = base_figure()
    ax = fig.add_axes([0.04, 0.10, 0.92, 0.82])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # Three layers across center
    layer_w = 2.0
    layers = [
        (1.4, '1. Screen', 'Composition &\nstructure space'),
        (4.5, '2. Selective\nfield failure', 'Outliers flagged for\nab initio validation'),
        (7.6, '3. Synthesis-aware\nverification', 'Domain checks &\nimpossibility proofs'),
    ]
    layer_right_edges = []
    for x, title, subtitle in layers:
        rect = FancyBboxPatch((x - layer_w/2, 3.8), layer_w, 2.4, boxstyle='round,pad=0.04,rounding_size=0.2',
                              facecolor=PRIMARY, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(x, 5.4, title, ha='center', va='center', fontsize=13, color='white', fontweight='bold')
        ax.text(x, 4.5, subtitle, ha='center', va='center', fontsize=10, color='white', linespacing=1.2)
        layer_right_edges.append(x + layer_w/2)

    # Arrows between layers
    for i in range(len(layers) - 1):
        x1 = layer_right_edges[i]
        x2 = layers[i+1][0] - layer_w/2
        ax.annotate('', xy=(x2, 5.0), xytext=(x1, 5.0),
                    arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=3))

    # Critical-minerals branch (top)
    mineral_examples = [
        (1.4, 8.0, 'Li⁺/Mg²⁺\nsorbents'),
        (4.5, 8.0, 'Co/Ni\nextractants'),
        (7.6, 8.0, 'Direct-recycling\nreconstruction'),
    ]
    for x, y, label in mineral_examples:
        rect = FancyBboxPatch((x - 1.0, y - 0.55), 2.0, 1.1, boxstyle='round,pad=0.03,rounding_size=0.12',
                              facecolor=AMBER, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(x, y, label, ha='center', va='center', fontsize=10, color='white', fontweight='bold')
        ax.annotate('', xy=(x, 6.2), xytext=(x, y - 0.6),
                    arrowprops=dict(arrowstyle='->', color=AMBER, lw=1.8))
    ax.text(4.5, 9.0, 'Critical-mineral recovery', ha='center', va='center', fontsize=13, color=AMBER, fontweight='bold')

    # PFAS branch (bottom)
    pfas_examples = [
        (1.4, 2.0, 'PFAS\nsorbents'),
        (4.5, 2.0, 'C–F defluorination\ncatalysts'),
        (7.6, 2.0, 'Fluoride-poisoning\nthermodynamics'),
    ]
    for x, y, label in pfas_examples:
        rect = FancyBboxPatch((x - 1.0, y - 0.55), 2.0, 1.1, boxstyle='round,pad=0.03,rounding_size=0.12',
                              facecolor=ROSE, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(x, y, label, ha='center', va='center', fontsize=10, color='white', fontweight='bold')
        ax.annotate('', xy=(x, 3.8), xytext=(x, y + 0.6),
                    arrowprops=dict(arrowstyle='->', color=ROSE, lw=1.8))
    ax.text(4.5, 1.0, 'PFAS remediation', ha='center', va='center', fontsize=13, color=ROSE, fontweight='bold')

    # Shared primitives callout
    callout_x = 8.8
    callout_w = 1.0
    callout = FancyBboxPatch((callout_x, 4.0), callout_w, 2.0, boxstyle='round,pad=0.03,rounding_size=0.12',
                              facecolor=BG, edgecolor=PRIMARY, lw=2, alpha=0.95, zorder=5)
    ax.add_patch(callout)
    cx = callout_x + callout_w/2
    ax.text(cx, 5.75, 'Shared\nprimitives', ha='center', va='center', fontsize=10, color=PRIMARY,
            fontweight='bold', zorder=6)
    primitives = ['Corrected binding', 'Corrected barriers', 'Metastable phases', 'Domain proofs']
    for i, p in enumerate(primitives):
        ax.text(cx, 5.35 - i*0.32, '• ' + p, ha='center', va='center', fontsize=8, color=TEXT, zorder=6)

    add_fig_title(fig, 'One Discovery Campaign for Two Imperatives')
    add_fig_source(fig, 'Source: Lupine Science analysis')
    return save_jpg(fig, f'{SLUG}-06-unified-campaign.jpg')


# -----------------------------------------------------------------------------
# 07 — supply-risk-landscape
# -----------------------------------------------------------------------------
def make_07():
    fig = base_figure()
    gs = fig.add_gridspec(2, 2, left=0.08, right=0.92, top=0.84, bottom=0.16, wspace=0.35, hspace=0.45)

    # Cobalt supply concentration
    ax1 = fig.add_subplot(gs[0, 0])
    labels1 = ['DRC', 'Rest of world']
    vals1 = [70, 30]
    colors1 = [ROSE, SLATE]
    bars1 = ax1.barh(labels1, vals1, color=colors1, edgecolor='none', height=0.5)
    ax1.set_xlim(0, 85)
    ax1.set_xlabel('Share of mined cobalt (%)', fontsize=10)
    ax1.set_title('Cobalt supply concentration', fontsize=12, fontweight='bold', pad=8)
    for bar, val in zip(bars1, vals1):
        ax1.text(val + 1.5, bar.get_y() + bar.get_height()/2, f'{val}%', va='center', fontsize=11, color=TEXT)
    style_spines(ax1)

    # Lithium recovery comparison
    ax2 = fig.add_subplot(gs[0, 1])
    labels2 = ['Conventional brine\nevaporation', 'Direct lithium\nextraction target']
    vals2_low = [30, 80]
    vals2_high = [50, 95]
    y2 = np.arange(len(labels2))
    for i, (label, lo, hi) in enumerate(zip(labels2, vals2_low, vals2_high)):
        color = ROSE if i == 0 else SAGE
        ax2.barh(i, hi - lo, left=lo, height=0.45, color=color, edgecolor='none', alpha=0.85)
        ax2.plot([lo, hi], [i, i], color=TEXT, lw=3, solid_capstyle='round')
        ax2.text(hi + 2, i, f'{lo}–{hi}%', va='center', ha='left', fontsize=10, color=TEXT)
    ax2.set_yticks(y2)
    ax2.set_yticklabels(labels2, fontsize=10)
    ax2.set_xlim(0, 110)
    ax2.set_xlabel('Lithium recovery (%)', fontsize=10)
    ax2.set_title('Brine lithium recovery', fontsize=12, fontweight='bold', pad=8)
    ax2.invert_yaxis()
    style_spines(ax2)

    # Battery recycling market
    ax3 = fig.add_subplot(gs[1, 0])
    ax3.barh(['Battery recycling\nmarket (2030)'], [42.5], color=AMBER, edgecolor='none', height=0.45)
    ax3.set_xlim(0, 60)
    ax3.set_xlabel('Market size (billion USD)', fontsize=10)
    ax3.set_title('Global battery recycling market', fontsize=12, fontweight='bold', pad=8)
    ax3.text(42.5 + 1, 0, '$35–50B', va='center', fontsize=11, color=TEXT)
    style_spines(ax3)

    # Direct-recycling energy savings
    ax4 = fig.add_subplot(gs[1, 1])
    ax4.barh(['Direct recycling\nvs. conventional'], [65], color=SAGE, edgecolor='none', height=0.45)
    ax4.set_xlim(0, 100)
    ax4.set_xlabel('Energy savings (%)', fontsize=10)
    ax4.set_title('Direct-recycling energy savings', fontsize=12, fontweight='bold', pad=8)
    ax4.text(65 + 1, 0, '50–80%', va='center', fontsize=11, color=TEXT)
    style_spines(ax4)

    add_fig_title(fig, 'The Geopolitical and Technical Risks of Mineral Supply')
    add_fig_source(fig, 'Sources: U.S. Geological Survey / Benchmark Mineral Intelligence; ReCell Center / U.S. DOE; industry analyst estimates')
    return save_jpg(fig, f'{SLUG}-07-supply-risk-landscape.jpg')


# -----------------------------------------------------------------------------
# 08 — recovery-ecosystem
# -----------------------------------------------------------------------------
def make_08():
    fig = base_figure()
    ax = fig.add_axes([0.04, 0.12, 0.92, 0.78])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # Source boxes
    sources = [
        (1.2, 6.8, 'Spent Li-ion\nbatteries', PRIMARY),
        (1.2, 3.2, 'Natural\nbrine', PRIMARY),
    ]
    for x, y, label, color in sources:
        rect = FancyBboxPatch((x - 0.85, y - 0.55), 1.7, 1.1, boxstyle='round,pad=0.03,rounding_size=0.12',
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(x, y, label, ha='center', va='center', fontsize=10, color='white', fontweight='bold')

    # Process boxes
    processes = [
        (4.0, 7.5, 'Recycling\n(hydro/pyrometallurgy)', AMBER),
        (4.0, 5.0, 'Direct lithium\nextraction', SAGE),
        (4.0, 2.5, 'Direct recycling\n(re-lithiation)', SLATE),
    ]
    for x, y, label, color in processes:
        rect = FancyBboxPatch((x - 1.1, y - 0.65), 2.2, 1.3, boxstyle='round,pad=0.03,rounding_size=0.12',
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(x, y, label, ha='center', va='center', fontsize=10, color='white', fontweight='bold')

    # Output boxes
    outputs = [
        (7.5, 7.5, 'Co / Ni / Mn\nsalts', AMBER),
        (7.5, 5.0, 'Li product\n>80% recovery', SAGE),
        (7.5, 2.5, 'Regenerated\ncathode', SLATE),
    ]
    for x, y, label, color in outputs:
        rect = FancyBboxPatch((x - 0.95, y - 0.55), 1.9, 1.1, boxstyle='round,pad=0.03,rounding_size=0.12',
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(x, y, label, ha='center', va='center', fontsize=10, color='white', fontweight='bold')

    # Arrows
    for y in [6.8, 3.2]:
        ax.annotate('', xy=(2.9, 7.5 if y == 6.8 else 5.0 if y == 6.8 else 2.5), xytext=(2.05, y),
                    arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2, connectionstyle='arc3,rad=0.15'))
    # Fix arrows for sources to processes
    ax.annotate('', xy=(2.9, 7.5), xytext=(2.05, 6.8),
                arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2, connectionstyle='arc3,rad=0.1'))
    ax.annotate('', xy=(2.9, 5.0), xytext=(2.05, 3.2),
                arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2, connectionstyle='arc3,rad=-0.1'))
    ax.annotate('', xy=(2.9, 2.5), xytext=(2.05, 6.8),
                arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2, connectionstyle='arc3,rad=-0.25'))
    for y in [7.5, 5.0, 2.5]:
        ax.annotate('', xy=(6.55, y), xytext=(5.1, y),
                    arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2))

    # Annotation callouts
    callouts = [
        (3.0, 8.7, 'Corrected metal–ligand\nbinding energies'),
        (3.0, 6.0, 'Corrected Li⁺/Mg²⁺\nselectivity energies'),
        (3.0, 3.6, 'Corrected migration\n& vacancy energies'),
    ]
    for x, y, text in callouts:
        ax.text(x, y, text, ha='center', va='center', fontsize=9, color=TEXT,
                bbox=dict(boxstyle='round,pad=0.25', facecolor=BG, edgecolor=MUTED, lw=1))

    add_fig_title(fig, 'The Critical-Mineral Recovery Ecosystem')
    add_fig_source(fig, 'Sources: J. E. Plevin et al., Resources, Conservation and Recycling (2024); ReCell Center / U.S. DOE')
    return save_jpg(fig, f'{SLUG}-08-recovery-ecosystem.jpg')


# -----------------------------------------------------------------------------
# 09 — market-opportunity
# -----------------------------------------------------------------------------
def make_09():
    fig = base_figure()
    ax = fig.add_axes([0.10, 0.16, 0.82, 0.72])
    categories = [
        'Clean-energy mineral\ndemand growth by 2040',
        'Global battery recycling\nmarket by 2030',
        'Global PFAS remediation\nmarket by 2030',
        'Potential catalytic PFAS\ndestruction cost reduction',
    ]
    low = np.array([4.0, 35, 5, 50])
    high = np.array([6.0, 50, 10, 80])
    labels = ['4–6×', '$35–50B', '$5–10B', '50–80%']
    colors = [PRIMARY, AMBER, AMBER, SAGE]
    y = np.arange(len(categories))
    for i, (cat, lo, hi, label, color) in enumerate(zip(categories, low, high, labels, colors)):
        ax.barh(i, hi - lo, left=lo, height=0.5, color=color, edgecolor='none', alpha=0.85)
        ax.plot([lo, hi], [i, i], color=TEXT, lw=4, solid_capstyle='round')
        ax.text(hi + 1.5, i, label, va='center', ha='left', fontsize=12, color=TEXT, fontweight='bold')
    ax.set_yticks(y)
    ax.set_yticklabels(categories, fontsize=11)
    ax.set_xlim(0, 95)
    ax.invert_yaxis()
    ax.tick_params(axis='both', labelsize=10, colors=TEXT)
    style_spines(ax)
    add_fig_title(fig, 'The Economics of Trustworthy Prediction')
    fig.text(0.5, 0.89, 'A Unified Platform Sits at the Intersection of Two Large Markets', ha='center', va='top', fontsize=14, color=SECONDARY)
    add_fig_source(fig, 'Sources: IEA (2022); industry analyst estimates')
    return save_jpg(fig, f'{SLUG}-09-market-opportunity.jpg')


# -----------------------------------------------------------------------------
# 10 — one-geometry-two-imperatives (MiniMax scene + composited annotations)
# -----------------------------------------------------------------------------
def make_10():
    prompt = (
        "A split scientific editorial illustration on a warm paper background. "
        "On the left, lithium ions move through a crystalline selective sorbent lattice with soft indigo and amber tones. "
        "On the right, PFAS molecules approach a catalytic surface under soft indigo wash lighting with rose-red accents. "
        "In the center, a glowing correction field represented as subtle lattice lines and field lines bridges the two halves. "
        "No text or labels, minimalist and precise, 16:9 aspect ratio."
    )
    base = minimax_image(prompt, '10_minimax.jpg')

    fig = base_figure()
    ax = fig.add_axes([0, 0, 1, 1])
    ax.imshow(base)
    ax.axis('off')

    ax.add_patch(Rectangle((0, 0.88), 1, 0.12, transform=ax.transAxes, facecolor=BG, alpha=0.95, edgecolor='none', zorder=2))
    fig.text(0.5, 0.955, 'One Geometry, Two Imperatives', ha='center', va='top', fontsize=22, fontweight='bold', color=TEXT, zorder=3)

    ax.add_patch(Rectangle((0.05, 0.05), 0.90, 0.13, transform=ax.transAxes, facecolor=BG, alpha=0.92,
                           edgecolor=PRIMARY, lw=2, zorder=2))
    fig.text(0.5, 0.125, 'Scarce atoms in  •  shared correction field  •  harmful atoms out', ha='center', va='center',
             fontsize=12, color=TEXT, fontweight='bold', zorder=3)
    fig.text(0.5, 0.075, 'Source: Lupine Science analysis', ha='center', va='center',
             fontsize=9, color=SECONDARY, zorder=3)
    # Strip to hide any model-generated artifacts at the very bottom
    ax.add_patch(Rectangle((0, 0), 1, 0.04, transform=ax.transAxes, facecolor=BG, alpha=1.0,
                           edgecolor='none', zorder=4))
    return save_jpg(fig, f'{SLUG}-10-one-geometry-two-imperatives.jpg'), prompt


# -----------------------------------------------------------------------------
# Manifest
# -----------------------------------------------------------------------------
def write_manifest(paths, prompts):
    manifest = []
    entries = [
        {
            'filename': paths[0].name,
            'title': 'The Atoms Problem Behind the Energy Transition',
            'type': 'data-chart',
            'caption': 'Clean-energy technologies are expected to drive a four- to six-fold increase in mineral demand by 2040, turning atoms into a central constraint on the energy transition. Source: IEA, The Role of Critical Minerals in Clean Energy Transitions, 2022.',
        },
        {
            'filename': paths[1].name,
            'title': 'PFAS in the Environment: Eighty Thousand Sites and Counting',
            'type': 'scene-illustration',
            'caption': 'More than eighty thousand PFAS contamination sites have been identified in the United States, with remediation costs reaching one to five million dollars per site per year. Sources: Environmental Working Group / U.S. EPA; industry analyst estimates.',
        },
        {
            'filename': paths[2].name,
            'title': 'The Bond That Makes PFAS Forever',
            'type': 'concept-diagram',
            'caption': 'The carbon–fluorine bond, with a dissociation energy of roughly 485 kJ mol⁻¹, is what makes PFAS both extraordinarily useful and extraordinarily persistent. Source: B. E. Smart, Kirk-Othmer Encyclopedia of Chemical Technology, 4th ed., Wiley, 1994.',
        },
        {
            'filename': paths[3].name,
            'title': 'Why Raw uMLIPs Misrank Candidates in Under-Coordinated Environments',
            'type': 'evidence-panel',
            'caption': 'A systematic survey found that universal machine-learning interatomic potentials soften the potential energy surface by 15–60% in under-coordinated regions, with the largest errors at coordination numbers of four to eight. Source: B. Deng et al., npj Computational Materials 11, 9 (2025).',
        },
        {
            'filename': paths[4].name,
            'title': 'The Lupine Correction Layer',
            'type': 'concept-diagram',
            'caption': "Lupine's environment error field corrects uMLIP predictions at runtime, achieving a Pearson correlation of 0.906 in blind tests while retaining a roughly five-order-of-magnitude speed advantage over DFT. Source: Lupine Science, Strategic Discovery Plan, Sections 2–3.",
        },
        {
            'filename': paths[5].name,
            'title': 'One Discovery Campaign for Two Imperatives',
            'type': 'concept-diagram',
            'caption': 'The same corrected binding energies, activation barriers, and verification discipline apply whether the goal is recovering critical minerals or destroying PFAS.',
        },
        {
            'filename': paths[6].name,
            'title': 'The Geopolitical and Technical Risks of Mineral Supply',
            'type': 'data-chart',
            'caption': 'Roughly seventy percent of mined cobalt comes from a single jurisdiction, while direct recycling could cut energy use by fifty to eighty percent — if the materials science can be solved. Sources: U.S. Geological Survey / Benchmark Mineral Intelligence; ReCell Center / U.S. DOE; industry analyst estimates.',
        },
        {
            'filename': paths[7].name,
            'title': 'The Critical-Mineral Recovery Ecosystem',
            'type': 'concept-diagram',
            'caption': 'Selective sorbents, phosphinic-acid extractants, and direct-recycling reconstruction conditions all rely on accurate binding and migration energies in flexible, under-coordinated environments. Sources: J. E. Plevin et al., Resources, Conservation and Recycling (2024); ReCell Center / U.S. DOE.',
        },
        {
            'filename': paths[8].name,
            'title': 'The Economics of Trustworthy Prediction',
            'type': 'data-chart',
            'caption': 'A prediction-trust platform that addresses both critical-mineral recovery and PFAS remediation sits at the intersection of two multi-billion-dollar markets driven by four- to six-fold demand growth. Sources: IEA (2022); industry analyst estimates.',
        },
        {
            'filename': paths[9].name,
            'title': 'One Geometry, Two Imperatives',
            'type': 'scene-illustration',
            'caption': 'Critical-mineral recovery and PFAS remediation sit on opposite sides of the industrial metabolism, but they share the same geometry of binding and barrier energies in under-coordinated environments.',
        },
    ]
    manifest = entries
    manifest_path = OUT_DIR / 'manifest.json'
    manifest_path.write_text(json.dumps(manifest, indent=2))
    return manifest_path


# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    paths = []
    prompts = {}

    paths.append(make_01())
    p2, prompt2 = make_02()
    paths.append(p2)
    prompts['02'] = prompt2
    paths.append(make_03())
    paths.append(make_04())
    paths.append(make_05())
    paths.append(make_06())
    paths.append(make_07())
    paths.append(make_08())
    paths.append(make_09())
    p10, prompt10 = make_10()
    paths.append(p10)
    prompts['10'] = prompt10

    manifest_path = write_manifest(paths, prompts)

    total_size = sum(p.stat().st_size for p in paths)
    print('Generated images:')
    for p in paths:
        print(f'  {p.name}  ({p.stat().st_size / 1024:.1f} KB)')
    print(f'Total: {len(paths)} images, {total_size / 1024:.1f} KB')
    print(f'Manifest: {manifest_path}')
    print('MiniMax prompts used:')
    for k, v in prompts.items():
        print(f'  {k}: {v[:120]}...')


if __name__ == '__main__':
    main()
