class SpacesContentView
  constructor: (@space_uid) ->
    @objectSelector = new Precision.models.SelectorModel({
      title: "Move data to space"
      help: "Only private data can be moved to a Space. Data in a Space can be published, but cannot be made private again."
      onSave: (selected) =>
        Precision.api("/api/publish/", {
          scope: @space_uid,
          uids: _.map(selected, "uid")
        })
      onAfterSave: () ->
        window.location.reload(true)
      listRelatedParams:
        editable: true
        scopes: ["private"]
        classes: ["file", "note", "comparison", "app", "asset", "job"]
      listModelConfigs: [
        {
          className: "file"
          name: "Files"
          apiEndpoint: "list_files"
          apiParams:
            editable: true
            scopes: ["private"]
            states: ["closed"]
        }
        {
          className: "note"
          name: "Notes"
          apiEndpoint: "list_notes"
          apiParams:
            editable: true
            scopes: ["private"]
            note_types: ["Note"]
        }
        {
          className: "comparison"
          name: "Comparisons"
          apiEndpoint: "list_comparisons"
          apiParams:
            editable: true
            scopes: ["private"]
        }
        {
          className: "app"
          name: "Apps"
          apiEndpoint: "list_apps"
          apiParams:
            editable: true
            scopes: ["private"]
        }
        {
          className: "asset"
          name: "Assets"
          apiEndpoint: "list_assets"
          apiParams:
            editable: true
            scopes: ["private"]
        }
        {
          className: "job"
          name: "Jobs"
          apiEndpoint: "list_jobs"
          apiParams:
            editable: true
            scopes: ["private"]
        }
      ]
    })

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

SpacesController = Paloma.controller('Spaces',
  content: ->
    params = @params
    $container = $("body main")
    viewModel = new SpacesContentView(params.space_uid)
    ko.applyBindings(viewModel, $container[0])
)
