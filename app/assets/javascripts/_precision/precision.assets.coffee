class AssetsModel
  constructor: () ->
    @loading = ko.observable(false)
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
        @searchAssets()
      else
        @assets.searchedIDs([])
    )

  createAssetModels: (assets) =>
    _.map(assets, (asset) -> new AssetModel(asset))

  getAssets: () =>
    @loading(true)
    Precision.api '/api/list_assets', {}, (assets) =>
      @loading(false)
      @assets(@createAssetModels(assets))

  searchAssets: _.debounce(() ->
    Precision.api '/api/search_assets', {prefix: @query.peek()}, (result) =>
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

  clearQuery: () =>
    @query("")

class AssetModel
  constructor: (asset) ->
    @dxid = asset.dxid
    @name = asset.name
    @describe = ko.observable()

  getDescribe: () ->
    if _.isEmpty(@describe.peek())
      Precision.api '/api/describe_asset', {id: @dxid}, (describe) =>
        @describe(describe)
        $('.assets-modal').modal('handleUpdate')


window.Precision ||= {}
window.Precision.models || = {}
window.Precision.models.AssetsModel = AssetsModel
