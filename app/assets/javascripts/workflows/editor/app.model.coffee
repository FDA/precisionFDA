class AppModel
  onChangeHandler: () ->
    @setInputOutput()

  selectedAppDxid: () => @appIdToDxid[@selectedApp()]

  setRevisions: () ->
    Precision.api('/api/list_app_revisions', { id: @app.id })
        .done((revisions) =>
          for revision in revisions
            @appIdToDxid[revision.id] = revision.uid
            @revisions.push(revision)
      )

  setInputOutput: () ->
    if @selectedApp()
      Precision.api('/api/get_app_spec', { id: @selectedAppDxid() })
        .done((app) =>
          @inputsForApp(app.spec.input_spec)
          @outputsForApp(app.spec.output_spec)
        )

  init: () ->
    @setInputOutput()
    @setRevisions()

  constructor: (app, mode) ->
    @app = app
    @inputsForApp = ko.observableArray()
    @outputsForApp = ko.observableArray()
    @revisions = ko.observableArray()
    @appIdToDxid = {}
    @selectedApp = ko.observable()

    @init()

window.Precision ||= {}
window.Precision.wfEditor ||= {}
window.Precision.wfEditor.AppModel = AppModel
