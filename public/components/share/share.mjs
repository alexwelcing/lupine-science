/**
 * share.mjs — self-contained social-share widget for Lupine Science.
 *
 * No third-party JavaScript, tracking pixels, or client-fetched counts.
 * Uses only static local SVG icons. Supports keyboard, ARIA, and
 * prefers-reduced-motion. The mobile view renders a single button that opens
 * a tray of share actions.
 *
 * Import and call initShare({ selector: '.share-root', url, title })
 * once per page. The markup is expected to be a wrapper <div> with the
 * class share-root; icons and links are generated dynamically.
 */

const ICONS = {
  bluesky: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 10.1c-1.3-2.5-4.8-7.1-8-9.1-3.1-1.9-4.8.2-3.4 3.4 1 2.3 3.5 5.4 5.5 5.4 1.6 0 2.9-1 4-1.9 1.1 1 2.4 1.9 4 1.9 2 0 4.5-3.1 5.5-5.4 1.4-3.2-.3-5.3-3.4-3.4-3.2 2-6.7 6.6-8 9.1-.4.8-.6 1.5-.6 2.1 0 2.3 2.1 4 4.6 4 2.4 0 4.3-1.4 5.1-3.5.3-.8.6-1.7.6-1.7s.3.9.6 1.7c.8 2.1 2.7 3.5 5.1 3.5 2.5 0 4.6-1.7 4.6-4 0-.6-.2-1.3-.6-2.1-1.3-2.5-4.8-7.1-8-9.1z"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  email: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Encode a string for use in a URL query parameter, matching the standard
 * encodeURIComponent alphabet plus RFC 3986 safe characters. This is the same
 * encoding used by modern browsers' URLSearchParams.
 */
export function encodeQuery(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

/**
 * Build the share URLs for the supported platforms.
 * The returned object is an array of { slug, href, label, icon, target, rel, isCopy, isEmail }.
 */
export function buildShareActions({ url, title }) {
  const encodedUrl = encodeQuery(url);
  const encodedTitle = encodeQuery(title);
  return [
    {
      slug: 'bluesky',
      href: `https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}`,
      label: 'Share on Bluesky',
      icon: ICONS.bluesky,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      slug: 'x',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      label: 'Share on X',
      icon: ICONS.x,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      slug: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      label: 'Share on LinkedIn',
      icon: ICONS.linkedin,
      target: '_blank',
      rel: 'noopener noreferrer',
    },
    {
      slug: 'copy',
      href: '#copy',
      label: 'Copy link',
      icon: ICONS.copy,
      isCopy: true,
    },
    {
      slug: 'email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      label: 'Share by email',
      icon: ICONS.email,
      isEmail: true,
    },
  ];
}

/**
 * Copy the given URL to the clipboard using the modern Clipboard API when
 * available, falling back to a temporary textarea and document.execCommand.
 * Returns a promise that resolves to true on success, false on failure.
 */
export async function copyUrlToClipboard(url) {
  const previousActive = document.activeElement;
  const restoreFocus = () => {
    if (previousActive && typeof previousActive.focus === 'function') {
      try { previousActive.focus(); } catch {}
    }
  };
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      restoreFocus();
      return true;
    } catch {
      // Fall through to legacy fallback
    }
  }
  const doc = this?.document ?? document;
  const textarea = doc.createElement('textarea');
  textarea.value = url;
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  doc.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    return doc.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
    restoreFocus();
  }
}

function createActionItem(action, onCopy, itemRole = 'listitem') {
  const item = document.createElement('li');
  item.className = `share-action share-action--${action.slug}`;
  if (itemRole) item.setAttribute('role', itemRole);

  if (action.isCopy) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'share-btn share-copy';
    button.setAttribute('data-url', ''); // populated by init
    button.setAttribute('aria-label', action.label);
    button.innerHTML = `${action.icon}<span class="share-action-text">${action.label}</span>`;
    if (onCopy) button.addEventListener('click', onCopy);
    item.appendChild(button);
  } else {
    const a = document.createElement('a');
    a.href = action.href;
    a.className = `share-link share-${action.slug}`;
    a.setAttribute('aria-label', action.label);
    if (action.target) a.target = action.target;
    if (action.rel) a.rel = action.rel;
    a.innerHTML = `${action.icon}<span class="share-action-text">${action.label}</span>`;
    item.appendChild(a);
  }
  return item;
}

/**
 * Initialize a single share widget on the given DOM element.
 */
export function initShare(root, { url, title }) {
  if (!root || !url || root.dataset.shareInitialized === 'true') return;
  root.dataset.shareInitialized = 'true';
  const actions = buildShareActions({ url, title });

  const id = root.id || `share-${Math.random().toString(36).slice(2, 8)}`;
  root.id = id;

  const isMobile = window.matchMedia('(max-width: 600px)').matches;
  const rootLabel = root.getAttribute('aria-label') || 'Share this page';

  // Preserve server-rendered fallback where present; otherwise build from scratch.
  const existingList = root.querySelector('.share-list');
  const live = document.createElement('span');
  live.className = 'share-live';
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');

  if (isMobile) {
    // Mobile: disclosure pattern — a single toggle controls a tray of native links/buttons.
    // Hide any server-rendered fallback list so it is not duplicated by the tray.
    if (existingList) existingList.hidden = true;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'share-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', `${id}-menu`);
    toggle.setAttribute('aria-label', rootLabel);
    toggle.innerHTML = `<span aria-hidden="true">↗</span><span class="share-toggle-text">Share</span>`;

    const menu = document.createElement('ul');
    menu.id = `${id}-menu`;
    menu.className = 'share-menu';
    menu.setAttribute('aria-label', 'Share options');
    menu.hidden = true;

    function closeTray() {
      toggle.setAttribute('aria-expanded', 'false');
      menu.hidden = true;
    }

    function openTray() {
      toggle.setAttribute('aria-expanded', 'true');
      menu.hidden = false;
      const first = menu.querySelector('a, button');
      if (first) first.focus();
    }

    function menuCopyHandler(labelText) {
      return async (event) => {
        event.preventDefault();
        const trigger = event.currentTarget;
        const ok = await copyUrlToClipboard(url);
        announce(root, ok ? 'Link copied to clipboard' : 'Could not copy link');
        if (ok) {
          const text = trigger.querySelector('.share-action-text');
          if (text) text.textContent = 'Copied!';
          setTimeout(() => { if (text) text.textContent = labelText; }, 2000);
        }
        closeTray();
        toggle.focus();
      };
    }

    for (const action of actions) {
      const onClick = action.isCopy ? menuCopyHandler(action.label) : undefined;
      const li = createActionItem(action, onClick, null);
      menu.appendChild(li);
    }

    root.appendChild(toggle);
    root.appendChild(menu);
    root.appendChild(live);

    toggle.addEventListener('click', () => {
      if (toggle.getAttribute('aria-expanded') === 'true') {
        closeTray();
        toggle.focus();
      } else {
        openTray();
      }
    });

    menu.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeTray();
        toggle.focus();
      }
    });

    document.addEventListener('click', (event) => {
      if (!root.contains(event.target)) closeTray();
    });
  } else if (!existingList) {
    // Desktop: visible row of action buttons (server did not render fallback)
    const list = document.createElement('ul');
    list.className = 'share-list';
    list.setAttribute('role', 'list');
    list.setAttribute('aria-label', 'Share options');

    for (const action of actions) {
      const li = createActionItem(action, async (event) => {
        event.preventDefault();
        const trigger = event.currentTarget;
        const ok = await copyUrlToClipboard(url);
        announce(root, ok ? 'Link copied to clipboard' : 'Could not copy link');
        if (ok) {
          const text = trigger.querySelector('.share-action-text');
          if (text) text.textContent = 'Copied!';
          setTimeout(() => { if (text) text.textContent = action.label; }, 2000);
        }
      });
      list.appendChild(li);
    }

    root.appendChild(list);
    root.appendChild(live);
  } else {
    // Desktop: enhance the server-rendered fallback list with Copy handling.
    existingList.querySelectorAll('a.share-copy, button.share-copy').forEach((btn) => {
      btn.addEventListener('click', async (event) => {
        event.preventDefault();
        const ok = await copyUrlToClipboard(url);
        announce(root, ok ? 'Link copied to clipboard' : 'Could not copy link');
      });
    });
    root.appendChild(live);
  }
}

function announce(root, message) {
  const live = root.querySelector('.share-live');
  if (live) {
    live.textContent = message;
    setTimeout(() => { live.textContent = ''; }, prefersReducedMotion() ? 3000 : 2000);
  }
}

/**
 * Auto-initialize all share widgets on the page. Roots are identified by the
 * .share-root class. Each root must have data-url and data-title attributes.
 */
export function initAllShareWidgets() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.share-root').forEach((root) => {
    const url = root.getAttribute('data-url');
    const title = root.getAttribute('data-title') || document.title || '';
    if (url) initShare(root, { url, title });
  });
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllShareWidgets);
  } else {
    initAllShareWidgets();
  }
}
