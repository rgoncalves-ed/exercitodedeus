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
     Wishlist (localStorage) — funciona logado ou não
     ========================================================== */

  var WL_KEY = 'exdeus_wishlist_v1';

  function wlRead() {
    try {
      var raw = localStorage.getItem(WL_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function wlWrite(arr) {
    try { localStorage.setItem(WL_KEY, JSON.stringify(arr)); } catch (e) {}
    wlRefreshUI();
    document.dispatchEvent(new CustomEvent('wishlist:change', { detail: arr }));
  }
  function wlHas(handle) { return wlRead().indexOf(handle) !== -1; }
  function wlToggle(handle) {
    var arr = wlRead();
    var i = arr.indexOf(handle);
    if (i === -1) arr.push(handle); else arr.splice(i, 1);
    wlWrite(arr);
    return i === -1;
  }
  function wlRemove(handle) {
    var arr = wlRead().filter(function (h) { return h !== handle; });
    wlWrite(arr);
  }

  function wlRefreshUI() {
    var arr = wlRead();
    var count = arr.length;
    // Count badges (header + account sidebar)
    document.querySelectorAll('[data-wishlist-count]').forEach(function (el) {
      el.textContent = count;
      if (count > 0) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
    });
    // Heart states on product cards
    document.querySelectorAll('[data-wishlist-toggle]').forEach(function (btn) {
      var has = arr.indexOf(btn.dataset.wishlistToggle) !== -1;
      btn.setAttribute('aria-pressed', has ? 'true' : 'false');
      btn.classList.toggle('is-active', has);
      btn.setAttribute('aria-label', has ? 'Remover da lista de desejo' : 'Adicionar à lista de desejo');
    });
  }

  // Click delegation: toggle wishlist
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-wishlist-toggle]');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      wlToggle(btn.dataset.wishlistToggle);
      return;
    }
    var rm = e.target.closest('[data-wishlist-remove]');
    if (rm) {
      e.preventDefault();
      wlRemove(rm.dataset.wishlistRemove);
    }
  });

  // Initial UI sync
  wlRefreshUI();
  window.exdeusWishlist = { read: wlRead, toggle: wlToggle, remove: wlRemove, has: wlHas };

  /* ==========================================================
     Wishlist page renderer (em /pages/lista-de-desejo)
     ========================================================== */

  function renderWishlistPage() {
    var container = document.querySelector('[data-wishlist-list]');
    var empty = document.querySelector('[data-wishlist-empty]');
    if (!container) return;

    var handles = wlRead();

    if (handles.length === 0) {
      container.innerHTML = '';
      if (empty) empty.removeAttribute('hidden');
      return;
    }
    if (empty) empty.setAttribute('hidden', '');

    container.innerHTML = '<p class="muted">Carregando produtos…</p>';

    Promise.all(handles.map(function (h) {
      return fetch('/products/' + encodeURIComponent(h) + '.js')
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    })).then(function (products) {
      var valid = products.filter(Boolean);
      if (valid.length === 0) {
        container.innerHTML = '';
        if (empty) empty.removeAttribute('hidden');
        return;
      }
      container.innerHTML = valid.map(function (p) {
        var img = p.featured_image
          ? '<img src="' + p.featured_image + '&width=400" alt="' + escapeHtml(p.title) + '" loading="lazy">'
          : '';
        var compare = (p.compare_at_price && p.compare_at_price > p.price)
          ? '<span class="price__compare">' + moneyBR(p.compare_at_price) + '</span>' : '';
        var url = '/products/' + p.handle;
        return ''
          + '<div class="product-card" data-product-handle="' + p.handle + '">'
          + '  <a href="' + url + '" class="product-card__media product-card__media--portrait">' + img + '</a>'
          + '  <button type="button" class="product-card__wishlist is-active" data-wishlist-toggle="' + p.handle + '" aria-pressed="true" aria-label="Remover da lista de desejo">'
          + '    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
          + '  </button>'
          + '  <div class="product-card__body">'
          + '    <a href="' + url + '" class="product-card__title-link"><h3 class="product-card__title">' + escapeHtml(p.title) + '</h3></a>'
          + '    <div class="product-card__price">' + compare + '<span class="price__final">' + moneyBR(p.price) + '</span></div>'
          + '    <div class="product-card__buttons">'
          + '      <form action="/cart/add" method="post" enctype="multipart/form-data">'
          + '        <input type="hidden" name="id" value="' + p.variants[0].id + '">'
          + '        <button type="submit" class="product-card__buy">Comprar</button>'
          + '      </form>'
          + '      <a href="' + url + '" class="product-card__details">Ver detalhes</a>'
          + '    </div>'
          + '  </div>'
          + '</div>';
      }).join('');
    });
  }

  // Re-render quando muda
  document.addEventListener('wishlist:change', renderWishlistPage);

  // Mini-preview no /account
  function renderWishlistPreview() {
    var container = document.querySelector('[data-wishlist-preview]');
    if (!container) return;
    var handles = wlRead().slice(0, 4);
    if (handles.length === 0) {
      container.innerHTML = '<p class="muted">Você ainda não salvou nenhum produto na lista de desejo.</p>';
      return;
    }
    Promise.all(handles.map(function (h) {
      return fetch('/products/' + encodeURIComponent(h) + '.js').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    })).then(function (products) {
      var valid = products.filter(Boolean);
      container.innerHTML = valid.map(function (p) {
        var img = p.featured_image ? '<img src="' + p.featured_image + '&width=200" alt="' + escapeHtml(p.title) + '" loading="lazy">' : '';
        return ''
          + '<a href="/products/' + p.handle + '" class="wishlist-preview__item">'
          + '  <span class="wishlist-preview__thumb">' + img + '</span>'
          + '  <span class="wishlist-preview__title">' + escapeHtml(p.title) + '</span>'
          + '  <span class="wishlist-preview__price">' + moneyBR(p.price) + '</span>'
          + '</a>';
      }).join('');
    });
  }

  // Dispara render no load (página de wishlist e prévia no account)
  renderWishlistPage();
  renderWishlistPreview();
  document.addEventListener('wishlist:change', renderWishlistPreview);

  /* ==========================================================
     Endereços (mostrar/ocultar formulário inline)
     ========================================================== */

  document.addEventListener('click', function (e) {
    var newBtn = e.target.closest('[data-address-new]');
    if (newBtn) {
      e.preventDefault();
      var f = document.querySelector('[data-address-form="new"]');
      if (f) { f.hidden = false; f.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      return;
    }
    var edit = e.target.closest('[data-address-edit]');
    if (edit) {
      e.preventDefault();
      var ef = document.querySelector('[data-address-form="' + edit.dataset.addressEdit + '"]');
      if (ef) { ef.hidden = false; ef.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      return;
    }
    var cancel = e.target.closest('[data-address-cancel]');
    if (cancel) {
      e.preventDefault();
      var cf = document.querySelector('[data-address-form="' + cancel.dataset.addressCancel + '"]');
      if (cf) cf.hidden = true;
      return;
    }
    var confirmBtn = e.target.closest('[data-confirm-message]');
    if (confirmBtn) {
      if (!confirm(confirmBtn.dataset.confirmMessage)) { e.preventDefault(); }
    }
  });

  /* ==========================================================
     Login: alternar entre login e recuperar senha
     ========================================================== */

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-recover-toggle]');
    if (!t) return;
    e.preventDefault();
    var container = document.querySelector('[data-recover-state]');
    if (!container) return;
    var login = container.querySelector('[data-form="login"]');
    var recover = container.querySelector('[data-form="recover"]');
    var loginHidden = login.hasAttribute('hidden');
    login.toggleAttribute('hidden', !loginHidden);
    recover.toggleAttribute('hidden', loginHidden);
  });

  // Se a URL contém #recover, abre direto a aba de recuperar
  if (location.hash === '#recover') {
    var c = document.querySelector('[data-recover-state]');
    if (c) {
      c.querySelector('[data-form="login"]').setAttribute('hidden', '');
      c.querySelector('[data-form="recover"]').removeAttribute('hidden');
    }
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

    updateFreeShippingBar(cart.total_price);
  }

  // Atualiza a barra de "Frete grátis acima de R$ X" reagindo ao cart
  function updateFreeShippingBar(totalCents) {
    document.querySelectorAll('[data-free-shipping-bar]').forEach(function (bar) {
      var threshold = parseInt(bar.dataset.thresholdCents, 10);
      if (!threshold || threshold <= 0) return;
      var missing = Math.max(0, threshold - totalCents);
      var percent = Math.min(100, Math.round((totalCents / threshold) * 100));
      var fill = bar.querySelector('[data-free-shipping-fill]');
      var text = bar.querySelector('[data-free-shipping-text]');
      if (fill) fill.style.width = percent + '%';
      if (missing <= 0) {
        bar.classList.add('is-achieved');
        if (text) text.innerHTML = '🎉 <strong>Você ganhou frete grátis!</strong>';
      } else {
        bar.classList.remove('is-achieved');
        if (text) text.innerHTML = 'Faltam <strong>' + moneyBR(missing) + '</strong> pra você ganhar <strong>frete grátis</strong>';
      }
    });
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

  /* ==========================================================
     Calculadora de frete (Frenet / qualquer provider Shopify)
     ========================================================== */

  // Busca o endereço pelo CEP via ViaCEP (gratuito, sem chave)
  function lookupCEP(cleanZip) {
    return fetch('https://viacep.com.br/ws/' + cleanZip + '/json/')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || data.erro) return null;
        return { city: data.localidade, province: data.uf };
      })
      .catch(function () { return null; });
  }

  // Polling em /cart/async_shipping_rates.json até retornar rates
  function pollShippingRates(qs) {
    var attempts = 0;
    var maxAttempts = 30;
    function poll() {
      attempts++;
      return fetch('/cart/async_shipping_rates.json?' + qs, {
        headers: { 'Accept': 'application/json' }
      })
        .then(function (r) {
          if (!r.ok) throw new Error('Frete indisponível (' + r.status + ')');
          return r.text();
        })
        .then(function (text) {
          var data = null;
          try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }

          // Estrutura ok com rates já prontos
          if (data && Array.isArray(data.shipping_rates)) {
            return data.shipping_rates;
          }
          // Ainda calculando (shipping_rates === null) → continua polling
          if (data && data.shipping_rates === null) {
            if (attempts >= maxAttempts) throw new Error('Tempo esgotado ao calcular frete');
            return new Promise(function (resolve) { setTimeout(resolve, 500); }).then(poll);
          }
          // Resposta vazia/inesperada — tenta de novo até maxAttempts
          if (attempts >= maxAttempts) throw new Error('Sem resposta do servidor de frete. Tente novamente.');
          return new Promise(function (resolve) { setTimeout(resolve, 500); }).then(poll);
        });
    }
    return poll();
  }

  // Calcula frete pela API nativa do Shopify, consultando o provider
  // configurado (Frenet, Melhor Envio, Correios etc). Antes, busca
  // estado/cidade pelo CEP via ViaCEP — Shopify exige endereço completo.
  function shopifyShippingRates(zip) {
    var clean = zip.replace(/\D/g, '');
    if (clean.length !== 8) return Promise.reject(new Error('CEP precisa ter 8 dígitos'));
    var formatted = clean.slice(0, 5) + '-' + clean.slice(5);

    return lookupCEP(clean).then(function (addr) {
      if (!addr) {
        throw new Error('CEP não encontrado. Confira o número digitado.');
      }

      var params = new URLSearchParams();
      params.append('shipping_address[zip]', formatted);
      params.append('shipping_address[country]', 'Brazil');
      params.append('shipping_address[province]', addr.province);
      params.append('shipping_address[city]', addr.city);
      var qs = params.toString();

      // 1. Prepara o cálculo (Shopify dispara request para os providers)
      return fetch('/cart/prepare_shipping_rates.json?' + qs, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (!res.ok) {
          return res.json().then(function (err) {
            var msg = '';
            if (err.shipping_address) {
              msg = Array.isArray(err.shipping_address) ? err.shipping_address.join(', ') : JSON.stringify(err.shipping_address);
            } else if (err.message) {
              msg = err.message;
            } else {
              msg = 'Erro ' + res.status + ' ao calcular frete. Verifique se o produto tem peso cadastrado e se o Frenet está ativo.';
            }
            throw new Error(msg);
          }, function () {
            throw new Error('Erro ' + res.status + '. Verifique a configuração do Frenet em Apps → Frenet.');
          });
        }
        return pollShippingRates(qs);
      });
    });
  }

  // Para a PDP: adiciona o produto temporariamente, calcula e remove
  function calcRatesForVariant(variantId, qty, zip) {
    var addedKey = null;
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: qty || 1 })
    })
      .then(function (r) { if (!r.ok) throw new Error('Falha ao preparar produto'); return r.json(); })
      .then(function (line) {
        addedKey = line.key;
        return shopifyShippingRates(zip);
      })
      .then(function (rates) {
        // remove o item temporário antes de retornar
        return fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ id: addedKey, quantity: 0 })
        }).then(function () { return rates; });
      })
      .catch(function (err) {
        if (addedKey) {
          // tenta limpar mesmo em caso de erro pra não deixar item fantasma
          fetch('/cart/change.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ id: addedKey, quantity: 0 })
          });
        }
        throw err;
      });
  }

  function renderShippingRates(rates) {
    if (!rates || rates.length === 0) {
      return '<p class="ship-calc__error">Nenhuma opção de frete encontrada para este CEP. Confira se o endereço está correto.</p>';
    }
    var rows = rates.map(function (r) {
      var name = escapeHtml(r.presentment_name || r.name || r.code || 'Frete');
      var price = parseFloat(r.price);
      var priceFmt = price <= 0 ? '<strong style="color:#16A34A;">Grátis</strong>' : moneyBR(price * 100);
      var when = '';
      if (r.delivery_days) when = 'até ' + r.delivery_days + ' dias úteis';
      else if (r.delivery_range && r.delivery_range.length) when = r.delivery_range.join('–') + ' dias úteis';
      else if (r.delivery_date) when = 'entrega ' + r.delivery_date;
      return ''
        + '<li class="ship-calc__option">'
        + '  <span class="ship-calc__option-name">' + name + '</span>'
        + '  <span class="ship-calc__option-meta">' + escapeHtml(when) + '</span>'
        + '  <span class="ship-calc__option-price">' + priceFmt + '</span>'
        + '</li>';
    }).join('');
    return '<ul class="ship-calc__options">' + rows + '</ul>';
  }

  /* ==========================================================
     Product carousel (featured-collection)
     ========================================================== */

  document.querySelectorAll('[data-prod-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('[data-prod-carousel-track]');
    var prev = carousel.querySelector('[data-prod-carousel-prev]');
    var next = carousel.querySelector('[data-prod-carousel-next]');
    if (!track) return;

    function slideWidth() {
      var slide = track.querySelector('.prod-carousel__slide');
      if (!slide) return 0;
      var style = window.getComputedStyle(slide);
      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 16;
      return slide.offsetWidth + gap;
    }

    function visibleCount() {
      var w = slideWidth();
      if (!w) return 1;
      return Math.max(1, Math.floor(track.clientWidth / w));
    }

    function updateArrows() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.hidden = track.scrollLeft <= 4;
      if (next) next.hidden = track.scrollLeft >= max;
    }

    function scrollBy(dir) {
      var step = slideWidth() * visibleCount();
      track.scrollBy({ left: dir * step, behavior: 'smooth' });
    }

    if (prev) prev.addEventListener('click', function () { scrollBy(-1); });
    if (next) next.addEventListener('click', function () { scrollBy(1); });

    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);

    // Estado inicial
    updateArrows();

    // Recalcula quando imagens dos cards terminam de carregar (mudam scrollWidth)
    track.querySelectorAll('img').forEach(function (img) {
      if (img.complete) return;
      img.addEventListener('load', updateArrows, { once: true });
    });
  });

  /* ==========================================================
     Cookie banner (LGPD)
     ========================================================== */

  (function () {
    var COOKIE_KEY = 'exdeus_cookies_consent';
    var banner = document.querySelector('[data-cookie-banner]');
    if (!banner) return;

    function consented() {
      try { return localStorage.getItem(COOKIE_KEY); } catch (e) { return null; }
    }
    function save(val) {
      try { localStorage.setItem(COOKIE_KEY, val); } catch (e) {}
      banner.setAttribute('hidden', '');
    }

    if (!consented()) {
      // Mostra após 1s pra não atrapalhar o load inicial
      setTimeout(function () { banner.removeAttribute('hidden'); }, 800);
    }

    var acc = banner.querySelector('[data-cookie-accept]');
    var rej = banner.querySelector('[data-cookie-reject]');
    if (acc) acc.addEventListener('click', function () { save('accepted'); });
    if (rej) rej.addEventListener('click', function () { save('rejected'); });
  }());

  /* ==========================================================
     Filtros de coleção (toggle do painel lateral)
     ========================================================== */

  (function () {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) return;
    var toggle = document.querySelector('[data-filter-toggle]');
    var close = panel.querySelector('[data-filter-close]');
    if (toggle) toggle.addEventListener('click', function () {
      var isHidden = panel.hasAttribute('hidden');
      if (isHidden) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      document.body.classList.toggle('filter-open', isHidden);
    });
    if (close) close.addEventListener('click', function () {
      panel.setAttribute('hidden', '');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('filter-open');
    });
  }());

  /* ==========================================================
     Search autocomplete (Shopify predictive search API)
     ========================================================== */

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    var input = form.querySelector('[data-search-input]');
    var box = form.querySelector('[data-search-suggest]');
    var inner = form.querySelector('[data-search-suggest-inner]');
    if (!input || !box || !inner) return;

    var timer = null;

    function close() { box.setAttribute('hidden', ''); }
    function open() { box.removeAttribute('hidden'); }

    input.addEventListener('input', function () {
      var q = input.value.trim();
      if (timer) clearTimeout(timer);
      if (q.length < 2) { close(); return; }

      timer = setTimeout(function () {
        var url = '/search/suggest.json?q=' + encodeURIComponent(q)
                + '&resources[type]=product&resources[limit]=6&resources[options][unavailable_products]=last';
        fetch(url, { headers: { 'Accept': 'application/json' } })
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (data) {
            if (!data || !data.resources || !data.resources.results) { close(); return; }
            var products = data.resources.results.products || [];
            if (products.length === 0) {
              inner.innerHTML = '<p class="search-suggest__empty">Nenhum resultado pra <strong>' + escapeHtml(q) + '</strong>.</p>';
              open();
              return;
            }
            inner.innerHTML = products.map(function (p) {
              var imgUrl = p.image ? p.image.replace(/(\.[a-z]+)$/, '_120x$1') : '';
              var img = imgUrl ? '<img src="' + imgUrl + '" alt="" loading="lazy">' : '';
              var price = p.price ? moneyBR(parseFloat(p.price) * 100) : '';
              var compare = p.compare_at_price_max && parseFloat(p.compare_at_price_max) > parseFloat(p.price)
                ? '<span class="search-suggest__compare">' + moneyBR(parseFloat(p.compare_at_price_max) * 100) + '</span> '
                : '';
              return ''
                + '<a href="' + p.url + '" class="search-suggest__item" role="option">'
                + '  <span class="search-suggest__thumb">' + img + '</span>'
                + '  <span class="search-suggest__main">'
                + '    <span class="search-suggest__title">' + escapeHtml(p.title) + '</span>'
                + '    <span class="search-suggest__price">' + compare + '<strong>' + price + '</strong></span>'
                + '  </span>'
                + '</a>';
            }).join('');
            inner.innerHTML += '<a href="/search?q=' + encodeURIComponent(q) + '" class="search-suggest__all">Ver todos os resultados pra "' + escapeHtml(q) + '" →</a>';
            open();
          })
          .catch(function () { close(); });
      }, 200);
    });

    input.addEventListener('focus', function () {
      if (input.value.trim().length >= 2 && inner.children.length > 0) open();
    });

    document.addEventListener('click', function (e) {
      if (!form.contains(e.target)) close();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  });

  /* ==========================================================
     Cupom de desconto (cart page)
     ========================================================== */

  document.querySelectorAll('[data-coupon-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('[data-coupon-input]');
      var msg = form.parentNode.querySelector('[data-coupon-msg]');
      var btn = form.querySelector('button[type="submit"]');
      var code = (input.value || '').trim().toUpperCase();
      if (!code) {
        if (msg) { msg.textContent = 'Digite um código.'; msg.className = 'cart-checkout__coupon-msg is-error'; }
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Aplicando…';
      if (msg) { msg.textContent = ''; msg.className = 'cart-checkout__coupon-msg'; }
      // Shopify aplica via cookie quando visitamos /discount/CODE. Redireciona
      // de volta pro /cart. Se o cupom for inválido, o cart não fica com
      // discount_applications e o usuário vê na linha do total.
      window.location.href = '/discount/' + encodeURIComponent(code) + '?redirect=/cart';
    });
  });

  // Detecta se voltou de uma aplicação de cupom que não pegou
  // (URL ?discount_code=XXX persiste mesmo se Shopify ignorou o code)
  (function () {
    var params = new URLSearchParams(window.location.search);
    var attempted = params.get('discount_code');
    if (!attempted) return;
    var msg = document.querySelector('[data-coupon-msg]');
    var hasApplied = document.querySelector('.cart-checkout__coupon-applied');
    if (msg && !hasApplied) {
      msg.textContent = 'Cupom "' + attempted + '" não é válido ou expirou.';
      msg.className = 'cart-checkout__coupon-msg is-error';
      var wrap = document.querySelector('[data-coupon-form-wrap]');
      if (wrap) wrap.setAttribute('open', '');
    }
  }());

  // CEP salvo no localStorage (lembra entre sessões)
  var CEP_KEY = 'exdeus_last_cep';
  function saveCEP(cep) {
    try { localStorage.setItem(CEP_KEY, cep); } catch (e) {}
    syncCEPWidget(cep);
  }
  function loadCEP() { try { return localStorage.getItem(CEP_KEY) || ''; } catch (e) { return ''; } }

  function syncCEPWidget(cep) {
    document.querySelectorAll('[data-cep-widget-value]').forEach(function (el) {
      el.textContent = cep || 'Definir CEP';
    });
  }

  // Mini widget de CEP no topbar — abre dropdown, salva CEP, opcionalmente
  // calcula frete se o carrinho tem items.
  document.querySelectorAll('[data-cep-widget]').forEach(function (widget) {
    var toggle = widget.querySelector('[data-cep-widget-toggle]');
    var dropdown = widget.querySelector('[data-cep-widget-dropdown]');
    var input = widget.querySelector('[data-cep-widget-input]');
    var submit = widget.querySelector('[data-cep-widget-submit]');
    var result = widget.querySelector('[data-cep-widget-result]');
    var info = widget.querySelector('[data-cep-widget-info]');
    if (!toggle || !dropdown || !input || !submit) return;

    // Pre-fill com CEP salvo
    var savedCep = loadCEP();
    if (savedCep) input.value = savedCep;

    function open() {
      dropdown.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
      setTimeout(function () { input.focus(); }, 0);
    }
    function close() {
      dropdown.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (dropdown.hasAttribute('hidden')) open(); else close();
    });

    // Fecha ao clicar fora
    document.addEventListener('click', function (e) {
      if (!widget.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    // Máscara
    input.addEventListener('input', function () {
      var v = input.value.replace(/\D/g, '').slice(0, 8);
      input.value = v.length > 5 ? v.slice(0, 5) + '-' + v.slice(5) : v;
    });

    function submitCep() {
      var zip = input.value.trim();
      if (zip.replace(/\D/g, '').length !== 8) {
        if (result) result.innerHTML = '<p class="ship-calc__error">CEP precisa ter 8 dígitos.</p>';
        return;
      }
      saveCEP(zip);
      if (info) info.textContent = 'CEP salvo: ' + zip;

      // Pre-preenche outras calculadoras da página
      document.querySelectorAll('[data-shipping-calculator] [data-cep-input]').forEach(function (i) {
        if (i !== input) i.value = zip;
      });

      // Se tem itens no cart, calcula e mostra
      fetch('/cart.js').then(function (r) { return r.json(); }).then(function (cart) {
        if (cart.item_count === 0) {
          if (result) result.innerHTML = '<p class="ship-calc__loading" style="background:#E8F5E9;color:#1B5E20;border:0;padding:8px 10px;border-radius:6px;">CEP salvo! Adicione produtos pra ver o frete.</p>';
          setTimeout(close, 1800);
          return;
        }
        if (result) result.innerHTML = '<p class="ship-calc__loading">Calculando frete…</p>';
        submit.disabled = true;
        shopifyShippingRates(zip)
          .then(function (rates) {
            if (result) result.innerHTML = renderShippingRates(rates);
            updateCheapestShipping(rates);
          })
          .catch(function (err) {
            if (result) result.innerHTML = '<p class="ship-calc__error">' + escapeHtml(err.message || 'Erro') + '</p>';
          })
          .then(function () { submit.disabled = false; });
      });
    }

    submit.addEventListener('click', submitCep);
    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); submitCep(); }
    });

    // Mostra CEP atual no botão
    if (savedCep) syncCEPWidget(savedCep);
  });

  // Atualiza linhas "Frete a partir de R$ X" no resumo do carrinho/drawer
  function updateCheapestShipping(rates) {
    if (!rates || rates.length === 0) return;
    var prices = rates.map(function (r) { return parseFloat(r.price); }).filter(function (n) { return !isNaN(n); });
    if (prices.length === 0) return;
    var cheapest = Math.min.apply(null, prices);
    var label = cheapest <= 0 ? 'Grátis' : moneyBR(cheapest * 100);
    document.querySelectorAll('[data-cheapest-shipping]').forEach(function (el) {
      el.textContent = label;
      var row = el.closest('[data-shipping-row]');
      if (row) row.hidden = false;
    });
  }

  // Aplica a calculadora em cada [data-shipping-calculator] da página
  document.querySelectorAll('[data-shipping-calculator]').forEach(function (container) {
    var input = container.querySelector('[data-cep-input]');
    var btn = container.querySelector('[data-cep-calc]');
    var result = container.querySelector('[data-cep-result]');
    if (!input || !btn || !result) return;

    // Máscara CEP
    input.addEventListener('input', function () {
      var v = input.value.replace(/\D/g, '').slice(0, 8);
      input.value = v.length > 5 ? v.slice(0, 5) + '-' + v.slice(5) : v;
    });

    function calc(silent) {
      var zip = input.value.trim();
      if (zip.replace(/\D/g, '').length !== 8) {
        if (!silent) result.innerHTML = '<p class="ship-calc__error">Digite um CEP válido (8 dígitos).</p>';
        return;
      }
      result.innerHTML = '<p class="ship-calc__loading">Calculando frete…</p>';
      btn.disabled = true;
      var savedTxt = btn.textContent;
      btn.textContent = 'Calculando…';

      var variantId = container.dataset.variantId;
      var qty = parseInt(container.dataset.quantity, 10) || 1;
      var promise = variantId
        ? calcRatesForVariant(variantId, qty, zip)
        : shopifyShippingRates(zip);

      promise
        .then(function (rates) {
          result.innerHTML = renderShippingRates(rates);
          saveCEP(zip);
          updateCheapestShipping(rates);
        })
        .catch(function (err) {
          result.innerHTML = '<p class="ship-calc__error">' + escapeHtml(err.message || 'Erro ao calcular frete.') + '</p>';
        })
        .then(function () { btn.disabled = false; btn.textContent = savedTxt; });
    }

    btn.addEventListener('click', function () { calc(false); });
    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); calc(false); }
    });

    // Pré-preenche o CEP salvo. Se for no carrinho (sem variant_id), dispara
    // o cálculo automaticamente. Na PDP só preenche, evita cálculo desnecessário.
    var savedCep = loadCEP();
    if (savedCep) {
      input.value = savedCep;
      if (!container.dataset.variantId) {
        calc(true);
      }
    }
  });

  // Carrinho começa em sincronia com a tela
  if (document.querySelector('[data-cart-items]')) {
    fetchAndRenderCart();
  }
})();
