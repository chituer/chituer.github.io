(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn()
    else document.addEventListener('DOMContentLoaded', fn)
  }

  function norm(s) {
    return (s || '').toString().trim()
  }

  ready(function () {
    var root = document.querySelector('.pcboy-projects')
    if (!root) return

    var catsEl = document.getElementById('pcboy-projects-cats')
    var cards = Array.prototype.slice.call(root.querySelectorAll('.pcboy-project-card'))
    var emptyEl = root.querySelector('.pcboy-empty')

    var activeCat = ''

    function hasCat(card, cat) {
      if (!cat) return true
      var raw = (card.dataset && card.dataset.cats) ? card.dataset.cats : ''
      if (!raw) return false
      var parts = raw.split('|').map(function (x) { return x.trim() }).filter(Boolean)
      return parts.indexOf(cat) >= 0
    }

    function apply() {
      cards.forEach(function (card) {
        card.hidden = !hasCat(card, activeCat)
      })
      if (emptyEl) {
        emptyEl.hidden = root.querySelectorAll('.pcboy-project-card:not([hidden])').length > 0
      }
    }

    function setCat(cat) {
      activeCat = norm(cat)
      if (catsEl) {
        Array.prototype.slice.call(catsEl.querySelectorAll('[data-cat]')).forEach(function (btn) {
          var c = btn.dataset ? (btn.dataset.cat || '') : ''
          btn.classList.toggle('pcboy-chip-selected', norm(c) === activeCat)
        })
      }
      apply()
    }

    if (catsEl) {
      catsEl.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('[data-cat]') : null
        if (!btn) return
        setCat(btn.dataset ? (btn.dataset.cat || '') : '')
      })
    }

    Array.prototype.slice.call(root.querySelectorAll('[data-carousel="projects"]')).forEach(function (carousel) {
      var track = carousel.querySelector('.pcboy-carousel-track')
      var prev = carousel.querySelector('.pcboy-carousel-prev')
      var next = carousel.querySelector('.pcboy-carousel-next')
      if (!track) return

      function pageWidth() {
        var rect = track.getBoundingClientRect()
        return rect && rect.width ? rect.width : track.clientWidth
      }

      if (prev) {
        prev.addEventListener('click', function () {
          track.scrollBy({ left: -pageWidth(), behavior: 'smooth' })
        })
      }
      if (next) {
        next.addEventListener('click', function () {
          track.scrollBy({ left: pageWidth(), behavior: 'smooth' })
        })
      }
    })

    apply()
  })
})()
