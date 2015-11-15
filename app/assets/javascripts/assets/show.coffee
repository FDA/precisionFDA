class AssetModel
  constructor: (asset) ->
    @descriptionDisplay = Precision.md.render(asset.description)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AssetsController = Paloma.controller('Assets')
AssetsController::show = ->
  $container = $("body main")

  assetModel = new AssetModel(@params.asset)
  ko.applyBindings(assetModel, $container[0])
