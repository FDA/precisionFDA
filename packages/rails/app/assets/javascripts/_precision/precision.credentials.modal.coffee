class AuthCredentialsModal
  hideModal: () ->
    @modal.modal('hide')

  showModal: () ->
    @modal.modal('show')

  onPasswordInputValue: (root, e) =>
    @passwordInputValue(e.target.value)

  onOtpInputValue: (root, e) =>
    @otpInputValue(e.target.value)

  constructor: (@modalAction) ->
    @modal = $('#auth_credentials_modal')
    @isLoading = ko.observable(false)
    @passwordInputValue = ko.observable('')
    @otpInputValue = ko.observable('')

    @enableButton = ko.computed( () => @passwordInputValue().length and @otpInputValue().length)

    @modal.on 'hidden.bs.modal', () =>
      @isLoading(false)
      @passwordInputValue('')
      @otpInputValue('')
      $('#auth_credentials_modal_cridentials_input').val('')
      $('#auth_credentials_modal_opts_input').val('')

    $("[data-toggle=popover]").popover()


window.Precision ||= {}
window.Precision.AuthCredentialsModal = AuthCredentialsModal
