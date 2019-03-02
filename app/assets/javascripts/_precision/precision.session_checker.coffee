window.Precision ||= {}

class AlertModal
  #private
  createNode = (css = '', node = 'div', child = null) ->
    $node = $(document.createElement(node))
    $node.addClass(css)
    $node.append(child) if child
    return $node
    
  #private
  appendToPage = (container) ->
    if $('noscript').length > 0
      $('noscript').first?().after(container)
    else
      $('main').first?().prepend(container)

  #private
  createModalContainer = (title, body) ->
    $container = createNode('modal alert-modal fade in')
    $modalBackDrop = createNode('alert-modal-backdrop modal-backdrop fade in')
    $modalDialog = createNode('modal-dialog')
    $modalContent = createNode('modal-content')
    $modalHeader = createNode('modal-header alert alert-danger')
    $modalTitle = createNode('modal-title', 'h4', title)
    $modalBody = createNode('modal-body', 'div', body)

    $modalHeader.append($modalTitle)
    $modalContent.append($modalHeader)
    $modalContent.append($modalBody)
    $modalDialog.append($modalContent)
    $container.append($modalDialog)

    $('body').append($modalBackDrop)
    appendToPage($container)
    $container.modal({
      keyboard: false,
      backdrop: false
    })
    $container.on 'hide.bs.modal', () -> $modalBackDrop.remove()
    return $container

  #private
  createModal: (handler, expired) ->
    window.Precision.SESSION_CHECKER_MODAL_OPEN = true

    timerNum = 60
    url = '/login?back_url=' + window.location.href
    text = 'You are about to be logged out due to inactivity.'
    $button = createNode('btn btn-primary', 'button', 'Extend session')
    $buttonConteienr = createNode('alert-modal-button', 'div', $button)

    $body = createNode()
    $timer = createNode('alert-modal-timer')
    $timerText = createNode('', 'span', 'You will be logged out in ') if !expired
    $timerText = createNode('', 'span', 'You will be redirected to log in page in ') if expired
    $timerNum = createNode('', 'span', timerNum)
    $timerSeconds = createNode('', 'span', ' seconds')
    $or = createNode('', 'div', 'or')

    $timer.append($timerText)
    $timer.append($timerNum)
    $timer.append($timerSeconds)
    $body.append($timer)
    $body.append($or) if !expired
    $body.append($buttonConteienr) if !expired

    @intervalSessionAlert = setInterval(
      () =>
        if timerNum >= 0
          timerNum--
          $timerNum.text(timerNum)
        if timerNum == 0
          $timerSeconds.text('')
          timerNum = ''
          $timerText.text('You\'ve been logged out.')
          $timerSeconds.text('')
          $timerNum.text('')
          $button.remove()
          $or.remove()
          $login = createNode('btn btn-primary', 'button', 'Log In')
          $login.on 'click', () ->
            window.location = url
          $buttonConteienr.append($login)
        if timerNum < 0
          clearInterval(@intervalSessionAlert)
          window.location = url
          $timerNum.text('')
      1000
    )

    @container = createModalContainer(text, $body)
    $button.on 'click', () =>
      handler()
      @destroyModal()
  
  destroyModal: () ->
    window.Precision.SESSION_CHECKER_MODAL_OPEN = false
    @container.modal('hide')
    @container.remove()
    clearInterval(@intervalSessionAlert)
    $('body').removeClass('modal-open')
    $('body').css('padding-right', '0px')

  constructor: (handler = (() -> false), expired = false) ->
    @intervalSessionAlert = null
    @container = null
    @createModal(handler, expired)

################# AlertModal End ########################



class SessionChecker
  constructor: () ->
    @sessionExpiredAt = null
    @currentTime = null
    @timeDiff = null
    @checkTime = null
    @checker = null
    @timeout = null
    @modal = null

  getCurrentTime = () -> Math.floor((new Date()).getTime() / 1000)

  getCookie = (name) ->
    matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ))
    return decodeURIComponent(matches[1]) if matches
    return undefined

  getTimeExpired = () -> parseInt(getCookie('sessionExpiredAt'))

  sendRequest: (url) ->
    $.ajax({
      url: url,
      method: 'GET',
      success: (data) =>
        @checkSession()
      error: (data) =>
        @handle401Error(true) if data.status == 401
    })

  checkSession: () -> @checkTimeLeft()

  run: () ->
    @checker = @checkSession()

  checkTimeLeft: () ->
    clearTimeout(@timeout)
    @sessionExpiredAt = getTimeExpired()
    @currentTime = getCurrentTime()
    @timeDiff = @sessionExpiredAt - @currentTime
    @checkTime = (@timeDiff - 61) * 1000

    if @timeDiff <= 61
      @handle401Error()
      return false

    @timeout = setTimeout(
      () => @checkSession()
      ,
      @checkTime
    )
    return false

  handleExtendSession: () ->
    @sendRequest('/api/update_active')

  handle401Error: (expired = false) ->
    timeExpired = getTimeExpired()
    handler = @handleExtendSession.bind(this)
    @modal = new AlertModal(handler, expired)
    interval = setInterval(
      () =>
        if getTimeExpired() > timeExpired
          clearInterval(interval)
          @modal.destroyModal()
          @checkTimeLeft()
      ,
      1000
    )

window.Precision.session_checker = new SessionChecker()
window.Precision.SESSION_CHECKER_MODAL_OPEN = false
