# MODIFIED FROM: https://github.com/probonogeek/knockout-ace
# Based on Knockout Bindings for TinyMCE
# https://github.com/SteveSanderson/knockout/wiki/Bindings---tinyMCE
# Initial version by Ryan Niemeyer. Updated by Scott Messinger, Frederik Raabye, Thomas Hallock, Drew Freyling, and Shane Carr.

do ->
  instances_by_id = {}
  init_id = 0
  # generated id increment storage
  ko.bindingHandlers.ace =
    init: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) ->
      options = allBindingsAccessor().aceOptions or {}
      value = ko.utils.unwrapObservable(valueAccessor()) ? ""

      # Ace attaches to the element by DOM id, so we need to make one for the element if it doesn't have one already.
      if !element.id
        element.id = 'knockout-ace-' + init_id
        init_id = init_id + 1

      ace.require("ace/ext/language_tools")

      editor = ace.edit(element.id)

      editor.$blockScrolling = Infinity
      editor.setTheme 'ace/theme/' + options.theme if options.theme
      editor.getSession().setMode 'ace/mode/' + options.mode if options.mode
      editor.setReadOnly true if options.readOnly
      editor.renderer.setShowPrintMargin(options.checked ? false)
      editor.getSession().setTabSize(2)

      editor.setOptions _.defaults({
        enableBasicAutocompletion: true
        enableSnippets: true,
        enableLiveAutocompletion: false
      }, options.opts)

      editor.setValue value
      editor.gotoLine 0

      editor.getSession().on 'change', (delta) ->
        if ko.isWriteableObservable(valueAccessor())
          valueAccessor()(editor.getValue())
      instances_by_id[element.id] = editor

      # destroy the editor instance when the element is removed
      ko.utils.domNodeDisposal.addDisposeCallback element, ->
        editor.destroy()
        delete instances_by_id[element.id]

    update: (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) ->
      value = ko.utils.unwrapObservable(valueAccessor()) ? ""
      id = element.id

      #handle programmatic updates to the observable
      # also makes sure it doesn't update it if it's the same.
      # otherwise, it will reload the instance, causing the cursor to jump.
      if id != undefined and id != '' and instances_by_id.hasOwnProperty(id)
        editor = instances_by_id[id]
        content = editor.getValue()
        if content != value
          editor.setValue(value)
          editor.gotoLine 0

  ko.aceEditors =
    resizeAll: ->
      for id of instances_by_id
        if !instances_by_id.hasOwnProperty(id)
          continue
        editor = instances_by_id[id]
        editor.resize()
      return
    get: (id) ->
      instances_by_id[id]
