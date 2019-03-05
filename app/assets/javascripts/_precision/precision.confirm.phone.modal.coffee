class ConfirmPhoneModal
  codeInputOnKeyUp: (root, e) =>
    e.preventDefault()
    value = Precision.utils.digitsOnly(e.target.value).substr(0, 6)
    e.target.value = value
    @codeInputValue(value)

  hideModal: () ->
    @codeInputValue('')
    @modal.modal('hide')

  requestCode: (root, e) =>
    e.preventDefault()
    return false if !@phoneFullValue()
    @modal.modal('show')
    @isLoading(true)
    $.post('/phone_confirmations', { phone: @phoneFullValue() }).then(
      (data) =>
        @codeInputValue('')
        $('#confirm_phone_modal_input').val('')
        @isLoading(false)
      (error) =>
        console.log 'error', error
        Precision.alert.showAboveAll('Something went wrong!')
        @isLoading(false)
    )

  sendCode: () =>
    return false if !@phoneFullValue() or !@codeInputValue()
    @isLoading(true)
    $.get('/phone_confirmations/check_code', {
      phone: @phoneFullValue(),
      code: @codeInputValue()
    }).then(
      (data) =>
        @phoneConfirmedObservable(true)
        if typeof @options.onSuccessVerify == 'function'
          @options.onSuccessVerify(this)
        else
          Precision.alert.showAboveAll('Phone successfully confirmed', 'alert-success')
          @modal.modal('hide')
      (error) =>
        console.log 'error', error
        Precision.alert.showAboveAll('Wrong code! Try again or request new code.')
        @isLoading(false)
    )

  constructor: (
    @phoneValueObservable,
    @phoneCountryCodeObservable,
    @phoneConfirmedObservable,
    @options = {}
  ) ->
    @modal = $('#confirm_phone_modal')
    @isLoading = ko.observable()
    @codeInputValue = ko.observable('')
    @enableButton = ko.computed( => @codeInputValue().length == 6)
    @phoneValueLabel = ko.computed( =>
      phone = Precision.utils.formatToPhoneNumber(@phoneValueObservable())
      return "#{@phoneCountryCodeObservable()} #{phone}"
    )
    @phoneFullValue = ko.computed( =>
      phone = "#{@phoneCountryCodeObservable()}#{@phoneValueObservable()}"
      return if phone.length then phone.replace(/ /g, '') else ''
    )

    @modal.on 'hidden.bs.modal', () =>
      @isLoading(false)
      @codeInputValue('')
      $('#confirm_phone_modal_input').val('')


window.Precision ||= {}
window.Precision.ConfirmPhoneModal = ConfirmPhoneModal
