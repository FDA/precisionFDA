class LicenseModel
  constructor: (license) ->
    @id = license.id
    @licenseDisplay = Precision.md.render(license.content)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

LicensesController = Paloma.controller('Licenses',
  show: ->
    $container = $("body main")

    licenseModel = new LicenseModel(@params.license)
    ko.applyBindings(licenseModel, $container[0])
)
