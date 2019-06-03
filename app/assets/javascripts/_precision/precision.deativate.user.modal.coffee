class DeactivateUserModal
  resetModalData: () ->
    @isLoading(false)
    @dxuser(null)
    @reasonInput.val('')

  showModal: (dxuser) ->
    @dxuser(dxuser)
    @modal.modal('show')

  submit: (root, e) =>
    e.preventDefault()
    @isLoading(true)
    @form.submit()

  constructor: () ->
    @modal = $('#deactivate_user_modal')
    @reasonInput = $('#deactivate_user_modal_message')
    @form = $('#deactivate_user_modal_form')
    @isLoading = ko.observable(false)
    @dxuser = ko.observable()

    @modal.on 'hidden.bs.modal', () =>
      @resetModalData()

window.Precision ||= {}
window.Precision.DeactivateUserModal = DeactivateUserModal
