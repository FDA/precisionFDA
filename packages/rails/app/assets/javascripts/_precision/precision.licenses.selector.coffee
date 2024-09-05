class LicensesSelectorModel
  constructor: (options) ->
    @busy = ko.observable(false)
    @licensesToAccept = ko.observableArray()
    @licensesAccepted = ko.observableArray()
    @licensesAccepted.cache = ko.observableArray()
    @previewedLicense = ko.observable()

    @selectableLicensesToAccept = ko.computed(=>
      _.filter(@licensesToAccept(), (l) -> l.selectable)
    )

    @areSelectableLicensesSelected = ko.computed(=>
      selectableSize = _.size(@selectableLicensesToAccept())
      _.size(@licensesAccepted.cache()) == selectableSize && selectableSize > 0
    )

    @areAllLicensesAccepted = ko.computed(=>
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
      for license_to_set in licenses_to_set
        license_map[license_to_set.license.id] ?= license_to_set

      _.each(license_map, (l) =>
        @licensesToAccept.push(new LicenseModel(l.license, l.user_license))
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
        @onAcceptCallback() if @areAllLicensesAccepted()
        return rs
      )
      .fail((error) =>
        @busy(false)
        alert "Licenses could not be accepted: #{error.statusText}"
        console.error error
      )

class LicenseModel
  constructor: (license, userLicense) ->
    @id = license.id
    @uid = license.uid
    @approvalRequired = license.approval_required

    @licensePath = "/licenses/#{@id}"
    @requestApprovalPath = if @approvalRequired then "#{@licensePath}/request_approval" else @licensePath

    @title = ko.observable(license.title ? "Loading...")
    @content = ko.observable(license.content ? "Loading...")
    @contentHTML = ko.computed(=>
      if !@content()?
        "No license content to display"
      else
        Precision.md.render(@content())
    )

    @userLicense = new UserLicenseModel(userLicense)

    @selectable = !@approvalRequired

    if !license.title? || !license.content?
      Precision.api('/api/describe', {uid: @uid})
        .done((rs) =>
          @title(rs.title)
          @content(rs.content)
        )

class UserLicenseModel
  constructor: (userLicense) ->
    @active = userLicense?.active ? false
    @pending = userLicense?.pending ? false
    @unset = userLicense?.unset ? true

window.Precision ||= {}
window.Precision.models ||= {}
window.Precision.models.LicenseModel = LicenseModel
window.Precision.models.LicensesSelectorModel = LicensesSelectorModel
