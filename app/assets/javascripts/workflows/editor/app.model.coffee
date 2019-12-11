class AppModel
  onChangeHandler: () ->
    @setInputOutput()

  selectedAppDxid: () => @appIdToDxid()[@selectedApp()]

  setInputOutput: () ->
    if @selectedApp()
      Precision.api('/api/get_app_spec', { id: @selectedAppDxid() })
        .done((app) =>
          @inputsForApp(app.spec.input_spec)
          @outputsForApp(app.spec.output_spec)
        )

  constructor: (app, mode) ->
    @app = app
    @public = app.scope == 'public'
    @private = app.scope == 'private'
    @inputsForApp = ko.observableArray(app.spec.input_spec || [])
    @outputsForApp = ko.observableArray(app.spec.output_spec || [])
    @revisions = ko.observableArray(app.revisions || [])
    @appIdToDxid = ko.computed( =>
      appIdToDxid = {}
      for revision in @revisions()
        appIdToDxid[revision.id] = revision.uid
      return appIdToDxid
    )
    @selectedApp = ko.observable()

window.Precision ||= {}
window.Precision.wfEditor ||= {}
window.Precision.wfEditor.AppModel = AppModel
