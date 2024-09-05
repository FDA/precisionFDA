function ready(fn) {
  if (document.readyState !== 'loading') {
    fn()
    return
  }
  document.addEventListener('DOMContentLoaded', fn)
}

const resizeData = {
  tracking: false,
  startWidth: 250,
  startCursorScreenX: null,
  handleWidth: 12,
  resizeTarget: null,
  parentElement: null,
  maxWidth: null,
}

const debounce = (func, delay) => {
  let inDebounce
  return function () {
    const context = this
    const args = arguments
    clearTimeout(inDebounce)
    inDebounce = setTimeout(() => func.apply(context, args), delay)
  }
}

ready(function () {
  const resizer = document.getElementById('resizer')
  const sidebar = document.getElementById('sidebar')

  resizer.addEventListener('mousedown', function (event) {
    if (event.button === 0) {
      event.preventDefault()
      event.stopPropagation()

      if (!resizer.parentElement) {
        console.error(new Error('Parent element not found.'))
        return
      }

      resizeData.startWidth = sidebar.offsetWidth
      resizeData.startCursorScreenX = event.screenX
      resizeData.resizeTarget = sidebar
      resizeData.parentElement = resizer.parentElement
      resizeData.maxWidth = resizer.parentElement.clientWidth - resizeData.handleWidth
      resizeData.tracking = true
    }
  })

  window.addEventListener(
    'mousemove',
    debounce(function (event) {
      if (resizeData.tracking) {
        const cursorScreenXDelta = event.screenX - resizeData.startCursorScreenX
        const newWidth = Math.min(
          resizeData.startWidth + cursorScreenXDelta,
          resizeData.maxWidth,
        )

        resizeData.resizeTarget.style.width = newWidth + 'px'
        resizer.classList.add('resizing')
      }
    }, 1),
  )

  window.addEventListener('mouseup', function (event) {
    if (resizeData.tracking) {
      resizeData.tracking = false
      resizer.classList.remove('resizing')
    }
  })

  const collapseIcons = document.querySelectorAll('.collapse-icon')

  collapseIcons.forEach(function (icon) {
    icon.addEventListener('click', function () {
      const navbarItem = icon.closest('.navbar-item')
      if (navbarItem) {
        navbarItem.classList.toggle('expanded')
      }
    })
  })
})
