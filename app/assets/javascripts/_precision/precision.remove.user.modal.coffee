class RemoveUserModal
  resetModalData: () ->
    @isLoading(false)
    @user(null)
    @org(null)

  showModal: (user_id, org_id) ->
    @user(user_id)
    @org(org_id)
    @modal.modal('show')

  submit: (root, e) =>
    e.preventDefault()
    @isLoading(true)
    @form.submit()

  constructor: () ->
    @modal = $('#remove_user_modal')
    @form = $('#remove_user_modal_form')
    @isLoading = ko.observable(false)
    @user = ko.observable()
    @org = ko.observable()

    @modal.on 'hidden.bs.modal', () =>
      @resetModalData()

window.Precision ||= {}
window.Precision.RemoveUserModal = RemoveUserModal
