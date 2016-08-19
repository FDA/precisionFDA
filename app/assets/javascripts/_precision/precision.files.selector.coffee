class FilesSelectorModel
  constructor: (@opts = {}) ->
    @modal = $(".file-selector-modal")

    @selected = ko.observableArray()
    @inputModel = ko.observable()
    @busy = ko.observable(false)

    @patternQuery = ko.computed(=>
      @inputModel()?.patterns
    )
    @filterQuery = ko.observable()
    @files = ko.observableArray()
    @files.filtered = ko.computed(=>
      files = @files()
      files = @filterSetOfFiles(files, @patternQuery())
      files = @filterSetOfFiles(files, @filterQuery())
      files = _.sortBy(files, 'name')
      return files
    )

    @type = ko.computed(=>
      if @inputModel()?.isClassAnArray then 'checkbox' else 'radio'
    )

    @canSave = ko.computed(=>
      !@busy() && !_.isEmpty(@selected())
    )

    @modal.on('hidden.bs.modal', =>
      @files([])
      @inputModel(null)
      @selected([])
    )

  filterSetOfFiles: (files, query) ->
    return files if _.isEmpty(query)

    if _.isArray(query)
      return _.filter(files, (file) ->
        _.some(query, (queryToTest) ->
          regexp = Precision.utils.globToRegex(queryToTest, "i")
          file.name.match regexp
        )
      )
    else
      regexp = new RegExp(query, "i")
      return _.filter(files, (file) -> file.name.match regexp)

  getFiles: (params) ->
    if !params?
      params = _.defaults(@opts.params, {
        include:
          license: true
          user: true
          org: true
      })

    @busy(true)
    Precision.api('/api/list_files', params, (files) =>
      @files(_.map(files, (file) =>
        new FileModel(file, this)
      ))
    ).always(=>
      @busy(false)
    )

  open: (inputModel, value, params) =>
    @inputModel(inputModel)

    @getFiles(params).done(() =>
      @modal.modal('handleUpdate')

      # Since getFiles creates new FileModels, our existing selection is considered a different object
      # So we need to go through all the files to find our selection
      if value?
        files = @files.peek()
        if !_.isArray(value)
          foundValue = _.find(files, (file) -> file.uid == value.uid)
        else
          foundValue = _.map(value, (v) -> _.find(files, (file) -> file.uid == v.uid))
        @selected(foundValue)
    )
    @modal.modal('show')

  save: () =>
    value = @selected()
    inputModel = @inputModel.peek()
    inputModel.value(value)
    inputModel.licenseToAccept(value.license) if value.license? && value.user_license?.unset
    @modal.modal('hide')

class FileModel
  constructor: (file, @selectorModel) ->
    @uid = file.uid
    @name = file.name
    @scope = file.scope
    @scopeIcon = if file.scope == "public" then "fa fa-fw fa-globe" else "fa fa-fw fa-lock"
    @path = file.path
    @license = file.license
    @license_accepted = file.user_license.accepted
    @license_pending = file.user_license.pending
    @license_unset = file.user_license.unset
    @user = file.user
    @org = file.org

    @type = @selectorModel.type()

  onSelect: () =>
    @selectorModel.save() if @type == 'radio'


window.Precision ||= {}
window.Precision.models ||= {}
window.Precision.models.FilesSelectorModel = FilesSelectorModel
