document.addEventListener('DOMContentLoaded', () => {
  async function post(path, data) {
    const res = await fetch(path, { method: 'POST', body: data });
    if (!res.ok) console.error('POST failed', path, await res.text());
    return res.ok;
  }

  // Favorite toggle
  document.querySelectorAll('.fav, .fav-toggle').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      const active = btn.classList.contains('active');
      const ok = await post(`/api/assets/${id}/favorite`, new URLSearchParams({ favorite: active ? 'false' : 'true' }));
      if (ok) {
        btn.classList.toggle('active');
        if (btn.classList.contains('fav')) {
          btn.textContent = active ? '☆' : '★';
        } else {
          btn.textContent = active ? '☆ Add favorite' : '★ Favorited';
        }
      }
    });
  });

  // Rating
  document.querySelectorAll('.rating input[type="range"]').forEach(input => {
    const output = input.parentElement.querySelector('output');
    input.addEventListener('input', () => { output.textContent = input.value; });
    input.addEventListener('change', async () => {
      const id = input.dataset.id;
      await post(`/api/assets/${id}/rate`, new URLSearchParams({ rating: input.value }));
    });
  });

  // Notes
  const notes = document.getElementById('notes');
  if (notes) {
    let timeout;
    notes.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        await post(`/api/assets/${notes.dataset.id}/notes`, new URLSearchParams({ notes: notes.value }));
      }, 500);
    });
  }

  // Copy path
  document.querySelectorAll('.copy-path').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(btn.dataset.path);
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = orig, 1200);
      } catch (err) {
        console.error('Copy failed', err);
      }
    });
  });
});
