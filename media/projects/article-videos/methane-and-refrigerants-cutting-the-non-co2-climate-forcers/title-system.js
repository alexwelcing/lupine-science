/* Methane & Refrigerants episode — kinetic title and lower-third timeline.
 * Call addArticleTitleSystem(tl) from the episode's main timeline.
 * Pattern follows the director-approved a-field-not-a-neural-net title-system.js.
 * Seek-safe: every tween uses immediateRender:false on fromTo so the paused
 * timeline samples deterministically at any position.
 */
window.addArticleTitleSystem = function addArticleTitleSystem(tl) {
  const revealClip = (selector, start, duration) => {
    tl.fromTo(selector, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "none", immediateRender: false }, start);
    tl.to(selector, { opacity: 0, duration: 0.28, ease: "power2.inOut" }, start + duration - 0.28);
  };

  /* ---- Title card · 4–8.2s (after the four-second logo sting) ---- */
  const titleStart = 4;
  revealClip("#article-title-card", titleStart, 4.2);
  tl.fromTo("#article-title-card .title-system-wash", { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, duration: 1.1, ease: "sine.out", immediateRender: false }, titleStart + 0.08);
  tl.fromTo("#article-title-card .title-system-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.68, ease: "power2.inOut", immediateRender: false }, titleStart + 0.16);
  tl.fromTo("#article-title-card .title-system-brand", { opacity: 0, x: -36 }, { opacity: 1, x: 0, duration: 0.56, ease: "expo.out", immediateRender: false }, titleStart + 0.28);
  tl.fromTo("#article-title-card .title-system-eyebrow", { opacity: 0, x: 48 }, { opacity: 1, x: 0, duration: 0.48, ease: "power3.out", immediateRender: false }, titleStart + 0.5);
  tl.fromTo("#article-title-card .title-system-title", { opacity: 0, y: 86, rotation: 1.5 }, { opacity: 1, y: 0, rotation: 0, duration: 0.72, ease: "circ.out", immediateRender: false }, titleStart + 0.68);
  tl.fromTo("#article-title-card .title-system-deck", { opacity: 0, x: -54 }, { opacity: 1, x: 0, duration: 0.56, ease: "power4.out", immediateRender: false }, titleStart + 1.04);
  tl.fromTo("#article-title-card .title-system-index", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.42, ease: "power2.out", immediateRender: false }, titleStart + 1.2);

  /* ---- Section slates · beat transitions ----
   * Times align to the scene boundaries in the locked narration edit.
   */
  const sectionSlates = [
    ["#section-error",    19.186, 2.8],
    ["#section-methane",  33.201, 2.8],
    ["#section-cooling",  55.627, 2.8],
    ["#section-correct",  74.547, 2.8],
    ["#section-payoff",   94.451, 2.8],
  ];
  sectionSlates.forEach(([selector, start, duration], index) => {
    revealClip(selector, start, duration);
    tl.fromTo(selector + " .section-slate", { x: index % 2 ? 90 : -90, opacity: 0 }, { x: 0, opacity: 1, duration: 0.52, ease: index % 2 ? "expo.out" : "power4.out", immediateRender: false }, start + 0.12);
    tl.fromTo(selector + " .section-number", { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.34, ease: "power2.out", immediateRender: false }, start + 0.24);
    tl.fromTo(selector + " .section-title", { opacity: 0, y: 42 }, { opacity: 1, y: 0, duration: 0.54, ease: "circ.out", immediateRender: false }, start + 0.34);
    tl.fromTo(selector + " .section-subtitle", { opacity: 0, x: 34 }, { opacity: 1, x: 0, duration: 0.42, ease: "power3.out", immediateRender: false }, start + 0.56);
  });

  /* ---- Lower-thirds · evidence callouts ----
   * Placed mid-beat to cite the key claims; avoids the 2.8s section-slate windows.
   */
  const lowerThirds = [
    ["#source-barrier-sag",   39.0, 5.0],
    ["#source-methane-trap",  62.0, 5.0],
    ["#source-blind-correlation", 103.0, 5.5],
  ];
  lowerThirds.forEach(([selector, start, duration]) => {
    revealClip(selector, start, duration);
    tl.fromTo(selector + " .article-lower-third", { x: -92, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power4.out", immediateRender: false }, start + 0.08);
    tl.fromTo(selector + " .article-lower-third-tag", { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.32, ease: "power2.out", immediateRender: false }, start + 0.28);
    tl.fromTo(selector + " .article-lower-third-name", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.46, ease: "power3.out", immediateRender: false }, start + 0.34);
    tl.fromTo(selector + " .article-lower-third-role, " + selector + " .article-lower-third-dot", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.38, stagger: 0.06, ease: "power2.out", immediateRender: false }, start + 0.5);
  });
};
