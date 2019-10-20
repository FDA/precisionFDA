COUNTRY_INPUT = '#invitation_country_id'
STATE_SELECT = '#invitation_us_state'
COUNTRY_CODE_SELECT = '#invitation_phone_country_id'
PHONE_CONFIRMED_INPUT = '#invitation_phone_confirmed'

class RequestAccessPageView
  showConfirmPhoneModal: (root, e) ->
    e.preventDefault()
    @phoneConfirm.requestCode(root, e)

  phoneInputOnChange: (value = '') =>
    @phoneInputValue(value)
    @isPhoneInputValid(@phoneInput.validate(@phoneCountryCodeValue()))
    # @phoneConfirmed(false)

  showOrgAdminAgreement: () ->
    if @adminOrgChecked()
      @noOrgChecked(false)
      @adminOrgModal.modal('show')
    else
      @adminOrgAgreed(false)

  noOrgOnChange: (root, e) ->
    e.preventDefault()
    @adminOrgChecked(false)

  orgAdminAcceptAgreement: (root, e) ->
    e.preventDefault()
    @adminOrgAgreed(true)
    @adminOrgModal.modal('hide')

  constructor: (organizationAdmin = false) ->
    @phoneInputValue = ko.observable('')
    @phoneConfirmed = ko.observable(true)
    @phoneCountryCodeValue = ko.observable('')
    @isPhoneInputValid = ko.observable(false)
    @phoneFullValue = ko.computed( =>
      # @phoneConfirmed(false)
      return "#{@phoneCountryCodeValue().replace(/\s+/g, '')}#{@phoneInputValue()}"
    )

    @phoneConfirm = new Precision.ConfirmPhoneModal(
      @phoneInputValue,
      @phoneCountryCodeValue,
      @phoneConfirmed
    )
    @phoneInput = new Precision.PhoneInput($('#invitation_phone')[0], {
      onChange: @phoneInputOnChange
    })

    @disableConfirmPhoneButton = ko.computed(() =>
      return !@isPhoneInputValid() or !@phoneCountryCodeValue().length
    )
    @showConfirmPhoneButton = ko.computed( => @phoneInputValue().length and !@phoneConfirmed())

    ### Org Adm Agreement ###
    @adminOrgModal = $('#admin_org_agreement_modal')
    @noOrgChecked = ko.observable(false)
    @adminOrgChecked = ko.observable(organizationAdmin)
    @adminOrgModalAgreementRead = ko.observable(true)
    @adminOrgAgreed = ko.observable(false)
    @adminOrgEnableButton = ko.computed( => @adminOrgModalAgreementRead())
    @adminOrgModal.on 'hidden.bs.modal', () =>
      @adminOrgChecked(@adminOrgAgreed())
    ### Don't remove following code. We'll need it when we've got ageement text ###
    # @adminOrgModal.on 'shown.bs.modal', () =>
    #   @adminOrgModal.find('.modal-body').first().scrollTop(0)
    #   @adminOrgModalAgreementRead(false)
    # @adminOrgModal.find('.modal-body').first().on 'scroll', (e) =>
    #   elem = $(e.currentTarget)
    #   if elem[0].scrollHeight - elem.scrollTop() <= elem.outerHeight() + 10
    #     @adminOrgModalAgreementRead(true)
    ### Don't remove code above. We'll need it when we've got ageement text ###
    ### Org Adm Agreement ###

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

isFormValid = () ->
  $("#new_invitation :required").toArray().every (el) ->
    el.validity.valid

MainController = Paloma.controller('Main', {
  request_access: ->
    $container = $("body main")
    phone_confirmed = if @params.phone_confirmed == 'true' then true else false
    organization_admin = if @params.organization_admin == '1' then true else false
    viewModel = new RequestAccessPageView(organization_admin)
    ko.applyBindings(viewModel, $container[0])

    $container.on "click", ".accessible-btn-success", (e) ->
      if !viewModel.phoneConfirmed()
        Precision.alert.showAboveAll('Confirm phone number, please!')
        return false

      if isFormValid()
        e.preventDefault()
        $(PHONE_CONFIRMED_INPUT).val(viewModel.phoneConfirmed())
        $("#confirm-request-access-modal").modal()

    $(COUNTRY_INPUT).on 'change', (e) =>
      e.preventDefault()
      value = e.target.value
      $state = $(STATE_SELECT)
      $code = $(COUNTRY_CODE_SELECT)

      code = Precision.utils.findCountryCode(@params.country_codes, value)
      $code.find('option').each (i, option) ->
        if option.label == code
          $code.val(option.value)
          $code.trigger('change')

      if value == @params.usa_id.toString()
        $state.attr('required', 'required')
        $state.removeAttr('disabled')
      else
        $state.removeAttr('required')
        $state.attr('disabled', 'disabled')

    $(COUNTRY_CODE_SELECT).on 'change', (e) ->
      option = $(e.target).find("[value=\"#{e.target.value}\"]")
      v = viewModel
      v.phoneCountryCodeValue(option[0].label) if option and option[0]
      v.isPhoneInputValid(v.phoneInput.validate(v.phoneCountryCodeValue()))

    $(COUNTRY_INPUT).trigger('change')

    ### This is for turning off sms verification for some time ###
    # viewModel.phoneConfirmed(phone_confirmed)
    viewModel.phoneConfirmed(true)
})
