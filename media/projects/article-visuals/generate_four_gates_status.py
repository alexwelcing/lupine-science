#!/usr/bin/env python3
"""Generate 4 visuals for "Four Gates, Three Honest Failures, One Live Experiment"."""

from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import numpy as np

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

SLUG = 'four-gates-three-honest-failures-one-live-experiment'
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
    'axes.edgecolor': MUTED,
    'axes.labelcolor': INK,
    'text.color': INK,
    'xtick.color': SECONDARY,
    'ytick.color': SECONDARY,
})


def save(fig, name):
    path = OUT_DIR / f'{SLUG}-{name}.jpg'
    fig.savefig(path, dpi=DPI, facecolor=BG, bbox_inches='tight', pad_inches=0.25)
    plt.close(fig)
    print(f'wrote {path}')


# -----------------------------------------------------------------------------
# 01 — The scoreboard: four gates and their states
# -----------------------------------------------------------------------------
def scoreboard():
    fig, ax = plt.subplots(figsize=FIGSIZE)
    ax.set_xlim(0, 128)
    ax.set_ylim(0, 72)
    ax.axis('off')

    ax.text(64, 66, 'The Campaign Scoreboard', ha='center', va='center',
            fontsize=26, fontweight='bold', color=INK)
    ax.text(64, 60.5, 'Round-4 preregistered campaigns · status 2026-07-19',
            ha='center', va='center', fontsize=12.5, color=SECONDARY)

    cards = [
        dict(x=6,  title='Z1', sub='Barrier accuracy',
             metric='MAE 135–243 meV', gate='gate ≤ 40 meV',
             state='FAILED', color=ROSE, soft=SOFT_ROSE,
             note='all four models ·\nsystematic under-prediction'),
        dict(x=37, title='R4', sub='Elastic correction',
             metric='0/4 and 0/1\ngroups', gate='confirmatory',
             state='FAILED', color=ROSE, soft=SOFT_ROSE,
             note='verdicts recorded;\namendment on file'),
        dict(x=68, title='Z2', sub='Spin / Tc ranking',
             metric='no SOC-capable\nrunner', gate='—',
             state='ABSTAINED', color=AMBER, soft=SOFT_AMBER,
             note='audit instead of\nfabricated numbers'),
        dict(x=99, title='Z3', sub='Adsorption Δ-learning',
             metric='128 cells\nrunning', gate='≤ 0.1 eV corrected',
             state='LIVE', color=SAGE, soft=SOFT_SAGE,
             note='baseline errors feed\nthe delta model'),
    ]
    for c in cards:
        box = FancyBboxPatch((c['x'], 16), 24, 38,
                             boxstyle='round,pad=0.8,rounding_size=2.2',
                             facecolor='white', edgecolor=c['color'], linewidth=2.2)
        ax.add_patch(box)
        ax.text(c['x'] + 12, 48.5, c['title'], ha='center', fontsize=22,
                fontweight='bold', color=c['color'])
        ax.text(c['x'] + 12, 44.5, c['sub'], ha='center', fontsize=9.5, color=SECONDARY)
        ax.text(c['x'] + 12, 39.2, c['metric'], ha='center', va='center', fontsize=10,
                color=INK, fontweight='bold', linespacing=1.35)
        ax.text(c['x'] + 12, 34.6, c['gate'], ha='center', fontsize=9.5, color=SECONDARY)
        pill = FancyBboxPatch((c['x'] + 5.2, 28.5), 13.6, 4.6,
                              boxstyle='round,pad=0.3,rounding_size=2.0',
                              facecolor=c['soft'], edgecolor='none')
        ax.add_patch(pill)
        ax.text(c['x'] + 12, 30.8, c['state'], ha='center', va='center',
                fontsize=11, fontweight='bold', color=c['color'])
        ax.text(c['x'] + 12, 21.5, c['note'], ha='center', va='center',
                fontsize=9, color=SECONDARY, linespacing=1.5)

    ax.text(64, 9, 'Every card is backed by content-addressed artifacts: manifest → locked panel → cloud run → hash-chained rows',
            ha='center', fontsize=11, color=INDIGO)
    ax.text(64, 4.5, 'Failing in public, with receipts.',
            ha='center', fontsize=12.5, style='italic', color=INK)
    save(fig, '01-four-gates-scoreboard')


# -----------------------------------------------------------------------------
# 02 — Z1: barrier MAE vs the 40 meV gate + signed-error bias
# -----------------------------------------------------------------------------
def z1_chart():
    fig, (ax, ax2) = plt.subplots(1, 2, figsize=FIGSIZE,
                                  gridspec_kw={'width_ratios': [1.15, 1]})
    models = ['mace-mpa-0\nmedium', 'mace-mp\nsmall', 'mace-mp\nmedium', 'chgnet']
    maes = [135.0, 152.0, 174.7, 242.5]
    colors = [SAGE, INDIGO, INDIGO, SLATE]

    bars = ax.bar(models, maes, color=colors, width=0.62, zorder=3)
    ax.axhline(40, color=ROSE, linewidth=2.2, linestyle='--', zorder=4)
    ax.text(1.5, 52, 'gate ≤ 40 meV', color=ROSE, fontsize=10,
            ha='center', fontweight='bold')
    for b, v in zip(bars, maes):
        ax.text(b.get_x() + b.get_width() / 2, v + 6, f'{v:.0f}', ha='center',
                fontsize=12, fontweight='bold', color=INK)
    ax.set_ylabel('migration-barrier MAE (meV)')
    ax.set_title('Z1: all four models\nmiss the barrier gate', fontsize=13,
                 fontweight='bold', pad=12)
    ax.set_ylim(0, 275)
    ax.spines[['top', 'right']].set_visible(False)
    ax.grid(axis='y', color=MUTED, alpha=0.25, zorder=0)

    # signed-error distribution for mace-mp-small: all negative
    errs = -np.array([74.9, 467.0, 157.8, 86.4, 168.7, 258.3, 27.9, 68.1, 130.9,
                      146.4, 227.4, 143.0, 427.9, 61.0, 166.3, 61.2, 33.9, 87.0,
                      78.5, 16.4, 233.0, 144.1, 449.7, 206.8, 12.9, 16.2])
    ax2.axvline(0, color=INK, linewidth=1.4)
    ax2.hist(errs, bins=12, color=ROSE, alpha=0.85, zorder=3)
    ax2.set_xlabel('signed error per NEB path (meV), predicted − DFT reference')
    ax2.set_ylabel('paths')
    ax2.set_title('Every completed path under-predicts\nthe barrier (mace-mp-small)',
                  fontsize=13, fontweight='bold', pad=12)
    ax2.text(-465, 5.7, '26/26 negative\n→ systematic bias,\nnot random scatter',
             fontsize=10, color=INK,
             bbox=dict(boxstyle='round,pad=0.5', facecolor=SOFT_ROSE, edgecolor=ROSE))
    ax2.set_xlim(-500, 40)
    ax2.spines[['top', 'right']].set_visible(False)
    ax2.grid(axis='y', color=MUTED, alpha=0.25, zorder=0)
    save(fig, '02-z1-barrier-mae-vs-gate')


# -----------------------------------------------------------------------------
# 03 — Z3: anatomy of the first adsorption error
# -----------------------------------------------------------------------------
def z3_anatomy():
    fig, ax = plt.subplots(figsize=FIGSIZE)

    labels = ['gas molecule\n(43 atoms)', 'clean Ni(111) slab\n(84 atoms)',
              'adsorbed complex\n(127 atoms)', 'the interface\n(what remains)']
    vals = [1.39, -12.45, -1.24, 9.82]
    cols = [SAGE, SLATE, INDIGO, ROSE]
    x = np.arange(4)
    bars = ax.bar(x, vals, color=cols, width=0.58, zorder=3)
    ax.axhline(0, color=INK, linewidth=1.2)
    for xi, v in zip(x, vals):
        ax.text(xi, v + (0.45 if v > 0 else -0.55), f'{v:+.2f} eV',
                ha='center', va='bottom' if v > 0 else 'top',
                fontsize=12.5, fontweight='bold', color=INK)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=10.5)
    ax.set_ylabel('model − reference, per system (eV)')
    ax.set_title('Z3 first datapoint: the whole miss lives at the interface',
                 fontsize=15, fontweight='bold', pad=14)
    ax.set_ylim(-15.5, 13)
    ax.spines[['top', 'right']].set_visible(False)
    ax.grid(axis='y', color=MUTED, alpha=0.25, zorder=0)

    ax.annotate('slab and complex nearly cancel;\n'
                'the residual +9.8 eV is the adsorption bond itself —\n'
                'a dispersion-driven stabilization the model never learned',
                xy=(3.35, 9.82), xytext=(0.35, 5.4), fontsize=10.5, color=INK,
                arrowprops=dict(arrowstyle='->', color=SECONDARY),
                bbox=dict(boxstyle='round,pad=0.5', facecolor=SOFT_AMBER, edgecolor=AMBER))
    save(fig, '03-z3-interface-error-anatomy')


# -----------------------------------------------------------------------------
# 04 — The receipts pipeline (hash chain)
# -----------------------------------------------------------------------------
def receipts():
    fig, ax = plt.subplots(figsize=FIGSIZE)
    ax.set_xlim(0, 128)
    ax.set_ylim(0, 72)
    ax.axis('off')

    ax.text(64, 66, 'Why you can check our work', ha='center', fontsize=20,
            fontweight='bold', color=INK)
    ax.text(64, 60.5, 'every stage is content-addressed; changing anything upstream breaks the chain',
            ha='center', fontsize=11.5, color=SECONDARY)

    steps = [
        ('campaign\nmanifest', 'what we promised\nto measure', INDIGO, SOFT_INDIGO),
        ('locked\npanel', 'the exact 30–32\nsystems, hash-pinned', SLATE, '#dfe5ea'),
        ('cloud\nexecution', 'one artifact per\nmeasurement, GCS', AMBER, SOFT_AMBER),
        ('measurement\nrows', 'RFC 8785 bytes,\nhash-chained', SAGE, SOFT_SAGE),
        ('ingestion +\ngates', 'claims update only\nif hashes verify', ROSE, SOFT_ROSE),
    ]
    w = 20
    gap = (128 - 5 * w) / 6
    for i, (title, sub, color, soft) in enumerate(steps):
        x = gap + i * (w + gap)
        box = FancyBboxPatch((x, 28), w, 18, boxstyle='round,pad=0.7,rounding_size=2',
                             facecolor='white', edgecolor=color, linewidth=2)
        ax.add_patch(box)
        ax.text(x + w / 2, 40, title, ha='center', va='center', fontsize=11.5,
                fontweight='bold', color=color, linespacing=1.4)
        ax.text(x + w / 2, 32.5, sub, ha='center', va='center', fontsize=8.8,
                color=SECONDARY, linespacing=1.4)
        if i < 4:
            ax.annotate('', xy=(x + w + gap - 1.2, 37), xytext=(x + w + 1.2, 37),
                        arrowprops=dict(arrowstyle='-|>', color=INK, lw=2))
        ax.text(x + w / 2, 24.5, 'sha256', ha='center', fontsize=8.5,
                fontfamily='monospace', color=MUTED)

    ax.text(64, 15, 'If a number in this article is wrong, the row hashes won’t verify — and the pipeline refuses to publish it.',
            ha='center', fontsize=11, color=INK)
    ax.text(64, 9.5, 'The claims registry marks every gate unsupported until real ingestion lands. The Lean theorems are scaffolding by design, and say so.',
            ha='center', fontsize=10, color=SECONDARY)
    save(fig, '04-receipts-pipeline')


if __name__ == '__main__':
    scoreboard()
    z1_chart()
    z3_anatomy()
    receipts()
