/* ==========================================================
   Exército de Deus — Theme JS
   ========================================================== */

(function () {
  'use strict';

  // ---------- Mobile menu ----------
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-mobile-toggle]');
    if (toggle) {
      var nav = document.querySelector('[data-site-nav]');
      if (nav) nav.classList.toggle('is-open');
    }
  });

  // ---------- Hero / CTA slider (carrossel rotativo reutilizável) ----------
  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var track = slider.querySelector('[data-slider-track]');
    var slides = slider.querySelectorAll('[data-slide]');
    var dots = slider.querySelectorAll('[data-slider-dot]');
    var prevBtn = slider.querySelector('[data-slider-prev]');
    var nextBtn = slider.querySelector('[data-slider-next]');
    if (!track || slides.length === 0) return;

    var current = 0;
    var autoplayMs = (parseInt(slider.dataset.autoplay, 10) || 6) * 1000;
    var timer = null;
    var hovering = false;

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      slides.forEach(function (s, i) {
        if (i === current) {
          s.removeAttribute('aria-hidden');
        } else {
          s.setAttribute('aria-hidden', 'true');
        }
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === current);
        d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function start() {
      if (slides.length < 2 || autoplayMs <= 0) return;
      stop();
      timer = setInterval(function () { if (!hovering) next(); }, autoplayMs);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); start(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); start(); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        goTo(parseInt(d.dataset.sliderDot, 10) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', function () { hovering = true; });
    slider.addEventListener('mouseleave', function () { hovering = false; });

    // Swipe touch
    var startX = 0, deltaX = 0, dragging = false;
    track.addEventListener('touchstart', function (e) {
      dragging = true;
      startX = e.touches[0].clientX;
      deltaX = 0;
    }, { passive: true });
    track.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      deltaX = e.touches[0].clientX - startX;
    }, { passive: true });
    track.addEventListener('touchend', function () {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(deltaX) > 50) {
        if (deltaX < 0) next(); else prev();
        start();
      }
    });

    goTo(0);
    start();
  });

  // ---------- YouTube Shorts: clica na thumb e troca por iframe ----------
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-shorts-video]');
    if (!trigger || trigger.dataset.loaded === '1') return;
    var id = trigger.dataset.videoId;
    if (!id) return;
    trigger.dataset.loaded = '1';
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&playsinline=1';
    iframe.title = 'YouTube Shorts';
    iframe.loading = 'lazy';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', '');
    iframe.frameBorder = '0';
    trigger.innerHTML = '';
    trigger.appendChild(iframe);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var trigger = e.target.closest && e.target.closest('[data-shorts-video]');
    if (!trigger) return;
    e.preventDefault();
    trigger.click();
  });

  // ---------- Product page: thumb selection ----------
  var productSection = document.querySelector('[data-product-section]');
  if (productSection) {
    var mainImage = productSection.querySelector('[data-main-image]');
    productSection.querySelectorAll('[data-thumb]').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        productSection.querySelectorAll('[data-thumb]').forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
        var full = thumb.dataset.full;
        if (mainImage && full) mainImage.src = full;
      });
    });
  }

  /* ==========================================================
     Cart drawer + AJAX cart
     ========================================================== */

  function moneyBR(cents) {
    return 'R$ ' + (cents / 100).toFixed(2).replace('.', ',');
  }

  function openCart() {
    document.body.classList.add('cart-open');
    document.querySelector('[data-cart-drawer]').setAttribute('aria-hidden', 'false');
    var overlay = document.querySelector('[data-cart-overlay]');
    if (overlay) overlay.removeAttribute('hidden');
    fetchAndRenderCart();
  }

  function closeCart() {
    document.body.classList.remove('cart-open');
    var drawer = document.querySelector('[data-cart-drawer]');
    if (drawer) drawer.setAttribute('aria-hidden', 'true');
  }

  function updateCartCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
    });
  }

  function renderCart(cart) {
    var itemsEl = document.querySelector('[data-cart-items]');
    var footerEl = document.querySelector('[data-cart-footer]');
    var shippingEl = document.querySelector('[data-cart-shipping]');
    if (!itemsEl) return;

    updateCartCount(cart.item_count);

    if (cart.item_count === 0) {
      itemsEl.innerHTML = '<p class="cart-drawer__empty">Seu carrinho está vazio.</p>';
      if (footerEl) footerEl.setAttribute('hidden', '');
      if (shippingEl) shippingEl.setAttribute('hidden', '');
      return;
    }

    if (footerEl) footerEl.removeAttribute('hidden');
    if (shippingEl) shippingEl.removeAttribute('hidden');

    itemsEl.innerHTML = cart.items.map(function (item, i) {
      var imgUrl = item.image ? item.image.replace(/(\.[a-z]+)\?/, '_120x$1?') : '';
      var img = imgUrl ? '<img src="' + imgUrl + '" alt="' + escapeHtml(item.product_title) + '" class="cart-item__image">' : '<div class="cart-item__image"></div>';
      return ''
        + '<div class="cart-item" data-line-key="' + item.key + '" data-line-index="' + (i + 1) + '">'
        + img
        + '  <div class="cart-item__info">'
        + '    <h4 class="cart-item__title">' + escapeHtml(item.product_title) + '</h4>'
        + '    <div class="cart-item__price">' + moneyBR(item.final_price) + '</div>'
        + '    <div class="cart-item__qty">'
        + '      <button type="button" data-line-decrease aria-label="Diminuir">−</button>'
        + '      <input type="number" value="' + item.quantity + '" min="0" data-line-qty>'
        + '      <button type="button" data-line-increase aria-label="Aumentar">+</button>'
        + '    </div>'
        + '  </div>'
        + '  <button type="button" class="cart-item__remove" data-line-remove aria-label="Remover">'
        + '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>'
        + '  </button>'
        + '</div>';
    }).join('');

    var subtotalEl = document.querySelector('[data-cart-subtotal]');
    var totalEl = document.querySelector('[data-cart-total]');
    if (subtotalEl) subtotalEl.textContent = moneyBR(cart.total_price);
    if (totalEl) totalEl.textContent = moneyBR(cart.total_price);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (s) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s];
    });
  }

  function fetchAndRenderCart() {
    return fetch('/cart.js', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(renderCart)
      .catch(function (err) { console.error('Erro ao carregar carrinho:', err); });
  }

  function changeLine(lineKey, quantity) {
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: lineKey, quantity: quantity })
    })
      .then(function (r) { return r.json(); })
      .then(renderCart);
  }

  function clearCart() {
    return fetch('/cart/clear.js', { method: 'POST', headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(renderCart);
  }

  function addItemFromForm(form) {
    var data = new FormData(form);
    return fetch('/cart/add.js', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
    }).then(function (r) {
      if (!r.ok) throw new Error('add failed');
      return r.json();
    });
  }

  // Click handlers (delegação de eventos)
  document.addEventListener('click', function (e) {
    // Abrir carrinho
    if (e.target.closest('[data-cart-open]')) {
      e.preventDefault();
      openCart();
      return;
    }

    // Fechar carrinho
    if (e.target.closest('[data-cart-close]') || e.target.closest('[data-cart-overlay]')) {
      e.preventDefault();
      closeCart();
      return;
    }

    // Limpar carrinho
    if (e.target.closest('[data-cart-clear]')) {
      e.preventDefault();
      clearCart();
      return;
    }

    // +/- e remover dentro do drawer
    var lineEl = e.target.closest('[data-line-key]');
    if (!lineEl) return;
    var key = lineEl.dataset.lineKey;
    var qtyInput = lineEl.querySelector('[data-line-qty]');
    var current = parseInt(qtyInput && qtyInput.value, 10) || 0;

    if (e.target.closest('[data-line-decrease]')) {
      e.preventDefault();
      changeLine(key, Math.max(0, current - 1));
    }
    if (e.target.closest('[data-line-increase]')) {
      e.preventDefault();
      changeLine(key, current + 1);
    }
    if (e.target.closest('[data-line-remove]')) {
      e.preventDefault();
      changeLine(key, 0);
    }
  });

  // Input direto na quantidade
  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-line-qty]')) {
      var lineEl = e.target.closest('[data-line-key]');
      if (!lineEl) return;
      var q = parseInt(e.target.value, 10);
      if (isNaN(q) || q < 0) q = 0;
      changeLine(lineEl.dataset.lineKey, q);
    }
  });

  // Interceptar formulários "Adicionar ao carrinho" do product-card e da página de produto
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches('form[action*="/cart/add"]')) return;
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var label = btn ? btn.textContent : '';
    if (btn) btn.textContent = 'Adicionando...';
    addItemFromForm(form)
      .then(function () { return fetchAndRenderCart(); })
      .then(function () { openCart(); })
      .catch(function (err) { console.error('Erro ao adicionar:', err); alert('Não foi possível adicionar ao carrinho.'); })
      .finally(function () { if (btn) btn.textContent = label || 'Comprar'; });
  });

  // ESC fecha o drawer
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('cart-open')) closeCart();
  });

  // CEP: máscara simples + chamada fake (visual apenas, sem API real)
  var cepInput = document.querySelector('[data-cep-input]');
  if (cepInput) {
    cepInput.addEventListener('input', function () {
      var v = cepInput.value.replace(/\D/g, '').slice(0, 8);
      cepInput.value = v.length > 5 ? v.slice(0, 5) + '-' + v.slice(5) : v;
    });
  }

  // Carrinho começa em sincronia com a tela
  if (document.querySelector('[data-cart-items]')) {
    fetchAndRenderCart();
  }
})();
