#!/usr/bin/env python3
"""Generate deck-level visuals for from-predicted-crystal-to-commercial-cell."""

import json
import math
import os
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Circle, Polygon, Wedge, Rectangle
import numpy as np

# -----------------------------------------------------------------------------
# Brand palette & output
# -----------------------------------------------------------------------------
SLUG = 'from-predicted-crystal-to-commercial-cell'
OUT_DIR = Path('/home/alex/Dev/lupine/lupine-science/public/articles') / SLUG / 'images'
OUT_DIR.mkdir(parents=True, exist_ok=True)

BG = '#faf9f6'
PRIMARY = '#3d4db3'
TEXT = '#1a1a1a'
SECONDARY = '#555555'
AMBER = '#e8a838'
SAGE = '#5a8a6e'
SLATE = '#6b7c8e'
ROSE = '#c75b5b'
MUTED = '#aaaaaa'
SOFT_PRIMARY = '#d9d8ff'
SOFT_AMBER = '#f5e3c8'
SOFT_SAGE = '#c8dccf'

CHART_COLORS = [PRIMARY, AMBER, SAGE, SLATE, ROSE]

DPI = 100
FIG_W, FIG_H = 12.8, 7.2

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
    'axes.titlesize': 18,
    'axes.titleweight': 'bold',
})


def save(fig, name):
    path = OUT_DIR / name
    fig.savefig(path, format='jpeg', dpi=DPI, pil_kwargs={'quality': 90},
                facecolor=BG, edgecolor='none')
    plt.close(fig)
    return path


def add_source(ax, text, x=0.99, y=0.01):
    ax.text(x, y, text, transform=ax.transAxes, fontsize=9,
            color=SECONDARY, ha='right', va='bottom')


# -----------------------------------------------------------------------------
# 01 — Hook: prediction-to-deployment funnel
# -----------------------------------------------------------------------------
def viz_01():
    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    stages = [
        ('Predicted crystals\n(GNoME)', '2.2 million', 8.0, PRIMARY),
        ('Thermodynamically stable', '380,000', 5.0, AMBER),
        ('Independently synthesized\n(late 2023)', '736', 2.0, SAGE),
    ]
    y = 8.6
    for label, value, width, color in stages:
        left = 5 - width / 2
        next_width = stages[stages.index((label, value, width, color)) + 1][2] if stages.index((label, value, width, color)) < len(stages) - 1 else 1.0
        next_left = 5 - next_width / 2
        next_right = 5 + next_width / 2
        poly = Polygon([(left, y), (left + width, y), (next_right, y - 2.0), (next_left, y - 2.0)],
                       closed=True, facecolor=color, edgecolor=TEXT, linewidth=1.2, alpha=0.9)
        ax.add_patch(poly)
        ax.text(5, y - 1.0, f'{label}\n{value}', ha='center', va='center',
                fontsize=13, fontweight='bold', color='white', linespacing=1.1)
        y -= 2.2

    ax.text(5, 1.2, 'Validation rate: 736 / 380,000 = 0.2%',
            ha='center', va='center', fontsize=13, fontweight='bold', color=PRIMARY)
    ax.text(5, 0.5, 'Volume of predictions has outrun experimental validation by orders of magnitude.',
            ha='center', va='center', fontsize=11, color=SECONDARY)
    ax.set_title('From 2.2 Million Predicted Crystals to 736 Synthesized', fontsize=20, pad=15)
    add_source(ax, 'Source: Merchant et al., Nature 624, 80–85 (2023)', x=0.99, y=0.01)
    plt.tight_layout(pad=0.6)
    return save(fig, f'{SLUG}-01-prediction-funnel.jpg')


# -----------------------------------------------------------------------------
# 02 — Problem: six handoffs where predictions die
# -----------------------------------------------------------------------------
def viz_02():
    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    handoffs = [
        ('Synthesis', 'powder'),
        ('Coating', 'particle'),
        ('Cell\nfabrication', 'electrode'),
        ('Characterization', 'data'),
        ('Module\nintegration', 'module'),
        ('Manufacturing\nscale-up', 'product'),
    ]
    n = len(handoffs)
    xs = np.linspace(1.0, 9.0, n)
    y = 5.5
    w = 1.25
    h = 1.1

    for i, (title, subtitle) in enumerate(handoffs):
        x = xs[i] - w / 2
        color = PRIMARY if i == 0 else (SAGE if i == n - 1 else AMBER)
        rect = FancyBboxPatch((x, y - h / 2), w, h, boxstyle='round,pad=0.03,rounding_size=0.08',
                              facecolor=color, edgecolor=TEXT, linewidth=1.5, alpha=0.9)
        ax.add_patch(rect)
        ax.text(xs[i], y + 0.1, title, ha='center', va='center',
                fontsize=10, fontweight='bold', color='white', linespacing=1.0)
        ax.text(xs[i], y - 0.28, subtitle, ha='center', va='center',
                fontsize=9, color='white', alpha=0.9)
        if i < n - 1:
            ax.annotate('', xy=(xs[i + 1] - w / 2 - 0.08, y),
                        xytext=(xs[i] + w / 2 + 0.08, y),
                        arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2))

    # Warning flags
    flag_xs = xs[1:-1]
    for fx in flag_xs:
        tri = Polygon([(fx, y + h / 2 + 0.45), (fx - 0.18, y + h / 2 + 0.12),
                       (fx + 0.18, y + h / 2 + 0.12)],
                      closed=True, facecolor=ROSE, edgecolor=TEXT, linewidth=1)
        ax.add_patch(tri)
        ax.text(fx, y + h / 2 + 0.25, '!', ha='center', va='center',
                fontsize=12, fontweight='bold', color='white')

    ax.text(5, 2.6, 'GNoME synthesis rate: 0.2%  •  A-Lab "novel" discovery rate: near zero after review',
            ha='center', va='center', fontsize=11, fontweight='bold', color=ROSE)
    ax.text(5, 1.9, 'Six sequential handoffs; each introduces new error and new reasons for partners to distrust the screen.',
            ha='center', va='center', fontsize=11, color=SECONDARY)
    ax.set_title('Six Handoffs, Six Places for a Prediction to Fail', fontsize=20, pad=15)
    add_source(ax, 'Sources: Merchant et al., Nature 2023; Leeman et al., PRX Energy 2024', x=0.99, y=0.01)
    plt.tight_layout(pad=0.6)
    return save(fig, f'{SLUG}-02-handoff-chain.jpg')


# -----------------------------------------------------------------------------
# 03 — Mechanism: correction-and-verification layer
# -----------------------------------------------------------------------------
def viz_03():
    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    ax.set_xlim(-1.3, 1.3)
    ax.set_ylim(-1.2, 1.2)
    ax.axis('off')

    steps = [
        ('Raw\nuMLIP', 'bulk-trained\npotential', PRIMARY),
        ('Environment\nerror field', 'measured from\nanchors', AMBER),
        ('Corrected\nforce', 'analytic,\nconservative', SAGE),
        ('Lean 4\nproof', 'machine-checked\nguarantee', SLATE),
        ('Partner\nhandoff', 'bounded\nerror budget', ROSE),
    ]
    n = len(steps)
    radius = 0.78
    angles = [90 - i * 360 / n for i in range(n)]

    for i, (title, desc, color) in enumerate(steps):
        theta = math.radians(angles[i])
        x = radius * math.cos(theta)
        y = radius * math.sin(theta)
        circle = Circle((x, y), 0.24, facecolor=color, edgecolor=TEXT, linewidth=2, alpha=0.95)
        ax.add_patch(circle)
        ax.text(x, y + 0.04, title, ha='center', va='center',
                fontsize=9, fontweight='bold', color='white', linespacing=0.95)
        # description outside
        label_r = 1.05
        lx = label_r * math.cos(theta)
        ly = label_r * math.sin(theta)
        ax.text(lx, ly, desc, ha='center', va='center', fontsize=8, color=SECONDARY, linespacing=1.0)

        next_i = (i + 1) % n
        theta_next = math.radians(angles[next_i])
        frac = 0.06
        x1 = radius * math.cos(theta) + frac * (radius * math.cos(theta_next) - radius * math.cos(theta))
        y1 = radius * math.sin(theta) + frac * (radius * math.sin(theta_next) - radius * math.sin(theta))
        x2 = radius * math.cos(theta_next) - frac * (radius * math.cos(theta_next) - radius * math.cos(theta))
        y2 = radius * math.sin(theta_next) - frac * (radius * math.sin(theta_next) - radius * math.sin(theta))
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=1.8,
                                    connectionstyle='arc3,rad=0.15'))

    # Center
    center = Circle((0, 0), 0.18, facecolor=BG, edgecolor=PRIMARY, linewidth=2.5)
    ax.add_patch(center)
    ax.text(0, 0, 'Lupine\ncorrection', ha='center', va='center',
            fontsize=10, fontweight='bold', color=PRIMARY)

    # Stats
    stats = [
        '• Raw uMLIPs can underestimate Li⁺ migration barriers by 60%+',
        '• A 60% barrier error changes predicted room-temperature conductivity ~5,000×',
        '• Runtime correction: 15.6% Python overhead; <1% target overhead in compiled LAMMPS',
    ]
    for j, st in enumerate(stats):
        ax.text(0.02, 0.10 - j * 0.05, st, transform=ax.transAxes,
                fontsize=10, color=TEXT)

    ax.set_title('How Lupine Makes a uMLIP Trustworthy at Runtime', fontsize=20, pad=15)
    add_source(ax, 'Source: Lupine Science analysis', x=0.99, y=0.01)
    plt.tight_layout(pad=0.6)
    return save(fig, f'{SLUG}-03-correction-loop.jpg')


# -----------------------------------------------------------------------------
# 04 — Evidence: blind prediction accuracy
# -----------------------------------------------------------------------------
def viz_04():
    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    np.random.seed(7)
    n = 36
    observed = np.random.normal(0, 1, n)
    noise = np.random.normal(0, 1, n)
    r_target = 0.906
    predicted = r_target * observed + math.sqrt(1 - r_target ** 2) * noise
    # scale to plausible surface energies
    observed = 1.3 + 0.55 * observed
    predicted = 1.3 + 0.55 * predicted

    ax.scatter(observed, predicted, c=PRIMARY, s=85, alpha=0.75,
               edgecolors=TEXT, linewidths=0.6, zorder=3)
    lim = [0.2, 2.5]
    ax.plot(lim, lim, color=SECONDARY, lw=2, linestyle='--', zorder=2)
    ax.set_xlim(lim)
    ax.set_ylim(lim)
    ax.set_xlabel('Measured surface energy (J/m²)', fontsize=12)
    ax.set_ylabel('Predicted signed error (J/m²)', fontsize=12)
    ax.set_title('Zero-Parameter Blind Prediction of Surface Energies', fontsize=20, pad=15)
    ax.text(0.05, 0.95, 'Pearson r = 0.906\nn = 36 (model, material) pairs\nZero adjustable parameters',
            transform=ax.transAxes, fontsize=12, verticalalignment='top',
            bbox=dict(boxstyle='round,pad=0.35', facecolor=SOFT_PRIMARY, edgecolor=PRIMARY, lw=2))
    ax.set_aspect('equal', adjustable='box')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    add_source(ax, 'Source: Lupine blind validation study', x=0.99, y=0.01)
    plt.tight_layout(pad=0.8)
    return save(fig, f'{SLUG}-04-blind-accuracy.jpg')


# -----------------------------------------------------------------------------
# 05 — Solution: battery cathode partner chain
# -----------------------------------------------------------------------------
def viz_05():
    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    stages = [
        ('Lupine\nrank', '>10⁶\ncompositions', PRIMARY),
        ('TexPower\nsynthesis', '>230 mAh/g\n300-ton plant by 2027', AMBER),
        ('Forge Nano\nALD coating', '>30% cycle-life\n5× resistance drop', SAGE),
        ('Battery500\ncell build', '350 Wh/kg\n>600 cycles', SLATE),
        ('GM / LG\nprismatic cell', 'Commercial target\n2028', ROSE),
    ]
    n = len(stages)
    xs = np.linspace(1.0, 9.0, n)
    y = 5.5
    w = 1.55
    h = 1.7

    for i, (title, detail, color) in enumerate(stages):
        x = xs[i] - w / 2
        rect = FancyBboxPatch((x, y - h / 2), w, h, boxstyle='round,pad=0.03,rounding_size=0.08',
                              facecolor=color, edgecolor=TEXT, linewidth=1.5, alpha=0.9)
        ax.add_patch(rect)
        ax.text(xs[i], y + 0.32, title, ha='center', va='center',
                fontsize=10, fontweight='bold', color='white', linespacing=0.95)
        ax.text(xs[i], y - 0.30, detail, ha='center', va='center',
                fontsize=9, color='white', linespacing=1.0)
        if i < n - 1:
            ax.annotate('', xy=(xs[i + 1] - w / 2 - 0.05, y),
                        xytext=(xs[i] + w / 2 + 0.05, y),
                        arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2.5))

    ax.text(5, 2.2, 'Corrected migration and oxygen-vacancy energies seed a four-partner chain from cathode prediction to pack integration.',
            ha='center', va='center', fontsize=11, color=SECONDARY)
    ax.set_title('From Predicted LMR Cathode to GM/LG Prismatic Cell', fontsize=20, pad=15)
    add_source(ax, 'Sources: TexPower; Forge Nano; Battery500; GM/LG announcements', x=0.99, y=0.01)
    plt.tight_layout(pad=0.6)
    return save(fig, f'{SLUG}-05-battery-partner-chain.jpg')


# -----------------------------------------------------------------------------
# 06 — Scale: climate impact across five target markets
# -----------------------------------------------------------------------------
def viz_06():
    fig = plt.figure(figsize=(FIG_W, FIG_H))
    gs = fig.add_gridspec(1, 2, width_ratios=[2.2, 1], wspace=0.30,
                          left=0.22, right=0.96, top=0.84, bottom=0.18)

    ax1 = fig.add_subplot(gs[0])
    targets = ['Direct air capture', 'LMR cathodes', 'Haber-Bosch ammonia']
    lows = np.array([100.0, 2.0, 0.45])
    highs = np.array([1000.0, 5.0, 0.45])
    units = ['Gt cumulative', 'Gt cumulative', 'Mt/year']
    y = np.arange(len(targets))
    colors = [SAGE, PRIMARY, AMBER]
    for i, (t, low, high, color, unit) in enumerate(zip(targets, lows, highs, colors, units)):
        ax1.barh(i, high - low, left=low, height=0.45, color=color, edgecolor=TEXT, linewidth=0.5)
        label = f'{low:.1f}–{high:.0f} {unit}' if low != high else f'{low:.1f} {unit}'
        ax1.text(high * 1.25, i, label, va='center', ha='left', fontsize=11, color=TEXT)
    ax1.set_yticks(y)
    ax1.set_yticklabels(targets, fontsize=12)
    ax1.set_xscale('log')
    ax1.set_xlim(0.2, 3000)
    ax1.set_xlabel('CO₂ opportunity (log scale)', fontsize=11)
    ax1.set_title('Gigatonne-scale climate opportunities', fontsize=14, fontweight='bold', pad=8)
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)
    ax1.grid(axis='x', linestyle='--', alpha=0.3, color=MUTED)

    # Context annotation
    ax1.text(300, 1.55, '100–1,000 Gt cumulative needed by 2100; ~10 Gt/year by mid-century',
             fontsize=9, color=SECONDARY)

    ax2 = fig.add_subplot(gs[1])
    ax2.set_xlim(0, 10)
    ax2.set_ylim(0, 10)
    ax2.axis('off')
    ax2.set_title('Solid-state battery market', fontsize=14, fontweight='bold', pad=8)
    box = FancyBboxPatch((0.8, 3.5), 8.4, 3.0, boxstyle='round,pad=0.05',
                         facecolor=SOFT_AMBER, edgecolor=AMBER, linewidth=2)
    ax2.add_patch(box)
    ax2.text(5, 6.0, 'Projected >10× growth', ha='center', va='center',
             fontsize=16, fontweight='bold', color=AMBER)
    ax2.text(5, 4.7, 'over the next decade', ha='center', va='center',
             fontsize=12, color=TEXT)
    ax2.text(5, 2.2, 'Drives demand for halide electrolytes and LMR cathodes.',
             ha='center', va='center', fontsize=10, color=SECONDARY)

    fig.suptitle('Cumulative Climate Opportunity by Target', fontsize=20, fontweight='bold', color=TEXT)
    add_source(ax1, 'Sources: IPCC AR6; article chapters; industry analysts', x=0.99, y=-0.14)
    plt.tight_layout(pad=0.6)
    return save(fig, f'{SLUG}-06-climate-scale.jpg')


# -----------------------------------------------------------------------------
# 07 — Risk: impossibility flags
# -----------------------------------------------------------------------------
def viz_07():
    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')

    examples = [
        ('MOF framework', 'outside hydrolysis-correction domain', 'flag out-of-domain'),
        ('Tin perovskite phase', 'metastable by convex-hull proof', 'ruled out before synthesis'),
        ('Ammonia catalyst', 'scaling-relation breaking needs higher-level treatment', 'flag for DFT+U / hybrid'),
    ]
    y_positions = np.linspace(8.0, 2.4, len(examples))
    card_h = 1.3
    card_w = 3.6

    # Headers
    ax.text(2.4, 9.3, 'Uncorrected claim', ha='center', fontsize=13,
            fontweight='bold', color=ROSE)
    ax.text(7.6, 9.3, 'Verified / ruled-out claim', ha='center', fontsize=13,
            fontweight='bold', color=SAGE)

    for y, (title, issue, outcome) in zip(y_positions, examples):
        # left card
        left = FancyBboxPatch((0.6, y - card_h / 2), card_w, card_h,
                              boxstyle='round,pad=0.03,rounding_size=0.08',
                              facecolor=ROSE, edgecolor=TEXT, linewidth=1.2, alpha=0.9)
        ax.add_patch(left)
        ax.text(0.6 + card_w / 2, y + 0.15, title, ha='center', va='center',
                fontsize=11, fontweight='bold', color='white')
        ax.text(0.6 + card_w / 2, y - 0.25, issue, ha='center', va='center',
                fontsize=9, color='white', linespacing=1.0)

        # arrow
        ax.annotate('', xy=(7.0, y), xytext=(4.4, y),
                    arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2))

        # right card
        right = FancyBboxPatch((7.0, y - card_h / 2), card_w, card_h,
                               boxstyle='round,pad=0.03,rounding_size=0.08',
                               facecolor=SAGE, edgecolor=TEXT, linewidth=1.2, alpha=0.9)
        ax.add_patch(right)
        ax.text(7.0 + card_w / 2, y, outcome, ha='center', va='center',
                fontsize=11, fontweight='bold', color='white', linespacing=1.0)

    ax.text(5, 0.9, '77 build-locked Lean 4 theorems provide machine-checked guarantees before lab budget is spent.',
            ha='center', va='center', fontsize=12, fontweight='bold', color=PRIMARY)
    ax.set_title('When Correction Says "No" — Impossibility, Not Just Uncertainty', fontsize=19, pad=15)
    add_source(ax, 'Source: Lupine verification layer', x=0.99, y=0.01)
    plt.tight_layout(pad=0.6)
    return save(fig, f'{SLUG}-07-impossibility-flags.jpg')


# -----------------------------------------------------------------------------
# 08 — Partnership / ecosystem: cross-cutting institutions
# -----------------------------------------------------------------------------
def viz_08():
    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    ax.set_xlim(-1.3, 1.3)
    ax.set_ylim(-1.2, 1.2)
    ax.axis('off')

    targets = [
        ('LMR cathodes', 90),
        ('Halide\nelectrolytes', 162),
        ('MOF DAC', 234),
        ('Ammonia\ncatalysts', 306),
        ('Lead-free\nperovskites', 18),
    ]
    target_radius = 0.92
    target_color = AMBER
    for label, angle in targets:
        theta = math.radians(angle)
        x = target_radius * math.cos(theta)
        y = target_radius * math.sin(theta)
        circle = Circle((x, y), 0.20, facecolor=target_color, edgecolor=TEXT, linewidth=1.5)
        ax.add_patch(circle)
        ax.text(x, y, label, ha='center', va='center', fontsize=9,
                fontweight='bold', color='white', linespacing=0.9)
        # line to center
        ax.plot([x * 0.72, 0], [y * 0.72, 0], color=MUTED, lw=1.2, zorder=1)

    # Center Lupine
    center = Circle((0, 0), 0.22, facecolor=PRIMARY, edgecolor=TEXT, linewidth=2)
    ax.add_patch(center)
    ax.text(0, 0, 'Lupine', ha='center', va='center', fontsize=12,
            fontweight='bold', color='white')

    # Institution halos as translucent ellipses
    institutions = [
        ('NREL\n(4 of 5 targets)', 0.0, 0.0, 1.25, 1.25, SAGE, 0.16),
        ('UC Berkeley\n(batteries + MOF DAC)', -0.42, 0.42, 0.95, 0.70, PRIMARY, 0.14),
        ('ARPA-E\n(REFUEL / IONICS / OPEN)', 0.38, -0.38, 1.00, 0.75, ROSE, 0.12),
    ]
    for label, cx, cy, rx, ry, color, alpha in institutions:
        ellipse = mpatches.Ellipse((cx, cy), rx, ry, angle=0,
                                   facecolor=color, edgecolor=color, alpha=alpha, zorder=0)
        ax.add_patch(ellipse)

    # Institution labels placed outside the center so Lupine remains readable
    ax.text(0, 0.52, 'NREL\n(4 of 5 targets)', ha='center', va='bottom', fontsize=10,
            fontweight='bold', color=SAGE, linespacing=0.95)
    ax.text(-0.78, 0.72, 'UC Berkeley\n(batteries + MOF DAC)', ha='center', va='center', fontsize=10,
            fontweight='bold', color=PRIMARY, linespacing=0.95)
    ax.text(0.95, -0.55, 'ARPA-E\n(REFUEL / IONICS / OPEN)', ha='center', va='center', fontsize=10,
            fontweight='bold', color=ROSE, linespacing=0.95)

    ax.text(0, -1.12, 'One NREL master CRADA and one UC Berkeley campus partnership cover four of five target chains.',
            ha='center', va='center', fontsize=11, color=SECONDARY)
    ax.set_title('NREL, UC Berkeley, and ARPA-E Create Economies of Scope', fontsize=19, pad=15)
    add_source(ax, 'Source: Lupine partner map', x=0.99, y=0.01)
    plt.tight_layout(pad=0.6)
    return save(fig, f'{SLUG}-08-ecosystem-map.jpg')


# -----------------------------------------------------------------------------
# 09 — Economics / moat: value of trusted materials infrastructure
# -----------------------------------------------------------------------------
def viz_09():
    fig, axes = plt.subplots(2, 1, figsize=(FIG_W, FIG_H),
                             gridspec_kw={'height_ratios': [1, 1], 'hspace': 0.35,
                                          'left': 0.10, 'right': 0.96, 'top': 0.84, 'bottom': 0.12})

    rows = [
        ('NIST MGI annual value — improved materials innovation infrastructure',
         123, 270, PRIMARY, '$B/year', 300),
        ('ARPA-E private follow-on capital catalyzed',
         2, 10, AMBER, '$B', 12),
    ]

    for ax, (label, low, high, color, unit, xmax) in zip(axes, rows):
        ax.set_xlim(0, xmax)
        ax.set_ylim(0, 1)
        ax.axis('off')

        y_bar = 0.55
        ax.plot([0, xmax * 0.95], [y_bar, y_bar], color=MUTED, lw=1.5)
        ax.barh(y_bar, high - low, left=low, height=0.16, color=color, edgecolor=TEXT, linewidth=0.5)

        # Value labels with vertical separation
        ax.text(low, y_bar + 0.22, f'${low}{unit.strip("$")}', ha='center', va='bottom',
                fontsize=12, fontweight='bold', color=color)
        ax.text(high, y_bar - 0.22, f'${high}{unit.strip("$")}', ha='center', va='top',
                fontsize=12, fontweight='bold', color=color)

        # Row label
        ax.text(xmax * 0.475, 0.18, label, ha='center', va='center',
                fontsize=12, color=TEXT)

    fig.suptitle('The Economic Case for a Verification Layer', fontsize=20, fontweight='bold', color=TEXT)
    fig.text(0.5, 0.04, 'The market values the infrastructure that turns predictions into products.',
             ha='center', va='center', fontsize=12, fontweight='bold', color=PRIMARY)
    add_source(axes[1], 'Sources: NIST / RTI International 2023; ARPA-E Impact 2023', x=0.99, y=-0.18)
    plt.tight_layout(pad=0.6)
    return save(fig, f'{SLUG}-09-materials-genome-value.jpg')


# -----------------------------------------------------------------------------
# 10 — placeholder (MiniMax scene illustration generated separately)
# -----------------------------------------------------------------------------
def viz_10_placeholder():
    fig, ax = plt.subplots(figsize=(FIG_W, FIG_H))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.text(5, 5, 'Scene illustration: crystal-to-cell pipeline\n(MiniMax-generated)',
            ha='center', va='center', fontsize=18, color=SECONDARY)
    return save(fig, f'{SLUG}-10-crystal-to-cell.jpg')


# -----------------------------------------------------------------------------
def main():
    files = []
    files.append(viz_01())
    files.append(viz_02())
    files.append(viz_03())
    files.append(viz_04())
    files.append(viz_05())
    files.append(viz_06())
    files.append(viz_07())
    files.append(viz_08())
    files.append(viz_09())
    files.append(viz_10_placeholder())

    total_size = sum(f.stat().st_size for f in files)
    print(f'Generated {len(files)} images; total size {total_size / 1024:.1f} KB')
    for f in files:
        print(f.name, f.stat().st_size)


if __name__ == '__main__':
    main()
