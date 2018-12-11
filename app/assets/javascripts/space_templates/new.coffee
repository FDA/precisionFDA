
class SpaceTemplateView
  constructor: (@space_template_id, spaces, verifiedSpacesURL, unverifiedAppsURL, apps, files, readonly, spaceData) ->
    @spaces = spaces
    @selectedSpaces = ko.observableArray([])
    @selectedApps = ko.observableArray([])
    self.selectedApps = @selectedApps
    @verifiedSpacesURL = verifiedSpacesURL
    @unverifiedAppsURL = unverifiedAppsURL
    @addedSpaces = ko.observableArray([])
    self.addedSpaces = @addedSpaces
    @searchSpaceBox = ko.observable("")
    @searchAppBox = ko.observable("")
    @spaceApps = ko.observableArray([])
    self.spaceApps = @spaceApps

    @unverifiedApps = ko.observableArray([])
    self.unverifiedApps = @unverifiedApps

    @spaceFiles = ko.observableArray([])
    self.spaceFiles = @spaceFiles

    self.spaceData = {}
    self.spaceData = spaceData if spaceData



    self.readonly =  readonly

  addSelectedSpaces: () ->
    @searchSpaceBox("")
    checked = $('[name="spaces[selected][]"]:checked')
    sp = []
    checked.each((e, v)->
      sp.push($(v).val())
    )
    spaces = @spaces.filter( (space) ->
      this.indexOf(space.id + "") > -1
    ,sp)

    @addedSpaces(spaces)
    this.loadAppsAndFiles(spaces)

    $('#verified-spaces').modal("hide")

  addSelectedApps: () ->
    @searchAppBox("")
    checked = $('[name="apps[selected][]"]:checked')

    apps = @unverifiedApps().filter( (app) ->
      found = false
      checked.each((e) ->
        found = true if $(checked[e]).attr("value") == (app.id + "")
      )
      for k,v of @spaceApps()
        if v.id == app.id
          found = false

      found
    )

    @selectedApps(apps)
    sApps = @spaceApps()

    @spaceApps(sApps.concat(apps))
    #@spaceApps().push(apps)
    $('#unverified-apps').modal("hide")

  showSelectSpacesModal: (e) ->
    $('#verified-spaces').modal('show')

  showSelectAppModal: (e) ->
    this.loadApps(e) if self.unverifiedApps().length < 1
    $('#filter-verified-apps').val("")
    #@selectedApps([])
    $('#unverified-apps').modal('show')


  deleteSpace: (space)->
    if self.readonly != true
      for k,v of self.spaceData.apps[space.id]
        i = self.spaceApps.indexOf(v)
        self.spaceApps.splice(i,1) if i > -1

      for k,v of self.spaceData.files[space.id]
        i = self.spaceFiles.indexOf(v)
        self.spaceFiles.splice(i,1) if i > -1

      self.addedSpaces.remove(space)

  deleteApp: (app)->
    if self.readonly != true
      i = self.selectedApps().indexOf(app)
      self.selectedApps().splice(i,1) if i > -1

      self.spaceApps.remove(app)

  deleteNode:(file)->
    if self.readonly != true
      self.spaceFiles.remove(file)

  loadAppsAndFiles: (spaces)->
    $.ajax({
        url: '/spaces/apps_and_files?spaces=' + spaces.map((e) -> e.id).join(','),
        method: 'GET',
        contentType: "application/json",
        success: (data) =>
          datum = JSON.parse(data)
          self.spaceData = datum
          apps = []
          files = []

          for k,v of datum.apps
            apps = apps.concat v

          for k,v of datum.files
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
        @unverifiedApps(data)
    })

SpaceTemplatesController = Paloma.controller('SpaceTemplates',

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

    for k,v of viewModel.spaces
      v.checked = false

    if params.templateApps
      viewModel.spaceApps(params.templateApps)
      viewModel.spaceFiles(params.templateFiles)
      viewModel.addedSpaces(params.templateSpaces)

      for k,v of viewModel.spaces
        for a,b of params.templateSpaces
          if b.id == v.id
            viewModel.spaces[k].checked = true
          else
            viewModel.spaces[k].checked = false


    ko.applyBindings(viewModel, $container[0] )

    viewModel.searchSpaceBox.subscribe((value)->
      #filter items in the modal

      $("table.filter tr").each((i)->
        $row = $(this)
        id = $row.find("td").text()

        if id.indexOf(value) >= 0
          $(this).show()
        else
          $(this).hide()
      )
    )
    viewModel.searchAppBox.subscribe((value)->
      #filter items in the modal

      $("table.filter tr").each((i)->
        $row = $(this)
        id = $row.find("td").text()

        if id.indexOf(value) >= 0
          $(this).show()
        else
          $(this).hide()
      )
    )


)
