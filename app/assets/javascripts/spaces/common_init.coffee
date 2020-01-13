HELP_TEXT = "Only private data can be moved to a Space. Data in a Space can be published, but cannot be made private again."

getRelatedObjects = (item, spaceUID) ->
  Precision.promisifyApi('/api/related_to_publish', {
    uid: item.uid,
    scopes: spaceUID
  })

class RelateObjectChild
  constructor: (data, isWF = false) ->
    @uid = data.uid
    @title = data.title
    @type = data.className
    @icon = "fa #{data.fa_class}"
    @url = data.path
    @isWFapp = isWF and @type == 'app'
    @checked = ko.observable(@isWFapp)
    @disabled = ko.observable(@isWFapp)

class RelateObject
  toggleChildren: (data, e) =>
    if e.target.checked
      @relatedObjects().forEach((child) -> child.checked(true))
    else
      @relatedObjects().forEach((child) -> child.checked(false) if !child.isWFapp)

  constructor: (data) ->
    @uid = data.uid
    @title = data.title
    @type = data.className()
    @icon = data.classIcon().replace(/fa-fw/, '')
    @url = data.path()

    isWF = @type == 'workflow'
    @relatedObjects = ko.observableArray(data.loadedRelatedObjects.map(
      (item) -> new RelateObjectChild(item, isWF))
    )

class SpacesContentView
  shareRelatedObjects: () ->
    @relatedObjects().forEach((item) =>
      item.relatedObjects().forEach((child) =>
        @relatedIDs.push(child.uid) if child.checked()
      )
    )
    $('#add_related_objects_modal').modal('hide')
    @objectSelector.saving(true)
    @onSaveHandler(@selected)

  checkRelatedItems: (selected, spaceUID) ->
    new Promise((resolve, reject) ->
      relatedItemsGetters = []
      selected.forEach((item) ->
        relatedItemsGetters.push(getRelatedObjects(item, spaceUID))
      )
      Promise.all(relatedItemsGetters).then(
        (data) ->
          resolve(data)
        (error) ->
          Precision.alert.showAboveAll('Something went wrong while checking related objects!')
          reject(error)
      )
    )

  publishFilesOnSuccess: (count) ->
    msg = """#{count} objects have been published.
            Files are being processed, this could take a while."""
    Precision.alert.showAfterReload(msg, 'alert-succes')
    window.location.reload(true)

  onSaveHandler: (selected) ->
    selectedFiles = selected.filter((item) -> item.className() == 'file')
    uids = _.map(selected, 'uid')
    uids = _.union(uids, @relatedIDs)

    Precision.api("/api/publish/", {
      scope: @space_uid,
      uids: uids
    }).then(
      (data) =>
        @publishFilesOnSuccess(data.published_count) if selectedFiles.length
        window.location.reload(true) if !selectedFiles.length
      (response) =>
        @objectSelector.saving(false)
        try
          responseJSON = JSON.parse(response.responseText)
          Precision.alert.showAboveAll("#{responseJSON.error.type}: #{responseJSON.error.message}")
        catch
          Precision.alert.showAboveAll('Something went wrong!')
    )

  constructor: (@space_uid, scopes) ->
    @selected = []
    @selectedFilesCount = ko.observable(0)
    @relatedIDs = []
    @relatedObjects = ko.observableArray([])

    @objectSelector = new Precision.models.SelectorModel({
      title: "Move data to space",
      help: HELP_TEXT,
      useFileLimit: true,
      onSave: (selected) =>
        @relatedIDs = []
        @selected = []
        @relatedObjects([])

        @checkRelatedItems(selected, @space_uid).then((data) =>
          noRelated = true
          selected.forEach((item, index) ->
            item.loadedRelatedObjects = data[index]
            noRelated = false if item.loadedRelatedObjects.length
          )
          return @onSaveHandler(selected) if noRelated

          @relatedObjects(selected.filter((item) -> item.loadedRelatedObjects.length)
                                  .map((item) -> new RelateObject(item)))

          @objectSelector.saving(false)
          @selected = selected
          $('#add_related_objects_modal').modal('show')
        )

        deferred = $.Deferred()
        deferred.resolve(selected, false)

      listRelatedParams: {
        editable: true,
        scopes: scopes,
        classes: ["file", "note", "comparison", "app", "asset", "job", 'workflow']
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
            scopes: scopes,
            space_uid: @space_uid,
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
    'workflows -> common_init'
  ],
  common_init: () ->
    init(@params)
})
