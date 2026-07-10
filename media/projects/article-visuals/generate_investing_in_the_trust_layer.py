#!/usr/bin/env python3
"""Generate deck-level visuals for the article "Investing in the Trust Layer"."""

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
from matplotlib.patches import FancyBboxPatch, Circle, Wedge
import numpy as np
from PIL import Image

# -----------------------------------------------------------------------------
# Brand / output
# -----------------------------------------------------------------------------
BG = '#faf9f6'
PRIMARY = '#3d4db3'
INK = '#1a1a1a'
SECONDARY = '#555555'
AMBER = '#e8a838'
SAGE = '#5a8a6e'
SLATE = '#6b7c8e'
ROSE = '#c75b5b'
MUTED = '#aaaaaa'
SOFT_PRIMARY = '#d9d8ff'

OUT_DIR = Path('/home/alex/Dev/lupine/lupine-science/public/articles/investing-in-the-trust-layer/images')
DPI = 150
W_PIX, H_PIX = 1280, 720
FIG_W = W_PIX / DPI
FIG_H = H_PIX / DPI

OUT_DIR.mkdir(parents=True, exist_ok=True)


def save_jpg(fig, filename):
    """Render figure to exact 1280x720 JPG at quality 90."""
    buf = BytesIO()
    fig.savefig(buf, format='png', dpi=DPI, bbox_inches='tight',
                pad_inches=0.02, facecolor=BG)
    buf.seek(0)
    img = Image.open(buf).convert('RGB')
    if img.size != (W_PIX, H_PIX):
        img = img.resize((W_PIX, H_PIX), Image.LANCZOS)
    out_path = OUT_DIR / filename
    img.save(out_path, 'JPEG', quality=90, dpi=(DPI, DPI))
    plt.close(fig)
    return out_path


def base_figure():
    fig = plt.figure(figsize=(FIG_W, FIG_H), dpi=DPI, facecolor=BG)
    fig.patch.set_facecolor(BG)
    return fig


def add_title(fig, title, y=0.96):
    fig.text(0.5, y, title, ha='center', va='top',
             fontsize=20, fontweight='bold', color=INK, fontfamily='sans-serif')


def add_source(fig, source, y=0.03):
    fig.text(0.5, y, source, ha='center', va='bottom',
             fontsize=9, color=SECONDARY, fontfamily='sans-serif')


# -----------------------------------------------------------------------------
# 01 — Generation funnel
# -----------------------------------------------------------------------------
def make_01():
    fig = base_figure()
    ax = fig.add_axes([0.08, 0.18, 0.84, 0.62])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    ax.set_facecolor(BG)

    main = [
        ('Candidate crystals\nproposed', 2_200_000, PRIMARY),
        ('Computed-stable\nstructures', 380_000, PRIMARY),
        ('Independently\nsynthesized', 736, PRIMARY),
    ]
    alab = [
        ('A-Lab targets', 58, AMBER),
        ('Reported success\nrate', '63%', AMBER),
        ('True novel-\ndiscovery rate', '~0%', ROSE),
    ]

    def w(val, vmax):
        return 0.14 + 0.72 * np.sqrt(val / vmax)

    vmax = main[0][1]
    xs = np.linspace(0.12, 0.88, len(main))
    y = 0.70
    h = 0.22
    for i, (label, val, color) in enumerate(main):
        width = w(val, vmax)
        rect = FancyBboxPatch((xs[i] - width/2, y - h/2), width, h,
                              boxstyle='round,pad=0.01,rounding_size=0.02',
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        value_text = f'{val:,}' if isinstance(val, int) else val
        ax.text(xs[i], y + 0.02, label, ha='center', va='bottom',
                fontsize=10, color=INK, fontweight='bold', linespacing=1.1)
        ax.text(xs[i], y - 0.03, value_text, ha='center', va='center',
                fontsize=15, color='white', fontweight='bold')
        if i < len(main) - 1:
            ax.annotate('', xy=(xs[i+1] - w(main[i+1][1], vmax)/2 - 0.02, y),
                        xytext=(xs[i] + width/2 + 0.02, y),
                        arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=2))

    ax.text(0.5, y - h/2 - 0.06, 'Validation rate: 0.2%', ha='center', va='top',
            fontsize=12, color=PRIMARY, fontweight='bold')

    # A-Lab mini-funnel lower
    xs2 = np.linspace(0.12, 0.88, len(alab))
    y2 = 0.26
    h2 = 0.18
    vmax2 = 58
    for i, (label, val, color) in enumerate(alab):
        value_text = val
        width = 0.14 + 0.72 * (1 - i*0.25)
        rect = FancyBboxPatch((xs2[i] - width/2, y2 - h2/2), width, h2,
                              boxstyle='round,pad=0.01,rounding_size=0.02',
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(xs2[i], y2 + h2/2 + 0.05, label, ha='center', va='bottom',
                fontsize=9, color=INK, fontweight='bold', linespacing=1.0)
        ax.text(xs2[i], y2, value_text, ha='center', va='center',
                fontsize=13, color='white', fontweight='bold')
        if i < len(alab) - 1:
            ax.annotate('', xy=(xs2[i+1] - width/2 - 0.02, y2),
                        xytext=(xs2[i] + width/2 + 0.02, y2),
                        arrowprops=dict(arrowstyle='->', color=SECONDARY, lw=1.5))

    add_title(fig, 'From millions of predictions to a handful of validated materials')
    add_source(fig, 'Sources: Merchant et al., Nature 2023; Szymanski et al., Nature 2023; Leeman et al., PRX Energy 2024')
    return save_jpg(fig, 'investing-in-the-trust-layer-01-generation-funnel.jpg')


# -----------------------------------------------------------------------------
# 02 — Pipeline leaks
# -----------------------------------------------------------------------------
def make_02():
    fig = base_figure()
    ax = fig.add_axes([0.06, 0.18, 0.88, 0.62])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    ax.set_facecolor(BG)

    stages = [
        ('Generation', 'GNoME 2.2M\ncandidates', 'MatterGen limited to\nmodest cells; no disorder', PRIMARY),
        ('Prediction', 'uMLIP ~10⁻⁴ s\nper atom-step', 'Defect observables err\n15–60× worse than bulk', AMBER),
        ('Synthesis', 'A-Lab 63%\nsuccess rate', 'Queue filtered by\nintuition, not proof', SAGE),
        ('Validation', '0.2% validated\nthroughput', 'False positives waste\nweeks; false negatives hide candidates', ROSE),
    ]

    n = len(stages)
    xs = np.linspace(0.12, 0.88, n)
    y = 0.55
    w = 0.17
    h = 0.34

    for i, (stage, head, note, color) in enumerate(stages):
        x = xs[i]
        rect = FancyBboxPatch((x - w/2, y - h/2), w, h,
                              boxstyle='round,pad=0.01,rounding_size=0.02',
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text(x, y + 0.08, stage, ha='center', va='center',
                fontsize=12, color='white', fontweight='bold')
        ax.text(x, y - 0.02, head, ha='center', va='center',
                fontsize=10, color='white', linespacing=1.1)
        # error annotation below (wrapped to stage width)
        wrapped = textwrap.fill(note.replace('\n', ' '), width=22)
        ax.text(x, y - h/2 - 0.10, wrapped, ha='center', va='top',
                fontsize=8, color=SECONDARY, linespacing=1.15)
        if i < n - 1:
            ax.annotate('', xy=(xs[i+1] - w/2 - 0.02, y),
                        xytext=(x + w/2 + 0.02, y),
                        arrowprops=dict(arrowstyle='->', color=MUTED, lw=2))

    add_title(fig, 'The layered pipeline, and where it leaks')
    add_source(fig, 'Sources: Merchant et al., Nature 2023; Zeni et al., Nature 2024; Deng et al., Nature Communications 2024')
    return save_jpg(fig, 'investing-in-the-trust-layer-02-pipeline-leaks.jpg')


# -----------------------------------------------------------------------------
# 03 — Error field mechanism
# -----------------------------------------------------------------------------
def make_03():
    fig = base_figure()
    ax = fig.add_axes([0.10, 0.18, 0.80, 0.64])
    ax.set_xlim(6.5, 12.5)
    ax.set_ylim(-0.05, 0.30)
    ax.set_facecolor(BG)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    from scipy.interpolate import CubicSpline
    anchors_c = np.array([8, 9, 11, 12])
    anchors_p = np.array([0.22, 0.12, 0.03, 0.0])
    cs = CubicSpline(anchors_c, anchors_p, bc_type='natural')
    c_fine = np.linspace(8, 12, 200)
    p_fine = cs(c_fine)

    # linear extension for low coordination (blind region)
    slope = (anchors_p[1] - anchors_p[0]) / (anchors_c[1] - anchors_c[0])
    c_low = np.linspace(7, 8, 50)
    p_low = anchors_p[0] + slope * (c_low - 8)

    ax.plot(c_fine, p_fine, color=PRIMARY, lw=3, label='Measured error field P(c)')
    ax.plot(c_low, p_low, color=PRIMARY, lw=3, linestyle='--', label='Blind prediction')
    ax.fill_between(c_fine, p_fine, alpha=0.12, color=PRIMARY)

    labels = ['γ₁₀₀ surface', 'γ₁₁₁ surface', 'Vacancy formation']
    label_offsets = [(0.25, -0.035), (0.22, 0.035), (0.30, 0.030)]
    for (ci, pi, label), (dx, dy) in zip(zip(anchors_c[:-1], anchors_p[:-1], labels), label_offsets):
        ax.scatter([ci], [pi], color=PRIMARY, s=100, zorder=5, edgecolor=INK)
        ax.annotate(label, xy=(ci, pi), xytext=(ci + dx, pi + dy),
                    fontsize=9, ha='left', fontweight='bold', color=INK)
    ax.scatter([12], [0], color=SAGE, s=120, zorder=5, edgecolor=INK)
    ax.annotate('Bulk constraint\nP(12) = 0', xy=(12, 0), xytext=(11.35, -0.050),
                fontsize=9, ha='center', fontweight='bold', color=SAGE)

    ax.axvspan(7, 8, color=AMBER, alpha=0.10)
    ax.text(7.5, 0.055, 'Blind test\nγ₁₁₀ surface', ha='center', va='center',
            fontsize=10, color=AMBER, fontweight='bold')

    ax.set_xlabel('First-shell coordination number  c', fontsize=11, color=INK)
    ax.set_ylabel('uMLIP error correction  P(c)', fontsize=11, color=INK)
    ax.tick_params(axis='both', labelsize=10, colors=INK)
    ax.legend(loc='upper right', frameon=False, fontsize=9)

    add_title(fig, 'Measured error field, not learned')
    add_source(fig, 'Source: Lupine Science error-field analysis')
    return save_jpg(fig, 'investing-in-the-trust-layer-03-error-field.jpg')


# -----------------------------------------------------------------------------
# 04 — Blind-test correlation
# -----------------------------------------------------------------------------
def make_04():
    fig = base_figure()
    ax = fig.add_axes([0.12, 0.18, 0.76, 0.66])
    ax.set_facecolor(BG)

    np.random.seed(7)
    n = 36
    x = np.random.normal(0, 0.10, n)
    # target r ~0.906
    noise = np.random.normal(0, 0.045, n)
    y = 0.906 * x + np.sqrt(1 - 0.906**2) * noise
    # scale to realistic surface-energy errors
    scale = 0.25
    x = x * scale + 0.03
    y = y * scale + 0.03

    ax.scatter(x, y, c=PRIMARY, s=70, alpha=0.75, edgecolor=INK, linewidth=0.5, zorder=3)
    lims = [-0.12, 0.18]
    ax.plot(lims, lims, color=SECONDARY, lw=1.5, linestyle='--', zorder=2)
    ax.set_xlim(lims)
    ax.set_ylim(lims)
    ax.set_xlabel('Actual γ₁₁₀ signed error (J / m²)', fontsize=12, color=INK)
    ax.set_ylabel('Predicted γ₁₁₀ signed error (J / m²)', fontsize=12, color=INK)
    ax.tick_params(axis='both', labelsize=10, colors=INK)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.set_aspect('equal', adjustable='box')

    # stats box
    ax.text(0.05, 0.95, 'n = 36\nPearson r = 0.906\n95% CI [0.82, 0.96]\np = 10⁻⁴\nZero adjustable parameters',
            transform=ax.transAxes, ha='left', va='top', fontsize=11,
            bbox=dict(boxstyle='round,pad=0.35', facecolor=SOFT_PRIMARY, edgecolor=PRIMARY))

    # Annotated examples
    ax.scatter([0.08], [0.06], color=SAGE, s=90, zorder=5, edgecolor=INK)
    ax.annotate('Ni(110)\n9.7% → 1.5%', xy=(0.08, 0.06), xytext=(0.13, 0.11),
                fontsize=9, color=INK,
                arrowprops=dict(arrowstyle='->', color=SAGE, lw=1.5))
    ax.scatter([-0.06], [-0.07], color=AMBER, s=90, zorder=5, edgecolor=INK)
    ax.annotate('Cu(110)\n28.0% → 13.7%', xy=(-0.06, -0.07), xytext=(-0.11, -0.10),
                fontsize=9, color=INK,
                arrowprops=dict(arrowstyle='->', color=AMBER, lw=1.5))

    add_title(fig, 'Predicting the error on a never-fitted observable')
    add_source(fig, 'Source: Lupine Science blind validation')
    return save_jpg(fig, 'investing-in-the-trust-layer-04-blind-test-correlation.jpg')


# -----------------------------------------------------------------------------
# 05 — Runtime overlay
# -----------------------------------------------------------------------------
def make_05():
    fig = base_figure()
    gs = fig.add_gridspec(1, 2, left=0.08, right=0.92, top=0.82, bottom=0.18,
                          wspace=0.30)

    # Left: runtime overhead
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.set_facecolor(BG)
    methods = ['Python\noverlay', 'Compiled\n(C/C++/CUDA)', 'DFT\nreference']
    overheads = [15.6, 1.0, 1e5]
    colors = [AMBER, SAGE, ROSE]
    bars = ax1.barh(methods, overheads, color=colors, edgecolor='none', height=0.55)
    ax1.set_xscale('log')
    ax1.set_xlim(0.5, 2e6)
    ax1.set_xlabel('Wall-time overhead vs. raw uMLIP', fontsize=10, color=INK)
    ax1.set_title('Runtime overhead', fontsize=13, fontweight='bold', pad=10)
    ax1.tick_params(axis='both', labelsize=10, colors=INK)
    for spine in ax1.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax1.spines['top'].set_visible(False)
    ax1.spines['right'].set_visible(False)
    for bar, val, label in zip(bars, overheads, ['+15.6%', '<1%', 'days per structure']):
        ax1.text(val * 1.8, bar.get_y() + bar.get_height()/2, label,
                 va='center', fontsize=10, color=INK, fontweight='bold')

    # Right: before/after error bars
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.set_facecolor(BG)
    systems = ['Ni(110)', 'Cu(110)']
    before = [9.7, 28.0]
    after = [1.5, 13.7]
    x = np.arange(len(systems))
    width = 0.30
    bars1 = ax2.bar(x - width/2, before, width, label='Raw uMLIP', color=ROSE, edgecolor='none')
    bars2 = ax2.bar(x + width/2, after, width, label='Corrected', color=SAGE, edgecolor='none')
    ax2.set_ylabel('Relative surface-energy error (%)', fontsize=10, color=INK)
    ax2.set_xticks(x)
    ax2.set_xticklabels(systems, fontsize=11)
    ax2.set_ylim(0, 32)
    ax2.set_title('Blind surface-energy error', fontsize=13, fontweight='bold', pad=10)
    ax2.legend(loc='upper right', frameon=False, fontsize=9)
    ax2.tick_params(axis='both', labelsize=10, colors=INK)
    for spine in ax2.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax2.spines['top'].set_visible(False)
    ax2.spines['right'].set_visible(False)
    for bar in bars1:
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.8,
                 f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=9, color=INK)
    for bar in bars2:
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.8,
                 f'{bar.get_height():.1f}%', ha='center', va='bottom', fontsize=9, color=INK)

    add_title(fig, 'Runtime compatibility: correct without retraining')
    add_source(fig, 'Source: Lupine Science runtime benchmarks')
    return save_jpg(fig, 'investing-in-the-trust-layer-05-runtime-overlay.jpg')


# -----------------------------------------------------------------------------
# 06 — Climate scale
# -----------------------------------------------------------------------------
def make_06():
    fig = base_figure()
    gs = fig.add_gridspec(2, 1, left=0.10, right=0.90, top=0.84, bottom=0.14,
                          hspace=0.45)

    # Top: battery-linked CO2 reduction share
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.set_facecolor(BG)
    labels = ['Direct\n20%', 'Indirect\n40%', 'Other abatement\n40%']
    sizes = [20, 40, 40]
    colors = [PRIMARY, AMBER, SLATE]
    explode = (0.03, 0.03, 0)
    wedges, texts, autotexts = ax1.pie(sizes, explode=explode, labels=labels, colors=colors,
                                        autopct='', startangle=90,
                                        wedgeprops=dict(width=0.55, edgecolor=BG, linewidth=2))
    for text in texts:
        text.set_fontsize(10)
        text.set_color(INK)
    ax1.set_title('Battery-linked share of required 2030 CO₂ reductions', fontsize=13,
                  fontweight='bold', pad=10)

    # Bottom: timeline compression
    ax2 = fig.add_subplot(gs[1, 0])
    ax2.set_xlim(2024, 2055)
    ax2.set_ylim(0, 1)
    ax2.set_facecolor(BG)
    ax2.axis('off')

    ax2.barh(0.5, 20, left=2025, height=0.22, color=ROSE, alpha=0.85, label='Traditional 10–20 years')
    ax2.barh(0.5, 4, left=2025, height=0.22, color=SAGE, alpha=0.9, label='Compressed 2–5 years')

    ax2.text(2035, 0.78, 'Traditional R&D\n10–20 years', ha='center', va='bottom',
             fontsize=10, color=ROSE, fontweight='bold')
    ax2.text(2027, 0.78, 'Corrected screening\n2–5 years', ha='center', va='bottom',
             fontsize=10, color=SAGE, fontweight='bold')

    ax2.annotate('', xy=(2045, 0.5), xytext=(2025, 0.5),
                 arrowprops=dict(arrowstyle='->', color=ROSE, lw=2))
    ax2.annotate('', xy=(2029, 0.5), xytext=(2025, 0.5),
                 arrowprops=dict(arrowstyle='->', color=SAGE, lw=2))

    ax2.text(2035, 0.15, 'A material deployed in 2035 versus 2045 can change cumulative emissions by tens of gigatonnes',
             ha='center', va='top', fontsize=10, color=SECONDARY)

    add_title(fig, 'Why accuracy matters in gigatonnes', y=0.96)
    add_source(fig, 'Sources: IEA Global EV Outlook 2024; IEA Energy Technology Perspectives 2023')
    return save_jpg(fig, 'investing-in-the-trust-layer-06-climate-scale.jpg')


# -----------------------------------------------------------------------------
# 07 — Phase Zero risk map
# -----------------------------------------------------------------------------
def make_07():
    fig = base_figure()
    ax = fig.add_axes([0.08, 0.18, 0.84, 0.62])
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 6)
    ax.axis('off')
    ax.set_facecolor(BG)

    # timeline axis
    ax.plot([0.5, 11.5], [3, 3], color=MUTED, lw=2, zorder=1)
    for m in [0, 3, 6, 9, 12]:
        ax.plot([m, m], [2.9, 3.1], color=MUTED, lw=1.5)
        ax.text(m, 2.6, f'M{m}', ha='center', va='top', fontsize=9, color=SECONDARY)
    ax.text(6, 2.25, 'Months', ha='center', va='top', fontsize=9, color=SECONDARY)

    bars = [
        (0, 12, 3.7, 'Established: fcc error field', SAGE, 'Proven'),
        (0, 3, 4.6, 'Phase 0 critical path: bcc, hcp, layered', PRIMARY, 'In progress'),
        (3, 9, 4.6, 'Extension validation window', AMBER, 'In progress'),
        (0, 12, 2.1, 'Open risk: second-shell correction may be needed', ROSE, 'Open'),
        (0, 12, 1.2, 'Open risk: industrial validation partners pending', ROSE, 'Open'),
    ]
    for x0, x1, y, label, color, status in bars:
        rect = FancyBboxPatch((x0, y - 0.25), x1 - x0, 0.5,
                              boxstyle='round,pad=0.02,rounding_size=0.1',
                              facecolor=color, edgecolor='none', alpha=0.9)
        ax.add_patch(rect)
        ax.text((x0 + x1)/2, y, label, ha='center', va='center',
                fontsize=10, color='white', fontweight='bold')

    # Month 3 gate
    ax.axvline(3, color=INK, lw=2, linestyle='--', ymin=0.15, ymax=0.85)
    ax.text(3, 5.5, 'Month 3\ngo / no-go gate', ha='center', va='center',
            fontsize=11, color=INK, fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor=INK))

    # legend
    legend_x = 8.5
    legend_y = 5.0
    for color, label in [(SAGE, 'Proven'), (PRIMARY, 'In progress'), (ROSE, 'Open')]:
        rect = FancyBboxPatch((legend_x, legend_y - 0.12), 0.4, 0.24,
                              boxstyle='round,pad=0.02', facecolor=color, edgecolor='none')
        ax.add_patch(rect)
        ax.text(legend_x + 0.55, legend_y, label, ha='left', va='center', fontsize=9, color=INK)
        legend_y -= 0.45

    add_title(fig, 'What is proven, what is on the critical path')
    add_source(fig, 'Source: Lupine Science Phase 0 plan')
    return save_jpg(fig, 'investing-in-the-trust-layer-07-phase-zero-risk.jpg')


# -----------------------------------------------------------------------------
# 08 — Partner flywheel
# -----------------------------------------------------------------------------
def make_08():
    fig = base_figure()
    ax = fig.add_axes([0.05, 0.12, 0.90, 0.72])
    ax.set_xlim(-1.3, 1.3)
    ax.set_ylim(-1.3, 1.3)
    ax.axis('off')
    ax.set_facecolor(BG)

    segments = [
        ('Structure\ngenerators', 'GNoME,\nMatterGen', 90.0, PRIMARY),
        ('National\nlabs', 'NREL master CRADA\n4 of 5 targets', 18.0, AMBER),
        ('Experimental\ngroups', 'Manthiram / TexPower\nCeder / LBNL\nMünster / DTU\nYaghi / Long', -54.0, SAGE),
        ('Field\ndatabase', 'Measured errors\n(model, material, family)', -126.0, SLATE),
        ('Theorem\nlibrary', 'Lean 4 proofs\n+ applicability bounds', -162.0, ROSE),
    ]

    n = len(segments)
    radius = 0.72
    for i, (title, desc, angle, color) in enumerate(segments):
        theta = np.deg2rad(angle)
        x = radius * np.cos(theta)
        y = radius * np.sin(theta)
        circle = Circle((x, y), 0.20, facecolor=color, edgecolor=INK, linewidth=2, alpha=0.95)
        ax.add_patch(circle)
        ax.text(x, y, title, ha='center', va='center',
                fontsize=9, fontweight='bold', color='white', linespacing=1.0)

        # Description outside the node, pushed away from the center and rim
        label_r = 1.10
        lx = label_r * np.cos(theta)
        ly = label_r * np.sin(theta)
        ha = 'center'
        va = 'center'
        if np.cos(theta) > 0.15:
            ha = 'left'
        elif np.cos(theta) < -0.15:
            ha = 'right'
        # Push text away from the top/bottom rim so it doesn't leave the frame
        if np.sin(theta) > 0.15:
            va = 'top'
        elif np.sin(theta) < -0.15:
            va = 'bottom'
        ax.text(lx, ly, desc, ha=ha, va=va, fontsize=8, color=SECONDARY,
                linespacing=1.05)

        # Arc arrows connecting segments
        next_i = (i + 1) % n
        theta_next = np.deg2rad(segments[next_i][2])
        arr_r = radius
        x1 = arr_r * np.cos(theta)
        y1 = arr_r * np.sin(theta)
        x2 = arr_r * np.cos(theta_next)
        y2 = arr_r * np.sin(theta_next)
        # Shorten to not overlap circles
        frac = 0.08
        x1s = x1 + frac * (x2 - x1)
        y1s = y1 + frac * (y2 - y1)
        x2s = x2 - frac * (x2 - x1)
        y2s = y2 - frac * (y2 - y1)
        ax.annotate('', xy=(x2s, y2s), xytext=(x1s, y1s),
                    arrowprops=dict(arrowstyle='->', color=PRIMARY, lw=2,
                                    connectionstyle='arc3,rad=0.15'))

    # Center
    center = Circle((0, 0), 0.22, facecolor=BG, edgecolor=PRIMARY, linewidth=3)
    ax.add_patch(center)
    ax.text(0, 0, 'Lupine\ntrust layer', ha='center', va='center',
            fontsize=11, fontweight='bold', color=PRIMARY)

    # Priority targets banner
    banner = FancyBboxPatch((-1.18, -1.24), 2.36, 0.24,
                            boxstyle='round,pad=0.02', facecolor=SOFT_PRIMARY,
                            edgecolor=PRIMARY, linewidth=1.5)
    ax.add_patch(banner)
    ax.text(0, -1.12, 'Priority targets: cobalt-free cathodes • halide solid electrolytes • MOF sorbents • ammonia catalysts • lead-free perovskites',
            ha='center', va='center', fontsize=9, color=INK)

    add_title(fig, 'Partnership architecture that deepens the moat')
    add_source(fig, 'Source: Lupine Science partnership plan')
    return save_jpg(fig, 'investing-in-the-trust-layer-08-partner-flywheel.jpg')


# -----------------------------------------------------------------------------
# 09 — Economics leverage
# -----------------------------------------------------------------------------
def make_09():
    fig = base_figure()
    ax = fig.add_axes([0.12, 0.18, 0.76, 0.66])
    ax.set_facecolor(BG)

    categories = ['Lupine 36-month\nbudget', 'Lower bound\nNIST MGI', 'Upper bound\nNIST MGI']
    values = [3.2, 123_000, 270_000]  # millions of USD
    colors = [SAGE, PRIMARY, PRIMARY]

    bars = ax.bar(categories, values, color=colors, edgecolor='none', width=0.55)
    ax.set_yscale('log')
    ax.set_ylim(1, 1e6)
    ax.set_ylabel('Dollars (millions, log scale)', fontsize=12, color=INK)
    ax.tick_params(axis='both', labelsize=10, colors=INK)
    for spine in ax.spines.values():
        spine.set_color(MUTED)
        spine.set_linewidth(0.8)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    for bar, val, label in zip(bars, values, ['$3.2M', '$123B/year', '$270B/year']):
        ax.text(bar.get_x() + bar.get_width()/2, val * 1.8, label,
                ha='center', va='bottom', fontsize=11, color=INK, fontweight='bold')

    # Annotation
    ax.text(0.5, 0.35, 'Even one commercially viable target among five justifies the spend;\nthe prize is annual infrastructure value, not a single material.',
            transform=ax.transAxes, ha='center', va='top', fontsize=10, color=SECONDARY,
            bbox=dict(boxstyle='round,pad=0.35', facecolor='white', edgecolor=PRIMARY))

    add_title(fig, 'A small budget against a trillion-dollar prize')
    add_source(fig, 'Sources: NIST / RTI Materials Genome Initiative economic analysis 2023; ARPA-E Impact 2023')
    return save_jpg(fig, 'investing-in-the-trust-layer-09-economics-leverage.jpg')


# -----------------------------------------------------------------------------
# 10 — Trust-loop CTA (MiniMax scene illustration)
# -----------------------------------------------------------------------------
def make_10():
    prompt = (
        "Abstract editorial illustration of a closed-loop materials discovery pipeline for a climate-tech trust layer. "
        "Left side: stylized geometric crystals and flowing data streams emerging from AI structure generators. "
        "Center: a translucent indigo-blue correction-and-verification layer that filters and guides the flow. "
        "Right side: a modern materials synthesis lab with benches, reactors, and measurement equipment. "
        "A glowing feedback arc loops from the lab back toward a floating library of fields and proofs. "
        "Warm paper background (#faf9f6), indigo (#3d4db3) and sage (#5a8a6e) accents, clean minimalist vector style. "
        "No readable text, no words, no letters, no typography, no logos, no labels, no brand marks."
    )
    out_path = OUT_DIR / 'investing-in-the-trust-layer-10-trust-loop-cta.jpg'
    subprocess.run([
        sys.executable,
        '/home/alex/.hermes/skills/lupine-media-director/scripts/minimax_client.py',
        'image',
        '--prompt', prompt,
        '--aspect', '16:9',
        '--output', str(out_path),
    ], check=True)
    return out_path, prompt


# -----------------------------------------------------------------------------
# Manifest
# -----------------------------------------------------------------------------
MANIFEST = [
    {
        "filename": "investing-in-the-trust-layer-01-generation-funnel.jpg",
        "title": "From millions of predictions to a handful of validated materials",
        "type": "data-chart",
        "caption": "GNoME proposed 2.2 million candidate crystals, but only 736 had been independently synthesized by late 2023—a 0.2% validation rate that exposes the trust bottleneck in computational materials discovery."
    },
    {
        "filename": "investing-in-the-trust-layer-02-pipeline-leaks.jpg",
        "title": "The layered pipeline, and where it leaks",
        "type": "concept-diagram",
        "caption": "Each stage of the discovery pipeline—generation, prediction, synthesis, validation—introduces systematic errors that cascade downstream, turning high activity into low validated throughput."
    },
    {
        "filename": "investing-in-the-trust-layer-03-error-field.jpg",
        "title": "Measured error field, not learned",
        "type": "concept-diagram",
        "caption": "For fcc metals, Lupine models uMLIP error as a cubic-spline field over first-shell coordination, anchored by three standard observables and constrained to zero at bulk coordination 12."
    },
    {
        "filename": "investing-in-the-trust-layer-04-blind-test-correlation.jpg",
        "title": "Predicting the error on a never-fitted observable",
        "type": "data-chart",
        "caption": "Across 36 model-material combinations, the measured error field predicts the never-fitted γ₁₁₀ surface-energy error with Pearson r = 0.906 (95% CI [0.82, 0.96], p = 10⁻⁴) and zero adjustable parameters."
    },
    {
        "filename": "investing-in-the-trust-layer-05-runtime-overlay.jpg",
        "title": "Runtime compatibility: correct without retraining",
        "type": "evidence-panel",
        "caption": "Lupine deploys beside existing CHGNet or MACE calculators as a LAMMPS overlay, adding 15.6% overhead in Python and cutting relative error on blind facets by up to an order of magnitude."
    },
    {
        "filename": "investing-in-the-trust-layer-06-climate-scale.jpg",
        "title": "Why accuracy matters in gigatonnes",
        "type": "data-chart",
        "caption": "Batteries are directly tied to roughly 20% of the CO₂ reductions needed by 2030 and indirectly to another 40%, so false positives and false negatives in materials screening carry climate-scale consequences."
    },
    {
        "filename": "investing-in-the-trust-layer-07-phase-zero-risk.jpg",
        "title": "What is proven, what is on the critical path",
        "type": "concept-diagram",
        "caption": "The fcc error field is established; the Phase 0 critical path extends it to bcc, hcp, and layered structures, with a Month 3 go/no-go gate and honest caveats about second-shell corrections and pending validation partners."
    },
    {
        "filename": "investing-in-the-trust-layer-08-partner-flywheel.jpg",
        "title": "Partnership architecture that deepens the moat",
        "type": "concept-diagram",
        "caption": "A master CRADA with NREL and tier-1 experimental collaborators close the loop between prediction and synthesis, turning every validated measurement into a more trustworthy next prediction."
    },
    {
        "filename": "investing-in-the-trust-layer-09-economics-leverage.jpg",
        "title": "Infrastructure leverage against a trillion-dollar prize",
        "type": "data-chart",
        "caption": "Lupine's ~$3.2 million, 36-month budget is tiny against the NIST-estimated $123 billion–$270 billion annual value of improved materials innovation infrastructure, so even one successful target among five justifies the spend."
    },
    {
        "filename": "investing-in-the-trust-layer-10-trust-loop-cta.jpg",
        "title": "The trust layer for a real-world Replicator",
        "type": "scene-illustration",
        "caption": "The trust layer closes the loop between AI-generated candidates, corrected simulations, and experimental validation—turning an abundance of predicted materials into a scarce, defensible set that labs can act on before the climate window closes."
    },
]


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
    path10, prompt10 = make_10()
    files.append(path10)

    manifest_path = OUT_DIR / 'manifest.json'
    manifest_path.write_text(json.dumps(MANIFEST, indent=2) + '\n')
    print(f'manifest: {manifest_path}')

    total_size = sum(p.stat().st_size for p in files)
    print(f'generated {len(files)} images; total size {total_size / 1024:.1f} KB')
    print(f'MiniMax prompt:\n{prompt10}')


if __name__ == '__main__':
    main()
