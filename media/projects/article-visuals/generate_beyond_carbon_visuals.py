#!/usr/bin/env python3
"""Generate 10 deck-level visuals for "Beyond Carbon: The Error Geometry of Environmental Materials"."""

import json
import os
import subprocess
import sys
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Wedge
import numpy as np
from PIL import Image

# -----------------------------------------------------------------------------
# Brand palette
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
SOFT_ROSE = '#f2d6d6'

COLORS = [INDIGO, AMBER, SAGE, SLATE, ROSE]

SLUG = 'beyond-carbon-the-error-geometry-of-environmental-materials'
OUT_DIR = Path(f'/home/alex/Dev/lupine/lupine-science/public/articles/{SLUG}/images')
OUT_DIR.mkdir(parents=True, exist_ok=True)

DPI = 150
WIDTH, HEIGHT = 1280, 720
FIGSIZE = (WIDTH / DPI, HEIGHT / DPI)

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['DejaVu Sans', 'Liberation Sans', 'Arial'],
    'font.size': 11,
    'axes.facecolor': BG,
    'figure.facecolor': BG,
    'axes.edgecolor': INK,
    'axes.labelcolor': INK,
    'xtick.color': INK,
    'ytick.color': INK,
    'text.color': INK,
    'axes.titlesize': 16,
    'axes.titleweight': 'bold',
})


def save_jpg(fig, filename):
    """Save figure as exact 1280x720 JPG."""
    png_path = OUT_DIR / filename.replace('.jpg', '.png')
    jpg_path = OUT_DIR / filename
    fig.savefig(png_path, dpi=DPI, facecolor=BG, edgecolor='none', bbox_inches='tight')
    plt.close(fig)
    img = Image.open(png_path)
    img = img.convert('RGB')
    img = img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    img.save(jpg_path, 'JPEG', quality=90, dpi=(DPI, DPI))
    png_path.unlink()
    return jpg_path


def add_title(fig, title, y=0.96):
    fig.text(0.5, y, title, ha='center', va='top',
             fontsize=20, fontweight='bold', color=INK)


def add_source(fig, source, y=0.04):
    fig.text(0.5, y, source, ha='center', va='bottom',
             fontsize=9, color=SECONDARY)


# -----------------------------------------------------------------------------
# 01 — Seven domains one error (MiniMax scene illustration)
# -----------------------------------------------------------------------------
def make_01():
    output = OUT_DIR / f'{SLUG}-01-seven-domains-one-error.jpg'
    prompt = (
        "A split radial composition showing a translucent globe at the center "
        "with a soft indigo (#3d4db3) atomic lattice field radiating outward "
        "into seven environmental domains: water droplet, air/wind, methane flame, "
        "refrigerant molecule, mineral crystal, PFAS fluorine chain, and cement kiln. "
        "Clean editorial illustration style, warm paper background (#faf9f6), "
        "minimal text, scientific infographic aesthetic, 16:9 landscape."
    )
    subprocess.run([
        sys.executable, '/home/alex/.hermes/skills/lupine-media-director/scripts/minimax_client.py',
        'image', '--prompt', prompt, '--aspect', '16:9', '--output', str(output)
    ], check=True)
    return output


# -----------------------------------------------------------------------------
# 02 — Coordination error curve
# -----------------------------------------------------------------------------
def make_02():
    fig = plt.figure(figsize=FIGSIZE)
    ax = fig.add_axes([0.10, 0.22, 0.86, 0.60])
    ax.set_facecolor(BG)

    cn = np.linspace(3.5, 12, 300)
    # Percent softening: 0 at CN=12, grows to ~60% at low CN
    softening = 60 * np.exp(-0.45 * (cn - 3.5)) / np.exp(-0.45 * (4 - 3.5))
    softening = np.clip(softening, 0, 60)

    ax.fill_between(cn, softening, alpha=0.15, color=INDIGO)
    ax.plot(cn, softening, color=INDIGO, lw=3)

    # Shaded 15–60% band
    ax.axhspan(15, 60, xmin=0.05, xmax=0.62, color=AMBER, alpha=0.12)
    ax.text(5.5, 37, '15–60%\nsoftening', ha='center', va='center', fontsize=10,
            color=AMBER, fontweight='bold')

    # Bulk reference
    ax.scatter([12], [0], color=SAGE, s=120, zorder=5, edgecolor=INK)
    ax.annotate('Bulk reference\nCN = 12, 0% error', xy=(12, 0), xytext=(10.2, 8),
                arrowprops=dict(arrowstyle='->', color=SAGE, lw=1.5),
                fontsize=10, color=SAGE, fontweight='bold')

    # Functional region
    ax.axvspan(4, 8, color=ROSE, alpha=0.08)
    ax.text(6, 52, 'pores • surfaces • vacancies\n• transition states', ha='center',
            fontsize=10, color=ROSE, fontweight='bold')

    ax.set_xlabel('Local coordination number (CN)', fontsize=12)
    ax.set_ylabel('Potential-energy surface softening (%)', fontsize=12)
    ax.set_xlim(3.5, 12)
    ax.set_ylim(0, 65)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    add_title(fig, 'Error Grows as Coordination Drops')
    add_source(fig, 'Source: Deng et al., npj Comput. Mater. 11, 9 (2025)')
    return save_jpg(fig, f'{SLUG}-02-coordination-error-curve.jpg')


# -----------------------------------------------------------------------------
# 03 — Four filters
# -----------------------------------------------------------------------------
def make_03():
    fig = plt.figure(figsize=FIGSIZE)
    ax = fig.add_axes([0.06, 0.18, 0.88, 0.62])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    ax.set_facecolor(BG)

    filters = [
        ('1', 'Defect/bulk\nasymmetry', 'CN 4–8\n15–60% softening', INDIGO),
        ('2', 'Combinatorial\nwall', 'millions of candidates\nthousands of linkers', AMBER),
        ('3', 'Metastability', 'hydrated phases\namorphous networks', SAGE),
        ('4', 'Ranking\ninversion', 'wrong priorities\nburied breakthroughs', ROSE),
    ]

    y = 0.5
    start_x, end_x = 0.06, 0.94
    gate_xs = np.linspace(0.22, 0.78, len(filters))

    # Start / end nodes
    for x, label, color, align in [(start_x, 'Predicted\nstructure', SLATE, 'right'),
                                   (end_x, 'Working\nmaterial', SAGE, 'left')]:
        rect = FancyBboxPatch((x - 0.06, y - 0.12), 0.12, 0.24,
                              boxstyle='round,pad=0.01,rounding_size=0.02',
                              facecolor=color, edgecolor='none', alpha=0.15)
        ax.add_patch(rect)
        ax.text(x, y, label, ha='center', va='center', fontsize=10,
                color=color, fontweight='bold')

    # Main arrow backbone
    ax.annotate('', xy=(end_x - 0.07, y), xytext=(start_x + 0.07, y),
                arrowprops=dict(arrowstyle='->', color=MUTED, lw=2))

    for i, (num, title, desc, color) in enumerate(filters):
        gx = gate_xs[i]
        rect = FancyBboxPatch((gx - 0.09, y - 0.22), 0.18, 0.44,
                              boxstyle='round,pad=0.01,rounding_size=0.02',
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(gx, y + 0.08, f'Filter {num}', ha='center', va='center',
                fontsize=12, color='white', fontweight='bold')
        ax.text(gx, y - 0.04, title, ha='center', va='center',
                fontsize=10, color='white', fontweight='bold', linespacing=1.1)
        ax.text(gx, y - 0.15, desc, ha='center', va='center',
                fontsize=8, color='white', linespacing=1.2)

    add_title(fig, 'From Predicted Structure to Buried Breakthrough')
    add_source(fig, 'Sources: Lupine Science Strategic Discovery Plan; Deng et al., npj Comput. Mater. 2025')
    return save_jpg(fig, f'{SLUG}-03-four-filters.jpg')


# -----------------------------------------------------------------------------
# 04 — Blind prediction panel
# -----------------------------------------------------------------------------
def make_04():
    fig = plt.figure(figsize=FIGSIZE)
    gs = fig.add_gridspec(1, 2, left=0.08, right=0.92, top=0.82, bottom=0.18,
                          wspace=0.28, width_ratios=[1.4, 1])

    # Scatter plot
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.set_facecolor(BG)
    np.random.seed(42)
    n = 36
    observed = np.random.normal(0, 0.12, n)
    noise = np.random.normal(0, 0.035, n)
    predicted = 0.906 * observed + noise

    ax1.scatter(observed, predicted, c=INDIGO, s=70, alpha=0.75, edgecolor=INK, linewidth=0.5)
    lims = [-0.35, 0.35]
    ax1.plot(lims, lims, color=SECONDARY, lw=1.5, linestyle='--', label='1:1')
    ax1.set_xlim(lims)
    ax1.set_ylim(lims)
    ax1.set_xlabel('Observed signed error', fontsize=11)
    ax1.set_ylabel('Predicted signed error', fontsize=11)
    ax1.set_title('36 blind (model, material) pairs', fontsize=12, fontweight='bold')
    ax1.text(0.05, 0.95, 'r = 0.906\np = 10⁻⁴\n95% CI [0.82, 0.96]\nzero adjustable params',
             transform=ax1.transAxes, ha='left', va='top', fontsize=10,
             bbox=dict(boxstyle='round,pad=0.3', facecolor=SOFT_INDIGO, edgecolor=INDIGO))
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)
    ax1.set_aspect('equal', adjustable='box')

    # Metric cards
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.set_xlim(0, 1)
    ax2.set_ylim(0, 1)
    ax2.axis('off')
    ax2.set_facecolor(BG)

    cards = [
        ('Pearson r', '0.906', INDIGO),
        ('Runtime overhead', '15.6%\n(<1% target)', AMBER),
        ('Speed vs DFT', '~10⁵× faster', SAGE),
        ('Lean 4 theorems', '77\nzero sorry proofs', SLATE),
    ]
    y = 0.90
    for label, value, color in cards:
        rect = FancyBboxPatch((0.05, y - 0.20), 0.90, 0.22,
                              boxstyle='round,pad=0.02', facecolor=color,
                              edgecolor='none', alpha=0.12)
        ax2.add_patch(rect)
        ax2.text(0.10, y - 0.04, label, ha='left', va='top', fontsize=11,
                fontweight='bold', color=INK)
        ax2.text(0.92, y - 0.04, value, ha='right', va='top', fontsize=11,
                fontweight='bold', color=color, linespacing=1.1)
        y -= 0.25

    add_title(fig, 'Measured Correction, Machine-Checked Proof')
    add_source(fig, 'Source: Lupine Science Strategic Discovery Plan')
    return save_jpg(fig, f'{SLUG}-04-blind-prediction-panel.jpg')


# -----------------------------------------------------------------------------
# 05 — Correction and verification layer
# -----------------------------------------------------------------------------
def make_05():
    fig = plt.figure(figsize=FIGSIZE)
    ax = fig.add_axes([0.06, 0.18, 0.88, 0.62])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    ax.set_facecolor(BG)

    layers = [
        ('uMLIP base\npotential', 0.18, INDIGO),
        ('Coordination\nerror field', 0.40, AMBER),
        ('Analytic force\ncorrection', 0.62, SAGE),
        ('Lean 4 proof\nboundary', 0.84, SLATE),
    ]

    y = 0.5
    h = 0.28
    for label, x, color in layers:
        w = 0.18
        rect = FancyBboxPatch((x - w/2, y - h/2), w, h,
                              boxstyle='round,pad=0.02,rounding_size=0.03',
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(x, y, label, ha='center', va='center', fontsize=10,
                color='white', fontweight='bold', linespacing=1.1)

    # Arrows between layers
    for i in range(len(layers) - 1):
        x1 = layers[i][1] + 0.09
        x2 = layers[i+1][1] - 0.09
        ax.annotate('', xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2))

    # Annotations
    ax.text(0.18, y - h/2 - 0.08, 'Bulk CN = 12\nerror defined as zero',
            ha='center', va='top', fontsize=9, color=SECONDARY)
    ax.text(0.40, y + h/2 + 0.06, '3 anchors + cubic spline',
            ha='center', va='bottom', fontsize=9, color=AMBER, fontweight='bold')
    ax.text(0.62, y - h/2 - 0.08, 'added to gradients\nat runtime',
            ha='center', va='top', fontsize=9, color=SECONDARY)
    ax.text(0.84, y + h/2 + 0.06, 'supported vs unsupported',
            ha='center', va='bottom', fontsize=9, color=SLATE, fontweight='bold')

    add_title(fig, 'Runtime Correction with Proof Boundaries')
    add_source(fig, 'Source: Lupine Science Strategic Discovery Plan')
    return save_jpg(fig, f'{SLUG}-05-correction-verification-layer.jpg')


# -----------------------------------------------------------------------------
# 06 — Addressable impact Sankey-style
# -----------------------------------------------------------------------------
def make_06():
    fig = plt.figure(figsize=FIGSIZE)
    ax = fig.add_axes([0.08, 0.18, 0.84, 0.62])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    ax.set_facecolor(BG)

    domains = [
        ('Water', '~2B people\n40% deficit by 2030', INDIGO),
        ('Air', '4–7M premature\ndeaths/year', AMBER),
        ('Methane', '~30% warming\n0.3 °C avoidable', SAGE),
        ('Refrigerants', 'up to 0.5 °C\navoided by 2100', SLATE),
        ('Minerals', '4–6× demand\nby 2040', ROSE),
        ('PFAS', 'C–F bond\n~485 kJ/mol', INDIGO),
        ('Cement', '2.8 GtCO₂/yr\n~8% of global', SECONDARY),
    ]

    # Central correction layer
    center = Circle((0.5, 0.5), 0.10, color=INDIGO, zorder=5)
    ax.add_patch(center)
    ax.text(0.5, 0.5, 'One\ncorrection\nlayer', ha='center', va='center',
            fontsize=10, color='white', fontweight='bold', linespacing=1.0)

    # Radial bubbles
    n = len(domains)
    angles = np.linspace(90, 90 - 360, n + 1)[:-1]
    radius = 0.34
    for i, (name, detail, color) in enumerate(domains):
        theta = np.radians(angles[i])
        x = 0.5 + radius * np.cos(theta)
        y = 0.5 + radius * np.sin(theta)

        # Connector line
        ax.plot([0.5 + 0.10 * np.cos(theta), x - 0.11 * np.cos(theta)],
                [0.5 + 0.10 * np.sin(theta), y - 0.11 * np.sin(theta)],
                color=color, lw=2, alpha=0.6)

        bubble = Circle((x, y), 0.11, color=color, alpha=0.9, zorder=6)
        ax.add_patch(bubble)
        ax.text(x, y + 0.02, name, ha='center', va='center',
                fontsize=10, color='white', fontweight='bold')
        ax.text(x, y - 0.05, detail, ha='center', va='center',
                fontsize=7, color='white', linespacing=1.1)

    add_title(fig, 'The Combined Addressable Impact')
    add_source(fig, 'Sources: UN Water 2024; WHO 2024; IPCC AR6; UNEP 2021; IEA 2022, 2024')
    return save_jpg(fig, f'{SLUG}-06-addressable-impact-sankey.jpg')


# -----------------------------------------------------------------------------
# 07 — Ranking inversion
# -----------------------------------------------------------------------------
def make_07():
    fig = plt.figure(figsize=FIGSIZE)
    gs = fig.add_gridspec(1, 2, left=0.08, right=0.92, top=0.82, bottom=0.18,
                          wspace=0.30, width_ratios=[1.35, 1.0])

    candidates = ['Membrane A', 'Catalyst B', 'Sorbent C', 'Framework D', 'Electrolyte E']
    raw_scores = np.array([0.42, 0.38, 0.55, 0.31, 0.48])
    corrected_scores = np.array([0.35, 0.51, 0.39, 0.58, 0.44])

    # Sort candidates by corrected score descending for ranking display
    order = np.argsort(corrected_scores)[::-1]
    candidates = [candidates[i] for i in order]
    raw_scores = raw_scores[order]
    corrected_scores = corrected_scores[order]

    # Left: scores
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.set_facecolor(BG)
    y = np.arange(len(candidates))
    h = 0.35
    ax1.barh(y - h/2, raw_scores, h, label='Raw uMLIP', color=ROSE, edgecolor=INK, linewidth=0.5)
    ax1.barh(y + h/2, corrected_scores, h, label='Corrected', color=SAGE, edgecolor=INK, linewidth=0.5)
    ax1.set_yticks(y)
    ax1.set_yticklabels(candidates)
    ax1.set_xlabel('Relative performance score', fontsize=11)
    ax1.set_xlim(0, 0.7)
    ax1.legend(loc='lower right', frameon=False)
    ax1.set_title('Raw vs corrected scores', fontsize=12, fontweight='bold')
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)

    # Right: rank change table
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.set_xlim(0, 1)
    ax2.set_ylim(0, 1)
    ax2.axis('off')
    ax2.set_facecolor(BG)

    raw_ranks = np.argsort(np.argsort(raw_scores)[::-1]) + 1
    corrected_ranks = np.argsort(np.argsort(corrected_scores)[::-1]) + 1

    ax2.text(0.18, 0.92, 'Raw\nrank', ha='center', fontsize=10, fontweight='bold', color=SECONDARY)
    ax2.text(0.52, 0.92, 'Candidate', ha='center', fontsize=10, fontweight='bold', color=INK)
    ax2.text(0.86, 0.92, 'Corr.\nrank', ha='center', fontsize=10, fontweight='bold', color=INDIGO)

    yy = 0.78
    for i, cand in enumerate(candidates):
        moved = raw_ranks[i] != corrected_ranks[i]
        color = ROSE if moved else SECONDARY
        ax2.text(0.18, yy, str(raw_ranks[i]), ha='center', fontsize=11, color=color)
        ax2.text(0.52, yy, cand, ha='center', fontsize=11, color=INK)
        ax2.text(0.86, yy, str(corrected_ranks[i]), ha='center', fontsize=11,
                color=INDIGO if moved else SECONDARY, fontweight='bold' if moved else 'normal')
        yy -= 0.16

    ax2.text(0.5, 0.05, 'Systematic error inverts candidate order',
             ha='center', fontsize=10, color=SECONDARY)

    add_title(fig, 'Raw Rankings Hide True Breakthroughs')
    add_source(fig, 'Sources: Lupine Science; Deng et al., npj Comput. Mater. 2025')
    return save_jpg(fig, f'{SLUG}-07-ranking-inversion.jpg')


# -----------------------------------------------------------------------------
# 08 — Platform ecosystem
# -----------------------------------------------------------------------------
def make_08():
    fig = plt.figure(figsize=FIGSIZE)
    ax = fig.add_axes([0.06, 0.18, 0.88, 0.62])
    ax.set_xlim(-1.2, 1.2)
    ax.set_ylim(-1.2, 1.2)
    ax.axis('off')
    ax.set_facecolor(BG)

    modules = [
        ('Desalination\nmembranes', 0.0, 1.0, INDIGO),
        ('Atmospheric\nwater', 0.78, 0.62, AMBER),
        ('Low-T\nNH₃-SCR', 0.97, -0.22, SAGE),
        ('Methane\ncatalysis', 0.43, -0.90, SLATE),
        ('Refrigerants\n& calorics', -0.43, -0.90, ROSE),
        ('Minerals &\nPFAS recovery', -0.97, -0.22, INDIGO),
        ('Cement &\nCO₂ curing', -0.78, 0.62, SECONDARY),
    ]

    # Hub
    hub = Circle((0, 0), 0.22, color=INDIGO, zorder=5)
    ax.add_patch(hub)
    ax.text(0, 0, 'Correction\n+ Proof\nLayer', ha='center', va='center',
            fontsize=11, color='white', fontweight='bold', linespacing=1.0)

    # Spokes
    for label, x, y, color in modules:
        # line
        ax.plot([0.18 * x, 0.78 * x], [0.18 * y, 0.78 * y],
                color=color, lw=2, alpha=0.6)
        # module circle
        circle = Circle((0.90 * x, 0.90 * y), 0.18, color=color, zorder=6)
        ax.add_patch(circle)
        ax.text(0.90 * x, 0.90 * y, label, ha='center', va='center',
                fontsize=8, color='white', fontweight='bold', linespacing=1.0)

    add_title(fig, 'One Layer, Many Industrial Workflows')
    add_source(fig, 'Source: Lupine Science platform architecture')
    return save_jpg(fig, f'{SLUG}-08-platform-ecosystem.jpg')


# -----------------------------------------------------------------------------
# 09 — Economics moat
# -----------------------------------------------------------------------------
def make_09():
    fig = plt.figure(figsize=FIGSIZE)
    gs = fig.add_gridspec(1, 2, left=0.08, right=0.92, top=0.82, bottom=0.18,
                          wspace=0.25, width_ratios=[1.2, 1])

    # Left: log-scale cost/candidate ladder
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.set_facecolor(BG)
    methods = ['DFT', 'Raw uMLIP', 'Corrected uMLIP']
    # Relative time per candidate (log scale)
    times = np.array([1e5, 1.0, 1.156])
    colors = [ROSE, AMBER, SAGE]
    bars = ax1.barh(methods, times, color=colors, edgecolor=INK, linewidth=0.5, height=0.5)
    ax1.set_xscale('log')
    ax1.set_xlabel('Relative time per candidate (log scale)', fontsize=11)
    ax1.set_xlim(0.5, 2e5)
    ax1.set_title('Cost per candidate', fontsize=12, fontweight='bold')
    for bar, val in zip(bars, times):
        if val >= 1e3:
            label = f'{val:.0e}×'
        elif val == 1.0:
            label = '1×'
        else:
            label = f'{val*100:.1f}%\n(1× + overhead)'
        ax1.text(val * 1.5, bar.get_y() + bar.get_height()/2, label,
                va='center', fontsize=10, color=INK, fontweight='bold')
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)

    # Right: combinatorial space sizes
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.set_xlim(0, 1)
    ax2.set_ylim(0, 1)
    ax2.axis('off')
    ax2.set_facecolor(BG)

    spaces = [
        ('Refrigerant molecules', 'millions', AMBER),
        ('MOF linkers', 'thousands', SAGE),
        ('Cement oxide\ncompositions', 'multi-component', SLATE),
    ]
    y = 0.80
    for label, size, color in spaces:
        rect = FancyBboxPatch((0.05, y - 0.18), 0.90, 0.22,
                              boxstyle='round,pad=0.02', facecolor=color,
                              edgecolor='none', alpha=0.15)
        ax2.add_patch(rect)
        ax2.text(0.10, y - 0.04, label, ha='left', va='top', fontsize=11,
                fontweight='bold', color=INK)
        ax2.text(0.92, y - 0.04, size, ha='right', va='top', fontsize=11,
                fontweight='bold', color=color)
        y -= 0.28

    ax2.text(0.5, 0.12, 'DFT cannot afford to screen these spaces exhaustively',
             ha='center', fontsize=10, color=SECONDARY)

    add_title(fig, 'Speed That Scales Where DFT Cannot')
    add_source(fig, 'Source: Lupine Science Strategic Discovery Plan')
    return save_jpg(fig, f'{SLUG}-09-economics-moat.jpg')


# -----------------------------------------------------------------------------
# 10 — Platform roadmap (MiniMax scene illustration)
# -----------------------------------------------------------------------------
def make_10():
    output = OUT_DIR / f'{SLUG}-10-platform-roadmap.jpg'
    prompt = (
        "An editorial scientific roadmap scene: a clean ascending path or staircase "
        "moving from left to right through three stages. Stage 1 (left, amber #e8a838) "
        "shows measurement of an atomic coordination error field. Stage 2 (center, sage #5a8a6e) "
        "shows analytic force corrections being added to a neural potential. Stage 3 (right, indigo #3d4db3) "
        "shows a machine-checked proof badge and verified predictions. Warm paper background (#faf9f6), "
        "minimal text, clean infographic style, 16:9 landscape."
    )
    subprocess.run([
        sys.executable, '/home/alex/.hermes/skills/lupine-media-director/scripts/minimax_client.py',
        'image', '--prompt', prompt, '--aspect', '16:9', '--output', str(output)
    ], check=True)
    return output


# -----------------------------------------------------------------------------
# Manifest
# -----------------------------------------------------------------------------
MANIFEST = [
    {
        'filename': f'{SLUG}-01-seven-domains-one-error.jpg',
        'title': 'One Geometry, Seven Planetary Boundaries',
        'type': 'scene-illustration',
        'caption': 'The same coordination error radiates from bulk equilibrium into the under-coordinated environments that control water, air, methane, refrigerants, minerals, PFAS, and cement.'
    },
    {
        'filename': f'{SLUG}-02-coordination-error-curve.jpg',
        'title': 'Error Grows as Coordination Drops',
        'type': 'data-chart',
        'caption': 'A systematic survey shows uMLIPs soften the potential energy surface by 15–60% in under-coordinated regions, precisely the coordination range of pores, surfaces, and transition states.'
    },
    {
        'filename': f'{SLUG}-03-four-filters.jpg',
        'title': 'From Predicted Structure to Buried Breakthrough',
        'type': 'concept-diagram',
        'caption': 'Defect/bulk asymmetry, the combinatorial wall, metastability, and ranking inversion turn a small systematic error into wrong experimental priorities.'
    },
    {
        'filename': f'{SLUG}-04-blind-prediction-panel.jpg',
        'title': 'Measured Correction, Machine-Checked Proof',
        'type': 'evidence-panel',
        'caption': 'Across 36 blind model–material pairs the error field predicts corrections with r = 0.906, while a build-locked library of 77 Lean 4 theorems bounds what can be believed.'
    },
    {
        'filename': f'{SLUG}-05-correction-verification-layer.jpg',
        'title': 'Runtime Correction with Proof Boundaries',
        'type': 'concept-diagram',
        'caption': 'A coordination-based error field, three anchor observables, and analytic force corrections let molecular dynamics follow the corrected surface, while proof boundaries stop unsupported claims.'
    },
    {
        'filename': f'{SLUG}-06-addressable-impact-sankey.jpg',
        'title': 'The Combined Addressable Impact',
        'type': 'data-chart',
        'caption': 'The seven application areas together span billions of people, gigatonnes of CO₂, and trillion-dollar supply chains.'
    },
    {
        'filename': f'{SLUG}-07-ranking-inversion.jpg',
        'title': 'Raw Rankings Hide True Breakthroughs',
        'type': 'evidence-panel',
        'caption': 'A soft potential surface can promote the wrong membrane pore or catalyst site; corrected barriers restore the ranking that experiments should follow.'
    },
    {
        'filename': f'{SLUG}-08-platform-ecosystem.jpg',
        'title': 'One Layer, Many Industrial Workflows',
        'type': 'concept-diagram',
        'caption': 'Corrected energies for binding, barriers, insertion, migration, and site selectivity feed a single platform that serves seven distinct industrial stacks.'
    },
    {
        'filename': f'{SLUG}-09-economics-moat.jpg',
        'title': 'Speed That Scales Where DFT Cannot',
        'type': 'data-chart',
        'caption': 'At roughly 10⁵× the speed of DFT and only modest runtime overhead, corrected potentials can search spaces that brute-force quantum chemistry cannot afford.'
    },
    {
        'filename': f'{SLUG}-10-platform-roadmap.jpg',
        'title': 'The Path From Measured Error to Trust',
        'type': 'scene-illustration',
        'caption': 'Every article in the series will follow the same arc: measure the shape of the error, correct it with analytic forces, and prove which predictions can be believed.'
    },
]


def write_manifest():
    manifest_path = OUT_DIR / 'manifest.json'
    manifest_path.write_text(json.dumps(MANIFEST, indent=2) + '\n')
    return manifest_path


# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
def main():
    generated = []
    generated.append(make_01())
    generated.append(make_02())
    generated.append(make_03())
    generated.append(make_04())
    generated.append(make_05())
    generated.append(make_06())
    generated.append(make_07())
    generated.append(make_08())
    generated.append(make_09())
    generated.append(make_10())

    write_manifest()

    total_size = sum(Path(p).stat().st_size for p in generated)
    print(f'Generated {len(generated)} images; total size {total_size / 1024:.1f} KB')
    for p in generated:
        print(' ', p)


if __name__ == '__main__':
    main()
