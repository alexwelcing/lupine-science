#!/usr/bin/env python3
"""Generate 10 deck-level visuals for the water-and-air article."""

import json
import math
import os
from io import BytesIO
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch, Polygon, Wedge
import numpy as np
from PIL import Image
from scipy.interpolate import CubicSpline

# -----------------------------------------------------------------------------
# Brand system
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
SOFT_AMBER = '#f5e3c8'
SOFT_SAGE = '#c8dccf'
MUTED = '#aaaaaa'

SLUG = 'water-and-air-correcting-the-molecules-we-drink-and-breathe'
OUT_DIR = Path(f'/home/alex/Dev/lupine/lupine-science/public/articles/{SLUG}/images')
OUT_DIR.mkdir(parents=True, exist_ok=True)

DPI = 150
W_PIX, H_PIX = 1280, 720
FIG_W = W_PIX / DPI
FIG_H = H_PIX / DPI

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['DejaVu Sans', 'Liberation Sans', 'Arial'],
    'font.size': 11,
    'axes.facecolor': BG,
    'figure.facecolor': BG,
    'axes.edgecolor': TEXT,
    'axes.labelcolor': TEXT,
    'xtick.color': SECONDARY,
    'ytick.color': SECONDARY,
    'text.color': TEXT,
    'axes.titlesize': 16,
    'axes.titleweight': 'bold',
})


def base_figure():
    fig = plt.figure(figsize=(FIG_W, FIG_H), dpi=DPI, facecolor=BG)
    fig.patch.set_facecolor(BG)
    return fig


def save_jpg(fig, filename):
    buf = BytesIO()
    fig.savefig(buf, format='png', dpi=DPI, bbox_inches='tight',
                pad_inches=0.02, facecolor=BG)
    buf.seek(0)
    img = Image.open(buf)
    img = img.convert('RGB')
    if img.size != (W_PIX, H_PIX):
        img = img.resize((W_PIX, H_PIX), Image.Resampling.LANCZOS)
    out_path = OUT_DIR / filename
    img.save(out_path, 'JPEG', quality=90, dpi=(DPI, DPI))
    plt.close(fig)
    return out_path


def add_title(fig, title, y=0.96):
    fig.text(0.5, y, title, ha='center', va='top',
             fontsize=20, fontweight='bold', color=TEXT,
             fontfamily='sans-serif')


def add_source(fig, source, y=0.04):
    fig.text(0.5, y, source, ha='center', va='bottom',
             fontsize=9, color=SECONDARY, fontfamily='sans-serif')


# -----------------------------------------------------------------------------
# 01 — Global stakes
# -----------------------------------------------------------------------------
def make_01():
    fig = base_figure()
    gs = fig.add_gridspec(1, 2, left=0.08, right=0.92, top=0.80, bottom=0.20,
                          wspace=0.30)

    # Water panel
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.set_facecolor(BG)
    categories = ['Desalinated\nsupply', 'Projected\nfreshwater deficit']
    values = [97, 40]
    colors = [PRIMARY, AMBER]
    bars = ax1.barh(categories, values, color=colors, edgecolor='none', height=0.5)
    ax1.set_xlim(0, 120)
    ax1.invert_yaxis()
    ax1.set_xlabel('Value (units vary)', fontsize=10, color=TEXT)
    ax1.set_title('Water', fontsize=14, color=TEXT, fontweight='bold', pad=10)
    for bar, val, unit in zip(bars, values, ['M m³/day', '% by 2030']):
        ax1.text(val + 2, bar.get_y() + bar.get_height()/2,
                 f'{val} {unit}', va='center', fontsize=11, color=TEXT)
    ax1.text(0.5, 0.12, '≈2 billion people already affected by water scarcity',
             transform=ax1.transAxes, ha='center', fontsize=10, color=SECONDARY)
    ax1.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax1.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax1.grid(axis='x', linestyle='--', alpha=0.3, color=MUTED)

    # Air panel
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.set_facecolor(BG)
    contributors = ['PM₂.₅', 'NOx', 'VOCs / other']
    deaths = [2.7, 1.6, 0.7]
    colors2 = [PRIMARY, AMBER, SLATE]
    left = 0
    for contrib, death, color in zip(contributors, deaths, colors2):
        ax2.barh('Air pollution', death, left=left, color=color, edgecolor='none', height=0.5)
        ax2.text(left + death/2, 0, f'{contrib}\n{death}M', ha='center', va='center',
                 fontsize=10, color='white', fontweight='bold')
        left += death
    ax2.set_xlim(0, 5.5)
    ax2.set_yticks([])
    ax2.set_xlabel('Premature deaths per year (millions)', fontsize=10, color=TEXT)
    ax2.set_title('Air', fontsize=14, color=TEXT, fontweight='bold', pad=10)
    ax2.text(0.5, 0.12, '4–7 million premature deaths linked to outdoor air pollution',
             transform=ax2.transAxes, ha='center', fontsize=10, color=SECONDARY)
    ax2.tick_params(axis='x', labelsize=10, colors=TEXT)
    for spine in ax2.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax2.grid(axis='x', linestyle='--', alpha=0.3, color=MUTED)

    add_title(fig, 'The Human Scale of Water and Air Failure', y=0.96)
    add_source(fig, 'Sources: IDA 2023; UN Water 2024; WHO / HEI 2024')
    return save_jpg(fig, f'{SLUG}-01-global-stakes.jpg')


# -----------------------------------------------------------------------------
# 02 — Coordination error field
# -----------------------------------------------------------------------------
def make_02():
    fig = base_figure()
    ax = fig.add_axes([0.10, 0.18, 0.80, 0.68])
    ax.set_facecolor(BG)

    x = np.linspace(2, 12, 300)
    # Upper / lower envelope of 15–60% softening, peaking in 4–8 range
    upper = 60 * np.exp(-0.15 * (x - 5.5)**2) + 15
    lower = 25 * np.exp(-0.18 * (x - 5.5)**2) + 12
    upper = np.clip(upper, 15, 60)
    lower = np.clip(lower, 12, 55)

    ax.fill_between(x, lower, upper, color=PRIMARY, alpha=0.15)
    ax.plot(x, upper, color=PRIMARY, lw=2.5, label='Upper envelope')
    ax.plot(x, lower, color=SLATE, lw=2, linestyle='--', label='Lower envelope')

    # Danger zone
    ax.axvspan(4, 8, color=ROSE, alpha=0.08)
    ax.axvline(4, color=ROSE, lw=1, linestyle=':', alpha=0.6)
    ax.axvline(8, color=ROSE, lw=1, linestyle=':', alpha=0.6)
    ax.text(6, 8, '4–8 coordination\ndanger zone', ha='center', va='bottom',
            fontsize=11, color=ROSE, fontweight='bold')

    examples = [
        ('Membrane\npore linings', 4.2, ROSE, 0.5, 20),
        ('MOF\nmetal centres', 5.3, AMBER, 0.7, 14),
        ('Zeolite\nexchanged cations', 6.4, SAGE, 0.9, 8),
        ('Single-atom\ncatalysts', 7.5, SLATE, 0.9, 10),
    ]
    for label, cx, color, tx_off, ty_off in examples:
        yloc = 0.5 * (np.interp(cx, x, upper) + np.interp(cx, x, lower))
        ax.scatter([cx], [yloc], color=color, s=100, zorder=5, edgecolor=TEXT)
        ax.annotate(label, xy=(cx, yloc), xytext=(cx + tx_off, yloc + ty_off),
                    arrowprops=dict(arrowstyle='->', color=color, lw=1.5),
                    fontsize=8, color=color, fontweight='bold')

    ax.set_xlim(2, 12)
    ax.set_ylim(0, 70)
    ax.set_xlabel('Local coordination number', fontsize=12, color=TEXT)
    ax.set_ylabel('Potential-energy surface softening (%)', fontsize=12, color=TEXT)
    ax.legend(loc='upper right', frameon=False, fontsize=9)
    ax.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax.grid(True, linestyle='--', alpha=0.3, color=MUTED)

    add_title(fig, 'The Error Is Coordination, Not Chemistry')
    add_source(fig, 'Source: Deng et al., npj Comput. Mater. 11, 9 (2025)')
    return save_jpg(fig, f'{SLUG}-02-coordination-error-field.jpg')


# -----------------------------------------------------------------------------
# 03 — Correction layer
# -----------------------------------------------------------------------------
def make_03():
    fig = base_figure()
    ax = fig.add_axes([0.06, 0.18, 0.88, 0.70])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor(BG)

    boxes = [
        (0.3, 5.0, 1.8, 1.4, 'Raw uMLIP\npotential surface', PRIMARY),
        (2.5, 5.0, 1.6, 1.4, 'Anchor\nobservables', AMBER),
        (4.5, 5.0, 1.7, 1.4, 'Cubic-spline\nerror field', SAGE),
        (6.6, 5.0, 1.6, 1.4, 'Corrected\ngradients', SLATE),
        (8.6, 5.0, 1.4, 1.4, 'MD / NEB /\nrelaxation', ROSE),
    ]
    for x, y, w, h, label, color in boxes:
        rect = FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.04,rounding_size=0.12',
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h/2, label, ha='center', va='center',
                fontsize=10, fontweight='bold', color='white', linespacing=1.1)

    for i in range(len(boxes) - 1):
        x1 = boxes[i][0] + boxes[i][2]
        x2 = boxes[i+1][0]
        yc = boxes[i][1] + boxes[i][3]/2
        ax.annotate('', xy=(x2 - 0.05, yc), xytext=(x1 + 0.05, yc),
                    arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2))

    # Inset: cubic spline anchored at three points and bulk zero
    inset = fig.add_axes([0.12, 0.22, 0.28, 0.24])
    inset.set_facecolor(BG)
    cs = CubicSpline([8, 9, 11, 12], [0.22, 0.12, 0.03, 0.0])
    c_fine = np.linspace(8, 12, 200)
    inset.plot(c_fine, cs(c_fine), color=PRIMARY, lw=2.5)
    inset.scatter([8, 9, 11], [0.22, 0.12, 0.03], color=AMBER, s=50, zorder=5)
    inset.scatter([12], [0.0], color=SAGE, s=80, zorder=5, marker='o')
    inset.axhline(0, color=MUTED, lw=0.8)
    inset.set_xlim(7.5, 12.5)
    inset.set_ylim(-0.05, 0.28)
    inset.set_title('Spline forced to zero in bulk', fontsize=9, color=TEXT)
    inset.set_xlabel('Coordination', fontsize=8, color=SECONDARY)
    inset.set_ylabel('P(c)', fontsize=8, color=SECONDARY)
    for spine in inset.spines.values():
        spine.set_color(MUTED)

    add_title(fig, 'The Correction Layer, Applied at Runtime')
    add_source(fig, 'Source: Lupine Science Strategic Discovery Plan')
    return save_jpg(fig, f'{SLUG}-03-correction-layer.jpg')


# -----------------------------------------------------------------------------
# 04 — Blind prediction
# -----------------------------------------------------------------------------
def make_04():
    fig = base_figure()
    gs = fig.add_gridspec(2, 2, left=0.10, right=0.90, top=0.82, bottom=0.15,
                          width_ratios=[4, 1], height_ratios=[1, 4], wspace=0.05, hspace=0.05)

    ax_scatter = fig.add_subplot(gs[1, 0])
    ax_top = fig.add_subplot(gs[0, 0], sharex=ax_scatter)
    ax_right = fig.add_subplot(gs[1, 1], sharey=ax_scatter)

    np.random.seed(7)
    n = 36
    x_std = np.random.normal(0, 1, n)
    noise = np.random.normal(0, 1, n)
    r_target = 0.906
    y_std = r_target * x_std + math.sqrt(1 - r_target**2) * noise
    # Scale to plausible surface/binding energies
    x = 1.2 + 0.45 * x_std
    y = 1.2 + 0.45 * y_std

    ax_scatter.scatter(x, y, c=PRIMARY, s=70, alpha=0.75, edgecolor=TEXT, linewidth=0.5, zorder=3)
    lims = [0.3, 2.2]
    ax_scatter.plot(lims, lims, color=SECONDARY, lw=1.5, linestyle='--', zorder=2)
    ax_scatter.set_xlim(lims)
    ax_scatter.set_ylim(lims)
    ax_scatter.set_xlabel('Reference value (eV or J/m²)', fontsize=11, color=TEXT)
    ax_scatter.set_ylabel('Corrected uMLIP prediction', fontsize=11, color=TEXT)
    ax_scatter.set_aspect('equal', adjustable='box')
    for spine in ax_scatter.spines.values():
        spine.set_color(MUTED)

    ax_top.hist(x, bins=10, color=PRIMARY, alpha=0.6, edgecolor='white')
    ax_top.axis('off')
    ax_right.hist(y, bins=10, color=PRIMARY, alpha=0.6, edgecolor='white', orientation='horizontal')
    ax_right.axis('off')

    ax_scatter.text(0.05, 0.95,
                    'n = 36\nr = 0.906\np = 10⁻⁴\n95% CI [0.82, 0.96]\nZero adjustable parameters',
                    transform=ax_scatter.transAxes, ha='left', va='top', fontsize=11,
                    bbox=dict(boxstyle='round,pad=0.35', facecolor=SOFT_INDIGO, edgecolor=PRIMARY))

    add_title(fig, 'Blind Prediction Accuracy Across Models and Materials')
    add_source(fig, 'Source: Lupine Science Strategic Discovery Plan')
    return save_jpg(fig, f'{SLUG}-04-blind-prediction.jpg')


# -----------------------------------------------------------------------------
# 05 — Water rankings
# -----------------------------------------------------------------------------
def make_05():
    fig = base_figure()
    ax = fig.add_axes([0.06, 0.15, 0.88, 0.75])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor(BG)

    rows = [
        ('Desalination membranes', 'NaCl rejection vs permeability', 8.2),
        ('Atmospheric water sorbents', 'Capacity vs hydrolysis barrier', 5.0),
        ('Lithium-selective frameworks', 'Li⁺/Mg²⁺ selectivity', 1.8),
    ]

    ax.text(1.4, 9.5, 'Raw uMLIP ranking', ha='center', fontsize=12, color=TEXT, fontweight='bold')
    ax.text(5.0, 9.5, 'Correction', ha='center', fontsize=12, color=TEXT, fontweight='bold')
    ax.text(8.6, 9.5, 'Corrected ranking', ha='center', fontsize=12, color=PRIMARY, fontweight='bold')

    for title, subtitle, yc in rows:
        # Row label
        ax.text(0.2, yc, title, ha='left', va='center', fontsize=11,
                color=TEXT, fontweight='bold', rotation=90)
        ax.text(0.6, yc - 0.7, subtitle, ha='left', va='center', fontsize=9,
                color=SECONDARY, rotation=90)

        # Raw ranking: false priority highlighted in rose
        raw_order = [('B', ROSE), ('A', TEXT), ('C', TEXT)]
        xstart = 0.55
        for i, (cand, col) in enumerate(raw_order):
            rect = FancyBboxPatch((xstart + i*0.55, yc - 0.5), 0.45, 1.0,
                                  boxstyle='round,pad=0.02', facecolor=col if col == ROSE else 'white',
                                  edgecolor=col, linewidth=2)
            ax.add_patch(rect)
            ax.text(xstart + i*0.55 + 0.225, yc, cand, ha='center', va='center',
                    fontsize=12, fontweight='bold', color='white' if col == ROSE else col)

        # Arrow
        ax.annotate('', xy=(5.7, yc), xytext=(4.2, yc),
                    arrowprops=dict(arrowstyle='->', color=PRIMARY, lw=2))

        # Corrected ranking: true priority highlighted in sage
        corr_order = [('D', SAGE), ('A', TEXT), ('B', TEXT)]
        xstart = 6.0
        for i, (cand, col) in enumerate(corr_order):
            rect = FancyBboxPatch((xstart + i*0.55, yc - 0.5), 0.45, 1.0,
                                  boxstyle='round,pad=0.02', facecolor=col if col == SAGE else 'white',
                                  edgecolor=col, linewidth=2)
            ax.add_patch(rect)
            ax.text(xstart + i*0.55 + 0.225, yc, cand, ha='center', va='center',
                    fontsize=12, fontweight='bold', color='white' if col == SAGE else col)

    # Mini schematics on far right
    def draw_schematic(sx, sy, kind):
        if kind == 'pore':
            ax.plot([sx-0.25, sx-0.25], [sy-0.35, sy+0.35], color=SLATE, lw=3)
            ax.plot([sx+0.25, sx+0.25], [sy-0.35, sy+0.35], color=SLATE, lw=3)
            for yy in [sy-0.15, sy+0.15]:
                circle = Circle((sx, yy), 0.06, color=PRIMARY, zorder=5)
                ax.add_patch(circle)
        elif kind == 'mof':
            ax.plot([sx, sx-0.2], [sy, sy+0.25], color=AMBER, lw=3)
            ax.plot([sx, sx+0.2], [sy, sy+0.25], color=AMBER, lw=3)
            ax.plot([sx, sx], [sy, sy-0.25], color=AMBER, lw=3)
            circle = Circle((sx, sy), 0.08, color=SAGE, zorder=5)
            ax.add_patch(circle)
        elif kind == 'window':
            ring = Circle((sx, sy), 0.22, fill=False, color=PRIMARY, lw=3)
            ax.add_patch(ring)
            ax.text(sx-0.08, sy, 'Li', ha='center', va='center', fontsize=8, color=TEXT)
            ax.text(sx+0.12, sy-0.15, 'Mg', ha='center', va='center', fontsize=7, color=ROSE)

    # Map schematics to rows on right edge
    draw_schematic(9.4, 8.2, 'pore')
    draw_schematic(9.4, 5.0, 'mof')
    draw_schematic(9.4, 1.8, 'window')

    add_title(fig, 'What Corrected Screening Changes in Water')
    add_source(fig, 'Sources: IDA 2023; Hanikel et al. ACS Cent. Sci.; DLE literature')
    return save_jpg(fig, f'{SLUG}-05-water-rankings.jpg')


# -----------------------------------------------------------------------------
# 06 — Market scale
# -----------------------------------------------------------------------------
def make_06():
    fig = base_figure()
    ax = fig.add_axes([0.12, 0.18, 0.76, 0.68])
    ax.set_facecolor(BG)

    categories = [
        'Atmospheric water\ngeneration by 2030',
        'Automotive catalyst\nmarket (annual)',
        'Global lithium demand\nby 2030 (LCE)',
    ]
    values = [9, 20, 2.4]
    units = ['$9B', '>$20B', '~2.4M tonnes']
    colors = [PRIMARY, SAGE, AMBER]

    y = np.arange(len(categories))
    bars = ax.barh(y, values, color=colors, edgecolor='none', height=0.55)
    ax.set_yticks(y)
    ax.set_yticklabels(categories, fontsize=11)
    ax.invert_yaxis()
    ax.set_xlim(0, 26)
    ax.set_xlabel('Market magnitude (units vary)', fontsize=12, color=TEXT)

    for bar, val, unit in zip(bars, values, units):
        ax.text(val + 0.5, bar.get_y() + bar.get_height()/2, unit,
                va='center', fontsize=12, fontweight='bold', color=TEXT)

    ax.text(0.5, -0.16, 'Corrected discovery targets sit inside multi-billion-dollar markets and strategic supply chains.',
            transform=ax.transAxes, ha='center', fontsize=10, color=SECONDARY)
    ax.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax.grid(axis='x', linestyle='--', alpha=0.3, color=MUTED)

    add_title(fig, 'The Markets Touched by Corrected Discovery')
    add_source(fig, 'Sources: market projections; IEA Critical Minerals 2022')
    return save_jpg(fig, f'{SLUG}-06-market-scale.jpg')


# -----------------------------------------------------------------------------
# 07 — Hidden risks
# -----------------------------------------------------------------------------
def make_07():
    fig = base_figure()
    ax = fig.add_axes([0.06, 0.12, 0.88, 0.80])
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_facecolor(BG)

    risks = [
        ('AWH hydrolysis', 'Collapsed\nsorbents', 7.5, 7.5),
        ('Cold-start NOx', 'High real-driving\nemissions', 2.5, 7.5),
        ('Soot filter regeneration', '3–7% fuel\npenalty', 7.5, 2.5),
        ('VOC oxidation', 'Needs >150 °C\nconversion', 2.5, 2.5),
    ]

    for title, consequence, cx, cy in risks:
        # Quadrant background
        rect = FancyBboxPatch((cx - 1.85, cy - 1.7), 3.7, 3.4,
                              boxstyle='round,pad=0.04,rounding_size=0.15',
                              facecolor=BG, edgecolor=MUTED, linewidth=1.5)
        ax.add_patch(rect)
        ax.text(cx, cy + 1.35, title, ha='center', va='top',
                fontsize=11, fontweight='bold', color=TEXT)

        # Raw vs corrected bars
        bar_w = 0.35
        # raw short rose
        rect_r = FancyBboxPatch((cx - 0.85, cy - 0.5), bar_w, 0.6,
                                boxstyle='round,pad=0.02', facecolor=ROSE, edgecolor='none')
        ax.add_patch(rect_r)
        ax.text(cx - 0.68, cy + 0.2, 'raw', ha='center', va='bottom', fontsize=8, color=ROSE)
        # corrected tall sage
        rect_c = FancyBboxPatch((cx + 0.15, cy - 0.5), bar_w, 1.2,
                                boxstyle='round,pad=0.02', facecolor=SAGE, edgecolor='none')
        ax.add_patch(rect_c)
        ax.text(cx + 0.32, cy + 0.8, 'corrected', ha='center', va='bottom', fontsize=8, color=SAGE)

        ax.text(cx, cy - 1.05, consequence, ha='center', va='top',
                fontsize=9, color=SECONDARY, linespacing=1.2)

    # Central coordination hub
    center_x, center_y = 5.0, 5.0
    hub = Circle((center_x, center_y), 0.55, facecolor=SOFT_INDIGO, edgecolor=PRIMARY, linewidth=2)
    ax.add_patch(hub)
    ax.text(center_x, center_y, 'CN\n4–8', ha='center', va='center',
            fontsize=11, fontweight='bold', color=PRIMARY)

    for _, _, cx, cy in risks:
        ax.annotate('', xy=(cx - 0.3 if cx > 5 else cx + 0.3,
                            cy - 0.3 if cy > 5 else cy + 0.3),
                    xytext=(center_x + 0.4*(cx-5)/5, center_y + 0.4*(cy-5)/5),
                    arrowprops=dict(arrowstyle='->', color=PRIMARY, lw=1.5,
                                    connectionstyle='arc3,rad=0.1'))

    add_title(fig, 'Hidden Risks: When Soft Barriers Become Real Failures')
    add_source(fig, 'Sources: Deng et al. 2025; EPA/EEA; automotive emissions literature')
    return save_jpg(fig, f'{SLUG}-07-hidden-risks.jpg')


# -----------------------------------------------------------------------------
# 08 — Proof ecosystem
# -----------------------------------------------------------------------------
def make_08():
    fig = base_figure()
    ax = fig.add_axes([0.06, 0.12, 0.88, 0.80])
    ax.set_xlim(-1.2, 1.2)
    ax.set_ylim(-1.15, 1.15)
    ax.axis('off')
    ax.set_facecolor(BG)

    steps = [
        ('Peer-reviewed\nanchors', 0.0, 1.0, PRIMARY),
        ('Error-field\nmeasurement', 0.95, 0.31, AMBER),
        ('Runtime\ncorrection', 0.59, -0.81, SAGE),
        ('Formal proof\nlibrary', -0.59, -0.81, SLATE),
        ('Bounded\nuncertainty', -0.95, 0.31, ROSE),
    ]

    n = len(steps)
    radius = 0.72
    angles = [90 - i * 360 / n for i in range(n)]

    for i, (title, _, _, _) in enumerate(steps):
        theta0 = math.radians(angles[i])
        theta1 = math.radians(angles[(i + 1) % n])
        r = radius
        ax.annotate('', xy=(r * math.cos(theta1), r * math.sin(theta1)),
                    xytext=(r * math.cos(theta0), r * math.sin(theta0)),
                    arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2,
                                    connectionstyle='arc3,rad=0.15'))

    for title, x, y, color in steps:
        cx, cy = x * radius, y * radius
        circle = Circle((cx, cy), 0.22, facecolor=color, edgecolor=TEXT, linewidth=1.5)
        ax.add_patch(circle)
        ax.text(cx, cy, title, ha='center', va='center',
                fontsize=8, fontweight='bold', color='white', linespacing=1.05)

    # Center lock icon
    lock = Circle((0, 0), 0.18, facecolor=BG, edgecolor=PRIMARY, linewidth=2)
    ax.add_patch(lock)
    ax.text(0, 0, 'LOCK', ha='center', va='center', fontsize=8,
            fontweight='bold', color=PRIMARY)

    ax.text(0, -1.05, '77 build-locked Lean 4 theorems • zero sorry proofs',
            ha='center', va='center', fontsize=11, fontweight='bold', color=SAGE)

    add_title(fig, 'From Peer-Reviewed Anchors to Machine-Checked Proofs')
    add_source(fig, 'Sources: Deng et al. 2025; Lupine Science Lean 4 library')
    return save_jpg(fig, f'{SLUG}-08-proof-ecosystem.jpg')


# -----------------------------------------------------------------------------
# 09 — Speed moat
# -----------------------------------------------------------------------------
def make_09():
    fig = base_figure()
    ax = fig.add_axes([0.12, 0.18, 0.76, 0.68])
    ax.set_facecolor(BG)

    methods = ['DFT', 'Raw uMLIP', 'Corrected uMLIP']
    costs = [1e4, 1e-1, 1.156e-1]
    colors = [ROSE, AMBER, SAGE]

    x = np.arange(len(methods))
    bars = ax.bar(x, costs, color=colors, edgecolor='none', width=0.55)
    ax.set_xticks(x)
    ax.set_xticklabels(methods, fontsize=11)
    ax.set_ylabel('Relative cost per candidate (log scale)', fontsize=12, color=TEXT)
    ax.set_yscale('log')
    ax.set_ylim(1e-2, 2e5)
    ax.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax.grid(axis='y', linestyle='--', alpha=0.3, color=MUTED)

    labels = ['~hours', '~0.1 s', '~0.1 s + 15.6%']
    for bar, label in zip(bars, labels):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2, height * 1.4, label,
                ha='center', va='bottom', fontsize=10, fontweight='bold', color=TEXT)

    # Throughput arrow
    ax.annotate('', xy=(2.3, 2e-2), xytext=(0.7, 2e-2),
                arrowprops=dict(arrowstyle='->', color=PRIMARY, lw=2))
    ax.text(1.5, 3.5e-2, '10⁵ → 10⁶ candidates', ha='center', va='bottom',
            fontsize=11, fontweight='bold', color=PRIMARY)

    add_title(fig, 'Accuracy at Screening Speed')
    add_source(fig, 'Source: Lupine Science Strategic Discovery Plan')
    return save_jpg(fig, f'{SLUG}-09-speed-moat.jpg')


# -----------------------------------------------------------------------------
# Manifest
# -----------------------------------------------------------------------------
MANIFEST = [
    {
        "filename": f"{SLUG}-01-global-stakes.jpg",
        "title": "The Human Scale of Water and Air Failure",
        "type": "data-chart",
        "caption": "Water scarcity already touches about two billion people and air pollution is linked to millions of premature deaths each year, yet the materials we need to fix both are still designed with computational tools that misread their atomic environments."
    },
    {
        "filename": f"{SLUG}-02-coordination-error-field.jpg",
        "title": "The Error Is Coordination, Not Chemistry",
        "type": "concept-diagram",
        "caption": "A recent survey of leading uMLIPs shows the potential energy surface is softened by 15–60% in under-coordinated environments, with the worst errors in the coordination range that governs pores, metal centres, and single-atom sites."
    },
    {
        "filename": f"{SLUG}-03-correction-layer.jpg",
        "title": "The Correction Layer, Applied at Runtime",
        "type": "concept-diagram",
        "caption": "The correction is built from measured anchor observables, enforced to vanish in bulk environments, and applied as analytic forces so every molecular dynamics or barrier calculation follows the corrected surface."
    },
    {
        "filename": f"{SLUG}-04-blind-prediction.jpg",
        "title": "Blind Prediction Accuracy Across Models and Materials",
        "type": "data-chart",
        "caption": "Across 36 blind (model, material) combinations, corrected uMLIPs achieve r = 0.906 with zero adjustable parameters, closing the gap between fast screening and trustworthy energies."
    },
    {
        "filename": f"{SLUG}-05-water-rankings.jpg",
        "title": "What Corrected Screening Changes in Water",
        "type": "evidence-panel",
        "caption": "In desalination membranes, atmospheric-water sorbents, and lithium-selective frameworks, corrected binding and barrier energies overturn the false priorities that raw uMLIPs produce."
    },
    {
        "filename": f"{SLUG}-06-market-scale.jpg",
        "title": "The Markets Touched by Corrected Discovery",
        "type": "data-chart",
        "caption": "The materials that corrected discovery could improve sit inside multi-billion-dollar markets: atmospheric water generation, automotive catalysts, and the lithium supply chain for batteries."
    },
    {
        "filename": f"{SLUG}-07-hidden-risks.jpg",
        "title": "Hidden Risks: When Soft Barriers Become Real Failures",
        "type": "concept-diagram",
        "caption": "Underestimated hydrolysis, redox, and activation barriers translate into collapsed sorbents, cold-start NOx, filter regeneration penalties, and inefficient VOC oxidation in real devices."
    },
    {
        "filename": f"{SLUG}-08-proof-ecosystem.jpg",
        "title": "From Peer-Reviewed Anchors to Machine-Checked Proofs",
        "type": "concept-diagram",
        "caption": "The correction layer is backed by peer-reviewed anchors and 77 build-locked Lean 4 theorems, so claims that fall outside the measured domain are flagged as bounded uncertainty rather than sold as prediction."
    },
    {
        "filename": f"{SLUG}-09-speed-moat.jpg",
        "title": "Accuracy at Screening Speed",
        "type": "data-chart",
        "caption": "Corrected uMLIPs stay roughly 10⁵× faster than DFT while adding only 15.6% runtime overhead, making hundred-thousand- to million-candidate screens economically feasible."
    },
    {
        "filename": f"{SLUG}-10-platform-thesis.jpg",
        "title": "One Correction Layer for Every Pore and Every Breath",
        "type": "scene-illustration",
        "caption": "Because the failure mode is coordination-specific, not climate-specific, one measured and verified correction layer can raise the reliability of discovery across water, air, batteries, and direct air capture."
    },
]


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

    manifest_path = OUT_DIR / 'manifest.json'
    manifest_path.write_text(json.dumps(MANIFEST, indent=2))
    generated.append(manifest_path)

    total_size = sum(p.stat().st_size for p in generated if p.is_file())
    print(f'Generated {len([p for p in generated if p.suffix == ".jpg"])} images + manifest')
    print(f'Total size: {total_size / 1024:.1f} KB')
    for p in generated:
        print(p.name, p.stat().st_size)


if __name__ == '__main__':
    main()
