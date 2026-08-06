
const products = window.TERFED_PRODUCTS;
const config = window.TERFED_CONFIG;
const categories = window.TERFED_CATEGORIES;
const formatPrice = value => new Intl.NumberFormat('uk-UA').format(value) + ' грн';
const byId = id => document.getElementById(id);

const categoryOrder = ['all','harrows','discators','cultivators','zubr','adapter','carts'];
let activeFilter = 'all';
let compareIds = [];

const productGrid = byId('productGrid');
const searchInput = byId('catalogSearch');
const sortSelect = byId('sortSelect');
const emptyState = byId('emptyState');
const filterButtons = byId('filterButtons');

function parseWidth(width){
  const nums = (width || '').match(/\d+(?:[,.]\d+)?/g)?.map(v => Number(v.replace(',','.'))) || [];
  return nums.length ? Math.max(...nums) : 0;
}

function productCard(product){
  return `<article class="product-card">
    <div class="product-image"><span class="product-tag">${product.badge}</span><img src="${product.image}" alt="${product.title}" loading="lazy"></div>
    <div class="product-body">
      <span class="product-category">${product.categoryLabel}</span>
      <h3 class="product-title">${product.title}</h3>
      <p class="product-description">${product.description}</p>
      <div class="spec-row">
        <div class="spec"><strong>${product.specs.width}</strong><span>захват</span></div>
        <div class="spec"><strong>${product.specs.power}</strong><span>трактор</span></div>
        <div class="spec"><strong>${product.specs.disc}</strong><span>додатково</span></div>
      </div>
      <div class="product-bottom">
        <div><span class="price-label">Ціна від</span><strong class="price-value">${formatPrice(product.priceFrom)}</strong></div>
        <div class="product-actions"><button class="compare-toggle ${compareIds.includes(product.id)?'active':''}" type="button" data-compare="${product.id}" aria-label="${compareIds.includes(product.id)?'Видалити з порівняння':'Додати до порівняння'}">⇄</button><a class="button button-dark button-small" href="products/${product.slug}.html">Детальніше</a></div>
      </div>
    </div>
  </article>`;
}

function renderFilters(){
  filterButtons.innerHTML = categoryOrder.map(key => `<button class="filter-button ${activeFilter===key?'active':''}" type="button" data-filter="${key}">${categories[key]}</button>`).join('');
  filterButtons.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => {activeFilter=btn.dataset.filter; renderFilters(); renderProducts();}));
}

function renderProducts(){
  const q = searchInput.value.trim().toLocaleLowerCase('uk');
  let list = products.filter(p => {
    const matchesCategory = activeFilter === 'all' || p.category === activeFilter;
    const haystack = [p.title,p.name,p.description,p.categoryLabel,...p.variants.flat()].join(' ').toLocaleLowerCase('uk');
    return matchesCategory && haystack.includes(q);
  });
  const sort = sortSelect.value;
  if(sort==='price-asc') list.sort((a,b)=>a.priceFrom-b.priceFrom);
  if(sort==='price-desc') list.sort((a,b)=>b.priceFrom-a.priceFrom);
  if(sort==='width-desc') list.sort((a,b)=>parseWidth(b.specs.width)-parseWidth(a.specs.width));
  productGrid.innerHTML = list.map(productCard).join('');
  emptyState.hidden = list.length > 0;
  byId('catalogCount').textContent = `Показано товарних лінійок: ${list.length} з ${products.length}`;
  productGrid.querySelectorAll('[data-compare]').forEach(btn=>btn.addEventListener('click',()=>toggleCompare(btn.dataset.compare)));
}

function toggleCompare(id){
  if(compareIds.includes(id)) compareIds=compareIds.filter(x=>x!==id);
  else { if(compareIds.length>=3){ alert('Можна порівнювати до 3 товарних лінійок одночасно.'); return; } compareIds.push(id); }
  renderProducts(); renderCompareBar();
}
function renderCompareBar(){
  const bar=byId('compareBar'), list=byId('compareList');
  list.innerHTML=compareIds.map(id=>{const p=products.find(x=>x.id===id);return `<div class="compare-chip">${p.title}<button type="button" data-remove-compare="${id}">×</button></div>`}).join('');
  bar.classList.toggle('visible',compareIds.length>0);
  list.querySelectorAll('[data-remove-compare]').forEach(btn=>btn.addEventListener('click',()=>toggleCompare(btn.dataset.removeCompare)));
}
function openCompare(){
  if(compareIds.length<2){alert('Додайте щонайменше дві моделі для порівняння.');return;}
  const chosen=compareIds.map(id=>products.find(p=>p.id===id));
  byId('compareContent').innerHTML=`<table class="compare-table"><thead><tr><th>Параметр</th>${chosen.map(p=>`<th>${p.title}</th>`).join('')}</tr></thead><tbody>
  <tr><th>Категорія</th>${chosen.map(p=>`<td>${p.categoryLabel}</td>`).join('')}</tr>
  <tr><th>Ширина</th>${chosen.map(p=>`<td>${p.specs.width}</td>`).join('')}</tr>
  <tr><th>Потужність</th>${chosen.map(p=>`<td>${p.specs.power}</td>`).join('')}</tr>
  <tr><th>Додатково</th>${chosen.map(p=>`<td>${p.specs.disc}</td>`).join('')}</tr>
  <tr><th>Ціна від</th>${chosen.map(p=>`<td>${formatPrice(p.priceFrom)}</td>`).join('')}</tr>
  <tr><th>Особливості</th>${chosen.map(p=>`<td>${p.features.slice(0,3).map(x=>'• '+x).join('<br>')}</td>`).join('')}</tr>
  </tbody></table>`;
  byId('compareModal').showModal(); document.body.classList.add('modal-open');
}

byId('openCompare').addEventListener('click',openCompare);
byId('clearCompare').addEventListener('click',()=>{compareIds=[];renderProducts();renderCompareBar();});
searchInput.addEventListener('input',renderProducts); sortSelect.addEventListener('change',renderProducts);

const productSelect=byId('productSelect');
for(const p of products){const opt=document.createElement('option');opt.value=p.title;opt.textContent=p.title;productSelect.append(opt)}


const selectorResult=byId('selectorResult');
byId('runSelector').addEventListener('click',()=>{
  const power=Number(byId('tractorPower').value); const cat=byId('selectorType').value;
  if(!power){selectorResult.classList.add('visible');selectorResult.innerHTML='Оберіть потужність вашого трактора — і ми покажемо відповідні лінійки.';return;}
  const matches=products.filter(p=>(cat==='all'||p.category===cat) && p.powerMin!==null && p.powerMin<=power && p.powerMax>=power);
  if(!matches.length){selectorResult.classList.add('visible');selectorResult.innerHTML='Для обраних параметрів точних збігів у каталозі немає. Залиште заявку — менеджер допоможе підібрати конфігурацію.';return;}
  selectorResult.classList.add('visible'); selectorResult.innerHTML=`<strong>Підібрано ${matches.length} лінійок:</strong><br>${matches.slice(0,5).map(p=>`<a href="products/${p.slug}.html" style="color:var(--green-2);font-weight:900">${p.title}</a>`).join('<br>')}`;
});

const menuToggle=byId('menuToggle'), mainNav=byId('mainNav');
menuToggle.addEventListener('click',()=>{const open=!mainNav.classList.contains('open');mainNav.classList.toggle('open',open);menuToggle.setAttribute('aria-expanded',String(open));});
mainNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mainNav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false')}));

function loadVideo(){
  const frame=byId('homeVideoFrame');
  const videoId=(config.VIDEO_ID||'').trim();
  if(!frame) return;
  if(!videoId){
    frame.innerHTML=`<div class="video-empty"><div><strong>Відео TERFED</strong><span>Перегляньте всі актуальні відео на офіційному YouTube-каналі компанії.</span><a class="button button-light" href="${config.YOUTUBE_CHANNEL}" target="_blank" rel="noopener noreferrer">Відкрити YouTube-канал</a></div></div>`;
    return;
  }
  const watchUrl=`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const thumbnailUrl=`https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
  if(window.location.protocol==='file:'){
    frame.innerHTML=`<div class="video-file-fallback"><img src="${thumbnailUrl}" alt="Відео TERFED — техніка в роботі" loading="eager"><div class="video-file-overlay"><div><span class="video-play-badge" aria-hidden="true">▶</span><strong>Відео TERFED</strong><span>Локальний перегляд відкривається через зовнішній YouTube-плеєр. Після публікації сайту онлайн відео працюватиме безпосередньо на сторінці.</span><a class="button button-primary" href="${watchUrl}" target="_blank" rel="noopener noreferrer">▶ Дивитися на YouTube</a></div></div></div>`;
    return;
  }
  const origin=window.location.origin && window.location.origin!=='null' ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
  const embedUrl=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1&playsinline=1${origin}`;
  frame.innerHTML=`<iframe src="${embedUrl}" title="Відео TERFED — техніка в роботі" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
}
loadVideo();

byId('floatingQuote').addEventListener('click',()=>byId('request').scrollIntoView({behavior:'smooth'}));

document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>{const d=byId(btn.dataset.close);d.close();document.body.classList.remove('modal-open')}));
document.querySelectorAll('dialog.modal').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){d.close();document.body.classList.remove('modal-open')}}));

byId('currentYear').textContent=new Date().getFullYear();
const header=document.querySelector('.site-header'); window.addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>10),{passive:true});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.1});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

renderFilters();renderProducts();renderCompareBar();
