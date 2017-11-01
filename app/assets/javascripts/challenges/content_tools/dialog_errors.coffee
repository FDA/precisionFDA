### Show error for ContentTools dialog ###

ContentTools.ShowDialogError = (message) ->
  if not this._domErrorContainer
    this._domErrorContainer = document.createElement('div')
    ContentEdit.addCSSClass(this._domErrorContainer, 'ct-dialog__error-cont')
  this._domErrorContainer.innerHTML = ''
  this._domControls.appendChild(this._domErrorContainer)

  this._domError = document.createElement('div')
  ContentEdit.addCSSClass(this._domError, 'ct-dialog__error')
  this._domError.innerText = message
  this._domErrorContainer.appendChild(this._domError)

ContentTools.HideDialogError = ->
  if this._domErrorContainer
    this._domErrorContainer.remove()
    this._domErrorContainer = null

ContentTools.UrlIsValid = (url) ->
  expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
  regex = new RegExp(expression)
  return url.match(regex)
