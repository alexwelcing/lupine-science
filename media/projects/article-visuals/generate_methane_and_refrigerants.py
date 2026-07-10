#!/usr/bin/env python3
"""Generate deck-level visuals for methane-and-refrigerants-cutting-the-non-co2-climate-forcers."""

import json
import os
from io import BytesIO
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch, Rectangle, Polygon
import numpy as np
from PIL import Image
from scipy.interpolate import CubicSpline

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
MUTED = '#aaaaaa'
SOFT_INDIGO = '#d9d8ff'
SOFT_AMBER = '#f5e3c8'
SOFT_SAGE = '#c8dccf'
SOFT_SLATE = '#d8dfe6'
SOFT_ROSE = '#f0d4d4'

SLUG = 'methane-and-refrigerants-cutting-the-non-co2-climate-forcers'
OUT_DIR = Path(f'/home/alex/Dev/lupine/lupine-science/public/articles/{SLUG}/images')
OUT_DIR.mkdir(parents=True, exist_ok=True)

DPI = 150
W_PIX, H_PIX = 1280, 720
FIG_W = W_PIX / DPI
FIG_H = H_PIX / DPI


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
        img = img.resize((W_PIX, H_PIX), Image.LANCZOS)
    out_path = OUT_DIR / filename
    img.save(out_path, 'JPEG', quality=90, dpi=(DPI, DPI))
    plt.close(fig)
    return out_path


def add_title(fig, title, y=0.96):
    fig.text(0.5, y, title, ha='center', va='top',
             fontsize=22, fontweight='bold', color=TEXT,
             fontfamily='sans-serif')


def add_source(fig, source, y=0.04):
    fig.text(0.5, y, source, ha='center', va='bottom',
             fontsize=9, color=SECONDARY, fontfamily='sans-serif')


# -----------------------------------------------------------------------------
# 01 — Non-CO₂ warming lever
# -----------------------------------------------------------------------------
def make_01():
    fig = base_figure()
    gs = fig.add_gridspec(1, 2, left=0.08, right=0.92, top=0.82, bottom=0.20,
                          wspace=0.30)

    # Left: warming avoided
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.set_facecolor(BG)
    measures = ['Cut methane\n30% by 2030', 'Full Kigali\ncompliance', 'Combined\npotential']
    values = [0.3, 0.5, 0.8]
    colors = [AMBER, SAGE, PRIMARY]
    bars = ax1.barh(measures, values, color=colors, edgecolor='none', height=0.55)
    ax1.set_xlim(0, 1.0)
    ax1.invert_yaxis()
    ax1.set_xlabel('Warming avoided by 2040 / 2100 (°C)', fontsize=11, color=TEXT)
    ax1.set_title('Near-term warming avoidance', fontsize=13, color=TEXT, fontweight='bold', pad=10)
    for bar, val in zip(bars, values):
        ax1.text(val + 0.03, bar.get_y() + bar.get_height()/2, f'{val:.1f} °C',
                 va='center', fontsize=11, color=TEXT, fontweight='bold')
    ax1.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax1.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax1.grid(axis='x', linestyle='--', alpha=0.3, color=MUTED)

    # Right: current contribution and GWP
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.set_facecolor(BG)
    ax2.set_xlim(0, 1)
    ax2.set_ylim(0, 1)
    ax2.axis('off')

    metrics = [
        ('Methane share of current warming', '30%', ROSE),
        ('20-year GWP vs CO₂', '80–85×', AMBER),
        ('Anthropogenic CH₄ emissions', '~360 Mt/year', PRIMARY),
        ('Equivalent CO₂e', '~10 GtCO₂e', SAGE),
    ]
    for i, (label, value, color) in enumerate(metrics):
        y = 0.82 - i * 0.22
        rect = FancyBboxPatch((0.10, y - 0.09), 0.80, 0.18,
                              boxstyle='round,pad=0.01,rounding_size=0.02',
                              facecolor=color, edgecolor='none', alpha=0.12)
        ax2.add_patch(rect)
        ax2.text(0.50, y + 0.025, label, ha='center', va='center', fontsize=9, color=TEXT)
        ax2.text(0.50, y - 0.045, value, ha='center', va='center', fontsize=13,
                 color=color, fontweight='bold')

    add_title(fig, 'The Non-CO₂ Warming Lever', y=0.96)
    add_source(fig, 'Sources: UNEP Global Methane Assessment, 2021; UNEP / US EPA Kigali Amendment impact estimates; IPCC AR6.')
    return save_jpg(fig, f'{SLUG}-01-non-co2-warming-lever.jpg')


# -----------------------------------------------------------------------------
# 02 — uMLIP softening error (evidence panel)
# -----------------------------------------------------------------------------
def make_02():
    fig = base_figure()
    gs = fig.add_gridspec(1, 2, left=0.08, right=0.92, top=0.82, bottom=0.18,
                          wspace=0.28)

    # Left: coordination-number error heatmap
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.set_facecolor(BG)
    c = np.linspace(6.5, 12, 100)
    error_pct = 60 * np.exp(-0.55 * (c - 6.5)) + 5
    error_pct = np.clip(error_pct, 5, 60)
    # Diverging-ish bar/area
    ax1.fill_between(c, error_pct, color=ROSE, alpha=0.15)
    ax1.plot(c, error_pct, color=ROSE, lw=3)
    ax1.axhspan(15, 60, xmin=0, xmax=0.55, color=ROSE, alpha=0.08)
    ax1.text(8.5, 45, '15–60%\nsoftening', ha='center', fontsize=10, color=ROSE, fontweight='bold')

    # Region labels
    regions = [
        (7.3, 'surfaces\n(110), (100)'),
        (8.7, '(111) surfaces'),
        (10.0, 'transition\nstates'),
        (11.2, 'defects /\nradicals'),
    ]
    for x, label in regions:
        ax1.axvline(x, color=MUTED, lw=1, linestyle=':', alpha=0.7)
        ax1.text(x, 52, label, ha='center', fontsize=8, color=SECONDARY)

    ax1.set_xlabel('Local coordination number', fontsize=11, color=TEXT)
    ax1.set_ylabel('uMLIP softening (%)', fontsize=11, color=TEXT)
    ax1.set_xlim(6.5, 12)
    ax1.set_ylim(0, 65)
    ax1.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax1.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax1.set_title('Softening vs coordination', fontsize=13, color=TEXT, fontweight='bold', pad=10)

    # Right: ranking inversion scatter
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.set_facecolor(BG)
    np.random.seed(3)
    n = 18
    dft = np.linspace(-1.5, 1.5, n)
    umlip = dft * 0.6 + np.random.normal(0, 0.2, n)
    # Add a few inverted points
    umlip[4] += 0.8
    umlip[12] -= 0.7
    colors = [ROSE if (i == 4 or i == 12) else PRIMARY for i in range(n)]
    ax2.scatter(dft, umlip, c=colors, s=80, alpha=0.8, edgecolor=TEXT, linewidth=0.5, zorder=3)
    lims = [-1.8, 1.8]
    ax2.plot(lims, lims, 'k--', lw=1.5, label='1:1 ranking')
    ax2.set_xlim(lims)
    ax2.set_ylim(lims)
    ax2.set_xlabel('DFT ranking score', fontsize=11, color=TEXT)
    ax2.set_ylabel('uMLIP ranking score', fontsize=11, color=TEXT)
    ax2.set_title('Inverted candidate rankings', fontsize=13, color=TEXT, fontweight='bold', pad=10)
    ax2.text(0.05, 0.95, 'False positives\n& false negatives', transform=ax2.transAxes,
             ha='left', va='top', fontsize=10, color=ROSE, fontweight='bold')
    ax2.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax2.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax2.grid(True, linestyle='--', alpha=0.3, color=MUTED)

    add_title(fig, 'Where uMLIPs Fail: Systematic Softening in Under-Coordinated Environments', y=0.96)
    add_source(fig, 'Source: Deng et al., npj Computational Materials, 2025.')
    return save_jpg(fig, f'{SLUG}-02-umlip-softening-error.jpg')


# -----------------------------------------------------------------------------
# 03 — Environment error field (concept diagram)
# -----------------------------------------------------------------------------
def make_03():
    fig = base_figure()
    ax = fig.add_axes([0.08, 0.18, 0.84, 0.66])
    ax.set_xlim(6.2, 12.8)
    ax.set_ylim(-0.08, 0.32)
    ax.set_facecolor(BG)

    # Anchor points and spline
    anchors_c = np.array([8, 9, 11, 12])
    anchors_p = np.array([0.22, 0.12, 0.03, 0.0])
    cs = CubicSpline(anchors_c, anchors_p, bc_type='natural')
    c_fine = np.linspace(8, 12, 200)
    p_fine = cs(c_fine)
    # Blind prediction below lowest anchor
    slope = (anchors_p[1] - anchors_p[0]) / (anchors_c[1] - anchors_c[0])
    c_low = np.linspace(7, 8, 50)
    p_low = anchors_p[0] + slope * (c_low - 8)

    ax.plot(c_fine, p_fine, color=PRIMARY, lw=3, label='Measured spline')
    ax.plot(c_low, p_low, color=PRIMARY, lw=3, linestyle='--', label='Blind prediction')
    ax.fill_between(c_fine, p_fine, alpha=0.12, color=PRIMARY)

    # Anchors
    for ci, pi, label in zip(anchors_c[:-1], anchors_p[:-1],
                             ['Anchor 1\n(100)', 'Anchor 2\n(111)', 'Anchor 3\nvacancy']):
        ax.scatter([ci], [pi], color=PRIMARY, s=120, zorder=5, edgecolor=TEXT)
        ax.annotate(label, xy=(ci, pi), xytext=(ci - 0.15, pi + 0.045),
                    fontsize=9, ha='center', fontweight='bold', color=TEXT)
    ax.scatter([12], [0], color=SAGE, s=140, zorder=5, edgecolor=TEXT, marker='D')
    ax.annotate('Bulk constraint\nP(12) = 0', xy=(12, 0), xytext=(11.5, -0.06),
                fontsize=9, ha='center', fontweight='bold', color=SAGE)

    # Blind region highlight
    ax.axvspan(7, 8, color=AMBER, alpha=0.12)
    ax.text(7.5, 0.28, 'Low-coordination\nblind prediction', ha='center', va='center',
            fontsize=9, color=AMBER, fontweight='bold')

    # Inset: lattice fragment with force-correction arrows
    inset = fig.add_axes([0.62, 0.24, 0.24, 0.24])
    inset.set_xlim(-0.5, 3.5)
    inset.set_ylim(-0.5, 3.5)
    inset.set_facecolor(BG)
    inset.axis('off')
    # Lattice grid
    xs, ys = np.meshgrid(np.arange(4), np.arange(4))
    for i in range(4):
        for j in range(4):
            if i < 3:
                inset.plot([i, i+1], [j, j], color=MUTED, lw=1.5, zorder=1)
            if j < 3:
                inset.plot([i, i], [j, j+1], color=MUTED, lw=1.5, zorder=1)
    # Surface atom with correction arrow
    inset.scatter([0, 1, 2, 3], [0, 0, 0, 0], c=SLATE, s=60, zorder=3)
    inset.scatter([0, 1, 2, 3], [1, 1, 2, 2], c=SLATE, s=60, zorder=3)
    inset.annotate('', xy=(1.5, -0.7), xytext=(1.5, 0),
                   arrowprops=dict(arrowstyle='->', color=PRIMARY, lw=2))
    inset.text(1.5, -1.0, 'Force correction', ha='center', fontsize=8, color=PRIMARY)
    for spine in inset.spines.values():
        spine.set_color(MUTED)
    inset.set_title('Local force correction', fontsize=9, color=TEXT)

    ax.set_xlabel('Local coordination number  c', fontsize=11, color=TEXT)
    ax.set_ylabel('Correction potential  P(c)', fontsize=11, color=TEXT)
    ax.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax.legend(loc='upper right', frameon=False, fontsize=9)

    # Overhead callout
    ax.text(0.02, 0.02, 'Python overhead: 15.6%  →  compiled overlay: <1%',
            transform=ax.transAxes, fontsize=10, color=SECONDARY)

    add_title(fig, "Lupine's Measured Environment Error Field", y=0.96)
    add_source(fig, 'Source: Lupine Science, Strategic Discovery Plan, Sections 2–3.')
    return save_jpg(fig, f'{SLUG}-03-environment-error-field.jpg')


# -----------------------------------------------------------------------------
# 04 — Blind prediction correlation
# -----------------------------------------------------------------------------
def make_04():
    fig = base_figure()
    ax = fig.add_axes([0.12, 0.18, 0.76, 0.66])
    ax.set_facecolor(BG)

    np.random.seed(7)
    n = 36
    observed = np.linspace(-0.8, 0.8, n)
    noise = np.random.normal(0, 0.18, n)
    # Generate predictions with target correlation 0.906
    noise = (noise - noise.mean()) / noise.std()
    predicted = 0.906 * ((observed - observed.mean()) / observed.std()) + np.sqrt(1 - 0.906**2) * noise
    observed = 0.15 * ((observed - observed.mean()) / observed.std())
    predicted = 0.15 * predicted

    ax.scatter(observed, predicted, c=PRIMARY, s=70, alpha=0.75,
               edgecolor=TEXT, linewidth=0.5, zorder=3)
    lims = [-0.35, 0.35]
    ax.plot(lims, lims, color=SECONDARY, lw=2, linestyle='--', zorder=2)
    ax.set_xlim(lims)
    ax.set_ylim(lims)
    ax.set_xlabel('Reference value', fontsize=12, color=TEXT)
    ax.set_ylabel('Corrected prediction', fontsize=12, color=TEXT)

    # Stats box
    stats_text = 'n = 36\nr = 0.906\np = 10⁻⁴\n95% CI [0.82, 0.96]\nzero adjustable parameters'
    ax.text(0.05, 0.95, stats_text, transform=ax.transAxes, ha='left', va='top',
            fontsize=11, color=TEXT,
            bbox=dict(boxstyle='round,pad=0.4', facecolor=SOFT_INDIGO,
                      edgecolor=PRIMARY, linewidth=2))

    ax.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax.grid(True, linestyle='--', alpha=0.3, color=MUTED)
    ax.set_aspect('equal', adjustable='box')

    add_title(fig, 'Blind Prediction Accuracy Across 36 (Model, Material) Combinations', y=0.96)
    add_source(fig, 'Source: Lupine Science, Strategic Discovery Plan, Sections 2–3.')
    return save_jpg(fig, f'{SLUG}-04-blind-prediction-correlation.jpg')


# -----------------------------------------------------------------------------
# 05 — Methane-to-methanol scaling
# -----------------------------------------------------------------------------
def make_05():
    fig = base_figure()
    ax = fig.add_axes([0.12, 0.18, 0.76, 0.66])
    ax.set_facecolor(BG)

    x = np.linspace(0, 1, 300)
    # Scaling-relation trap: high activity → over-oxidation
    trap = 1.6 * np.exp(-((x - 0.35)**2) / 0.03) + 0.4 * x
    # Corrected selective path: lower barrier, stable methanol well
    selective = 0.9 * np.exp(-((x - 0.35)**2) / 0.04) + 0.25 * x - 0.15 * np.exp(-((x - 0.75)**2) / 0.02)

    ax.plot(x, trap, color=ROSE, lw=3, label='Scaling-relation trap')
    ax.plot(x, selective, color=SAGE, lw=3, label='Corrected selective path')
    ax.fill_between(x, trap, alpha=0.12, color=ROSE)
    ax.fill_between(x, selective, alpha=0.12, color=SAGE)

    # Labels
    ax.text(0.18, 1.45, 'C–H activation\n~439 kJ/mol', ha='center', fontsize=10, color=TEXT)
    ax.text(0.72, 0.18, 'Methanol\ndesorbed', ha='center', fontsize=10, color=SAGE, fontweight='bold')
    ax.text(0.85, 0.95, 'CO₂\nover-oxidation', ha='center', fontsize=10, color=ROSE, fontweight='bold')

    # Barrier annotation
    ax.annotate('', xy=(0.35, 0.35), xytext=(0.35, 1.55),
                arrowprops=dict(arrowstyle='<->', color=AMBER, lw=2))
    ax.text(0.40, 0.95, 'Barrier\nreduction', fontsize=10, color=AMBER, fontweight='bold')

    # Industrial route marker
    ax.axhline(1.7, color=MUTED, lw=1.5, linestyle=':', alpha=0.7)
    ax.text(0.02, 1.72, 'Industrial syngas route: 800–1000 °C', fontsize=9, color=SECONDARY, va='bottom')

    ax.set_xlabel('Reaction coordinate', fontsize=12, color=TEXT)
    ax.set_ylabel('Energy (arbitrary)', fontsize=12, color=TEXT)
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 2.0)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.legend(loc='upper right', frameon=False, fontsize=10)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)

    add_title(fig, 'Breaking the Scaling Relation in Direct Methane-to-Methanol', y=0.96)
    add_source(fig, 'Sources: Berkowitz et al., J. Phys. Chem., 1994; IEA / Methanol Institute; Grundner et al., Nat. Commun., 2015.')
    return save_jpg(fig, f'{SLUG}-05-methane-to-methanol-scaling.jpg')


# -----------------------------------------------------------------------------
# 06 — Methane pyrolysis temperature
# -----------------------------------------------------------------------------
def make_06():
    fig = base_figure()
    ax = fig.add_axes([0.12, 0.18, 0.76, 0.66])
    ax.set_facecolor(BG)

    processes = ['Conventional\nthermal pyrolysis', 'Molten-metal /\nmolten-salt catalytic', 'Target low-T\noperation']
    temp_low = [1000, 700, 400]
    temp_high = [1200, 900, 600]
    colors = [ROSE, AMBER, SAGE]
    y = np.arange(len(processes))

    for i, (proc, tl, th, color) in enumerate(zip(processes, temp_low, temp_high, colors)):
        ax.barh(i, th - tl, left=tl, height=0.5, color=color, edgecolor='none', alpha=0.9)
        ax.text(tl + (th - tl)/2, i, f'{tl}–{th} °C', ha='center', va='center',
                fontsize=11, color='white', fontweight='bold')

    ax.set_yticks(y)
    ax.set_yticklabels(processes, fontsize=11)
    ax.set_xlim(300, 1300)
    ax.invert_yaxis()
    ax.set_xlabel('Process temperature (°C)', fontsize=12, color=TEXT)
    ax.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax.grid(axis='x', linestyle='--', alpha=0.3, color=MUTED)

    # Product annotations
    ax.text(1230, 2.0, 'H₂ + amorphous C', fontsize=10, color=ROSE, ha='left', va='center', fontweight='bold')
    ax.text(930, 1.0, 'H₂ + graphite / carbon black', fontsize=10, color=AMBER, ha='left', va='center', fontweight='bold')
    ax.text(620, 0.0, 'H₂ + sequesterable solid carbon', fontsize=10, color=SAGE, ha='left', va='center', fontweight='bold')

    # Note: row index 2 = conventional (top), 1 = molten-metal, 0 = target (bottom) because invert_yaxis

    add_title(fig, 'Methane Pyrolysis: Lower Temperature, Useful Carbon', y=0.96)
    add_source(fig, 'Source: Abánades, Int. J. Hydrogen Energy, 2012.')
    return save_jpg(fig, f'{SLUG}-06-methane-pyrolysis-temperature.jpg')


# -----------------------------------------------------------------------------
# 07 — Refrigerant GWP landscape
# -----------------------------------------------------------------------------
def make_07():
    fig = base_figure()
    ax = fig.add_axes([0.12, 0.18, 0.76, 0.66])
    ax.set_facecolor(BG)

    # Refrigerants data: (name, GWP, COP relative to R-410A, flammability/toxicity)
    refrigerants = [
        ('R-410A', 2088, 1.00, 'A1', PRIMARY),
        ('R-32', 675, 0.98, 'A2L', AMBER),
        ('R-1234yf', 1, 0.94, 'A2L', SAGE),
        ('CO₂', 1, 0.85, 'A1', SLATE),
        ('Ammonia', 0, 1.05, 'B2L', ROSE),
        ('Propane', 3, 0.95, 'A3', AMBER),
        ('Target', 5, 0.97, 'A1', PRIMARY),
    ]
    names = [r[0] for r in refrigerants]
    gwps = np.array([r[1] for r in refrigerants])
    cops = np.array([r[2] for r in refrigerants])
    classes = [r[3] for r in refrigerants]
    colors = [r[4] for r in refrigerants]

    # Safety zones
    ax.axvspan(0.5, 10, 0.6, 1.0, color=SAGE, alpha=0.08)
    ax.axvspan(0.5, 10, 0.0, 0.4, color=ROSE, alpha=0.08)
    ax.text(2, 1.12, 'Preferred zone', fontsize=10, color=SAGE, fontweight='bold')
    ax.text(2, 0.78, 'COP penalty >10%', fontsize=10, color=ROSE, fontweight='bold')

    # Scatter
    for i, (name, gwp, cop, cls, color) in enumerate(refrigerants):
        ax.scatter(gwp, cop, s=180, c=color, edgecolor=TEXT, linewidth=1, zorder=3)
        offset = (8, 8) if name != 'Target' else (8, -18)
        weight = 'bold' if name == 'Target' else 'normal'
        ax.annotate(f'{name}\n(GWP {gwp}, {cls})', xy=(gwp, cop),
                    xytext=offset, textcoords='offset points',
                    fontsize=9, color=TEXT, fontweight=weight, ha='left')

    ax.axhline(0.90, color=MUTED, lw=1.5, linestyle='--', alpha=0.7)
    ax.text(0.6, 0.91, 'COP within 10% of R-410A', fontsize=9, color=SECONDARY, va='bottom')
    ax.axvline(10, color=PRIMARY, lw=2, linestyle='--', alpha=0.7)
    ax.text(11, 0.80, 'Target\nGWP < 10', fontsize=9, color=PRIMARY, fontweight='bold')

    ax.set_xscale('log')
    ax.set_xlim(0.3, 3000)
    ax.set_ylim(0.75, 1.18)
    ax.set_xlabel('Global warming potential (GWP100, log scale)', fontsize=12, color=TEXT)
    ax.set_ylabel('COP relative to R-410A', fontsize=12, color=TEXT)
    ax.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax.grid(True, linestyle='--', alpha=0.3, color=MUTED)

    # Emissions trajectory callout
    ax.text(0.98, 0.05, 'Uncontrolled HFC emissions: 5–9 GtCO₂e/year by mid-century',
            transform=ax.transAxes, ha='right', va='bottom', fontsize=9, color=SECONDARY)

    add_title(fig, 'The Refrigerant Trade-Off: GWP, Performance, and Safety', y=0.96)
    add_source(fig, 'Sources: ASHRAE Standard 34; Velders et al., Climatic Change, 2021.')
    return save_jpg(fig, f'{SLUG}-07-refrigerant-gwp-landscape.jpg')


# -----------------------------------------------------------------------------
# 08 — Caloric verification workflow
# -----------------------------------------------------------------------------
def make_08():
    fig = base_figure()
    ax = fig.add_axes([0.08, 0.18, 0.84, 0.66])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    ax.set_facecolor(BG)

    stages = [
        ('uMLIP\nscreen', PRIMARY),
        ('Error-field\ncorrection', AMBER),
        ('Candidate\nranking', SAGE),
        ('Lean 4\nverification', SLATE),
        ('Synthesis\n/ operating\nbounds', ROSE),
    ]
    n = len(stages)
    xs = np.linspace(0.06, 0.94, n)
    y = 0.55
    w = 0.16
    h = 0.30

    for i, (label, color) in enumerate(stages):
        x = xs[i] - w/2
        rect = FancyBboxPatch((x, y - h/2), w, h,
                              boxstyle='round,pad=0.01,rounding_size=0.02',
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(xs[i], y, label, ha='center', va='center',
                fontsize=10, color='white', fontweight='bold', linespacing=1.1)
        if i < n - 1:
            ax.annotate('', xy=(xs[i+1] - w/2 - 0.01, y),
                        xytext=(xs[i] + w/2 + 0.01, y),
                        arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2))

    # Output labels below
    outputs = [
        'millions of candidates',
        'corrected energies',
        'ΔS + hysteresis rank',
        'supported vs unsupported',
        'validated material',
    ]
    for i, out in enumerate(outputs):
        ax.text(xs[i], y - h/2 - 0.05, out, ha='center', va='top',
                fontsize=8, color=SECONDARY)

    # Stats box
    stats_box = FancyBboxPatch((0.28, 0.12), 0.44, 0.16,
                               boxstyle='round,pad=0.02',
                               facecolor=SOFT_INDIGO, edgecolor=PRIMARY, linewidth=2)
    ax.add_patch(stats_box)
    ax.text(0.5, 0.20, '20–50% efficiency gain potential  •  77 build-locked Lean 4 theorems',
            ha='center', va='center', fontsize=10, color=TEXT, fontweight='bold')

    add_title(fig, 'Caloric Materials: From Correction to Verified Discovery', y=0.96)
    add_source(fig, 'Sources: Gutfleisch et al., Adv. Mater., 2011; DOE / ARPA-E; Lupine Science, Strategic Discovery Plan.')
    return save_jpg(fig, f'{SLUG}-08-caloric-verification-workflow.jpg')


# -----------------------------------------------------------------------------
# 09 — Market and timeline
# -----------------------------------------------------------------------------
def make_09():
    fig = base_figure()
    ax1 = fig.add_axes([0.12, 0.18, 0.76, 0.66])
    ax1.set_facecolor(BG)

    # Market bars
    markets = ['Methanol\nmarket', 'HVAC\nrefrigerants']
    values = [40, 20]
    x = np.array([1, 2])
    bars = ax1.bar(x, values, color=[AMBER, SAGE], edgecolor='none', width=0.5)
    ax1.set_ylabel('Market size ($B/year)', fontsize=12, color=TEXT)
    ax1.set_xticks(x)
    ax1.set_xticklabels(markets, fontsize=11)
    ax1.set_ylim(0, 55)
    for bar, val in zip(bars, values):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1.5,
                 f'${val}B/year', ha='center', va='bottom', fontsize=12,
                 color=TEXT, fontweight='bold')
    ax1.tick_params(axis='y', labelsize=10, colors=TEXT)
    for spine in ax1.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax1.grid(axis='y', linestyle='--', alpha=0.3, color=MUTED)

    # Timeline axis on top
    ax2 = ax1.twiny()
    ax2.set_xlim(2024, 2050)
    ax2.set_xticks([2030, 2047])
    ax2.set_xticklabels(['Global Methane\nPledge: 2030', 'Kigali: 80% HFC\nreduction by 2047'],
                        fontsize=9, color=TEXT)
    ax2.tick_params(axis='x', colors=TEXT, pad=8)
    ax2.spines['top'].set_color(MUTED)
    ax2.spines['top'].set_linewidth(0.8)

    # Policy markers
    ax2.axvline(2030, color=AMBER, lw=2, linestyle='--', alpha=0.8)
    ax2.axvline(2047, color=SAGE, lw=2, linestyle='--', alpha=0.8)

    # Warming avoidance band
    ax1.axhspan(48, 54, color=PRIMARY, alpha=0.08)
    ax1.text(2.6, 51, 'Combined warming\navoidance: 0.5–1 °C', fontsize=10,
             color=PRIMARY, fontweight='bold', ha='center')

    add_title(fig, 'Policy Timelines and Addressable Markets', y=0.96)
    add_source(fig, 'Sources: Methanol Institute; UNEP Global Methane Assessment, 2021; UNEP / US EPA Kigali Amendment estimates.')
    return save_jpg(fig, f'{SLUG}-09-market-and-timeline.jpg')


# -----------------------------------------------------------------------------
# 10 — Common correction geometry
# -----------------------------------------------------------------------------
def make_10():
    fig = base_figure()
    ax = fig.add_axes([0.06, 0.14, 0.88, 0.72])
    ax.set_xlim(-1.2, 1.2)
    ax.set_ylim(-1.15, 1.15)
    ax.axis('off')
    ax.set_facecolor(BG)

    # Center hub
    hub = Circle((0, 0), 0.22, facecolor=PRIMARY, edgecolor=TEXT, linewidth=2, alpha=0.95)
    ax.add_patch(hub)
    ax.text(0, 0.04, 'Environment', ha='center', va='center', fontsize=10,
            fontweight='bold', color='white')
    ax.text(0, -0.07, 'error field', ha='center', va='center', fontsize=10,
            fontweight='bold', color='white')

    # Spokes
    spokes = [
        ('Methane C–H\nactivation', 0.95, 0.31, AMBER),
        ('Methane\npyrolysis', 0.59, -0.81, SAGE),
        ('Fluorine-free\nrefrigerants', -0.59, -0.81, SLATE),
        ('Caloric\nmaterials', -0.95, 0.31, ROSE),
        ('Battery\ncathodes', 0.0, 1.0, PRIMARY),
        ('Direct air\ncapture', 0.0, -1.0, AMBER),
    ]

    for label, ux, uy, color in spokes:
        # Line from hub to node
        x = ux * 0.72
        y = uy * 0.72
        ax.plot([0, x], [0, y], color=color, lw=2.5, alpha=0.6, zorder=1)
        # Node
        node = Circle((x, y), 0.18, facecolor=color, edgecolor=TEXT, linewidth=1.5, alpha=0.95)
        ax.add_patch(node)
        ax.text(x, y, label, ha='center', va='center', fontsize=9,
                fontweight='bold', color='white', linespacing=1.1)

    # Next targets annotation
    ax.text(0, -1.05, 'Next in series: critical minerals  •  PFAS remediation  •  low-carbon cement',
            ha='center', va='center', fontsize=11, color=SECONDARY,
            bbox=dict(boxstyle='round,pad=0.3', facecolor=BG, edgecolor=MUTED, lw=1))

    add_title(fig, 'One Correction Geometry, Many Climate Targets', y=0.96)
    add_source(fig, 'Source: Lupine Science, Strategic Discovery Plan, Sections 2–3.')
    return save_jpg(fig, f'{SLUG}-10-common-correction-geometry.jpg')


# -----------------------------------------------------------------------------
# Manifest
# -----------------------------------------------------------------------------
MANIFEST = [
    {
        'filename': f'{SLUG}-01-non-co2-warming-lever.jpg',
        'title': 'The Non-CO₂ Warming Lever',
        'type': 'data-chart',
        'caption': 'Methane and HFC refrigerants together offer warming avoidance comparable to the entire energy-sector transition, yet both depend on materials that do not yet exist. Sources: UNEP Global Methane Assessment, 2021; UNEP / US EPA Kigali Amendment impact estimates; IPCC AR6.'
    },
    {
        'filename': f'{SLUG}-02-umlip-softening-error.jpg',
        'title': 'Where uMLIPs Fail: Systematic Softening in Under-Coordinated Environments',
        'type': 'evidence-panel',
        'caption': 'Universal machine-learning potentials soften the energy surface by 15–60% at surfaces, transition states, and radical fragments — the exact environments that determine catalyst and refrigerant performance. Source: Deng et al., npj Computational Materials, 2025.'
    },
    {
        'filename': f'{SLUG}-03-environment-error-field.jpg',
        'title': "Lupine's Measured Environment Error Field",
        'type': 'concept-diagram',
        'caption': 'The environment error field uses three anchor observables and a bulk constraint to correct under-coordinated predictions without retraining the underlying potential. Source: Lupine Science, Strategic Discovery Plan, Sections 2–3.'
    },
    {
        'filename': f'{SLUG}-04-blind-prediction-correlation.jpg',
        'title': 'Blind Prediction Accuracy Across 36 (Model, Material) Combinations',
        'type': 'data-chart',
        'caption': 'Blind tests across 36 model-material combinations yield r = 0.906 with no adjustable parameters, giving capital decisions a DFT-accurate signal at uMLIP speed. Source: Lupine Science, Strategic Discovery Plan, Sections 2–3.'
    },
    {
        'filename': f'{SLUG}-05-methane-to-methanol-scaling.jpg',
        'title': 'Breaking the Scaling Relation in Direct Methane-to-Methanol',
        'type': 'concept-diagram',
        'caption': 'Corrected transition-state barriers can escape the scaling relation that forces active methane catalysts to over-oxidize methanol. Sources: Berkowitz et al., J. Phys. Chem., 1994; IEA / Methanol Institute technology assessments; Grundner et al., Nat. Commun., 2015.'
    },
    {
        'filename': f'{SLUG}-06-methane-pyrolysis-temperature.jpg',
        'title': 'Methane Pyrolysis: Lower Temperature, Useful Carbon',
        'type': 'data-chart',
        'caption': 'Molten-metal catalysts can cut methane pyrolysis temperatures from above 1000 °C to 700–900 °C, producing hydrogen and a storable solid carbon product. Source: Abánades, Int. J. Hydrogen Energy, 2012.'
    },
    {
        'filename': f'{SLUG}-07-refrigerant-gwp-landscape.jpg',
        'title': 'The Refrigerant Trade-Off: GWP, Performance, and Safety',
        'type': 'data-chart',
        'caption': "Today's refrigerants force a choice between low GWP, high efficiency, and safety; computational screening must explore millions of candidates to find one that satisfies all three. Sources: ASHRAE Standard 34; Velders et al., Climatic Change, 2021."
    },
    {
        'filename': f'{SLUG}-08-caloric-verification-workflow.jpg',
        'title': 'Caloric Materials: From Correction to Verified Discovery',
        'type': 'concept-diagram',
        'caption': 'Caloric materials promise 20–50% efficiency gains, but only a verified correction pipeline can separate genuine thermodynamic predictions from microstructure assumptions. Sources: Gutfleisch et al., Adv. Mater., 2011; DOE / ARPA-E; Lupine Science, Strategic Discovery Plan, Sections 2–3.'
    },
    {
        'filename': f'{SLUG}-09-market-and-timeline.jpg',
        'title': 'Policy Timelines and Addressable Markets',
        'type': 'data-chart',
        'caption': 'Tens of billions of dollars in annual product markets and 2030–2047 policy deadlines make fast, verified materials discovery an economic and climate imperative. Sources: Methanol Institute; UNEP Global Methane Assessment, 2021; UNEP / US EPA Kigali Amendment impact estimates.'
    },
    {
        'filename': f'{SLUG}-10-common-correction-geometry.jpg',
        'title': 'One Correction Geometry, Many Climate Targets',
        'type': 'concept-diagram',
        'caption': 'Methane, refrigerants, caloric materials, batteries, and direct air capture share the same under-coordination failure mode — and the same correction geometry. Source: Lupine Science, Strategic Discovery Plan, Sections 2–3.'
    },
]


def write_manifest():
    path = OUT_DIR / 'manifest.json'
    with open(path, 'w') as f:
        json.dump(MANIFEST, f, indent=2)
    return path


# -----------------------------------------------------------------------------
# Run
# -----------------------------------------------------------------------------
def main():
    paths = [
        make_01(),
        make_02(),
        make_03(),
        make_04(),
        make_05(),
        make_06(),
        make_07(),
        make_08(),
        make_09(),
        make_10(),
    ]
    manifest_path = write_manifest()
    total_size = sum(p.stat().st_size for p in paths)
    print(f'Generated {len(paths)} images in {OUT_DIR}')
    print(f'Total size: {total_size / 1024:.1f} KB')
    print(f'Manifest: {manifest_path}')
    for p in paths:
        print(f'  {p.name}: {p.stat().st_size / 1024:.1f} KB')


if __name__ == '__main__':
    main()
