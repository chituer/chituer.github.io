(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn()
    else document.addEventListener('DOMContentLoaded', fn)
  }

  function isEditableTarget(el) {
    if (!el) return false
    var tag = (el.tagName || '').toLowerCase()
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
    if (el.isContentEditable) return true
    return false
  }

  ready(function () {
    var modal = document.getElementById('modalSearch')
    if (!modal) return

    var title = modal.querySelector('.modal-title')
    if (title && !modal.querySelector('.pcboy-kbd-hint')) {
      var hint = document.createElement('span')
      hint.className = 'pcboy-kbd-hint'
      hint.textContent = 'Ctrl/⌘+K'
      title.appendChild(hint)
    }

    document.addEventListener('keydown', function (e) {
      var key = (e.key || '').toLowerCase()
      if (key !== 'k') return
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.altKey) return
      if (isEditableTarget(e.target)) return
      e.preventDefault()

      if (typeof window.jQuery === 'function' && window.jQuery.fn && typeof window.jQuery.fn.modal === 'function') {
        window.jQuery('#modalSearch').modal('show')
        return
      }

      var opener = document.querySelector('[data-target="#modalSearch"]')
      if (opener) opener.click()
    }, { passive: false })
  })
})()
