window.Precision ||= {}

window.Precision.api = (route, input, successCallback, errorCallback) ->
  $.ajax route,
    contentType: 'application/json'
    data: JSON.stringify(input)
    dataType: 'json'
    jsonp: false
    method: 'POST'
    mimeType: 'application/json'
    processData: false
    success: (data, status, xhr) ->
      successCallback?(data)
    error: (xhr, status, err) ->
      if errorCallback? then errorCallback(status, err) else console.error(status, err)

window.Precision.md = new Remarkable('full', {
  linkify: true
})

window.Precision.CK_CONFIG =
  height: 400
  extraPlugins: 'widget,autogrow,attachment'
  toolbarGroups: [
    {name: 'clipboard', groups: ['clipboard', 'undo']}
    {name: 'styles', groups: ['styles']}
    {name: 'basicstyles', groups: ['basicstyles', 'cleanup']}
    {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph']}
    {name: 'links', groups: ['links']}
    {name: 'insert', groups: ['insert']}
    {name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing']}
    {name: 'forms', groups: ['forms']}
    {name: 'tools', groups: ['tools']}
    {name: 'document', groups: ['mode', 'document', 'doctools']}
    {name: 'others', groups: ['others']}
    {name: 'colors', groups: ['colors']}
    {name: 'about', groups: ['about']}
  ]
  removeButtons: 'Subscript,Superscript,Cut,Copy,Paste,PasteText,PasteFromWord,SpecialChar,Source,Strike,Underline,Styles,About,Scayt'
  on:
    insertElement: (e) ->
      el = $(e.data.$)
      if (el.is('table'))
        el.addClass('table table-bordered').removeAttr('cellpadding').removeAttr('cellspacing')
  autoGrow_minHeight: 400
  autoGrow_onStartup: true

window.Precision.INSTANCES = [
  {value: "baseline-2", label: "Baseline 2"}
  {value: "baseline-4", label: "Baseline 4"}
  {value: "baseline-8", label: "Baseline 8"}
  {value: "baseline-16", label: "Baseline 16"}
  {value: "baseline-32", label: "Baseline 32"}
  {value: "himem-2", label: "High Mem 2"}
  {value: "himem-4", label: "High Mem 4"}
  {value: "himem-8", label: "High Mem 8"}
  {value: "himem-16", label: "High Mem 16"}
  {value: "himem-32", label: "High Mem 32"}
  {value: "hidisk-2", label: "High Disk 2"}
  {value: "hidisk-4", label: "High Disk 4"}
  {value: "hidisk-8", label: "High Disk 8"}
  {value: "hidisk-16", label: "High Disk 16"}
  {value: "hidisk-36", label: "High Disk 36"}
]

window.Precision.carousel =
  # Source: http://jsfiddle.net/technotarek/gXN2u/
  setHeight: (id) ->
    slideHeight = []
    $(id + ' .item').each ->
      # add all slide heights to an array
      slideHeight.push $(this).height()
    # find the tallest item
    max = Math.max.apply(null, slideHeight)
    # set the slide's height
    $(id + ' .carousel-content').each ->
      $(this).css 'height', max + 'px'


$(document).on 'page:load', ->
  Paloma.executeHook()
  Paloma.engine.start()
