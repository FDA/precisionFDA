### Hide "Code" button in properties dialog ###

_bind = (fn, me) ->
  ->
    fn.apply me, arguments

_hasProp = {}.hasOwnProperty
_extends = (child, parent) ->
  ctor = ->
    @constructor = child
    return
  for key of parent
    if _hasProp.call(parent, key)
      child[key] = parent[key]
  ctor.prototype = parent.prototype
  child.prototype = new ctor
  child.__super__ = parent.prototype
  child

StyleUI = ((_super) ->
  StyleUI = (style, applied) ->
    @style = style
    StyleUI.__super__.constructor.call this
    @_applied = applied
    return
  _extends StyleUI, _super
  StyleUI.prototype.applied = (applied) ->
    if applied == undefined
      return @_applied
    if @_applied == applied
      return
    @_applied = applied
    if @_applied
      ContentEdit.addCSSClass @_domElement, 'ct-section--applied'
    else
      ContentEdit.removeCSSClass @_domElement, 'ct-section--applied'

  StyleUI.prototype.mount = (domParent, before) ->
    label = undefined
    if before == null
      before = null
    @_domElement = @constructor.createDiv([ 'ct-section' ])
    if @_applied
      ContentEdit.addCSSClass @_domElement, 'ct-section--applied'
    label = @constructor.createDiv([ 'ct-section__label' ])
    label.textContent = @style.name()
    @_domElement.appendChild label
    @_domElement.appendChild @constructor.createDiv([ 'ct-section__switch' ])
    StyleUI.__super__.mount.call this, domParent, before

  StyleUI.prototype._addDOMEventListeners = ->
    toggleSection = undefined
    toggleSection = ((_this) ->
      (ev) ->
        ev.preventDefault()
        if _this.applied()
          _this.applied false
        else
          _this.applied true
    )(this)
    @_domElement.addEventListener 'click', toggleSection

  StyleUI
)(ContentTools.AnchoredComponentUI)

ContentTools.PropertiesDialog.prototype.changedAttributes = ->
  
  attributes = {}
  changedAttributes = {}
  attributeUIs = this._attributeUIs
  
  for attributeUI in attributeUIs
    name = attributeUI.name()
    value = attributeUI.value()
    continue if name == ''
    attributes[name.toLowerCase()] = true
    if this.element.attr(name) != value
      changedAttributes[name] = value

  restricted = ContentTools.getRestrictedAtributes(this.element.tagName())
  elementAttributes = this.element.attributes()

  for name of elementAttributes
    value = elementAttributes[name]
    continue if restricted and restricted.indexOf(name.toLowerCase()) != -1
    if !attributes[name]
      changedAttributes[name] = null

  return changedAttributes

checkAttributes = (attrs, el) ->
  attrs_ok = true
  for name of attrs
    value = attrs[name]
    _el = document.createElement(el._domElement.tagName)
    try
      _el.setAttribute(name, value)
    catch
      Precision.alert.showAboveAll("Wrong argument name: #{name} or value: #{value}")
      attrs_ok = false
    finally
      _el = null
  return attrs_ok


ContentTools.PropertiesDialog.prototype.save = ->
  innerHTML = null
  
  if this._supportsCoding
    innerHTML = this._domInnerHTML.value

  changedAttributes = this.changedAttributes()
  if !checkAttributes(changedAttributes, this.element)
    return false
  
  detail = {
    changedAttributes: changedAttributes,
    changedStyles: this.changedStyles(),
    innerHTML: innerHTML
  }
  
  return this.dispatchEvent(this.createEvent('save', detail))


ContentTools.PropertiesDialog.prototype.mount = ->
  PropertiesDialog = ContentTools.PropertiesDialog
  PropertiesDialog.__super__.mount.call(this)
  
  this._supportsCoding = false

  ContentEdit.addCSSClass(this._domElement, 'ct-properties-dialog')
  ContentEdit.addCSSClass(this._domView, 'ct-properties-dialog__view')
  this._domStyles = this.constructor.createDiv(['ct-properties-dialog__styles'])
  this._domStyles.setAttribute('data-ct-empty', ContentEdit._('No styles available for this tag'))
  this._domView.appendChild(this._domStyles)
  _ref = ContentTools.StylePalette.styles(this.element)
  
  for style in _ref
    styleUI = new StyleUI(style, this.element.hasCSSClass(style.cssClass()))
    this._styleUIs.push(styleUI)
    styleUI.mount(this._domStyles)
  
  this._domAttributes = this.constructor.createDiv(['ct-properties-dialog__attributes'])
  this._domView.appendChild(this._domAttributes)
  restricted = ContentTools.getRestrictedAtributes(this.element.tagName())
  attributes = this.element.attributes()
  attributeNames = []
  for name of attributes
    value = attributes[name]
    continue if restricted and restricted.indexOf(name.toLowerCase()) != -1
    attributeNames.push(name)

  attributeNames.sort()
  for name in attributeNames
    value = attributes[name]
    this._addAttributeUI(name, value)

  this._addAttributeUI('', '')
  this._domCode = this.constructor.createDiv(['ct-properties-dialog__code'])
  this._domView.appendChild(this._domCode)
  this._domInnerHTML = document.createElement('textarea')
  this._domInnerHTML.setAttribute('class', 'ct-properties-dialog__inner-html')
  this._domInnerHTML.setAttribute('name', 'code')
  this._domInnerHTML.value = this.getElementInnerHTML()
  this._domCode.appendChild(this._domInnerHTML)
  domTabs = this.constructor.createDiv(['ct-control-group', 'ct-control-group--left'])
  this._domControls.appendChild(domTabs)
  this._domStylesTab = this.constructor.createDiv([
    'ct-control',
    'ct-control--icon',
    'ct-control--styles'
  ])

  this._domStylesTab.setAttribute('data-ct-tooltip', ContentEdit._('Styles'))
  domTabs.appendChild(this._domStylesTab)
  this._domAttributesTab = this.constructor.createDiv([
    'ct-control',
    'ct-control--icon',
    'ct-control--attributes'
  ])
  this._domAttributesTab.setAttribute('data-ct-tooltip', ContentEdit._('Attributes'))
  domTabs.appendChild(this._domAttributesTab)
  this._domCodeTab = this.constructor.createDiv([
    'ct-control',
    'ct-control--icon',
    'ct-control--code'
  ])
  this._domCodeTab.setAttribute('data-ct-tooltip', ContentEdit._('Code'))
  domTabs.appendChild(this._domCodeTab)
  if !this._supportsCoding
    ContentEdit.addCSSClass(this._domCodeTab, 'ct-control--muted')
    this._domCodeTab.style.display = 'none'

  this._domRemoveAttribute = this.constructor.createDiv([
    'ct-control',
    'ct-control--icon',
    'ct-control--remove',
    'ct-control--muted'
  ])
  this._domRemoveAttribute.setAttribute('data-ct-tooltip', ContentEdit._('Remove'))
  domTabs.appendChild(this._domRemoveAttribute)
  domActions = this.constructor.createDiv(['ct-control-group', 'ct-control-group--right'])
  this._domControls.appendChild(domActions)
  this._domApply = this.constructor.createDiv([
    'ct-control',
    'ct-control--text',
    'ct-control--apply'
  ])
  this._domApply.textContent = ContentEdit._('Apply')
  domActions.appendChild(this._domApply)
  lastTab = window.localStorage.getItem('ct-properties-dialog-tab')
  if lastTab == 'attributes'
    ContentEdit.addCSSClass(this._domElement, 'ct-properties-dialog--attributes')
    ContentEdit.addCSSClass(this._domAttributesTab, 'ct-control--active')
  else if lastTab == 'code' and this._supportsCoding
    ContentEdit.addCSSClass(this._domElement, 'ct-properties-dialog--code')
    ContentEdit.addCSSClass(this._domCodeTab, 'ct-control--active')
  else
    ContentEdit.addCSSClass(this._domElement, 'ct-properties-dialog--styles')
    ContentEdit.addCSSClass(this._domStylesTab, 'ct-control--active')

  return this._addDOMEventListeners()

ContentEdit.Element.prototype.removeAttr = (name) ->
  name = name.toLowerCase()
  return if typeof this._attributes[name] != 'string' and !this._attributes[name]
  delete this._attributes[name]
  if this.isMounted() and name.toLowerCase() != 'class'
    this._domElement.removeAttribute(name)
  return this.taint()

ContentTools.TagUI.prototype._onMouseDown = (ev) ->
  ev.preventDefault()
  if @element.storeState
    @element.storeState()
  app = ContentTools.EditorApp.get()
  modal = new (ContentTools.ModalUI)
  dialog = new (ContentTools.PropertiesDialog)(@element)
  dialog.addEventListener 'cancel', ((_this) ->
    ->
      modal.hide()
      dialog.hide()
      if _this.element.restoreState
        return _this.element.restoreState()
      return
  )(this)
  dialog.addEventListener 'save', ((_this) ->
    (ev) ->
      detail = ev.detail()
      attributes = detail.changedAttributes
      styles = detail.changedStyles
      innerHTML = detail.innerHTML
      for name of attributes
        value = attributes[name]
        if name == 'class'
          if value == null
            value = ''
          classNames = {}
          _ref = value.split(' ')
          _i = 0
          _len = _ref.length
          while _i < _len
            className = _ref[_i]
            className = className.trim()
            if !className
              _i++
              continue
            classNames[className] = true
            if !_this.element.hasCSSClass(className)
              _this.element.addCSSClass className
            _i++
          _ref1 = _this.element.attr('class').split(' ')
          _j = 0
          _len1 = _ref1.length
          while _j < _len1
            className = _ref1[_j]
            className = className.trim()
            if classNames[className] == undefined
              _this.element.removeCSSClass className
            _j++
        else
          if value == null
            _this.element.removeAttr name
            _this.element._domElement.removeAttribute name
          else
            _this.element.attr name, value
      for cssClass of styles
        applied = styles[cssClass]
        if applied
          _this.element.addCSSClass cssClass
        else
          _this.element.removeCSSClass cssClass
      if innerHTML != null
        if innerHTML != dialog.getElementInnerHTML()
          element = _this.element
          if !element.content
            element = element.children[0]
          element.content = new (HTMLString.String)(innerHTML, element.content.preserveWhitespace())
          element.updateInnerHTML()
          element.taint()
          element.selection new (ContentSelect.Range)(0, 0)
          element.storeState()
      modal.hide()
      dialog.hide()
      if _this.element.restoreState
        return _this.element.restoreState()
      return
  )(this)
  app.attach modal
  app.attach dialog
  modal.show()
  dialog.show()
