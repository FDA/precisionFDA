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

    @email(vals.email || '')
    @emailConfirmed(vals.email_confirmed || '')

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

  showCredentialsModal: (root, e) ->
    e.preventDefault()
    @authCredentialsModal.showModal()

  constructor: (params, contactsDefaults = {}) ->
    @contactsForm = $('#profile_form')
    @isEditing = ko.observable(false)
    @isLoading = ko.observable(false)
    @pristin = ko.observable(true)
    @contactsDefaults = ko.observable(contactsDefaults)

    ### Email Edit ###
    @authCredentialsModal = new Precision.AuthCredentialsModal(@sendRequest)
    @email = ko.observable('')
    @emailConfirmed = ko.observable(false)
    ### Email Edit ###


    @contactsForm.on 'input', (e) =>
      $(e.target).parent().parent().removeClass('has-error')
      @pristin(false)

    @emailLabel = ko.computed(=> @email())
    @setDefaults()

class ProfilePageView
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
