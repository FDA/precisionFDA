class AssetModel
  constructor: (asset) ->
    @id = asset.id
    @description = asset.description
    @descriptionDisplay = Precision.md.render(@description)

    @noteAttachModel = new Precision.models.NoteAttachModel(@id, 'UserFile')
    
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
