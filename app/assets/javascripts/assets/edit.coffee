class AssetModel
  constructor: (asset) ->
    @id = asset.id
    @description = ko.observable(asset.description)
    @description.preview = ko.computed(=>
      Precision.md.render(@description())
    )

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AssetsController = Paloma.controller('Assets')
AssetsController::edit = ->
  $container = $("body main")

  assetModel = new AssetModel(@params.asset)
  ko.applyBindings(assetModel, $container[0])
