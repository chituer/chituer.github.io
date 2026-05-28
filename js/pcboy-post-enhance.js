(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn()
    else document.addEventListener('DOMContentLoaded', fn)
  }

  function hash(str) {
    var h = 5381
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) + h) ^ str.charCodeAt(i)
    }
    return (h >>> 0).toString(36)
  }

  function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(text)
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea')
        ta.value = text
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.top = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        var ok = document.execCommand('copy')
        document.body.removeChild(ta)
        if (ok) resolve()
        else reject(new Error('copy failed'))
      } catch (e) {
        reject(e)
      }
    })
  }

  function setCopied(btn) {
    if (!btn) return
    btn.classList.add('pcboy-copied')
    setTimeout(function () {
      btn.classList.remove('pcboy-copied')
    }, 900)
  }

  function toggleClass(el, cls, on) {
    if (!el) return
    if (typeof on === 'boolean') el.classList.toggle(cls, on)
    else el.classList.toggle(cls)
  }

  ready(function () {
    var post = document.querySelector('article.post-content')
    if (!post) return

    var md = post.querySelector('.markdown-body')
    if (!md) return

    Array.prototype.slice.call(md.querySelectorAll('p')).forEach(function (p, idx) {
      if (p.querySelector('.pcboy-paralink')) return
      var text = (p.textContent || '').trim()
      if (!text) return
      var id = p.id
      if (!id) {
        id = 'p-' + idx + '-' + hash(text.slice(0, 64))
        p.id = id
      }
      var btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'pcboy-paralink'
      btn.setAttribute('aria-label', '复制段落链接')
      btn.textContent = ''
      btn.addEventListener('click', function (e) {
        e.preventDefault()
        e.stopPropagation()
        var url = window.location.origin + window.location.pathname + '#' + id
        copyText(url).then(function () {
          setCopied(btn)
          history.replaceState(null, document.title, '#' + id)
        })
      })
      p.appendChild(btn)
    })

    Array.prototype.slice.call(md.querySelectorAll('figure.highlight')).forEach(function (fig) {
      if (fig.querySelector('.pcboy-code-toggle')) return
      var lines = fig.querySelectorAll('td.gutter .line').length
      if (lines <= 16) return

      var btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'pcboy-code-toggle'
      btn.textContent = '展开'
      btn.addEventListener('click', function () {
        var collapsed = fig.classList.contains('pcboy-code-collapsed')
        toggleClass(fig, 'pcboy-code-collapsed', !collapsed)
        btn.textContent = collapsed ? '收起' : '展开'
      })
      fig.appendChild(btn)
      fig.classList.add('pcboy-code-collapsed')
    })

    var toc = document.getElementById('toc')
    var tocBody = document.getElementById('toc-body')
    if (toc && tocBody) {
      var key = 'pcboy_toc_collapsed'
      var collapsed = false
      try { collapsed = localStorage.getItem(key) === '1' } catch (e) {}
      toggleClass(toc, 'pcboy-toc-collapsed', collapsed)

      var header = toc.querySelector('.toc-header')
      if (header) {
        header.style.cursor = 'pointer'
        header.addEventListener('click', function () {
          collapsed = !toc.classList.contains('pcboy-toc-collapsed')
          toggleClass(toc, 'pcboy-toc-collapsed', collapsed)
          try { localStorage.setItem(key, collapsed ? '1' : '0') } catch (e) {}
        })
      }
    }
  })
})()
