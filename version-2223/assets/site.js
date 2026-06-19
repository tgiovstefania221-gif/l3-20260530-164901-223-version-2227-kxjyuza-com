
(function(){
  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => Array.from(root.querySelectorAll(s));

  function initNav(){
    const toggle = qs('[data-nav-toggle]');
    const nav = qs('[data-site-nav]');
    if(toggle && nav){
      toggle.addEventListener('click', () => nav.classList.toggle('open'));
    }
  }

  function initHeroCarousel(){
    const rail = qs('[data-hero-rail]');
    const prev = qs('[data-hero-prev]');
    const next = qs('[data-hero-next]');
    if(!rail) return;
    const cards = qsa('.marquee-card', rail);
    if(cards.length < 2) return;
    let index = 0;
    function go(step){
      index = (index + step + cards.length) % cards.length;
      const card = cards[index];
      rail.scrollTo({ left: card.offsetLeft - 12, behavior: 'smooth' });
    }
    prev && prev.addEventListener('click', () => go(-1));
    next && next.addEventListener('click', () => go(1));
    let timer = setInterval(() => go(1), 4200);
    rail.addEventListener('mouseenter', () => clearInterval(timer));
    rail.addEventListener('mouseleave', () => { timer = setInterval(() => go(1), 4200); });
  }

  function matchCard(card, term, yearFilter){
    const text = (card.dataset.keywords || '') + ' ' + (card.dataset.title || '');
    const termOk = !term || text.toLowerCase().includes(term.toLowerCase());
    let yearOk = true;
    const year = parseInt(card.dataset.year || '0', 10);
    if(yearFilter === '2020+') yearOk = year >= 2020;
    else if(yearFilter === '2010-2019') yearOk = year >= 2010 && year <= 2019;
    else if(yearFilter === '2000-2009') yearOk = year >= 2000 && year <= 2009;
    else if(yearFilter === '1990-1999') yearOk = year >= 1990 && year <= 1999;
    return termOk && yearOk;
  }

  function initFilters(){
    qsa('[data-filter-scope]').forEach(scope => {
      const input = qs('[data-filter-input]', scope.closest('section') || document);
      const yearFilter = qs('[data-year-filter]', scope.closest('section') || document);
      const cards = qsa('.movie-card', scope);
      if(!input && !yearFilter) return;
      function apply(){
        const term = input ? input.value.trim() : '';
        const yearVal = yearFilter ? yearFilter.value : 'all';
        let visible = 0;
        cards.forEach(card => {
          const ok = matchCard(card, term, yearVal);
          card.style.display = ok ? '' : 'none';
          if(ok) visible += 1;
        });
        const empty = qs('[data-empty-state]', scope.closest('section') || document);
        if(empty){ empty.style.display = visible ? 'none' : 'block'; }
      }
      input && input.addEventListener('input', apply);
      yearFilter && yearFilter.addEventListener('change', apply);
      apply();
    });
  }

  function initPlayer(){
    const video = qs('[data-player]');
    const playBtn = qs('[data-play-btn]');
    if(!video) return;
    if(playBtn){
      playBtn.addEventListener('click', () => {
        video.play().catch(() => {});
      });
    }
    video.addEventListener('error', () => {
      const note = qs('[data-player-note]');
      if(note){ note.textContent = '播放器正在尝试切换到备用源，请稍后重试。'; }
    });
  }

  function activeNav(){
    const current = location.pathname.split('/').pop() || 'index.html';
    qsa('.site-nav a').forEach(a => {
      const href = a.getAttribute('href').split('/').pop();
      if(href === current) a.classList.add('active');
    });
  }

  function initSearchPage(){
    const root = qs('[data-search-page]');
    if(!root || !window.MOVIE_LIBRARY) return;
    const input = qs('[data-search-input]', root);
    const cat = qs('[data-search-category]', root);
    const sort = qs('[data-search-sort]', root);
    const results = qs('[data-search-results]', root);
    const count = qs('[data-search-count]', root);
    const params = new URLSearchParams(location.search);
    const initial = (params.get('q') || '').trim();
    if(input && initial) input.value = initial;

    function score(movie, term){
      const base = (movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genres.join(' ') + ' ' + movie.tags.join(' ') + ' ' + movie.one_line).toLowerCase();
      if(!term) return 1;
      if(base.includes(term.toLowerCase())) return 1 + movie.score / 1e9;
      return 0;
    }

    function render(){
      const term = (input && input.value || '').trim();
      const category = cat ? cat.value : 'all';
      const sortVal = sort ? sort.value : 'relevance';
      let list = window.MOVIE_LIBRARY.filter(m => category === 'all' || m.category === category);
      list = list.map(m => ({ m, s: score(m, term) })).filter(x => term ? x.s > 0 : true);
      if(sortVal === 'year_desc') list.sort((a,b)=> b.m.year - a.m.year || a.m.title.localeCompare(b.m.title, 'zh-Hans-CN'));
      else if(sortVal === 'year_asc') list.sort((a,b)=> a.m.year - b.m.year || a.m.title.localeCompare(b.m.title, 'zh-Hans-CN'));
      else list.sort((a,b)=> b.s - a.s || b.m.score - a.m.score);
      const view = list.map(({m}) => `
        <article class="movie-card">
          <a class="movie-card-link" href="movie/${m.id}.html">
            <img class="movie-poster" src="posters/${m.id}.svg" alt="${m.title} 海报" loading="lazy" />
            <div class="movie-card-body">
              <div class="movie-meta-row">
                <span class="badge">${m.year}</span>
                <span class="badge ghost">${m.region}</span>
              </div>
              <h3>${m.title}</h3>
              <p>${m.one_line || m.summary}</p>
              <div class="card-subline">${m.category} · ${m.type}</div>
            </div>
          </a>
        </article>
      `).join('');
      results.innerHTML = view || '<div class="empty-state">没有匹配的影片，试试换一个关键词。</div>';
      if(count) count.textContent = `${list.length} 部影片`;
    }
    input && input.addEventListener('input', render);
    cat && cat.addEventListener('change', render);
    sort && sort.addEventListener('change', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHeroCarousel();
    initFilters();
    initPlayer();
    initSearchPage();
    activeNav();
  });
})();
