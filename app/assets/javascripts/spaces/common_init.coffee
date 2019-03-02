HELP_TEXT = "Only private data can be moved to a Space. Data in a Space can be published, but cannot be made private again."

class SpacesContentView
  constructor: (@space_uid, scopes) ->
    @objectSelector = new Precision.models.SelectorModel({
      title: "Move data to space",
      help: HELP_TEXT,
      onSave: (selected) =>
        Precision.api("/api/publish/", {
          scope: @space_uid,
          uids: _.map(selected, "uid")
        })
      onAfterSave: () ->
        window.location.reload(true)
      listRelatedParams: {
        editable: true,
        scopes: scopes,
        classes: ["file", "note", "comparison", "app", "asset", "job"]
      },
      listModelConfigs: [
        {
          className: "file",
          name: "Files",
          apiEndpoint: "list_files",
          apiParams: {
            editable: true,
            scopes: scopes,
            states: ["closed"]
          }
        },
        {
          className: "note",
          name: "Notes",
          apiEndpoint: "list_notes",
          apiParams: {
            editable: true,
            scopes: scopes,
            note_types: ["Note"]
          }
        },
        {
          className: "comparison",
          name: "Comparisons",
          apiEndpoint: "list_comparisons",
          apiParams: {
            editable: true,
            scopes: scopes
          }
        },
        {
          className: "app",
          name: "Apps",
          apiEndpoint: "list_apps",
          apiParams: {
            editable: true,
            scopes: scopes
          }
        },
        {
          className: "asset",
          name: "Assets",
          apiEndpoint: "list_assets",
          apiParams: {
            editable: true,
            scopes: scopes
          }
        },
        {
          className: "job",
          name: "Jobs",
          apiEndpoint: "list_jobs",
          apiParams: {
            editable: true,
            scopes: scopes
          }
        },
        {
          className: "workflow",
          name: "Workflows",
          apiEndpoint: "list_workflows",
          apiParams: {
            editable: true,
            scopes: scopes
          }
        }
      ]
    })

init = (params) ->
  $container = $("#ko_spaces_header_container")
  viewModel = new SpacesContentView(params.space_uid, params.scopes)
  ko.applyBindings(viewModel, $container[0])

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

SpacesController = Paloma.controller('Spaces', {
  before: [
    'discuss -> common_init',
    'members -> common_init',
    'feed -> common_init',
    'tasks -> common_init',
    'files -> common_init',
    'notes -> common_init',
    'apps -> common_init',
    'jobs -> common_init',
    'assets -> common_init',
    'comparisons -> common_init',
    'reports -> common_init',
  ],
  common_init: () ->
    init(@params)
})
