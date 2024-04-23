class AssetsModel
  constructor: () ->
    @loading = ko.observable(false)
    @refreshing = ko.observable(false)
    @query = ko.observable()
    @assets = ko.observableArray()
    @assets.filtered = ko.computed(=>
      assets = @assets()
      query = @query()
      return assets
    )
    @assets.selected = ko.observableArray()
    @assets.saved = ko.observableArray()

    @previewedAsset = ko.observable()

    @isQuerySearchable = ko.computed(=>
      return @query()?.length >= 2
    )

    @isQueryEmpty = ko.computed(=>
      return @query()?.length == 0
    )

    @queryActionClasses = ko.computed(=>
      if @loading()
        return 'disabled'
      else if !_.isEmpty(@query())
        return 'btn-link-danger'
      else
        return 'disabled'
    )

    @queryIconClasses = ko.computed(=>
      if @loading()
        return 'fa fa-fw fa-spinner fa-spin'
      else if !_.isEmpty(@query())
        return 'fa fa-fw fa-times'
      else
        return 'fa fa-fw fa-search'
    )

    $(".assets-modal").on("click", ".item-asset", (e) =>
      @previewAsset(ko.dataFor(e.currentTarget))
    )

    @assets.filtered.subscribe((filtered) =>
      assetFound = _.first(@assets.filtered())
      @previewAsset(assetFound) if assetFound?
      $('.assets-modal').modal('handleUpdate')
    )

    @query.subscribe((query) =>
      if @isQuerySearchable()
        @loading(true)
        @searchAssets(query)
      else if @isQueryEmpty()
        @refreshAssets()
    )

  createAssetModels: (assets) =>
    _.map(assets, (asset) -> new AssetModel(asset))

  updateAssetModels: (assets) =>
    @assets(_.map(assets, (asset) -> new AssetModel(asset)))

  getAssets: () =>
    if !@loading()
      @loading(true)
      Precision.api(
        '/api/list_assets',
        { limit: 20 },
        (assets) =>
          @loading(false)
          @refreshing(false)
          @updateAssetModels(assets)
          @setSelected(@assets.selected.peek())
        (error) =>
          Precision.alert.showAboveAll('Error while loading assets list!')
          @loading(false)
          @refreshing(false)
      )

  refreshAssets: () ->
    @refreshing(true)
    @getAssets()

  searchAssets: _.debounce((query) ->
    Precision.api(
      '/api/search_assets',
      { keyword: query, limit: 20 },
      (assets) =>
        @loading(false)
        @refreshing(false)
        @updateAssetModels(assets)
        # @setSelected(@assets.selected.peek())
      (error) =>
        Precision.alert.showAboveAll('Error while assets search!')
        @loading(false)
    )
  , 500)

  setSelected: (selectedAssets) ->
    ids = _.map(selectedAssets, 'uid')
    @assets.selected(_.filter(@assets.peek(), (asset) -> _.includes(ids, asset.uid)))

  saveAssets: () =>
    @assets.saved(@assets.selected.peek())

  previewAsset: (assetModel) =>
    @previewedAsset(assetModel)
    assetModel.getDescribe()

  queryAction: () =>
    @clearQuery() if !_.isEmpty(@query())

  clearQuery: () =>
    @query("")

class AssetModel
  constructor: (asset) ->
    @uid = asset.uid
    @name = asset.title
    @descriptionDisplay = ko.observable()
    @archiveEntries = ko.observableArray()
    @described = ko.observable(false)
    @loading = ko.observable(false)

  getDescribe: () ->
    if !@described.peek() && !@loading()
      @loading(true)
      Precision.api '/api/describe', {uid: @uid}, (describe) =>
        @loading(false)
        @descriptionDisplay(Precision.md.render(describe.description))
        @archiveEntries(describe.file_paths)
        @described(true)
        $('.assets-modal').modal('handleUpdate')


window.Precision ||= {}
window.Precision.models ||= {}
window.Precision.models.AssetsModel = AssetsModel
