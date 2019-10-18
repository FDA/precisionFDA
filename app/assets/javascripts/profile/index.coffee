COUNTRY_SELECT = '#profile_country_id'
US_STATE = '#profile_us_state'
# PHONE_COUNTRY_CODE = '#profile_phone_phone_country_id'
PHONE_COUNTRY_CODE = '#profile_phone_country_id'
PHONE_INPUT = '#profile_phone'

getCountryId =  (vals) -> if vals.country then vals.country.id else ''
getCountryName =  (vals) -> if vals.country then vals.country.name else ''
getCountryCode =  (vals) -> if vals.phone_country then vals.phone_country.dial_code else ''
getCountryCodeId =  (vals) -> if vals.phone_country then vals.phone_country.id else ''

class ProfileContactsModel
  setDefaults: (continueEditing) =>
    vals = @contactsDefaults()

    @country(getCountryId(vals))
    @countryName(getCountryName(vals))
    $(COUNTRY_SELECT).trigger('change')

    @email(vals.email || '')
    @emailConfirmed(vals.email_confirmed || '')
    @address1(vals.address1 || '')
    @address2(vals.address2 || '')
    @city(vals.city || '')
    @postalCode(vals.postal_code || '')
    @phoneCountryCodeValue(getCountryCode(vals))
    @phoneInput.setValue(vals.phone || '')
    @phoneInputValue(vals.phone || '')
    @isPhoneInputValid(@phoneInput.validate(@phoneCountryCodeValue()))

    @state(vals.us_state || '')
    @phoneCountryCode(getCountryCodeId(vals))
    # @phoneConfirmed(vals.phone_confirmed)
    @phoneConfirmed(true)

    @isLoading(false)
    if !continueEditing
      @isEditing(false)
      @pristin(true)

  showForm: (root, e) =>
    e.preventDefault()
    @isEditing(true)

  hideForm: (root, e) =>
    e.preventDefault()
    @isEditing(false)
    @pristin(true)
    @setDefaults()

  validateForm: () ->
    valid = true
    $rows = @contactsForm.find('.form-group.required')
    $rows.each((index, row) ->
      $(row).find('input').each((index, input) ->
        if input.validity.valid
          $(row).removeClass('has-error')
        else
          $(row).addClass('has-error')
          valid = false
      )
      $(row).find('select').each((index, select) ->
        if select.validity.valid
          $(row).removeClass('has-error')
        else
          $(row).addClass('has-error')
          valid = false
      )
    )
    return valid

  isEmailChaged: () -> @email().toLowerCase() != @contactsDefaults().email.toLowerCase()

  updateData: (root, e) =>
    e.preventDefault()
    if @isEmailChaged()
      @authCredentialsModal.showModal() if @validateForm()
    else
      @sendRequest(root, e)

  sendRequest: (root, e) =>
    e.preventDefault()
    if @validateForm()

      data = @contactsForm.serializeArray()
      state = data.filter (param) -> param.name == 'profile[us_state]'
      data.push({ name: 'profile[us_state]', value: null }) if !state.length

      if @isEmailChaged()
        @authCredentialsModal.isLoading(true)
        data.push({ name: 'password', value: @authCredentialsModal.passwordInputValue() })
        data.push({ name: 'otp', value: @authCredentialsModal.otpInputValue() })
      else
        @isLoading(true)

      $.ajax({
        method: 'PUT',
        url: '',
        contentType: 'multipart/form-data',
        data: data,
        success: (data) =>
          message = 'Data successfully updated!'

          if @isEmailChaged()
            message = 'Your email will be updated once the verification link sent to the new email address has been verified<br>'
            message += 'All other contact information has been updated'

          Precision.alert.showAboveAll(message, 'alert-success')
          @contactsDefaults(data)
          @setDefaults()
          @authCredentialsModal.isLoading(false)
          @authCredentialsModal.hideModal()
        error: (data) =>
          try
            errors = JSON.parse(data.responseText)
            errorText = ''
            for field, error of errors
              if field == 'error' and typeof error == 'object'
                errorText += "<b>#{error.type || ''}: </b>#{error.message || ''}<br>"
              else
                errorText += "<b>Error: </b>#{field} #{error}<br>"
            Precision.alert.showAboveAll(errorText)
          catch
            Precision.alert.showAboveAll('Something went wrong.')
          finally
            @isLoading(false)
            @authCredentialsModal.isLoading(false)
      })

  phoneInputOnChange: (value = '') =>
    @phoneInputValue(value)
    @isPhoneInputValid(@phoneInput.validate(@phoneCountryCodeValue()))
    # @phoneConfirmed(false)

  saveMobilePhone: (phoneModal) =>
    if @phoneConfirmed()
      @isLoading(true)
      $.ajax({
        method: 'PUT',
        url: '',
        contentType: 'multipart/form-data',
        data: {
          profile: {
            phone: @phoneInputValue(),
            phone_country_id: @phoneCountryCode()
            phone_confirmed: true
          }
        },
        success: (data) =>
          Precision.alert.showAboveAll('Phone successfully verified and saved!', 'alert-success')
          phoneModal.modal.modal('hide')
          @contactsDefaults(data)
          @setDefaults(true)
        error: (data) =>
          try
            errors = JSON.parse(data.responseText)
            errorText = ''
            for field, error of errors
              errorText += "<b>Error: </b>#{field} #{error}<br>"
            Precision.alert.showAboveAll(errorText)
          catch
            Precision.alert.showAboveAll('Something went wrong.')
          finally
            phoneModal.modal.modal('hide')
            phoneModal.isLoading(false)
            @isLoading(false)
      })

  showCredentialsModal: (root, e) ->
    e.preventDefault()
    @authCredentialsModal.showModal()

  constructor: (params, contactsDefaults = {}) ->
    @contactsForm = $('#profile_form')
    @phoneForm = $('#profile_phone_form')
    @isEditing = ko.observable(false)
    @isLoading = ko.observable(false)
    @pristin = ko.observable(true)
    @contactsDefaults = ko.observable(contactsDefaults)

    @address1 = ko.observable('')
    @address2 = ko.observable('')
    @city = ko.observable('')
    @country = ko.observable('')
    @countryName = ko.observable('')
    @state = ko.observable('')
    @postalCode = ko.observable('')

    ### Email Edit ###
    @authCredentialsModal = new Precision.AuthCredentialsModal(@sendRequest)
    @email = ko.observable('')
    @emailConfirmed = ko.observable(false)
    ### Email Edit ###

    ### Phone ###
    @phoneInputValue = ko.observable('')
    @phoneConfirmed = ko.observable(true)
    @phoneCountryCode = ko.observable('')
    @phoneCountryCodeValue = ko.observable('')
    @isPhoneInputValid = ko.observable(false)
    @phoneFullValue = ko.computed( =>
      # @phoneConfirmed(false)
      return "#{@phoneCountryCodeValue().replace(/\s/g, '')}#{@phoneInputValue()}"
    )

    @phoneInput = new Precision.PhoneInput($(PHONE_INPUT)[0], {
      onChange: @phoneInputOnChange
    })

    @disableConfirmPhoneButton = ko.computed(() =>
      return !@isPhoneInputValid() or !@phoneCountryCodeValue().length
    )
    @showConfirmPhoneButton = ko.computed( => @phoneInputValue().length and !@phoneConfirmed())
    ### Phone ###

    @contactsForm.on 'input', (e) =>
      $(e.target).parent().parent().removeClass('has-error')
      @pristin(false)

    @emailLabel = ko.computed(=> @email())
    @address1Label = ko.computed(=> @address1())
    @address2Label = ko.computed(=> @address2())
    @cityLabel = ko.computed(=>
      country = if @country() then "#{@countryName()}, " else ''
      state = if @state() then "#{@state()}, " else ''
      city = if @city() then "#{@city()}, " else ''
      postalCode = if @postalCode() then "#{@postalCode()}" else ''
      return "#{country}#{state}#{city}#{postalCode}"
    )
    @phoneLabel = ko.computed(=> "#{@phoneCountryCodeValue()} #{@phoneInputValue()}")

    $(COUNTRY_SELECT).on 'change', (e) ->
      e.preventDefault()
      value = e.target.value
      $state = $(US_STATE)
      $code = $(PHONE_COUNTRY_CODE)

      code = Precision.utils.findCountryCode(params.country_codes, value)
      $code.find('option').each (i, option) ->
        if option.label == code
          $code.val(option.value)
          $code.trigger('change')

      if value == params.usa_id.toString()
        $state.attr('required', 'required')
        $state.removeAttr('disabled')
      else
        $state.removeAttr('required')
        $state.attr('disabled', 'disabled')
        $state.val('')

    $(PHONE_COUNTRY_CODE).on 'change', (e) =>
      option = $(e.target).find("[value=\"#{e.target.value}\"]")
      @phoneCountryCodeValue(option[0].label) if option and option[0]
      @isPhoneInputValid(@phoneInput.validate(@phoneCountryCodeValue()))

    @setDefaults()

class ProfilePageView
  showConfirmPhoneModal: (root, e) ->
    e.preventDefault()
    @phoneConfirm.requestCode(root, e)

  showEditOrgNameModal: (root, e) ->
    e.preventDefault()
    @editOrgNameModalValue(@orgNameValue.text())
    @editOrgNameModal.modal('show')

  showDeactivateUserModal: (root, e) ->
    dxuser = $(e.currentTarget).attr('data-dxuser')
    @deactivateUserModal.showModal(dxuser)

  showRemoveUserModal: (root, e) ->
    user = $(e.currentTarget).attr('data-user')
    org = $(e.currentTarget).attr('data-org')
    @removeUserModal.showModal(user, org)

  changeOrgName: () ->
    if @editOrgNameModalValue() and @editOrgNameModalValue().length
      @editOrgNameModalIsLoading(true)
      $.ajax({
        method: 'PUT',
        url: '/org'
        contentType: 'multipart/form-data',
        data: {
          org: {
            name: @editOrgNameModalValue(),
          }
        },
        success: (data) =>
          Precision.alert.showAboveAll('Organization name successfully updated!', 'alert-success')
          @orgNameValue.text(@editOrgNameModalValue())
          @editOrgNameModal.modal('hide')
          @editOrgNameModalIsLoading(false)
        error: (data) =>
          try
            errors = JSON.parse(data.responseText)
            errorText = ''
            for field, error of errors
              errorText += "<b>Error: </b>#{field} #{error}<br>"
            Precision.alert.showAboveAll(errorText)
          catch
            Precision.alert.showAboveAll('Something went wrong.')
          finally
            @editOrgNameModalIsLoading(false)
      })

  editOrgNameModalValueOnChange: (root, e) ->
    @editOrgNameModalValue(e.target.value)

  showLeaveOrgModal: (root, e) ->
    @leaveOrgModal.modal('show')

  closeLeaveOrgModal: (root, e) ->
    @leaveOrgModal.modal('hide')

  showDissolveOrgModal: (root, e) ->
    @dissolveOrgModal.modal('show')

  closeDissolveOrgModal: (root, e) ->
    @dissolveOrgModal.modal('hide')

  createLeaveOrgRequest: (root, e) =>
    $.ajax({
      method: "POST",
      url: "/org_requests/leave",
      data: {
        id: @orgId,
      },
      success: () =>
        window.location = '/profile'
      error: (data) =>
        @createLeaveOrgRequestButtonDisabled(false)
        try
          errors = JSON.parse(data.responseText)
          errorText = ''
          for field, error of errors
            errorText += "<b>Error: </b>#{field} #{error}<br>"
          Precision.alert.showAboveAll(errorText)
        catch
          Precision.alert.showAboveAll('Something went wrong.')
      beforeSend: () =>
        @createLeaveOrgRequestButtonDisabled(true)
    })

  createDissolveOrgRequest: (root, e) =>
    $.ajax({
      method: "POST",
      url: "/org_requests/dissolve",
      data: {
        id: @orgId,
      },
      success: () =>
        window.location = '/profile'
      error: (data) =>
        @createDissolveOrgRequestButtonDisabled(false)
        try
          errors = JSON.parse(data.responseText)
          errorText = ''
          for field, error of errors
            errorText += "<b>Error: </b>#{field} #{error}<br>"
          Precision.alert.showAboveAll(errorText)
        catch
          Precision.alert.showAboveAll('Something went wrong.')
      beforeSend: () =>
        @createDissolveOrgRequestButtonDisabled(true)
    })

  constructor: (params, contactsDefaults) ->
    @orgId = params.org_id
    @contacts = new ProfileContactsModel(params, contactsDefaults)
    @authCredentialsModal = @contacts.authCredentialsModal
    @phoneConfirm = new Precision.ConfirmPhoneModal(
      @contacts.phoneInputValue,
      @contacts.phoneCountryCodeValue,
      @contacts.phoneConfirmed,
      {
        onSuccessVerify: @contacts.saveMobilePhone
      }
    )

    ### Deactivate user###
    @deactivateUserModal = new Precision.DeactivateUserModal()
    ### Deactivate user###

    ### Remove user###
    @removeUserModal = new Precision.RemoveUserModal()
    ### Remove user###

    ### Edit Org Name ###
    @editOrgNameModal = $('#edit_org_name_modal')
    @orgNameValue = $('#organization_info_name')
    @editOrgNameModalIsLoading = ko.observable(false)
    @editOrgNameModalValue = ko.observable('')
    @editOrgNameModalButtonDisabled = ko.computed( =>
      return (!@editOrgNameModalValue() or !@editOrgNameModalValue().length)
    )
    ### Edit Org Name ###

    @leaveOrgModal = $('#leave_org_modal')
    @dissolveOrgModal = $('#dissolve_org_modal')
    @createLeaveOrgRequestButtonDisabled = ko.observable(false)
    @createDissolveOrgRequestButtonDisabled = ko.observable(false)
#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ProfileController = Paloma.controller('Profile', {
  index: ->
    ### Page Model ###
    $container = $("body main")
    viewModel = new ProfilePageView(@params, @params.profile)
    ko.applyBindings(viewModel, $container[0])
    ### Page Model ###
    $time_zone_select = $(".JS-TimeZone-selector")

    $time_zone_select.on('change', (e) ->
      return unless this.value
      Precision.api("/api/update_time_zone", { time_zone: this.value })
        .done((data) ->
          Turbolinks.visit(location.toString())
        ).fail((error) ->
          console.error(error)
        )
    )
})
