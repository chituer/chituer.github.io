(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn()
    else document.addEventListener('DOMContentLoaded', fn)
  }

  function norm(s) {
    return (s || '').toString().trim()
  }

  function getRecent() {
    try {
      var raw = localStorage.getItem('pcboy_search_recent')
      var arr = raw ? JSON.parse(raw) : []
      return Array.isArray(arr) ? arr.filter(Boolean) : []
    } catch (e) {
      return []
    }
  }

  function setRecent(list) {
    try {
      localStorage.setItem('pcboy_search_recent', JSON.stringify(list.slice(0, 8)))
    } catch (e) {}
  }

  function pushRecent(q) {
    q = norm(q)
    if (!q) return
    var list = getRecent()
    var next = [q].concat(list.filter(function (x) { return x !== q }))
    setRecent(next)
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  ready(function () {
    var modal = document.getElementById('modalSearch')
    if (!modal) return

    var input = modal.querySelector('#local-search-input')
    var result = modal.querySelector('#local-search-result')
    if (!input || !result) return

    var quickLinks = [
      { label: '首页', url: '/' },
      { label: '项目', url: '/projects/' },
      { label: '工具箱', url: '/tools/' },
      { label: '归档', url: '/archives/' },
      { label: '分类', url: '/categories/' },
      { label: '标签', url: '/tags/' },
      { label: '关于', url: '/about/' }
    ]

    var activeIndex = -1

    function getItems() {
      return Array.prototype.slice.call(result.querySelectorAll('a.list-group-item.search-list-title'))
    }

    function setActive(idx) {
      var items = getItems()
      items.forEach(function (a, i) {
        a.classList.toggle('pcboy-search-active', i === idx)
      })
      activeIndex = idx
      if (idx >= 0 && items[idx]) {
        items[idx].scrollIntoView({ block: 'nearest' })
      }
    }

    function openActive() {
      var items = getItems()
      if (!items.length) return
      var idx = activeIndex >= 0 ? activeIndex : 0
      var a = items[idx]
      if (!a || !a.getAttribute) return
      pushRecent(input.value)
      window.location.href = a.getAttribute('href')
    }

    function renderSuggestions() {
      var q = norm(input.value)
      if (q) return

      var rec = getRecent()
      var html = ''

      html += '<div class="pcboy-search-block"><div class="pcboy-search-block-title">快捷入口</div>'
      html += '<div class="pcboy-search-quick">'
      quickLinks.forEach(function (it) {
        html += '<a class="pcboy-search-quick-item" href="' + it.url + '">' + escapeHtml(it.label) + '</a>'
      })
      html += '</div></div>'

      html += '<div class="pcboy-search-block pcboy-search-recent"><div class="pcboy-search-block-title">最近搜索</div>'
      if (!rec.length) {
        html += '<div class="pcboy-search-empty">暂无</div>'
      } else {
        html += '<div class="pcboy-search-recent-list">'
        rec.forEach(function (x) {
          html += '<button type="button" class="pcboy-search-recent-item" data-q="' + escapeHtml(x) + '">' + escapeHtml(x) + '</button>'
        })
        html += '</div>'
      }
      html += '</div>'

      result.innerHTML = html
      activeIndex = -1
    }

    function hideModal() {
      if (typeof window.jQuery === 'function' && window.jQuery.fn && typeof window.jQuery.fn.modal === 'function') {
        window.jQuery('#modalSearch').modal('hide')
        return
      }
      var closeBtn = modal.querySelector('#local-search-close')
      if (closeBtn) closeBtn.click()
    }

    function onKeydown(e) {
      var key = e.key
      if (key === 'Escape') {
        e.preventDefault()
        hideModal()
        return
      }
      if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Enter') return

      var items = getItems()
      if (!items.length) return

      if (key === 'Enter') {
        e.preventDefault()
        openActive()
        return
      }

      e.preventDefault()
      if (key === 'ArrowDown') {
        var next = activeIndex + 1
        if (next >= items.length) next = 0
        setActive(next)
      } else if (key === 'ArrowUp') {
        var prev = activeIndex - 1
        if (prev < 0) prev = items.length - 1
        setActive(prev)
      }
    }

    function onResultClick(e) {
      var a = e.target && e.target.closest ? e.target.closest('a.list-group-item.search-list-title') : null
      if (a) {
        pushRecent(input.value)
        return
      }
      var btn = e.target && e.target.closest ? e.target.closest('button.pcboy-search-recent-item') : null
      if (btn && btn.dataset) {
        input.value = btn.dataset.q || ''
        input.dispatchEvent(new Event('input', { bubbles: true }))
        input.focus()
      }
    }

    function onInput() {
      if (!norm(input.value)) renderSuggestions()
      activeIndex = -1
      setTimeout(function () {
        setActive(-1)
      }, 0)
    }

    function onOpen() {
      setTimeout(function () {
        renderSuggestions()
        input.focus()
      }, 0)
    }

    if (typeof window.jQuery === 'function') {
      window.jQuery(modal).on('shown.bs.modal', onOpen)
    } else if (typeof MutationObserver === 'function') {
      var last = modal.classList.contains('show')
      new MutationObserver(function () {
        var now = modal.classList.contains('show')
        if (now && !last) onOpen()
        last = now
      }).observe(modal, { attributes: true, attributeFilter: ['class'] })
    } else {
      Array.prototype.slice.call(document.querySelectorAll('[data-target="#modalSearch"]')).forEach(function (el) {
        el.addEventListener('click', onOpen)
      })
    }

    input.addEventListener('keydown', onKeydown)
    input.addEventListener('input', onInput)
    result.addEventListener('click', onResultClick)
  })
})()
