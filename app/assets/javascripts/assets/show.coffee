class AssetModel
  constructor: (asset, license) ->
    @id = asset.id
    @descriptionDisplay = Precision.md.render(asset.description)
    @licenseDisplay = Precision.md.render(license?.content)

    @noteAttachModel = new Precision.models.NoteAttachModel(@id, 'UserFile')

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

AssetsController = Paloma.controller('Assets',
  show: ->
    $container = $("body main")

    assetModel = new AssetModel(@params.asset, @params.license)
    ko.applyBindings(assetModel, $container[0])

    $tabs = $container.find(".nav-tabs > li")
    if $tabs.length > 0 && !$tabs.hasClass("active")
      $tabs.first().find("a[data-toggle='tab']").trigger("click")

    $container.find('[data-toggle="tooltip"]').tooltip({
      container: 'body'
    })
)
