
const products = window.TERFED_PRODUCTS;
const config = window.TERFED_CONFIG;
const currentId = document.body.dataset.productId;
const product = products.find(p => p.id === currentId);
const formatPrice = value => new Intl.NumberFormat('uk-UA').format(value) + ' грн';

if (!product) {
  document.body.innerHTML = '<main style="padding:60px;font-family:system-ui"><h1>Техніку не знайдено</h1><p>Поверніться до <a href="../index.html#catalog">каталогу TERFED</a>.</p></main>';
} else {
  document.title = `${product.title} — TERFED`;
  const desc = document.querySelector('meta[name="description"]'); if(desc) desc.content = `${product.title}. ${product.description} Характеристики, ціни з буклета TERFED 2026 року та консультація.`;
  document.getElementById('detailCategory').textContent = product.categoryLabel;
  document.getElementById('detailCategory2').textContent = product.categoryLabel;
  document.getElementById('detailTitle').textContent = product.title;
  document.getElementById('detailLead').textContent = product.description;
  document.getElementById('detailImage').src = `../${product.image}`;
  document.getElementById('detailImage').alt = product.title;
  document.getElementById('detailBadge').textContent = product.badge;
  document.getElementById('detailPrice').textContent = formatPrice(product.priceFrom);
  document.getElementById('detailWidth').textContent = product.specs.width;
  document.getElementById('detailPower').textContent = product.specs.power;
  document.getElementById('detailExtra').textContent = product.specs.disc;
  document.getElementById('detailFeatures').innerHTML = product.features.map(f=>`<li>${f}</li>`).join('');
  document.getElementById('variantsBody').innerHTML = product.variants.map(([name,price])=>`<tr><td>${name}</td><td>${price}</td></tr>`).join('');

  const similar = products.filter(p=>p.id!==product.id && p.category===product.category).sort((a,b)=>Math.abs(a.priceFrom-product.priceFrom)-Math.abs(b.priceFrom-product.priceFrom)).slice(0,3);
  document.getElementById('similarGrid').innerHTML = (similar.length ? similar : products.filter(p=>p.id!==product.id).slice(0,3)).map(p=>`<article class="similar-card"><img src="../${p.image}" alt="${p.title}" loading="eager"><div class="similar-card-body"><span class="product-category">${p.categoryLabel}</span><h3>${p.title}</h3><p>${p.description}</p><span class="mini-price">Від ${formatPrice(p.priceFrom)}</span><a class="button button-dark button-small" href="${p.slug}.html">Переглянути</a></div></article>`).join('');

  const video = document.getElementById('detailVideo');
  const videoId=(config.VIDEO_ID||'').trim();
  if(videoId){
    const watchUrl=`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    const thumbnailUrl=`https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
    if(window.location.protocol==='file:'){
      video.innerHTML=`<div class="video-file-fallback"><img src="${thumbnailUrl}" alt="Відео TERFED" loading="eager"><div class="video-file-overlay"><div><span class="video-play-badge" aria-hidden="true">▶</span><strong>Відео TERFED</strong><span>Локальний перегляд відкривається через YouTube. Після публікації сайту онлайн відео працюватиме безпосередньо на сторінці.</span><a class="button button-primary" href="${watchUrl}" target="_blank" rel="noopener noreferrer">▶ Дивитися відео</a><small>Для локальної перевірки використовуйте Live Server; на опублікованому сайті відео відкривається вбудовано.</small></div></div></div>`;
    } else {
      const origin=window.location.origin && window.location.origin!=='null' ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
      const embedUrl=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1&playsinline=1${origin}`;
      video.innerHTML=`<iframe src="${embedUrl}" title="Відео TERFED — техніка в роботі" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    }
  } else {video.innerHTML=`<div class="detail-video-empty"><div><h3>Відео цієї техніки</h3><p>Місце під відео вже підготовлене. Додайте ID потрібного ролика з YouTube у config.js, щоб відео відобразилося на цій сторінці.</p><a class="button button-primary" href="${config.YOUTUBE_CHANNEL}" target="_blank" rel="noopener noreferrer">Дивитися TERFED на YouTube</a></div></div>`;}

  const menuToggle=document.getElementById('menuToggle'), mainNav=document.getElementById('mainNav');menuToggle.addEventListener('click',()=>{const open=!mainNav.classList.contains('open');mainNav.classList.toggle('open',open);menuToggle.setAttribute('aria-expanded',String(open));});mainNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mainNav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false')}));
  document.getElementById('currentYear').textContent=new Date().getFullYear();
  const selector=document.getElementById('productSelect');
  products.filter(p=>p.id!==product.id).forEach(p=>{const o=document.createElement('option');o.value=p.title;o.textContent=p.title;selector.append(o)});
  selector.value = product.title;
  const sourcePage=document.getElementById('sourcePage'); if(sourcePage) sourcePage.value = `Сторінка техніки: ${product.title}`;
}
