// =====================
// HOME / ARTICLES NAV
// =====================
function showHome() {
  document.getElementById('home-wrapper').classList.add('active');
  document.getElementById('articles-page').classList.remove('active');
  document.getElementById('home-nav-btn').classList.remove('visible');
  document.getElementById('search').value = '';
  searchQuery = '';
  renderCards();
}

function showArticles() {
  document.getElementById('home-wrapper').classList.remove('active');
  document.getElementById('articles-page').classList.add('active');
  document.getElementById('home-nav-btn').classList.add('visible');
}

function goToCat(cat) {
  showArticles();
  currentCat = cat;
  // Update sidebar
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.cat-btn[data-cat="${cat}"]`);
  if (btn) btn.classList.add('active');
  const titles = {all: 'All Articles', access: 'Access & Training', licensing: 'Licensing', carriers: 'Carriers & Products', applications: 'Applications', declined: 'Declined Applications', escalation: 'Escalation Matrix'};
  document.getElementById('results-title').textContent = titles[cat] || cat;
  renderCards();
}

// =====================
// STATE
// =====================
let currentCat = 'all';
let activeTags = [];
let searchQuery = '';

// =====================
// INIT
// =====================
function init() {
  renderAllTags();
  renderCards();
  updateCounts();
  // Populate home page counts
  ['access','licensing','carriers','applications','declined','escalation'].forEach(cat => {
    const count = articles.filter(a => a.cat === cat).length;
    const el = document.getElementById('hc-count-' + cat);
    if (el) el.textContent = `${count} article${count !== 1 ? 's' : ''}`;
  });
  document.getElementById('search').addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase();
    if (searchQuery) {
      // Auto-switch to all articles view when searching
      if (!document.getElementById('articles-page').classList.contains('active')) {
        currentCat = 'all';
        showArticles();
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.cat-btn[data-cat="all"]').classList.add('active');
        document.getElementById('results-title').textContent = 'All Articles';
      }
    }
    renderCards();
  });
}

function renderAllTags() {
  const allTags = [...new Set(articles.flatMap(a => a.tags))].sort();
  const container = document.getElementById('tags-list');
  container.innerHTML = allTags.map(t => `
    <button class="tag-filter" onclick="toggleTag('${t}', this)">${t}</button>
  `).join('');
}

function updateCounts() {
  const cats = ['all','access','licensing','carriers','applications','declined','escalation'];
  cats.forEach(cat => {
    const count = cat === 'all' ? articles.length : articles.filter(a => a.cat === cat).length;
    const el = document.getElementById('count-' + cat);
    if (el) el.textContent = count;
  });
}

function filteredArticles() {
  return articles.filter(a => {
    const matchCat = currentCat === 'all' || a.cat === currentCat;
    const matchTags = activeTags.length === 0 || activeTags.every(t => a.tags.includes(t));
    const matchSearch = !searchQuery || 
      a.title.toLowerCase().includes(searchQuery) ||
      a.summary.toLowerCase().includes(searchQuery) ||
      a.tags.some(t => t.toLowerCase().includes(searchQuery)) ||
      a.catLabel.toLowerCase().includes(searchQuery);
    return matchCat && matchTags && matchSearch;
  });
}

function highlight(text) {
  if (!searchQuery) return text;
  const re = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark>$1</mark>');
}

function renderCards() {
  const items = filteredArticles();
  const grid = document.getElementById('cards-grid');
  const empty = document.getElementById('empty-state');
  const countEl = document.getElementById('results-count');

  countEl.textContent = `${items.length} article${items.length !== 1 ? 's' : ''}`;

  if (items.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = items.map(a => {
    const escClass = a.escalation === 'L1' ? 'esc-l1' : a.escalation === 'L2' ? 'esc-l2' : 'esc-l2';
    const tags = a.tags.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('');
    return `
      <div class="card" style="--card-color:${a.catColor};--card-color-bg:${a.catBg}" onclick="openDetail(${a.id})">
        <div class="card-top">
          <div class="card-icon">${a.icon}</div>
          <div class="card-title">${highlight(a.title)}</div>
        </div>
        <div class="card-summary">${highlight(a.summary)}</div>
        <div class="card-footer">
          ${tags}
          <span class="escalation-badge ${escClass}" style="margin-left:auto">${a.escalation}</span>
        </div>
      </div>
    `;
  }).join('');
}

function filterCat(cat, btn) {
  currentCat = cat;
  showArticles();
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const titles = {all: 'All Articles', access: 'Access & Training', licensing: 'Licensing', carriers: 'Carriers & Products', applications: 'Applications', declined: 'Declined Applications', escalation: 'Escalation Matrix'};
  document.getElementById('results-title').textContent = titles[cat] || cat;
  renderCards();
}

function toggleTag(tag, btn) {
  if (activeTags.includes(tag)) {
    activeTags = activeTags.filter(t => t !== tag);
    btn.classList.remove('active');
  } else {
    activeTags.push(tag);
    btn.classList.add('active');
  }
  renderCards();
}

// =====================
// DETAIL PANEL
// =====================
function openDetail(id) {
  const a = articles.find(x => x.id === id);
  if (!a) return;
  document.getElementById('d-cat').textContent = a.catLabel;
  document.getElementById('d-title').textContent = a.title;
  document.getElementById('d-tags').innerHTML = a.tags.map(t => `<span class="tag">${t}</span>`).join('');
  document.getElementById('d-body').innerHTML = a.body;
  document.getElementById('detail-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetailBtn() {
  document.getElementById('detail-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeDetail(e) {
  if (e.target === document.getElementById('detail-overlay')) {
    closeDetailBtn();
  }
}

// =====================
// COPY
// =====================
function copyText(btn) {
  const box = btn.closest('.copy-box');
  const contentEl = box.querySelector('.copy-box-content');
  const text = contentEl ? contentEl.innerText.trim() : '';
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  });
}

// =====================
// KEY EVENTS
// =====================
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDetailBtn();
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('search').focus();
  }
});

init();
