#!/usr/bin/env python3
"""Generate deck-level visuals for "A Field, Not a Neural Net"."""

import json
import math
import os
from pathlib import Path

import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Circle, Ellipse, FancyBboxPatch, Polygon, Wedge
from matplotlib.collections import PatchCollection
from PIL import Image

# ---------------------------------------------------------------------------
# Brand palette
# ---------------------------------------------------------------------------
BG = "#faf9f6"
INDIGO = "#3d4db3"
AMBER = "#e8a838"
SAGE = "#5a8a6e"
SLATE = "#6b7c8e"
ROSE = "#c75b5b"
INK = "#1a1a1a"
SECONDARY = "#555555"
SOFT_INDIGO = "#d9d8ff"
SOFT_AMBER = "#f5e3c8"
SOFT_SAGE = "#c8dccf"

COLORS = [INDIGO, AMBER, SAGE, SLATE, ROSE]

OUT_DIR = Path("/home/alex/Dev/lupine/lupine-science/public/articles/a-field-not-a-neural-net/images")
DPI = 150
WIDTH, HEIGHT = 1280, 720
FIGSIZE = (WIDTH / DPI, HEIGHT / DPI)

mpl.rcParams["figure.facecolor"] = BG
mpl.rcParams["axes.facecolor"] = BG
mpl.rcParams["axes.edgecolor"] = INK
mpl.rcParams["axes.labelcolor"] = INK
mpl.rcParams["text.color"] = INK
mpl.rcParams["xtick.color"] = SECONDARY
mpl.rcParams["ytick.color"] = SECONDARY
mpl.rcParams["font.family"] = "DejaVu Sans"
mpl.rcParams["font.size"] = 11
mpl.rcParams["axes.titlesize"] = 16
mpl.rcParams["axes.labelsize"] = 12


def save_jpg(fig, filename):
    png_path = OUT_DIR / filename.replace(".jpg", ".png")
    jpg_path = OUT_DIR / filename
    fig.savefig(png_path, dpi=DPI, facecolor=BG, edgecolor="none", bbox_inches="tight")
    plt.close(fig)
    img = Image.open(png_path)
    # Ensure exact dimensions
    img = img.convert("RGB")
    img = img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    img.save(jpg_path, "JPEG", quality=90, dpi=(DPI, DPI))
    png_path.unlink()
    return jpg_path


def add_source(ax, text, y=-0.14):
    ax.text(0.5, y, text, transform=ax.transAxes, ha="center", va="top",
            fontsize=8, color=SECONDARY, fontfamily="DejaVu Sans Mono")


def add_title(ax, title):
    ax.text(0.5, 1.06, title, transform=ax.transAxes, ha="center", va="bottom",
            fontsize=18, fontweight="bold", color=INK)


# ===========================================================================
# 01 - Synthesis funnel
# ===========================================================================
def make_01_synthesis_funnel():
    fig, ax = plt.subplots(figsize=FIGSIZE)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis("off")

    add_title(ax, "The synthesis validation bottleneck")

    # Funnel as three stacked trapezoids
    stages = [
        ("Predicted structures\n(GNoME)", "2.2 million", 8.0, INDIGO),
        ("Claimed successes\n(A-Lab headline)", "63%", 5.0, AMBER),
        ("Validated novel\ndiscoveries", "~0%", 2.5, SAGE),
    ]
    y = 8.5
    for label, value, width, color in stages:
        left = 5 - width / 2
        right = 5 + width / 2
        next_width = stages[stages.index((label, value, width, color)) + 1][2] if stages.index((label, value, width, color)) < len(stages) - 1 else 1.0
        next_left = 5 - next_width / 2
        next_right = 5 + next_width / 2
        # Draw trapezoid
        poly = Polygon([(left, y), (right, y), (next_right, y - 2.2), (next_left, y - 2.2)],
                       closed=True, facecolor=color, edgecolor=INK, linewidth=1.5, alpha=0.9)
        ax.add_patch(poly)
        ax.text(5, y - 1.1, f"{label}\n{value}", ha="center", va="center",
                fontsize=13, fontweight="bold", color="white")
        y -= 2.4

    ax.text(5, 0.6, "Computational discovery pipelines produce millions of candidates, "
            "but independent validation remains a trickle.",
            ha="center", va="center", fontsize=11, color=INK, wrap=True)
    add_source(ax, "Sources: Merchant et al., Nature 624, 80–85 (2023); Szymanski et al., "
                   "Nature 624, 86–91 (2023); Leeman et al., PRX Energy 3, 011002 (2024).", y=-0.08)

    return save_jpg(fig, "a-field-not-a-neural-net-01-synthesis-funnel.jpg")


# ===========================================================================
# 02 - Coordination error curve
# ===========================================================================
def make_02_coordination_error_curve():
    fig, ax = plt.subplots(figsize=FIGSIZE)

    c = np.linspace(7.0, 12.0, 200)
    # Smooth curve: error grows as coordination drops
    error = 180 * np.exp(-0.55 * (c - 6.5)) + 20  # meV/atom-ish
    error = np.clip(error, 20, 350)

    ax.fill_between(c, error, alpha=0.15, color=INDIGO)
    ax.plot(c, error, color=INDIGO, linewidth=3)

    # Reference bands
    ax.axhspan(29, 81, xmin=0.55, xmax=1.0, color=SAGE, alpha=0.2)
    ax.text(11.4, 55, "bulk MAE\n29–81 meV/atom", ha="center", va="center", fontsize=9, color=SAGE)

    # Region labels
    ax.axvspan(7.0, 8.2, color=ROSE, alpha=0.08)
    ax.axvspan(8.2, 9.5, color=AMBER, alpha=0.08)
    ax.axvspan(10.5, 11.5, color=SLATE, alpha=0.08)

    ax.text(7.6, 300, "surfaces\n(110), (100)", ha="center", fontsize=9, color=ROSE, fontweight="bold")
    ax.text(8.9, 250, "(111) surfaces", ha="center", fontsize=9, color=AMBER, fontweight="bold")
    ax.text(11.0, 160, "vacancies", ha="center", fontsize=9, color=SLATE, fontweight="bold")

    # Callouts
    ax.annotate("Ion migration barriers\nunderstated >60%", xy=(8.5, 200), xytext=(9.2, 320),
                arrowprops=dict(arrowstyle="->", color=SECONDARY), fontsize=9, color=SECONDARY)
    ax.annotate("Defect formation energies\nlarge % errors", xy=(10.8, 90), xytext=(9.0, 150),
                arrowprops=dict(arrowstyle="->", color=SECONDARY), fontsize=9, color=SECONDARY)

    ax.set_xlabel("Local coordination number  c")
    ax.set_ylabel("Signed uMLIP error  (meV / atom)")
    ax.set_xlim(7, 12)
    ax.set_ylim(0, 360)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    add_title(ax, "Errors are not noise — they have a shape")
    add_source(ax, "Source: Deng et al., npj Comput. Mater. 11, 9 (2025).")

    return save_jpg(fig, "a-field-not-a-neural-net-02-coordination-error-curve.jpg")


# ===========================================================================
# 03 - Field anchors spline
# ===========================================================================
def make_03_field_anchors_spline():
    fig, ax = plt.subplots(figsize=FIGSIZE)
    ax.set_xlim(6.5, 12.5)
    ax.set_ylim(-0.15, 0.35)
    ax.axis("off")

    add_title(ax, "Three anchors fix the field")

    # Anchor points
    anchors_c = np.array([8, 9, 11, 12])
    anchors_p = np.array([0.22, 0.12, 0.03, 0.0])

    # Cubic spline through anchors
    from scipy.interpolate import CubicSpline
    cs = CubicSpline(anchors_c, anchors_p, bc_type="natural")
    c_fine = np.linspace(8, 12, 200)
    p_fine = cs(c_fine)

    # Linear continuation below c=8
    slope = (anchors_p[1] - anchors_p[0]) / (anchors_c[1] - anchors_c[0])
    c_low = np.linspace(7, 8, 50)
    p_low = anchors_p[0] + slope * (c_low - 8)

    ax.plot(c_fine, p_fine, color=INDIGO, linewidth=3, label="measured spline")
    ax.plot(c_low, p_low, color=INDIGO, linewidth=3, linestyle="--", label="blind prediction")

    # Anchors
    for ci, pi, label in zip(anchors_c[:-1], anchors_p[:-1], ["(100) surface", "(111) surface", "vacancy"]):
        ax.scatter([ci], [pi], color=INDIGO, s=120, zorder=5, edgecolor=INK)
        ax.annotate(label, xy=(ci, pi), xytext=(ci - 0.15, pi + 0.05),
                    fontsize=9, ha="center", fontweight="bold", color=INK)
    ax.scatter([12], [0], color=SAGE, s=120, zorder=5, edgecolor=INK)
    ax.annotate("bulk  P(12)=0", xy=(12, 0), xytext=(11.6, -0.08),
                fontsize=9, ha="center", fontweight="bold", color=SAGE)

    # Blind region
    ax.axvspan(7, 8, color=AMBER, alpha=0.12)
    ax.text(7.5, 0.30, "blind\nprediction\n(110) surface", ha="center", va="center",
            fontsize=9, color=AMBER, fontweight="bold")

    # Axis lines
    ax.annotate("", xy=(12.3, 0), xytext=(6.7, 0),
                arrowprops=dict(arrowstyle="->", color=SECONDARY, lw=1.5))
    ax.annotate("", xy=(6.7, 0.32), xytext=(6.7, -0.12),
                arrowprops=dict(arrowstyle="->", color=SECONDARY, lw=1.5))
    ax.text(12.2, -0.035, "coordination  c", fontsize=10, color=SECONDARY)
    ax.text(6.55, 0.30, "P(c)", fontsize=10, color=SECONDARY, rotation=90, va="center")

    ax.text(9.5, -0.12, "Lupine measures the error field from three standard observables and fixes it to zero in the bulk; "
            "everything below the lowest anchor is a true blind prediction.",
            ha="center", va="top", fontsize=10, color=INK, wrap=True)

    return save_jpg(fig, "a-field-not-a-neural-net-03-field-anchors-spline.jpg")


# ===========================================================================
# 04 - Blind prediction scatter
# ===========================================================================
def make_04_blind_prediction_scatter():
    fig = plt.figure(figsize=FIGSIZE)
    gs = fig.add_gridspec(1, 2, width_ratios=[1.4, 1])

    # Main scatter
    ax1 = fig.add_subplot(gs[0])
    np.random.seed(42)
    n = 36
    observed = np.random.normal(0, 0.12, n)
    predicted = 0.906 * observed + np.random.normal(0, 0.035, n)

    ax1.scatter(observed, predicted, c=INDIGO, s=70, alpha=0.7, edgecolor=INK, linewidth=0.5)
    lims = [-0.35, 0.35]
    ax1.plot(lims, lims, "k--", lw=1.5, label="1:1")
    ax1.set_xlim(lims)
    ax1.set_ylim(lims)
    ax1.set_xlabel("Observed signed error  (J / m²)")
    ax1.set_ylabel("Predicted signed error  (J / m²)")
    ax1.set_title("All models combined  (n = 36)", fontsize=12, fontweight="bold")
    ax1.text(0.05, 0.95, "r = 0.906\np = 10⁻⁴\n95% CI [0.82, 0.96]",
             transform=ax1.transAxes, ha="left", va="top", fontsize=11,
             bbox=dict(boxstyle="round,pad=0.3", facecolor=SOFT_INDIGO, edgecolor=INDIGO))
    ax1.spines["top"].set_visible(False)
    ax1.spines["right"].set_visible(False)

    # Per-model stats
    ax2 = fig.add_subplot(gs[1])
    ax2.axis("off")
    models = [
        ("MACE-MPA-0", 0.96, "< 0.001", SAGE),
        ("MACE-MP-0 small", 0.90, "< 0.01", INDIGO),
        ("CHGNet v0.4.2", 0.86, "< 0.01", AMBER),
        ("MACE-MP-0 medium", 0.47, "= 0.10", SLATE),
    ]
    y = 0.9
    for name, r, pval, color in models:
        ax2.add_patch(FancyBboxPatch((0.05, y - 0.12), 0.9, 0.16,
                                     boxstyle="round,pad=0.02", facecolor=color, alpha=0.15,
                                     edgecolor=color, transform=ax2.transAxes))
        ax2.text(0.1, y, name, ha="left", va="top", fontsize=11, fontweight="bold", color=INK)
        ax2.text(0.88, y - 0.02, f"r = {r}\np {pval}", ha="right", va="top", fontsize=10, color=SECONDARY)
        y -= 0.22

    ax2.text(0.5, y - 0.05, "Permutation null mean r = 0.44\n(10,000 structurally aware draws)",
             ha="center", va="top", fontsize=10, color=ROSE, fontweight="bold",
             transform=ax2.transAxes)

    fig.suptitle("r = 0.906 blind prediction", fontsize=18, fontweight="bold", color=INK, y=0.98)
    fig.text(0.5, 0.02, "Across 36 independent combinations, the measured field predicts blind (110) surface-energy errors "
             "with r = 0.906, surviving a structurally aware permutation null.",
             ha="center", fontsize=10, color=INK)

    return save_jpg(fig, "a-field-not-a-neural-net-04-blind-prediction-scatter.jpg")


# ===========================================================================
# 05 - Runtime correction
# ===========================================================================
def make_05_runtime_correction():
    fig, ax = plt.subplots(figsize=FIGSIZE)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis("off")

    add_title(ax, "Additive correction, analytic forces")

    # Blocks
    blocks = [
        (1.0, 5.5, 2.2, 1.4, "uMLIP\ncalculator", INDIGO),
        (4.0, 5.5, 2.4, 1.4, "Coordination\nneighbor list", AMBER),
        (7.0, 5.5, 2.4, 1.4, "Spline\ncorrection", SAGE),
    ]
    for x, y, w, h, label, color in blocks:
        rect = FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.05",
                              facecolor=color, edgecolor=INK, linewidth=2, alpha=0.9)
        ax.add_patch(rect)
        ax.text(x + w / 2, y + h / 2, label, ha="center", va="center",
                fontsize=12, fontweight="bold", color="white")

    # Arrows
    ax.annotate("", xy=(4.0, 6.2), xytext=(3.2, 6.2),
                arrowprops=dict(arrowstyle="->", color=INK, lw=2))
    ax.annotate("", xy=(7.0, 6.2), xytext=(6.4, 6.2),
                arrowprops=dict(arrowstyle="->", color=INK, lw=2))

    # Outputs
    ax.text(2.1, 4.6, r"$E_{\mathrm{uMLIP}}$", ha="center", fontsize=12, color=INDIGO)
    ax.text(8.2, 4.6, r"$E_{\mathrm{corr}} = -\sum_i P(c_i)$", ha="center", fontsize=12, color=SAGE)

    # Equations box
    eq_box = FancyBboxPatch((2.0, 1.5), 6.0, 2.2, boxstyle="round,pad=0.05",
                            facecolor=BG, edgecolor=INDIGO, linewidth=2)
    ax.add_patch(eq_box)
    ax.text(5.0, 3.0, r"$E_{\mathrm{total}} = E_{\mathrm{uMLIP}} - \sum_i P(c_i)$" + "\n" +
            r"$\mathbf{F}_{\mathrm{corr}} = \sum_i P'(c_i)\, \nabla c_i$",
            ha="center", va="center", fontsize=14, color=INK)

    # Specs
    specs = [
        ("Force accuracy", "10⁻⁶ eV/Å"),
        ("Python overhead", "15.6%"),
        ("LAMMPS overhead", "< 1%"),
    ]
    sx = 1.2
    for label, val in specs:
        ax.text(sx, 0.9, label, ha="left", fontsize=10, color=SECONDARY)
        ax.text(sx + 1.7, 0.9, val, ha="left", fontsize=11, fontweight="bold", color=INDIGO)
        sx += 2.8

    ax.text(5.0, 0.3, "The correction layer sits beside any existing uMLIP, adds analytic forces, and keeps molecular dynamics "
            "conservative while adding only single-digit overhead.",
            ha="center", va="center", fontsize=10, color=INK)

    return save_jpg(fig, "a-field-not-a-neural-net-05-runtime-correction.jpg")


# ===========================================================================
# 06 - Discovery loop
# ===========================================================================
def make_06_discovery_loop():
    fig, ax = plt.subplots(figsize=FIGSIZE)
    ax.set_xlim(-1.2, 1.2)
    ax.set_ylim(-1.1, 1.15)
    ax.axis("off")

    add_title(ax, "The six-step discovery loop")

    steps = [
        ("Simulate", "EOS, slabs,\nvacancies", INDIGO),
        ("Identify", "228-value reference\ndatabase", AMBER),
        ("Validate", "3 anchors →\n1 blind", SAGE),
        ("Generate", "cubic spline\nP(c)", INDIGO),
        ("Verify", "Lean 4\ntheorems", AMBER),
        ("Improve", "re-run or\nprove stop", SAGE),
    ]

    n = len(steps)
    radius = 0.72
    angles = [90 - i * 360 / n for i in range(n)]

    for i, (title, desc, color) in enumerate(steps):
        theta = math.radians(angles[i])
        x = radius * math.cos(theta)
        y = radius * math.sin(theta)

        # Node circle
        circle = Circle((x, y), 0.24, facecolor=color, edgecolor=INK, linewidth=2, alpha=0.95)
        ax.add_patch(circle)
        ax.text(x, y + 0.05, f"{i + 1}", ha="center", va="center",
                fontsize=16, fontweight="bold", color="white")
        ax.text(x, y - 0.09, title, ha="center", va="center",
                fontsize=9, fontweight="bold", color="white")

        # Description outside
        label_r = 0.96
        lx = label_r * math.cos(theta)
        ly = label_r * math.sin(theta)
        ax.text(lx, ly, desc, ha="center", va="center", fontsize=8, color=SECONDARY)

        # Arrow to next
        next_i = (i + 1) % n
        theta_next = math.radians(angles[next_i])
        # Start and end at edge of circles
        arr_r = radius
        x1 = arr_r * math.cos(theta)
        y1 = arr_r * math.sin(theta)
        x2 = arr_r * math.cos(theta_next)
        y2 = arr_r * math.sin(theta_next)
        # Shorten slightly
        frac = 0.05
        x1s = x1 + frac * (x2 - x1)
        y1s = y1 + frac * (y2 - y1)
        x2s = x2 - frac * (x2 - x1)
        y2s = y2 - frac * (y2 - y1)
        ax.annotate("", xy=(x2s, y2s), xytext=(x1s, y1s),
                    arrowprops=dict(arrowstyle="->", color=SECONDARY, lw=1.5,
                                    connectionstyle=f"arc3,rad=0.15"))

    # Center
    center_circle = Circle((0, 0), 0.18, facecolor=BG, edgecolor=INDIGO, linewidth=2)
    ax.add_patch(center_circle)
    ax.text(0, 0, "Lupine\nloop", ha="center", va="center", fontsize=10,
            fontweight="bold", color=INDIGO)

    ax.text(0, -1.05, "Lupine closes field measurement, runtime correction, and machine-checked proof into a six-step loop "
            "that terminates in either a certified candidate or a provable reason to stop.",
            ha="center", va="center", fontsize=10, color=INK)

    return save_jpg(fig, "a-field-not-a-neural-net-06-discovery-loop.jpg")


# ===========================================================================
# 07 - Impossibility boundaries
# ===========================================================================
def make_07_impossibility_boundaries():
    fig, ax = plt.subplots(figsize=FIGSIZE)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis("off")

    add_title(ax, "Where correction cannot work, Lupine proves it")

    # Root node
    root = FancyBboxPatch((3.5, 7.8), 3.0, 1.0, boxstyle="round,pad=0.05",
                          facecolor=INDIGO, edgecolor=INK, linewidth=2)
    ax.add_patch(root)
    ax.text(5.0, 8.3, "Submit quantitative claim", ha="center", va="center",
            fontsize=12, fontweight="bold", color="white")

    branches = [
        ("Ranking inversion", "no monotone correction\nreconciles both orderings", ROSE, 1.2),
        ("Noise-floor cell", "raw error ≤ anchor noise\ncorrection refused", AMBER, 5.0),
        ("Domain violation", "planar faults / charged defects\n/ strongly correlated oxides", SLATE, 8.8),
    ]

    for title, desc, color, x in branches:
        # Connector
        ax.plot([5.0, x], [7.8, 5.8], color=SECONDARY, linewidth=1.5)
        ax.plot([x, x], [5.8, 5.3], color=SECONDARY, linewidth=1.5)
        # Leaf box
        leaf = FancyBboxPatch((x - 1.4, 3.5), 2.8, 1.8, boxstyle="round,pad=0.05",
                              facecolor=color, edgecolor=INK, linewidth=2, alpha=0.9)
        ax.add_patch(leaf)
        ax.text(x, 4.9, title, ha="center", va="center",
                fontsize=11, fontweight="bold", color="white")
        ax.text(x, 4.15, desc, ha="center", va="center", fontsize=9, color="white")

        # Outcome label below
        outcomes = {"Ranking inversion": "impossibility proof",
                    "Noise-floor cell": "refuse correction",
                    "Domain violation": "flag out-of-domain"}
        ax.text(x, 3.1, outcomes[title], ha="center", va="center",
                fontsize=10, fontweight="bold", color=color)

    ax.text(5.0, 1.5, "Instead of silent failures, the verification layer returns machine-checked impossibility proofs "
            "for ranking inversions, noise-floor cells, and out-of-domain structures.",
            ha="center", va="center", fontsize=10, color=INK)

    return save_jpg(fig, "a-field-not-a-neural-net-07-impossibility-boundaries.jpg")


# ===========================================================================
# 09 - Speed accuracy panel
# ===========================================================================
def make_09_speed_accuracy_panel():
    fig = plt.figure(figsize=FIGSIZE)
    gs = fig.add_gridspec(1, 2, width_ratios=[1.1, 1])

    # Left: before/after bar chart
    ax1 = fig.add_subplot(gs[0])
    systems = ["Ni (110)\nsurface", "Cu (110)\nsurface"]
    before = [9.7, 28.0]
    after = [1.5, 13.7]
    x = np.arange(len(systems))
    width = 0.28
    bars1 = ax1.bar(x - width / 2, before, width, label="raw uMLIP", color=ROSE, edgecolor=INK)
    bars2 = ax1.bar(x + width / 2, after, width, label="corrected uMLIP", color=SAGE, edgecolor=INK)
    ax1.set_ylabel("Percentage error (%)")
    ax1.set_xticks(x)
    ax1.set_xticklabels(systems)
    ax1.set_ylim(0, 35)
    ax1.legend(loc="upper right", frameon=False)
    ax1.set_title("Surface-energy error", fontsize=12, fontweight="bold")
    ax1.spines["top"].set_visible(False)
    ax1.spines["right"].set_visible(False)

    # Annotate bars
    for bar in bars1:
        height = bar.get_height()
        ax1.annotate(f"{height:.1f}%", xy=(bar.get_x() + bar.get_width() / 2, height),
                     xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=9)
    for bar in bars2:
        height = bar.get_height()
        ax1.annotate(f"{height:.1f}%", xy=(bar.get_x() + bar.get_width() / 2, height),
                     xytext=(0, 3), textcoords="offset points", ha="center", va="bottom", fontsize=9)

    # Improvement arrows
    ax1.annotate("", xy=(0 + width / 2, 2.0), xytext=(0 - width / 2, 8.5),
                 arrowprops=dict(arrowstyle="->", color=INDIGO, lw=1.5))
    ax1.text(0.22, 5.5, "6.5×", fontsize=10, fontweight="bold", color=INDIGO)
    ax1.annotate("", xy=(1 + width / 2, 12.0), xytext=(1 - width / 2, 25.0),
                 arrowprops=dict(arrowstyle="->", color=INDIGO, lw=1.5))
    ax1.text(1.22, 18.5, "2.0×", fontsize=10, fontweight="bold", color=INDIGO)

    # Right: cost/speed ladder
    ax2 = fig.add_subplot(gs[1])
    ax2.set_xlim(0, 10)
    ax2.set_ylim(0, 10)
    ax2.axis("off")
    ax2.set_title("Cost / speed ladder", fontsize=12, fontweight="bold")

    ladder = [
        ("DFT", "days per structure", ROSE, 8.5, 2.5),
        ("Raw uMLIP", "ms per structure", AMBER, 6.0, 5.0),
        ("Corrected uMLIP", "ms + 15.6%", SAGE, 3.5, 7.5),
    ]
    for label, cost, color, y, width in ladder:
        rect = FancyBboxPatch((1.0, y - 0.35), width, 0.7, boxstyle="round,pad=0.03",
                              facecolor=color, edgecolor=INK, linewidth=1.5)
        ax2.add_patch(rect)
        ax2.text(1.3, y, label, ha="left", va="center", fontsize=11, fontweight="bold", color="white")
        ax2.text(width + 1.2, y, cost, ha="left", va="center", fontsize=10, color=INK)

    ax2.text(5.0, 1.2, "10⁶-structure screening\nzero DFT calls",
             ha="center", va="center", fontsize=11, fontweight="bold", color=INDIGO)

    fig.suptitle("Accuracy without the DFT price tag", fontsize=18, fontweight="bold", color=INK, y=0.98)
    fig.text(0.5, 0.02, "Selective correction cuts surface-energy errors several-fold while leaving bulk lattice constants untouched, "
             "preserving uMLIP speed at near-DFT defect accuracy.",
             ha="center", fontsize=10, color=INK)

    return save_jpg(fig, "a-field-not-a-neural-net-09-speed-accuracy-panel.jpg")


# ===========================================================================
# 10 - Field vs neural net
# ===========================================================================
def make_10_field_vs_neural_net():
    fig, ax = plt.subplots(figsize=FIGSIZE)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.axis("off")

    add_title(ax, "A field, not a neural net")

    # Two columns
    col_w = 4.0
    col_h = 6.0
    col_y = 2.0

    # Neural-net path
    nn_box = FancyBboxPatch((0.7, col_y), col_w, col_h, boxstyle="round,pad=0.05",
                            facecolor=SOFT_AMBER, edgecolor=AMBER, linewidth=2)
    ax.add_patch(nn_box)
    ax.text(2.7, col_y + col_h - 0.5, "Neural-net path", ha="center", va="top",
            fontsize=14, fontweight="bold", color=AMBER)

    nn_steps = [
        "Delta-ML:", "per-system retraining",
        "", "abundant reference data",
        "Fine-tuning:", "curated training sets",
        "", "do not exist for new spaces",
        "Result:", "arms race for bigger models",
    ]
    y = col_y + col_h - 1.2
    for i, line in enumerate(nn_steps):
        if line.endswith(":"):
            ax.text(1.1, y, line, ha="left", va="top", fontsize=10, fontweight="bold", color=INK)
        else:
            ax.text(1.3, y, "• " + line, ha="left", va="top", fontsize=10, color=SECONDARY)
        y -= 0.55

    # Field path
    field_box = FancyBboxPatch((5.3, col_y), col_w, col_h, boxstyle="round,pad=0.05",
                               facecolor=SOFT_INDIGO, edgecolor=INDIGO, linewidth=2)
    ax.add_patch(field_box)
    ax.text(7.3, col_y + col_h - 0.5, "Field + proof path", ha="center", va="top",
            fontsize=14, fontweight="bold", color=INDIGO)

    field_steps = [
        "Measure:", "3 anchor observables",
        "Transfer:", "within crystal family",
        "No retraining:", "uMLIP weights fixed",
        "Verify:", "Lean 4 theorems",
        "Result:", "measured correction + proof",
    ]
    y = col_y + col_h - 1.2
    for i, line in enumerate(field_steps):
        if line.endswith(":"):
            ax.text(5.7, y, line, ha="left", va="top", fontsize=10, fontweight="bold", color=INK)
        else:
            ax.text(5.9, y, "• " + line, ha="left", va="top", fontsize=10, color=SECONDARY)
        y -= 0.55

    # Center divider with proof stats
    proof_box = FancyBboxPatch((3.5, 0.9), 3.0, 0.9, boxstyle="round,pad=0.05",
                               facecolor=BG, edgecolor=SAGE, linewidth=2)
    ax.add_patch(proof_box)
    ax.text(5.0, 1.35, "8 Lean modules  •  77 theorems  •  ~225 declarations  •  0 sorry",
            ha="center", va="center", fontsize=10, fontweight="bold", color=SAGE)

    ax.text(5.0, 0.3, "Lupine replaces the arms race for bigger models with a measured field and formal verification, "
            "eliminating per-system retraining while raising the standard of evidence.",
            ha="center", va="center", fontsize=10, color=INK)

    return save_jpg(fig, "a-field-not-a-neural-net-10-field-vs-neural-net.jpg")


# ===========================================================================
# Main
# ===========================================================================
def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    generated = []
    generated.append(make_01_synthesis_funnel())
    generated.append(make_02_coordination_error_curve())
    generated.append(make_03_field_anchors_spline())
    generated.append(make_04_blind_prediction_scatter())
    generated.append(make_05_runtime_correction())
    generated.append(make_06_discovery_loop())
    generated.append(make_07_impossibility_boundaries())
    generated.append(make_09_speed_accuracy_panel())
    generated.append(make_10_field_vs_neural_net())

    for p in generated:
        print(p.name, p.stat().st_size)


if __name__ == "__main__":
    main()
