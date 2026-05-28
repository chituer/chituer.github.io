(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn()
    else document.addEventListener('DOMContentLoaded', fn)
  }

  function clamp01(v) {
    if (v < 0) return 0
    if (v > 1) return 1
    return v
  }

  ready(function () {
    var post = document.querySelector('article.post-content')
    if (!post) return

    if (document.getElementById('pcboy-reading-progress')) return

    var bar = document.createElement('div')
    bar.id = 'pcboy-reading-progress'
    var inner = document.createElement('div')
    inner.className = 'pcboy-reading-progress-inner'
    bar.appendChild(inner)
    document.body.appendChild(bar)

    var ticking = false
    function update() {
      ticking = false
      var doc = document.documentElement
      var total = doc.scrollHeight - window.innerHeight
      var cur = window.scrollY || doc.scrollTop || 0
      var p = total > 0 ? cur / total : 0
      inner.style.transform = 'scaleX(' + clamp01(p) + ')'
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
  })
})()
