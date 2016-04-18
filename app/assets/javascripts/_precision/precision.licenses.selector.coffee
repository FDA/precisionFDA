class LicensesSelectorModel
  constructor: (options) ->
    @busy = ko.observable(false)
    @licensesToAccept = ko.observableArray()
    @licensesAccepted = ko.observableArray()
    @licensesAccepted.cache = ko.observableArray()
    @previewedLicense = ko.observable()

    @areAllLicensesSelected = ko.computed(=>
      _.size(@licensesAccepted.cache()) == _.size(@licensesToAccept())
    )

    @areLicensesAccepted = ko.computed(=>
      _.every(@licensesToAccept(), (licenseToAccept) =>
        _.some(@licensesAccepted(), (licenseAccepted) =>
          licenseToAccept.id == licenseAccepted.id
        )
      )
    )

    if options?
      @onAcceptCallback = options.onAcceptCallback

  setLicensesToAccept: (licenses_to_set) =>
    @licensesToAccept([])
    if _.size(licenses_to_set) > 0
      license_map = {}
      for license in licenses_to_set
        license_map[license.id] ?= license

      _.each(license_map, (license) =>
        @licensesToAccept.push(new LicenseModel(license))
      )

  previewLicense: (license) =>
    @previewedLicense(license)

  toggleLicensesModal: () ->
    @licensesAccepted.cache([])
    $('.license-modal').modal('toggle')

  acceptLicenses: () =>
    params =
      license_ids: _.map(@licensesAccepted.cache(), (license) -> license.id)
    @busy(true)
    Precision.api('/api/accept_licenses', params)
      .done((rs) =>
        @busy(false)
        @licensesAccepted(@licensesAccepted.cache.peek())
        @toggleLicensesModal()
        @onAcceptCallback()
        return rs
      )
      .fail((error) =>
        @busy(false)
        alert "Licenses could not be accepted: #{error.statusText}"
        console.error error
      )

class LicenseModel
  constructor: (license) ->
    @id = license.id
    @uid = license.uid
    @title = ko.observable(license.title ? "Loading...")
    @content = ko.observable(license.content ? "Loading...")
    @contentHTML = ko.computed(=>
      if !@content()?
        "No license content to display"
      else
        Precision.md.render(@content())
    )

    if !license.title? || !license.content?
      Precision.api('/api/describe', {uid: @uid})
        .done((rs) =>
          @title(rs.title)
          @content(rs.content)
        )

window.Precision ||= {}
window.Precision.models ||= {}
window.Precision.models.LicenseModel = LicenseModel
window.Precision.models.LicensesSelectorModel = LicensesSelectorModel
