NO_FILE = 'No file selected'
class SetIOValueModal
  setBoolValueTrue: () => @value(true)

  setBoolValueFalse: () => @value(false)

  showModal: (input) =>
    @editingInput(input)
    @value(input.wfValue())
    @modal.modal('show')

  clearFileValue: () =>
    @value(null)
    @fileTitle(NO_FILE)

  setFileValue: (file) =>
    @value(file.uid)
    @fileTitle(file.title())

  validate: () ->
    if @editingInput().class == 'int'
      _val = parseInt(@value())
      if isNaN(_val)
        @valid(false)
        Precision.alert.showAboveAll('Value should be a number')
        return false
      if _val.toString().length != @value().toString().length
        @valid(false)
        Precision.alert.showAboveAll('Value cannot contain a decimal')
        return false
    if @editingInput().class == 'float' and isNaN(parseFloat(@value()))
      @valid(false)
      Precision.alert.showAboveAll('Value should be a number')
      return false
    return true

  saveValue: () =>
    @valid(true)
    if @validate()
      # label = if @editingInput().class == 'file' then @fileTitle() else null
      # @editingInput().setWFvalue(@value(), label)
      @editingInput().setWFvalue(@value())
      @editingInput(null)
      @modal.modal('hide')

  constructor: () ->
    @editingInput = ko.observable(null)
    @value = ko.observable(null)
    @valid = ko.observable(true)
    @fileTitle = ko.observable(NO_FILE)

    @template = ko.computed(() =>
      if @editingInput()
        switch @editingInput().class
          when 'file' then return 'file'
          when 'boolean' then return 'boolean'
          else return 'default'
    )
    @disableSaveButton = ko.computed(() =>
      if typeof @value() == 'string' and @value().length
        return false
      if typeof @value() == 'boolean'
        return false
      return true
    )

    @modal = $('#set-io-value-modal')
    @modal.on 'hidden.bs.modal', () =>
      @valid(true)
      @value(null)
      @fileTitle(NO_FILE)
      @editingInput(null)
      $('body').addClass('modal-open') if $('.modal.in').length > 0

window.Precision ||= {}
window.Precision.wfEditor ||= {}
window.Precision.wfEditor.SetIOValueModal = SetIOValueModal
