class AssetsModel
  constructor: () ->
    @loading = ko.observable(false)
    @refreshing = ko.observable(false)
    @query = ko.observable()
    @assets = ko.observableArray()
    @assets.searchedIDs = ko.observableArray()
    @assets.filtered = ko.computed(=>
      assets = @assets()
      query = @query()
      if !_.isEmpty(query)
        assetsSearchIDs = @assets.searchedIDs()
        if assetsSearchIDs.length
          return _.filter(assets, (asset) -> _.includes(assetsSearchIDs, asset.dxid))
        else
          return _.filter(assets, (asset) -> asset.name.match(query))
      else
        return assets
    )
    @assets.selected = ko.observableArray()
    @assets.saved = ko.observableArray()

    @previewedAsset = ko.observable()

    @isQuerySearchable = ko.computed(=>
      return @query()?.length >= 3
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
      else
        @assets.searchedIDs([])
    )

  createAssetModels: (assets) =>
    _.map(assets, (asset) -> new AssetModel(asset))

  updateAssetModels: (assets) =>
    @assets(_.map(assets, (asset) -> new AssetModel(asset)))

  getAssets: () =>
    if !@loading()
      @loading(true)
      Precision.api '/api/list_assets', {}, (assets) =>
        @loading(false)
        @refreshing(false)
        @updateAssetModels(assets)
        @setSelected(@assets.selected.peek())

  refreshAssets: () ->
    @refreshing(true)
    @getAssets()

  searchAssets: _.debounce((query) ->
    Precision.api '/api/search_assets', {prefix: query}, (result) =>
      @loading(false)
      @previewedAsset(null)
      @assets.searchedIDs(result.ids)
  , 500)

  setSelected: (selectedAssets) ->
    ids = _.map(selectedAssets, 'dxid')
    @assets.selected(_.filter(@assets.peek(), (asset) -> _.includes(ids, asset.dxid)))

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
    @dxid = asset.dxid
    @name = asset.name
    @descriptionDisplay = ko.observable()
    @archiveEntries = ko.observableArray()
    @described = ko.observable(false)
    @loading = ko.observable(false)

  getDescribe: () ->
    if !@described.peek() && !@loading()
      @loading(true)
      Precision.api '/api/describe_asset', {id: @dxid}, (describe) =>
        @loading(false)
        @descriptionDisplay(Precision.md.render(describe.description))
        @archiveEntries(describe.archive_entries)
        @described(true)
        $('.assets-modal').modal('handleUpdate')


window.Precision ||= {}
window.Precision.models || = {}
window.Precision.models.AssetsModel = AssetsModel
