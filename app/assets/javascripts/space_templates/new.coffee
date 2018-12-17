
class SpaceTemplateView
  constructor: (
    @space_template_id,
    spaces,
    verifiedSpacesURL,
    unverifiedAppsURL,
    apps,
    files,
    readonly,
    spaceData
  ) ->
    @spaces = ko.observableArray(spaces)
    @selectedApps = ko.observableArray([])
    @verifiedSpacesURL = verifiedSpacesURL
    @unverifiedAppsURL = unverifiedAppsURL

    @addedSpaces = ko.computed( =>
      @spaces()
      _.filter(@spaces(), (space) ->
        space.checked == true
      )
    )

    @searchSpaceBox = ko.observable("")
    @searchAppBox = ko.observable("")
    @spaceApps = ko.observableArray(apps)
    @unverifiedApps = ko.observableArray([])
    @spaceFiles = ko.observableArray(files)

    self.spaceData = {}
    self.spaceData = spaceData if spaceData
    self.readonly =  readonly

  dismissSpaces: () ->
    @searchSpaceBox("")
    $('#verified-spaces').modal("hide")

  dismissApps: () ->
    @searchAppBox("")
    $('#unverified-apps').modal("hide")

  addSelectedSpaces: () ->
    @searchSpaceBox("")
    @spaces.valueHasMutated()
    this.loadAppsAndFiles(
      _.filter(@spaces(), (space) -> space.checked == true)
    )
    @dismissSpaces()

  addSelectedApps: () =>
    @searchAppBox("")
    checked = $('[name="apps[selected][]"]:checked')

    apps = @unverifiedApps().filter( (app) =>
      found = false
      checked.each((e) ->
        found = true if $(checked[e]).attr("value") == (app.id + "")
      )
      for k, v of @spaceApps()
        if v.id == app.id
          found = false

      found
    )

    @selectedApps(apps)
    sApps = @spaceApps()

    @spaceApps(sApps.concat(apps))
    @dismissApps()

  showSelectSpacesModal: (e) ->
    $('#verified-spaces').modal('show')

  showSelectAppModal: (e) =>
    this.loadApps(e) if @unverifiedApps().length < 1
    $('#filter-verified-apps').val("")
    $('#unverified-apps').modal('show')


  deleteSpace: (space) =>
    if self.readonly != true
      for k,v of self.spaceData.apps[space.id]
        i = @spaceApps().findIndex((e)->
          e.id == v.id
        )
        @spaceApps.splice(i,1) if i > -1

      for k,v of self.spaceData.files[space.id]
        i = @spaceFiles().findIndex((e)->
          e.id == v.id
        )
        @spaceFiles.splice(i,1) if i > -1

      index = @spaces().findIndex (item) ->
        item.id == space.id

      @spaces.replace(@spaces()[index], Object.assign {}, @spaces()[index], checked: false)

  deleteApp: (app) =>
    if self.readonly != true
      i = @selectedApps().indexOf(app)
      @selectedApps().splice(i, 1) if i > -1

      @spaceApps.remove(app)

      index = @unverifiedApps().findIndex (item) ->
        item.id == app.id

      @unverifiedApps.replace(@unverifiedApps()[index], Object.assign {}, @unverifiedApps()[index], checked: false)

  deleteNode: (file) =>
    if self.readonly != true
      @spaceFiles.remove(file)

  loadAppsAndFiles: (spaces) =>
    $.ajax({
        url: '/spaces/apps_and_files?spaces=' + spaces.map((e) -> e.id).join(','),
        method: 'GET',
        contentType: "application/json",
        success: (data) =>
          datum = JSON.parse(data)
          self.spaceData = datum
          apps = []
          files = []

          for k, v of datum.apps
            apps = apps.concat v

          for k, v of datum.files
            files = files.concat v

          apps = apps.concat @selectedApps()
          @spaceApps(apps)
          @spaceFiles(files)
      }
    )

  loadApps: (e) =>
    $.ajax({
      url: @unverifiedAppsURL,
      method: 'GET',
      contentType: "application/json",
      success: (data) =>
        @unverifiedApps(
          _.map(data, (app) =>
            selected = _.find(@spaceApps(), (selected_app) -> app.id == selected_app.id)
            app.checked = !!selected
            app
          )
        )
    })

SpaceTemplatesController = Paloma.controller('SpaceTemplates', {
  new: ->
    @furnishForm()

  edit: ->
    @furnishForm()

  show: ->
    @furnishForm()

  create: ->
    @furnishForm()

  duplicate: ->
    @furnishForm()

  furnishForm: ->
    params = @params
    $container = $('body main')
    if params.readonly
      $('.form input,textarea').prop('disabled', true);
    viewModel = new SpaceTemplateView(
      params.space_template_id,
      params.spaces,
      params.verifiedSpacesURL,
      params.unverifiedAppsURL,
      params.templateApps,
      params.templateFiles,
      params.readonly,
      params.spaceData
    )

    viewModel.spaces(
      _.map(viewModel.spaces(), (space) =>
        selected = _.find(params.templateSpaces, (selected_space) -> space.id == selected_space.id)
        space.checked = !!selected
        space
      )
    )

    ko.applyBindings(viewModel, $container[0])

    viewModel.searchSpaceBox.subscribe( (value) ->

      $("table.filter tr").each( (i) ->
        $row = $(this)
        id = $row.find("td").text()

        if id.indexOf(value) >= 0
          $(this).show()
        else
          $(this).hide()
      )
    )
    viewModel.searchAppBox.subscribe( (value) ->

      $("table.filter tr").each( (i) ->
        $row = $(this)
        id = $row.find("td").text()

        if id.indexOf(value) >= 0
          $(this).show()
        else
          $(this).hide()
      )
    )
})
