// Articles now render on the server. Keep this file as a tiny guard to avoid
// client-side re-rendering or data duplication.
(() => {
  const container = document.getElementById('article-content');
  if (!container) return;
  if (container.querySelector('.article-header')) return;
})();
