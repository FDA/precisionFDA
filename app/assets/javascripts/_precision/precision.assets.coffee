class AssetsModel
  constructor: () ->
    @loading = ko.observable(false)
    @query = ko.observable()
    @assets = ko.observableArray()
    @assets.searchedIDs = ko.observableArray()
    @assets.filtered = ko.computed(=>
      assets = @assets()
      query = @query()
      if query?
        assetsSearchIDs = @assets.searchedIDs()
        if assetsSearchIDs.length
          return _.filter(assets, (asset) -> _.includes(assetsSearchIDs, asset.dxid))
        else
          regexp = new RegExp(query, "i")
          return _.filter(assets, (asset) -> asset.name.match regexp)
      else
        return assets
    )
    @assets.selected = ko.observableArray()
    @assets.saved = ko.observableArray()

    @isQuerySearchable = ko.computed(=>
      return @query()?.length >= 3
    )

    @assets.filtered.subscribe((filtered) ->
      $('.assets-modal').modal('handleUpdate')
    )

  createAssetModels: (assets) =>
    _.map(assets, (asset) -> new AssetModel(asset))

  getAssets: () =>
    @loading(true)
    Precision.api '/api/list_assets', {}, (assets) =>
      @loading(false)
      @assets(@createAssetModels(assets))

  searchAssets: () =>
    @loading(true)
    Precision.api '/api/search_assets', {prefix: @query.peek()}, (result) =>
      @loading(false)
      @assets.searchedIDs(result.ids)

  setSelected: (selectedAssets) ->
    ids = _.map(selectedAssets, 'dxid')
    @assets.selected(_.filter(@assets.peek(), (asset) -> _.includes(ids, asset.dxid)))

  saveAssets: () =>
    @assets.saved(@assets.selected.peek())

class AssetModel
  constructor: (asset) ->
    @dxid = asset.dxid
    @name = asset.name
    @describe = ko.observable()

  getDescribe: () ->
    Precision.api '/api/describe_asset', {id: @id}, (describe) =>
      @describe(describe)

window.Precision ||= {}
window.Precision.models || = {}
window.Precision.models.AssetsModel = AssetsModel
