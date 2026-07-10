#!/usr/bin/env python3
"""Generate deck-level chart visuals for the-02-percent-synthesis-problem."""

import json
import os
from io import BytesIO

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np
from PIL import Image

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

OUT_DIR = '/home/alex/Dev/lupine/lupine-science/public/articles/the-02-percent-synthesis-problem/images'
DPI = 150
W_PIX, H_PIX = 1280, 720
FIG_W = W_PIX / DPI
FIG_H = H_PIX / DPI

os.makedirs(OUT_DIR, exist_ok=True)


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
    out_path = os.path.join(OUT_DIR, filename)
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
# 01 — Synthesis funnel
# -----------------------------------------------------------------------------
def make_01():
    fig = base_figure()
    ax = fig.add_axes([0.08, 0.18, 0.84, 0.62])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    ax.set_facecolor(BG)

    # Main funnel: GNoME -> independently synthesized
    main_stages = [
        ('GNoME computationally stable', 380000, PRIMARY),
        ('Independently synthesized', 736, PRIMARY),
    ]
    # A-Lab branch
    alab_stages = [
        ('A-Lab targets', 58, AMBER),
        ('Reported synthesized', 41, AMBER),
        ('True novel phases', 13, ROSE),
    ]

    def width(v, vmax):
        return 0.15 + 0.7 * np.sqrt(v / vmax)

    vmax_main = main_stages[0][1]
    vmax_alab = alab_stages[0][1]

    y_main = 0.72
    y_alab = 0.28
    h = 0.18

    # Main funnel bars
    xs = np.linspace(0.12, 0.88, len(main_stages))
    for i, (label, val, color) in enumerate(main_stages):
        w = width(val, vmax_main)
        rect = FancyBboxPatch((xs[i] - w/2, y_main - h/2), w, h,
                              boxstyle="round,pad=0.01,rounding_size=0.02",
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(xs[i], y_main + h/2 + 0.06, label, ha='center', va='bottom',
                fontsize=10, color=TEXT, fontweight='bold')
        ax.text(xs[i], y_main, f'{val:,}', ha='center', va='center',
                fontsize=14, color='white', fontweight='bold')
        if i < len(main_stages) - 1:
            ax.annotate('', xy=(xs[i+1] - w/2 - 0.02, y_main),
                        xytext=(xs[i] + w/2 + 0.02, y_main),
                        arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2))

    rate_text = 'Validation rate: 0.2%'
    ax.text(0.5, y_main - h/2 - 0.07, rate_text, ha='center', va='top',
            fontsize=11, color=PRIMARY, fontweight='bold')

    # A-Lab funnel bars
    xs2 = np.linspace(0.12, 0.88, len(alab_stages))
    for i, (label, val, color) in enumerate(alab_stages):
        w = width(val, vmax_alab)
        rect = FancyBboxPatch((xs2[i] - w/2, y_alab - h/2), w, h,
                              boxstyle="round,pad=0.01,rounding_size=0.02",
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(xs2[i], y_alab + h/2 + 0.06, label, ha='center', va='bottom',
                fontsize=10, color=TEXT, fontweight='bold')
        ax.text(xs2[i], y_alab, f'{val}', ha='center', va='center',
                fontsize=14, color='white', fontweight='bold')
        if i < len(alab_stages) - 1:
            ax.annotate('', xy=(xs2[i+1] - w/2 - 0.02, y_alab),
                        xytext=(xs2[i] + w/2 + 0.02, y_alab),
                        arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2))

    ax.text(0.5, y_alab - h/2 - 0.07,
            'Independent review: two-thirds of "novel" targets were known disordered phases',
            ha='center', va='top', fontsize=10, color=SECONDARY)

    add_title(fig, 'The 0.2% Synthesis Funnel', y=0.96)
    add_source(fig, 'Sources: Merchant et al., Nature 2023; Leeman et al., PRX Energy 2024')
    return save_jpg(fig, 'the-02-percent-synthesis-problem-01-synthesis-funnel.jpg')


# -----------------------------------------------------------------------------
# 02 — Four filters
# -----------------------------------------------------------------------------
def make_02():
    fig = base_figure()
    ax = fig.add_axes([0.06, 0.18, 0.88, 0.62])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    ax.set_facecolor(BG)

    filters = [
        ('1', 'Computed stability\n≠ synthesizability', PRIMARY),
        ('2', 'uMLIPs soften\naway from equilibrium', AMBER),
        ('3', 'Disorder, vacancies\n& non-stoichiometry', SAGE),
        ('4', 'Failed campaigns\ncost weeks & $$$', ROSE),
    ]

    y = 0.5
    start_x, end_x = 0.06, 0.94
    gate_xs = np.linspace(0.22, 0.78, len(filters))

    # Start / end nodes
    for x, label, color, align in [(start_x, 'Predicted\ncrystal', SLATE, 'right'),
                                   (end_x, 'Made\nmaterial', SAGE, 'left')]:
        rect = FancyBboxPatch((x - 0.06, y - 0.12), 0.12, 0.24,
                              boxstyle="round,pad=0.01,rounding_size=0.02",
                              facecolor=color, edgecolor='none', alpha=0.15)
        ax.add_patch(rect)
        ax.text(x, y, label, ha='center', va='center', fontsize=10,
                color=color, fontweight='bold')

    # Main arrow backbone
    ax.annotate('', xy=(end_x - 0.07, y), xytext=(start_x + 0.07, y),
                arrowprops=dict(arrowstyle='->', color=MUTED, lw=2,
                                connectionstyle='arc3,rad=0'))

    for i, (num, label, color) in enumerate(filters):
        gx = gate_xs[i]
        # gate box
        rect = FancyBboxPatch((gx - 0.08, y - 0.18), 0.16, 0.36,
                              boxstyle="round,pad=0.01,rounding_size=0.02",
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(gx, y + 0.04, f'Filter {num}', ha='center', va='center',
                fontsize=12, color='white', fontweight='bold')
        ax.text(gx, y - 0.07, label, ha='center', va='center',
                fontsize=8, color='white', linespacing=1.2)

    add_title(fig, 'Four Filters Between Prediction and Synthesis', y=0.96)
    add_source(fig, 'Source: Lupine Science analysis')
    return save_jpg(fig, 'the-02-percent-synthesis-problem-02-four-filters.jpg')


# -----------------------------------------------------------------------------
# 03 — uMLIP softening
# -----------------------------------------------------------------------------
def make_03():
    fig = base_figure()
    gs = fig.add_gridspec(1, 2, left=0.08, right=0.92, top=0.82, bottom=0.18,
                          wspace=0.25)

    x = np.linspace(-1.5, 1.5, 300)
    # Reference potential
    E_ref = 0.4 * x**4 - 0.8 * x**2 + 0.18 * x + 0.9
    # uMLIP softened barrier
    E_umlip = 0.35 * x**4 - 0.7 * x**2 + 0.15 * x + 0.85

    for idx, (ax, title, ydata, color, label) in enumerate([
        (fig.add_subplot(gs[0, 0]), 'Reference (DFT / experiment)', E_ref, PRIMARY, 'Reference'),
        (fig.add_subplot(gs[0, 1]), 'Universal ML potential (uMLIP)', E_umlip, AMBER, 'uMLIP'),
    ]):
        ax.set_facecolor(BG)
        ax.plot(x, ydata, color=color, lw=3, label=label)
        ax.fill_between(x, ydata, color=color, alpha=0.12)
        # mark under-coordinated region
        ax.axvspan(-0.35, 0.35, color=ROSE, alpha=0.08)
        ax.annotate('Under-coordinated\nenvironment', xy=(0, np.interp(0, x, ydata)),
                    xytext=(0.7, 0.35), textcoords='axes fraction',
                    arrowprops=dict(arrowstyle='->', color=ROSE, lw=1.5),
                    fontsize=9, color=ROSE, ha='center')
        ax.set_title(title, fontsize=12, color=TEXT, fontweight='bold', pad=10)
        ax.set_xlabel('Reaction coordinate', fontsize=10, color=SECONDARY)
        ax.set_ylabel('Energy', fontsize=10, color=SECONDARY)
        ax.set_xticks([])
        ax.set_yticks([])
        for spine in ax.spines.values():
            spine.set_color(MUTED)
            spine.set_linewidth(0.8)

    add_title(fig, 'Where Universal Potentials Soften', y=0.96)
    add_source(fig, 'Source: Deng et al., npj Comput. Mater. 2025')
    return save_jpg(fig, 'the-02-percent-synthesis-problem-03-umlip-softening.jpg')


# -----------------------------------------------------------------------------
# 04 — Barrier error
# -----------------------------------------------------------------------------
def make_04():
    fig = base_figure()
    ax = fig.add_axes([0.12, 0.18, 0.76, 0.66])
    ax.set_facecolor(BG)

    kT = 0.02585  # eV at 300 K
    errors = np.linspace(-200, 200, 400)
    multiplier = np.exp(-errors / 1000 / kT)  # errors in meV

    ax.plot(errors, multiplier, color=PRIMARY, lw=3)
    ax.fill_between(errors, multiplier, color=PRIMARY, alpha=0.12)
    ax.axvline(100, color=AMBER, lw=2, linestyle='--')
    ax.axhline(1/50, color=AMBER, lw=1.5, linestyle=':')
    ax.scatter([100], [1/50], color=AMBER, s=80, zorder=5)
    ax.annotate('100 meV error\n≈ 50× slower', xy=(100, 1/50),
                xytext=(130, 0.12), fontsize=10, color=AMBER,
                arrowprops=dict(arrowstyle='->', color=AMBER, lw=1.5))

    ax.set_xlabel('Barrier error (meV)', fontsize=12, color=TEXT)
    ax.set_ylabel('Hopping-rate multiplier', fontsize=12, color=TEXT)
    ax.set_yscale('log')
    ax.set_xlim(-200, 200)
    ax.set_ylim(0.005, 200)
    ax.set_xticks([-200, -100, 0, 100, 200])
    ax.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax.grid(True, linestyle='--', alpha=0.3, color=MUTED)

    add_title(fig, 'A 100 meV Barrier Error Changes Everything', y=0.96)
    add_source(fig, 'Source: Lupine Science analysis; Deng et al., npj Comput. Mater. 2025')
    return save_jpg(fig, 'the-02-percent-synthesis-problem-04-barrier-error.jpg')


# -----------------------------------------------------------------------------
# 05 — Error field correction
# -----------------------------------------------------------------------------
def make_05():
    fig = base_figure()
    ax = fig.add_axes([0.08, 0.18, 0.84, 0.66])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    ax.set_facecolor(BG)

    # 2D lattice of atoms
    np.random.seed(7)
    rows, cols = 5, 7
    xs = np.linspace(0.18, 0.82, cols)
    ys = np.linspace(0.32, 0.78, rows)
    coords = [(x, y) for y in ys for x in xs]

    # Draw bonds
    for i, (x, y) in enumerate(coords):
        for j, (x2, y2) in enumerate(coords[i+1:], start=i+1):
            if abs(x - x2) < 0.001 and abs(y - y2) < 0.14:
                ax.plot([x, x2], [y, y2], color=MUTED, lw=1.5, zorder=1)
            elif abs(x - x2) < 0.14 and abs(y - y2) < 0.001:
                ax.plot([x, x2], [y, y2], color=MUTED, lw=1.5, zorder=1)

    # Correction field arrows
    for (x, y) in coords:
        angle = 2 * np.pi * (x + y)
        dx = 0.025 * np.cos(angle)
        dy = 0.025 * np.sin(angle)
        ax.annotate('', xy=(x + dx, y + dy), xytext=(x, y),
                    arrowprops=dict(arrowstyle='->', color=PRIMARY, lw=1.2,
                                    alpha=0.7), zorder=3)
        circle = plt.Circle((x, y), 0.018, color=SLATE, zorder=4)
        ax.add_patch(circle)

    # Before / after landscape inset
    inset_ax = fig.add_axes([0.62, 0.22, 0.28, 0.24])
    inset_ax.set_facecolor(BG)
    q = np.linspace(-1, 1, 100)
    before = 0.5 * q**2 + 0.2 * np.sin(6*q)
    after = 0.55 * q**2
    inset_ax.plot(q, before, color=ROSE, lw=2, label='uMLIP')
    inset_ax.plot(q, after, color=SAGE, lw=2, label='Corrected')
    inset_ax.set_xticks([])
    inset_ax.set_yticks([])
    inset_ax.legend(loc='upper right', frameon=False, fontsize=8)
    for spine in inset_ax.spines.values():
        spine.set_color(MUTED)
    inset_ax.set_title('Local relaxation path', fontsize=9, color=TEXT)

    ax.text(0.18, 0.86, 'Local environment error field', fontsize=13,
            color=PRIMARY, fontweight='bold')
    ax.text(0.18, 0.80, 'Correction depends on atomic coordination and is applied with analytic forces',
            fontsize=10, color=SECONDARY)

    add_title(fig, 'Learning the Environment Error Field', y=0.96)
    add_source(fig, 'Source: Lupine Science')
    return save_jpg(fig, 'the-02-percent-synthesis-problem-05-error-field.jpg')


# -----------------------------------------------------------------------------
# 06 — Cobalt and climate scale
# -----------------------------------------------------------------------------
def make_06():
    fig = base_figure()
    gs = fig.add_gridspec(1, 2, left=0.08, right=0.92, top=0.82, bottom=0.20,
                          wspace=0.30)

    # Left: cobalt supply
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.set_facecolor(BG)
    countries = ['DRC', 'Indonesia', 'Australia', 'Russia', 'Cuba', 'Philippines', 'Rest']
    shares = [70, 10, 4, 4, 3, 3, 6]
    colors = [PRIMARY if c == 'DRC' else SLATE for c in countries]
    bars = ax1.barh(countries, shares, color=colors, edgecolor='none', height=0.6)
    ax1.set_xlim(0, 80)
    ax1.invert_yaxis()
    ax1.set_xlabel('Share of global cobalt supply (%)', fontsize=10, color=TEXT)
    ax1.set_title('Cobalt supply concentration', fontsize=12, color=TEXT,
                  fontweight='bold', pad=10)
    for bar, val in zip(bars, shares):
        ax1.text(val + 1, bar.get_y() + bar.get_height()/2, f'{val}%',
                 va='center', fontsize=10, color=TEXT)
    ax1.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax1.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax1.grid(axis='x', linestyle='--', alpha=0.3, color=MUTED)

    # Right: clean-energy investment trajectory
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.set_facecolor(BG)
    years = np.array([2023, 2025, 2027, 2030, 2032])
    investment = np.array([1.8, 2.4, 3.1, 4.0, 4.5])
    ax2.fill_between(years, investment, color=PRIMARY, alpha=0.15)
    ax2.plot(years, investment, color=PRIMARY, lw=3, marker='o', markersize=8)
    for yr, inv in zip(years, investment):
        ax2.annotate(f'${inv}T', xy=(yr, inv), textcoords="offset points",
                     xytext=(0, 10), ha='center', fontsize=9, color=TEXT)
    ax2.set_xlim(2022, 2033)
    ax2.set_ylim(0, 5.2)
    ax2.set_xlabel('Year', fontsize=10, color=TEXT)
    ax2.set_ylabel('Clean-energy hardware investment ($T/year)', fontsize=10, color=TEXT)
    ax2.set_title('Clean-energy investment trajectory', fontsize=12, color=TEXT,
                  fontweight='bold', pad=10)
    ax2.tick_params(axis='both', labelsize=10, colors=TEXT)
    for spine in ax2.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax2.grid(axis='y', linestyle='--', alpha=0.3, color=MUTED)

    add_title(fig, 'Cobalt Supply and the Net-Zero Abatement Gap', y=0.96)
    add_source(fig, 'Sources: IEA Critical Minerals 2022; IEA World Energy Investment 2024')
    return save_jpg(fig, 'the-02-percent-synthesis-problem-06-cobalt-climate.jpg')


# -----------------------------------------------------------------------------
# 09 — Failure economics
# -----------------------------------------------------------------------------
def make_09():
    fig = base_figure()
    ax = fig.add_axes([0.08, 0.18, 0.84, 0.66])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    ax.set_facecolor(BG)

    # Two horizontal stacked bars
    y1, y2 = 0.62, 0.30
    h = 0.18

    def bar(x, y, w, h, color, label, value):
        rect = FancyBboxPatch((x, y), w, h,
                              boxstyle="round,pad=0.005,rounding_size=0.015",
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h/2, value, ha='center', va='center',
                fontsize=12, color='white', fontweight='bold')
        ax.text(x + w/2, y - 0.05, label, ha='center', va='top',
                fontsize=10, color=TEXT, fontweight='bold')

    # Without filters
    ax.text(0.5, 0.90, 'Without four-filter enforcement', ha='center', va='center',
            fontsize=13, color=TEXT, fontweight='bold')
    bar(0.10, y1, 0.45, h, PRIMARY, 'Reach furnace', '100%')
    bar(0.57, y1, 0.33, h, ROSE, 'Synthesis failure', '~50%')

    # With filters
    ax.text(0.5, 0.52, 'With four-filter enforcement', ha='center', va='center',
            fontsize=13, color=TEXT, fontweight='bold')
    bar(0.10, y2, 0.15, h, SLATE, 'Flagged early', '75%')
    bar(0.28, y2, 0.27, h, PRIMARY, 'Reach furnace', '25%')
    bar(0.57, y2, 0.13, h, ROSE, 'Still fail', '~10-15%')

    # Arrows between scenarios
    ax.annotate('', xy=(0.28, y2 + h + 0.03), xytext=(0.325, y1 - 0.03),
                arrowprops=dict(arrowstyle='->', color=MUTED, lw=2,
                                connectionstyle='arc3,rad=-0.2'))

    add_title(fig, 'The Economics of a Failed Campaign', y=0.96)
    add_source(fig, 'Source: Lupine validation studies')
    return save_jpg(fig, 'the-02-percent-synthesis-problem-09-failure-economics.jpg')


# -----------------------------------------------------------------------------
# 10 — Predictions to partners
# -----------------------------------------------------------------------------
def make_10():
    fig = base_figure()
    ax = fig.add_axes([0.06, 0.22, 0.88, 0.60])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    ax.set_facecolor(BG)

    stages = [
        ('Predictions', PRIMARY),
        ('Correction\nLayer', AMBER),
        ('Machine-Checked\nProof', SAGE),
        ('Synthesis', SLATE),
        ('Characterization', ROSE),
        ('Scale Partners', PRIMARY),
    ]
    n = len(stages)
    xs = np.linspace(0.08, 0.92, n)
    y = 0.5
    w = 0.13
    h = 0.38

    for i, (label, color) in enumerate(stages):
        x = xs[i] - w/2
        rect = FancyBboxPatch((x, y - h/2), w, h,
                              boxstyle="round,pad=0.01,rounding_size=0.02",
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(xs[i], y, label, ha='center', va='center',
                fontsize=10, color='white', fontweight='bold', linespacing=1.1)
        if i < n - 1:
            ax.annotate('', xy=(xs[i+1] - w/2 - 0.01, y),
                        xytext=(xs[i] + w/2 + 0.01, y),
                        arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2))

    ax.text(0.5, y - h/2 - 0.10,
            'Corrected energy landscapes flow into synthesis, characterization, and scale partners',
            ha='center', va='top', fontsize=11, color=SECONDARY)

    add_title(fig, 'From Predictions to Partners', y=0.96)
    add_source(fig, 'Source: Lupine Science')
    return save_jpg(fig, 'the-02-percent-synthesis-problem-10-predictions-to-partners.jpg')


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
        make_09(),
        make_10(),
    ]
    for p in paths:
        print(p)


if __name__ == '__main__':
    main()
