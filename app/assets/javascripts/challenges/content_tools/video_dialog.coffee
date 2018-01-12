### ContentTools VideoDialog Monkeypatch ###
### Aim - add url validation ###

########################

ContentTools.VideoDialog.prototype.show_error = ContentTools.ShowDialogError
ContentTools.VideoDialog.prototype.hide_error = ContentTools.HideDialogError
ContentTools.VideoDialog.prototype.url_is_valid = ContentTools.UrlIsValid

########################

ContentTools.VideoDialog.prototype._addDOMEventListeners = ->
  VideoDialog = ContentTools.VideoDialog
  VideoDialog.__super__._addDOMEventListeners.call(this)
  valid = true

  this._domInput.addEventListener 'input', do =>
    return (ev) =>
      value = ev.target.value

      if value and this.url_is_valid(value)
        this.hide_error()
        ContentEdit.removeCSSClass(this._domButton, 'ct-control--muted')
        valid = true
      else if value and not this.url_is_valid(value)
        this.show_error('Invalid URL format!')
        ContentEdit.addCSSClass(this._domButton, 'ct-control--muted')
        valid = false
      else
        this.hide_error()
        valid = false
        ContentEdit.addCSSClass(this._domButton, 'ct-control--muted')

      if _this._updatePreviewTimeout
        clearTimeout(_this._updatePreviewTimeout)

      updatePreview = =>
        videoURL = _this._domInput.value.trim()
        embedURL = ContentTools.getEmbedVideoURL(videoURL)

        if embedURL
          return this.preview(embedURL)
        else
          return this.clearPreview()

      this._updatePreviewTimeout = setTimeout(updatePreview, 500)

  this._domInput.addEventListener 'keypress', do =>
    return (ev) =>
      this.save() if ev.keyCode == 13 and valid
      

  return this._domButton.addEventListener 'click', do =>
    return (ev) =>
      ev.preventDefault()
      this.save() if valid