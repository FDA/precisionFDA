class LicenseModel
  constructor: (license) ->
    @id = license.id
    @title = ko.observable(license.title)
    @content = ko.observable(license.content)
    @content.preview = ko.computed(=>
      Precision.md.render(@content())
    )

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

LicensesController = Paloma.controller('Licenses',
  edit: ->
    $container = $("body main")

    licenseModel = new LicenseModel(@params.license)
    ko.applyBindings(licenseModel, $container[0])
)
