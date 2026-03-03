document.addEventListener('DOMContentLoaded',async()=>{
  AOS.init({duration:700,easing:'ease-out-sine',once:true});
  const res=await fetch('products.json');
  const data=await res.json();
  const products=data.products;
  const carousel=document.getElementById('productCarousel');
  const grid=document.getElementById('productsGrid');
  const filterCat=document.getElementById('filterCat');
  const search=document.getElementById('search');
  const cartCount=document.getElementById('cartCount');
  let cart=0,wishlist=new Set();

  // populate carousel
  products.forEach(p=>{
    const imgSrc = Array.isArray(p.images) ? p.images[0] : p.img;
    const it=document.createElement('div');it.className='carousel-item';
    it.innerHTML=`<img src="${imgSrc}" alt="${p.title}"><h4>${p.title}</h4><div class="price">$${p.price}</div>`;
    carousel.appendChild(it);
  });
  // auto scroll carousel
  let cpos=0;setInterval(()=>{cpos=(cpos+1)%products.length;carousel.scrollTo({left:cpos*300,behavior:'smooth'})},3000);

  // build product grid
  function renderGrid(list){grid.innerHTML='';list.forEach(p=>{
    const imgSrc = Array.isArray(p.images) ? p.images[0] : p.img;
    const card=document.createElement('div');card.className='product-card';
    const badgeHtml = p.badge ? `<div class="product-badge">${p.badge}</div>` : '';
    const benefitHtml = p.benefit ? `<div class="product-benefit">${p.benefit}</div>` : '';
    card.innerHTML=`${badgeHtml}<div class="img-wrap"><img src="${imgSrc}" alt="${p.title}"></div>
    <div class="product-meta"><div><strong>${p.title}</strong><div class="rating">⭐ ${p.rating}</div></div><div class="price">$${p.price}</div></div>
    ${benefitHtml}
    <div class="actions"><button class="action-btn quick" data-id="${p.id}">Quick View</button><button class="action-btn add" data-id="${p.id}">Add</button></div>`;
    // tilt
    card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect();const dx=(e.clientX-r.left-r.width/2)/20;const dy=(e.clientY-r.top-r.height/2)/20;card.style.transform=`perspective(600px) rotateX(${ -dy }deg) rotateY(${ dx }deg)`});
    card.addEventListener('mouseleave',()=>{card.style.transform='translateY(0)'});
    grid.appendChild(card);
  })}
  renderGrid(products);

  // fill categories filter
  const cats=[...new Set(products.map(p=>p.category))];cats.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;filterCat.appendChild(o)});

  filterCat.addEventListener('change',()=>{const v=filterCat.value;if(v==='all')renderGrid(products);else renderGrid(products.filter(p=>p.category===v))});
  search.addEventListener('input',()=>{const q=search.value.toLowerCase();renderGrid(products.filter(p=>p.title.toLowerCase().includes(q))) });

  // quick view and add to cart
  document.body.addEventListener('click',e=>{
    if(e.target.matches('.add')){cart++;cartCount.textContent=cart;gsap.from('#cartCount',{scale:1.6,duration:.2,yoyo:true,repeat:1});}
    if(e.target.matches('.quick')){const id=+e.target.dataset.id;const p=products.find(x=>x.id===id);openQuick(p)}
  });

  // quick view modal
  const quick=document.getElementById('quickView'),quickInner=document.getElementById('quickInner'),closeQuick=document.getElementById('closeQuick');
  function openQuick(p){
    quick.setAttribute('aria-hidden','false');
    const imgs = Array.isArray(p.images) ? p.images : p.img ? [p.img] : [];
    let gallery = '';
    if(imgs.length>1){
      gallery = `<div class="quick-gallery" style="display:flex;gap:.5rem;margin-bottom:.5rem">
          ${imgs.map(src=>`<img class="thumb" src="${src}" style="width:50px;height:50px;object-fit:cover;cursor:pointer">`).join('')}
        </div>`;
    }
    const mainImg = imgs[0] || '';
    quickInner.innerHTML=`<div style="display:flex;gap:1rem"><div>
        <img id="quickMain" src="${mainImg}" style="width:200px;height:200px;object-fit:cover">
        ${gallery}
      </div><div><h3>${p.title}</h3><p>Price: $${p.price}</p><p>Rating: ${p.rating}</p>${p.benefit ? `<div style="background:rgba(20,184,166,0.1);padding:0.6rem;border-radius:8px;margin:0.6rem 0;color:#9aa6b2"><strong>✓ ${p.benefit}</strong></div>` : ''}<button id="qAdd" class="btn primary">Add to cart</button></div></div>`;
    // attach thumbnail click handlers
    quickInner.querySelectorAll('.thumb').forEach(img=>{
      img.addEventListener('click',e=>{
        document.getElementById('quickMain').src=e.target.src;
      });
    });
    document.getElementById('qAdd').addEventListener('click',()=>{cart++;cartCount.textContent=cart;quick.setAttribute('aria-hidden','true')})
  }
  closeQuick.addEventListener('click',()=>quick.setAttribute('aria-hidden','true'));

  // counters
  document.querySelectorAll('.count').forEach(el=>{const t=+el.dataset.target;let v=0;const inc=Math.ceil(t/90);const iv=setInterval(()=>{v+=inc; if(v>=t){el.textContent=t;clearInterval(iv);}else el.textContent=v},20)});

  // reviews carousel (simple)
  const reviews=[{name:'Rob',txt:'Great results!',img:'https://randomuser.me/api/portraits/men/32.jpg',r:5},{name:'Alex',txt:'Lightweight and effective',img:'https://randomuser.me/api/portraits/men/45.jpg',r:4.5}];
  const rc=document.getElementById('reviewsCarousel');reviews.forEach(r=>{const d=document.createElement('div');d.className='review';d.innerHTML=`<img src="${r.img}" style="width:44px;height:44px;border-radius:50%"><strong>${r.name}</strong><p>${r.txt}</p><div>⭐ ${r.r}</div>`;rc.appendChild(d)});

  // countdown
  function countdown(){let end=Date.now()+6*60*60*1000;setInterval(()=>{const diff=end-Date.now();if(diff<=0)return document.getElementById('countdown').textContent='00:00:00';const h=Math.floor(diff/3600000);const m=Math.floor(diff%3600000/60000);const s=Math.floor(diff%60000/1000);document.getElementById('countdown').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`},1000)}countdown();

  // newsletter
  document.getElementById('newsletterForm').addEventListener('submit',e=>{e.preventDefault();const btn=e.target.querySelector('button');btn.textContent='Subscribed ✓';setTimeout(()=>btn.textContent='Subscribe',2000)});

  // theme toggle
  document.getElementById('themeToggle').addEventListener('click',()=>{document.body.classList.toggle('light')});

  // simple page transitions using gsap
  gsap.from('main section',{opacity:0,y:20,duration:.6,stagger:.1});

  // AI skin type recommendation (UI only)
  setTimeout(()=>{if(confirm('Try a quick AI skin type recommendation (UI only)?'))alert('We recommend: Normal to Oily. Try: Hydrating Face Wash + Daily Moisturizer')},1500);
});
