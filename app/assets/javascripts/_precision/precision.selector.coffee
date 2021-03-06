# @opts
#   listModelConfigs (required): array of listModel configurations
#

MAX_OBJECTS = 20
FILES_NUM_HELP_TEXT = "You can select only #{MAX_OBJECTS} objects at the same time."

class SelectorModel
  addFilesScrollListener: () ->
    $('.object-selector-modal .modal-body').on 'scroll', (event) ->
      element = $(this).find('.tab-pane.active').find('.list-group').get(1)
      return unless element
      context = ko.contextFor(element)
      currentNumberOfObjects = context.$data.objects().length
      isFile = context.$data.className == 'file'
      scrolledDown = this.scrollTop == (this.scrollHeight - this.offsetHeight)
      notBusy = !context.$data.busy()
      notAllLoaded = currentNumberOfObjects != context.$data.totalCount
      if element && isFile && scrolledDown && notAllLoaded && notBusy
        context.$data.getObjects(currentNumberOfObjects)


  constructor: (@opts) ->
    @id = _.uniqueId('object-selector-modal-')
    @modal = null

    @title = ko.observable(@opts.title ? "Select data")
    @help = ko.observable(@opts.help)
    @useFileLimit = @opts.useFileLimit
    @selectionType = @opts.selectionType ? "checkbox"
    @selectableClasses = @opts.selectableClasses ? true
    @listRelatedParams = @opts.listRelatedParams

    @busy = ko.observable(false)
    @saving = ko.observable(false)
    @error = ko.observable()

    @filterByOwned = ko.observable(false)

    @calls = []
    @callsDeferred = $.Deferred()

    @selectedList = new ObjectListModel(this, {
      className: "selected"
      name: "Selected"
    })
    @selected = @selectedList.objects
    @numSelected = ko.computed( =>
      if _.isArray(@selected())
        _.size(@selected())
      else if _.isObject(@selected())
        return 1
    )

    @objectLists = ko.observableArray([@selectedList].concat(_.map(@opts.listModelConfigs, (listModelConfig) =>
      new ObjectListModel(this, listModelConfig)
    )))

    @filesNumhelp = ko.computed(() =>
      "#{FILES_NUM_HELP_TEXT} #{@numSelected()} object(s) selected."
    )

    @objectsHash = {}

    @canSave = ko.computed(=>
      !@busy() && !@saving() && !_.isEmpty(@selected())
    )

    @hasError = ko.computed(=>
      @error()?
    )

  getParentTypeFromContext: (context, type) ->
    return _.find(context.$parents, (parent) ->
      parent instanceof type
    )

  getObjectLists: () ->
    @busy(true)
    _.each(@objectLists.peek(), (listModel) =>
      @calls.push(listModel.getObjects()) if listModel.className != "selected"
    )

    $.when(this, @calls).always(() =>
      @callsDeferred.resolve()
      @busy(false)
    )

  reset: () =>
    @busy(false)
    @saving(false)
    @error(null)
    _.each(@calls, (call) -> call.abort())
    @calls = []
    @objectsHash = {}
    @callsDeferred = $.Deferred()

  open: () =>
    @modal = $("##{@id}")
    @modal.on('hidden.bs.modal', =>
      @modal.off()
      if @selectionType == "radio"
        @selected(null)
      else
        @selected([])
      @error(null)
    )
    @modal.on("click", ".object-related-link, .list-group-item.not-selectable label", () ->
      objectModel = ko.dataFor(this)
      context = ko.contextFor(this)
      objectModel.getRelatedObjects(context)
    )

    if _.size(@objectsHash) == 0
      @reset()
      @getObjectLists()
      .done(() =>
        @modal.modal('handleUpdate')
        @modal.find(".nav-pills li:first-child a").click()
      )
      .fail(@onError)
    @modal.modal('show')

  save: () =>
    @saving(true)
    @error(null)
    @opts.onSave(@selected())
      .done((data, hideModal = true) =>
        if hideModal
          @modal.modal('hide')
          @saving(false)
        @opts.onAfterSave?()
      )
      .fail(() =>
        @onError()
        @saving(false)
      )

  onError: (e) =>
    console.error(e.status, e.statusText, e.responseText)
    if e.responseText? && _.isObject(e.responseText)
      errorObject = JSON.parse e.responseText
      @error(errorObject.error)
    else
      @error({
        type: "#{e.status}: #{e.statusText}"
        message: "An unknown error occured. Please contact support at precisionfda-support@dnanexus.com"
      })

class ObjectListModel
  setFilterQuery: (root, e) ->
    @filterQuery(e.target.value)

  constructor: (@selectorModel, config) ->
    @className = config.className
    @name = config.name
    @apiEndpoint = config.apiEndpoint
    @apiParams = config.apiParams ? {}
    @selectable = config.selectable ? false
    @totalCount = 0

    @busy = ko.observable(false)

    @patternQuery = ko.observable(config.patterns)
    @filterQuery = ko.observable()
    @filterQueryOnInput = _.debounce(@setFilterQuery, 400)

    if @className == "selected" && @selectorModel.selectionType == "radio"
      @objects = ko.observable()
    else
      @objects = ko.observableArray()

    @objects.filtered = ko.computed(=>
      return [] if !@objects()?
      if @className == "selected" && @selectorModel.selectionType == "radio"
        objects = [@objects()]
      else
        objects = @objects()

      if @className != "selected"
        objects = @filterByProperty(objects, 'owned') if @selectorModel.filterByOwned()

      if @className == 'file' && @totalCount != @objects().length && !_.isEmpty(@filterQuery())
        @objects.removeAll()
        @getObjects(0, @totalCount)

      objects = @filterSetOfObjects(objects, @patternQuery()) if @patternQuery()?
      objects = @filterSetOfObjects(objects, @filterQuery())
      objects = _.sortBy(objects, 'name')
      return objects
    )
    @numFilteredObjects = ko.computed(=>
      @objects.filtered().length
    )

    @activeRelatedObjects = ko.observableArray().extend({ notify: 'always' })
    @isRelatedVisible = ko.computed(=>
      _.size(@activeRelatedObjects()) > 0
    )

  clearActiveRelated: () ->
    @activeRelatedObjects([])

  getObjects: (offset = 0, limit = 100) ->
    return $.Deferred().resolve() if !@apiEndpoint?
    accessibleScope = @selectorModel.listRelatedParams.scopes
    if @className == 'file'
      @apiParams['offset'] = offset
      @apiParams['limit'] = limit
      @apiParams['scopes'] = accessibleScope

    params = _.defaults(@apiParams, {
      describe: {
        include: {
          all_tags_list: false,
          user: true,
          org: true
        }
      }
    })

    @objects.removeAll() unless @className == 'file'
    @busy(true)
    Precision.api("/api/#{@apiEndpoint}", params, (result) =>
      @totalCount = result['count'] if result['count']
      objects = if result['objects'] then result['objects'] else result
      objectModels = _.map(objects, (object) =>
        objectModel = new ObjectItemModel(@selectorModel, this, object)
        @selectorModel.objectsHash[objectModel.uid] = objectModel
        objectModel
      )
      @objects(@objects().concat(objectModels))
    ).always(=>
      @busy(false)
    )

  filterByProperty: (objects, property) ->
    return _.filter(objects, (object) ->
      object[property].peek()
    )

  filterSetOfObjects: (objects, query) ->
    return objects if _.isEmpty(query)

    if _.isArray(query)
      return _.filter(objects, (object) ->
        _.some(query, (queryToTest) ->
          regexp = Precision.utils.globToRegex(queryToTest, "i")
          object.title.peek().match(regexp) || _.some(object.all_tags_list.peek(), (tag) -> tag.match(regexp))
        )
      )
    else
      regexp = new RegExp(query, "i")
      return _.filter(objects, (object) ->
        object.title.peek().match(regexp) || _.some(object.all_tags_list.peek(), (tag) -> tag.match(regexp))
      )

class ObjectItemModel
  constructor: (@selectorModel, @listModel, object, opts = {}) ->
    @loaded = ko.observable(false)
    @selected = @selectorModel.selected
    @selectionType = @selectorModel.selectionType
    @selectableClasses = @selectorModel.selectableClasses

    @id = object.id
    @uid = object.uid

    @title = ko.observable(object.title)
    @className = ko.observable(object.className || object.klass)
    @classIcon = ko.observable("fa fa-fw #{object.fa_class}")
    @scope = ko.observable(object.scope)

    @path = ko.observable(object.path)
    @parentFolderName = ko.observable(object.parent_folder_name)
    @filePath = ko.observable(@sanitizeFilePath(object.file_path))
    @userName = ko.observable(object.user?.full_name)
    @orgName = ko.observable(object.org?.name)
    @all_tags_list = ko.observable(object.all_tags_list)

    @owned = ko.observable(object.owned)
    @editable = ko.observable(object.editable)
    @accessible = ko.observable(object.accessible)
    @public = ko.observable(object.public)
    @private = ko.observable(object.private)
    @in_space = ko.observable(object.in_space)
    @review_space_private = object.space_private
    @review_space_public = object.space_public

    @showFolderName = ko.computed(=>
      if @owned() || (!@owned() && @in_space())
        return true
      else
        return false
    )
    @scopeFormatted = ko.computed(=>
      if @public()
        "Public"
      else if @private()
        "Private"
      else if @review_space_private
        "Shared in Space(Confidential)"
      else if @review_space_public
        "Shared in Space(Cooperative)"
      else if @in_space()
        "Shared in Space"
    )
    @scopeIcon = ko.computed(=>
      if @public()
        "fa fa-fw fa-globe"
      else if @private()
        "fa fa-fw fa-lock"
      else if @in_space()
        "fa fa-fw fa-object-group"
    )

    @activeRelatedObjects = @listModel.activeRelatedObjects

    @relatedObjects = ko.observable().extend({ notify: 'always' })
    @numRelatedObjects = ko.computed(=> _.size(@relatedObjects()))

    @loadingRelated = ko.observable(false)
    @loadedRelated = ko.observable(false)

    @license = ko.observable(object.license)
    @user_license = ko.observable(object.user_license)
    @user_license.accepted = ko.computed(=> @user_license()?.accepted)
    @user_license.pending = ko.computed(=> @user_license()?.pending)
    @user_license.unset = ko.computed(=> @user_license()?.unset)

    @isSelectable = ko.computed( =>
      isArray = _.isArray(@selectableClasses)
      @selectableClasses == true || (isArray && _.includes(@selectableClasses, @className()))
    )

    @disabledToCheck = ko.computed(() =>
      if @selectionType == 'checkbox'
        selected = @selected.indexOf(this) > -1
        maxObjectsSelected = @selectorModel.numSelected() == MAX_OBJECTS
        useFileLimit = @selectorModel.useFileLimit
        return maxObjectsSelected and !selected and useFileLimit
      return false
    )

    if opts.update
      @describe().done((item) =>
        @update(item)
      )
    else
      @loaded(true)

  sanitizeFilePath: (filePath) ->
    if filePath && filePath.length > 1 then filePath.replace(/\/$/, "") else filePath

  update: (object) ->
    @title(object.title)
    @className(object.className || object.klass)
    @classIcon("fa fa-fw #{object.fa_class}")
    @scope(object.scope)
    @path(object.path)
    @userName(object.user?.full_name)
    @orgName(object.org?.name)
    @owned(object.owned)
    @editable(object.editable)
    @accessible(object.accessible)
    @public(object.public)
    @private(object.private)
    @in_space(object.in_space)
    @license(object.license)
    @user_license(object.user_license)
    @all_tags_list(object.all_tags_list)

    @loaded(true)

  describe: () ->
    params = _.defaults(@listModel.apiParams, {
      uid: @uid,
      describe: {
        include: {
          all_tags_list: true,
          user: true,
          org: true
        }
      }
    })
    Precision.api("/api/describe", params)

  getRelatedObjects: (context) ->
    listModel = @selectorModel.getParentTypeFromContext(context, ObjectListModel)
    return if !listModel?

    if !@loadedRelated()
      @loadingRelated(true)
      @selectorModel.callsDeferred.done( =>
        params = {
          uid: @uid,
          opts: _.extend({
            describe: {
              include: {
                all_tags_list: true,
                user: true,
                org: true
              }
            }
          }, @selectorModel.listRelatedParams)
        }
        Precision.api("/api/list_related", params)
          .done((objects) =>
            relatedObjects = []
            _.each(objects, (object) =>
              if @selectorModel.objectsHash[object.uid]?
                relatedObjects.push(@selectorModel.objectsHash[object.uid])
              else
                newObjectModel = new ObjectItemModel(@selectorModel, this, object)
                @selectorModel.objectsHash[newObjectModel.uid] = newObjectModel
                relatedObjects.push(newObjectModel)
            )
            @relatedObjects(relatedObjects)
            listModel.activeRelatedObjects(@relatedObjects()) if _.size(@relatedObjects()) > 0
          )
          .fail(@selectorModel.onError)
          .always(() =>
            @loadingRelated(false)
            @loadedRelated(true)
          )
      )
    else if @numRelatedObjects() > 0
      listModel.activeRelatedObjects(@relatedObjects())

window.Precision ||= {}
window.Precision.models ||= {}
window.Precision.models.SelectorModel = SelectorModel
window.Precision.models.ObjectItemModel = ObjectItemModel