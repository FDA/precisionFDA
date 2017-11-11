### ContentTools ImageDialog Monkeypatch ###
### Aim - change upload image dialog ###

ContentTools.ImageDialog.prototype.mount = ->
  ImageDialog = ContentTools.ImageDialog
  ImageDialog.__super__.mount.call(this)
  dialogHeader = this._domCaption

  this.valid = true

  # this._domElement - is root Dialog node
  ContentEdit.addCSSClass(this._domElement, 'ct-image-dialog--pfda-challenges')
  ContentEdit.addCSSClass(this._domElement, 'ct-image-dialog')
  ContentEdit.addCSSClass(this._domView, 'ct-image-dialog__view')
  
  domControlGroup = this.constructor.createDiv(['ct-control-group'])
  this._domControls.appendChild(domControlGroup)

  this._domInput = document.createElement('input')
  this._domInput.setAttribute('class', 'ct-image-dialog__input')
  this._domInput.setAttribute('name', 'url')
  this._domInput.setAttribute('type', 'text')
  this._domInput.setAttribute('placeholder', 'Paste Image URL...')
  domControlGroup.appendChild(this._domInput)

  this._domButton = this.constructor.createDiv([
    'ct-control',
    'ct-control--text',
    'ct-control--insert',
    'ct-control--muted'
  ])
  this._domButton.textContent = ContentEdit._('Insert')
  domControlGroup.appendChild(this._domButton)

  this._addDOMEventListeners()
  return this.dispatchEvent(this.createEvent('imageuploader.mount'))

########################

ContentTools.ImageDialog.prototype.show_error = ContentTools.ShowDialogError
ContentTools.ImageDialog.prototype.hide_error = ContentTools.HideDialogError
ContentTools.ImageDialog.prototype.url_is_valid = ContentTools.UrlIsValid

########################

ContentTools.ImageDialog.prototype.save = ->

  _this = this
  imageURL = this._domInput.value.trim()
  img = new Image()

  img.addEventListener 'load', ->
      imageSize = [ this.naturalWidth , this.naturalHeight ]
      _this.populate imageURL, imageSize
      return _this.dispatchEvent _this.createEvent('save', {
        'imageURL': imageURL,
        'imageSize': imageSize,
        'imageAttrs': undefined
      })

  img.addEventListener 'error', (error) ->
      _this.show_error('Unreachable URL!')

  img.src = imageURL

########################

ContentTools.ImageDialog.prototype.unmount = ->
  this._domInput.blur() if this.isMounted()
  ImageDialog = ContentTools.ImageDialog
  ImageDialog.__super__.unmount.call(this)
  this._domButton = null
  this._domInput = null
  return this.dispatchEvent(this.createEvent('imageuploader.unmount'))

########################

ContentTools.ImageDialog.prototype._addDOMEventListeners = ->
  ImageDialog = ContentTools.ImageDialog
  ImageDialog.__super__._addDOMEventListeners.call(this)

  this._domInput.addEventListener 'input', do =>
    return (ev) =>
      value = ev.target.value
      if value and this.url_is_valid(value)
        this.hide_error()
        ContentEdit.removeCSSClass(this._domButton, 'ct-control--muted')
        this.valid = true
      else if value and not this.url_is_valid(value)
        this.show_error('Invalid URL format!')
        ContentEdit.addCSSClass(this._domButton, 'ct-control--muted')
        this.valid = false
      else
        this.hide_error()
        ContentEdit.addCSSClass(this._domButton, 'ct-control--muted')
        this.valid = false

  this._domInput.addEventListener 'keypress', do =>
    return (ev) =>
      _this.save() if ev.keyCode == 13 and this.valid

  return this._domButton.addEventListener 'click', do =>
    return (ev) =>
      ev.preventDefault()
      this.save() if this.valid