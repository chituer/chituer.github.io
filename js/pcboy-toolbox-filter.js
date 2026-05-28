(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn()
    else document.addEventListener('DOMContentLoaded', fn)
  }

  function norm(s) {
    return (s || '').toString().trim().toLowerCase()
  }

  function debounce(fn, wait) {
    var t = null
    return function () {
      var ctx = this
      var args = arguments
      if (t) clearTimeout(t)
      t = setTimeout(function () {
        fn.apply(ctx, args)
      }, wait)
    }
  }

  ready(function () {
    var root = document.querySelector('.pcboy-toolbox')
    if (!root) return

    var input = document.getElementById('pcboy-toolbox-search')
    var tagsEl = document.getElementById('pcboy-toolbox-tags')
    var resetBtn = document.getElementById('pcboy-toolbox-reset')

    var items = Array.prototype.slice.call(root.querySelectorAll('.pcboy-toolbox-item'))
    var categories = Array.prototype.slice.call(root.querySelectorAll('.pcboy-toolbox-category'))
    var emptyEl = root.querySelector('.pcboy-empty')

    var activeTag = ''

    function hasTag(a, tag) {
      if (!tag) return true
      var raw = (a.dataset && a.dataset.tags) ? a.dataset.tags : ''
      if (!raw) return false
      var parts = raw.split('|').map(function (x) { return x.trim() }).filter(Boolean)
      return parts.indexOf(tag) >= 0
    }

    function matchQuery(a, q) {
      if (!q) return true
      var name = norm(a.dataset ? a.dataset.name : '')
      var desc = norm(a.dataset ? a.dataset.desc : '')
      var tags = norm(a.dataset ? a.dataset.tags : '')
      var category = norm(a.dataset ? a.dataset.category : '')
      return name.indexOf(q) >= 0 || desc.indexOf(q) >= 0 || tags.indexOf(q) >= 0 || category.indexOf(q) >= 0
    }

    function apply() {
      var q = norm(input && input.value)

      items.forEach(function (a) {
        var ok = hasTag(a, activeTag) && matchQuery(a, q)
        a.hidden = !ok
      })

      categories.forEach(function (cat) {
        var visible = cat.querySelectorAll('.pcboy-toolbox-item:not([hidden])').length
        cat.hidden = visible === 0
      })

      if (emptyEl) {
        emptyEl.hidden = root.querySelectorAll('.pcboy-toolbox-item:not([hidden])').length > 0
      }
    }

    function setTag(tag) {
      activeTag = tag || ''
      if (tagsEl) {
        Array.prototype.slice.call(tagsEl.querySelectorAll('[data-tag]')).forEach(function (btn) {
          var t = btn.dataset ? (btn.dataset.tag || '') : ''
          btn.classList.toggle('pcboy-chip-selected', t === activeTag)
        })
      }
      apply()
    }

    if (tagsEl) {
      tagsEl.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('[data-tag]') : null
        if (!btn) return
        setTag(btn.dataset ? (btn.dataset.tag || '') : '')
      })
    }

    if (input) {
      input.addEventListener('input', debounce(apply, 80))
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (input) input.value = ''
        setTag('')
      })
    }

    apply()
  })
})()
