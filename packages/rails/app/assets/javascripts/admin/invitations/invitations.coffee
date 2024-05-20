MAX_USERS = 5

class InvitationModel
  constructor: (@original) ->
    @id = @original.id
    @firstName = ko.observable(@original.first_name)
    @lastName = ko.observable(@original.last_name)
    @email = ko.observable(@original.email)
    @duns = ko.observable(@original.duns)
    @errors = ko.observableArray([])
    @success = ko.observable(false)

class PageInvitationsView
  showGridModal: () ->
    @gridModal.modal('show')
    @invitationGridLoading(true)
    @invitationsDataGrid.ajax.reload((json) =>
      @invitationGridLoading(false)
    )

  renderSearchInvLabel: (item) ->
    "#{item.email} | #{item.first_name} #{item.last_name}"

  clearInvitations: () ->
    @invitations.removeAll()

  removeInvitation: (data) =>
    @invitations.remove(data)

  handleResponse: (data) =>
    noErrors = true
    @undoneInvitations().forEach((invitation) =>
      errors = data[invitation.id].errors
      invitation.errors(errors)
      invitation.success(errors.length == 0)
      noErrors = false if errors.length
      @provisionedUsernames.push(data[invitation.id].user.username) if invitation.success()
    )
    return noErrors

  provisionUsers: () ->
    $('#disable-screen-modal').modal('show')
    data = {}
    @undoneInvitations().forEach((invitation) ->
      data[invitation.id] = {
        first_name: invitation.firstName(),
        last_name: invitation.lastName(),
        email: invitation.email(),
        duns: invitation.duns(),
      }
    )
    $.post('/admin/invitations/provision', { invitations: data })
      .then(
        (data) =>
          responseIsOk = @handleResponse(data)

          if responseIsOk
            successMessage = "You have successfully provisioned the following users: " +
                              @provisionedUsernames().join(", ")
            Precision.alert.showAfterReload(successMessage, 'alert-success', true)
            window.location.reload()
          else
            $('#disable-screen-modal').modal('hide')
            Precision.alert.showAboveAll('Some fields filled in incorrectly.', 'alert-warning')
          @provisionedUsernames([])
        (error) ->
          try
            message = JSON.parse(error.responseText)["error"]
          catch
            message = null

          message = message || 'Something went wrong while provisioning users'

          Precision.alert.showAboveAll(message)
          $('#disable-screen-modal').modal('hide')
      )

  selectUser: (e, invitation) ->
    @selectedInvitations.push(invitation) if e.target.checked
    @selectedInvitations.remove(invitation) if !e.target.checked

  addSelectedUsers: () ->
    @selectedInvitations().forEach((invitation) =>
      @invitations.push(new InvitationModel(invitation))
    )
    @selectedInvitations([])
    @gridModal.modal('hide')

  constructor: (params) ->
    @countries = params.countries.map((country) -> { id: country[1], name: country[0] })
    @gridModal = $('#invitation_grid_modal')
    @invitationGridLoading = ko.observable(false)
    @selectedInvitations = ko.observableArray([])
    @invitations = ko.observableArray([])
    @provisionedUsernames = ko.observableArray([])
    @undoneInvitations = ko.computed(() =>
      @invitations().filter((invitation) -> !invitation.success())
    )
    @invitationsExclude = ko.computed(() =>
      @invitations().map((invitation) -> invitation.id)
    )
    @addSelectedEnabled = ko.computed(() => @selectedInvitations().length)

    @invitationsDataGrid = $('#invitations_data_grid').DataTable({
      ajax: {
        url: '/admin/invitations/browse',
        type: 'POST',
        data: () => { exclude: @invitationsExclude() },
        dataSrc: ''
      },
      columns: [
        { data: 'id' },
        { data: 'first_name' },
        { data: 'last_name' },
        { data: 'email' },
        { data: 'duns' },
        { data: 'created_at' },
      ],
      "columnDefs": [
        {
          targets: 0,
          orderable: false,
          data: 'id',
          render: (data) ->
            "<input value=\"#{data}\" type=\"checkbox\" class=\"select-user\" />"
        }
      ],
      order: [[ 5, "desc" ]]
    })
    @searchDataGridContainer = $('#invitations_data_grid_filter input', @gridModal)
    @searchValue = document.getElementById('search_input')
    @searchedInvitations = []
    @search = new Precision.autocomplete({
      inputNode: @searchValue,
      getOptionsAsync: (searchStr) =>
        return $.post('/admin/invitations/search', {
          query: searchStr,
          exclude: @invitationsExclude()
        }).then(
          (data) =>
            data = data.filter((item) =>
              filter = true
              @invitations().forEach((inv) -> filter = false if inv.id == item.id)
              return filter
            )
            @searchedInvitations = data
            return data.map (item) => { value: item.id, label: @renderSearchInvLabel(item) }
          (error) ->
            Precision.alert.showAboveAll('Something went wrong while searching invitations')
        )
    })
    $(@search.nodes.inputNode).on @search.eventNames.OPTION_CLICK, (e, data) =>
      @search.clearInput()
      _invitation = @searchedInvitations.filter((invitation) -> invitation.id.toString() == data)
      invitation = _invitation.length and _invitation[0]
      @invitations.push(new InvitationModel(invitation, @countries))

    @selectionDisabled = ko.computed(() =>
      disabled = @invitations().length >= MAX_USERS
      @search.disabled(disabled)
      return disabled
    )

    @gridModal.on 'hidden.bs.modal', () =>
      @selectedInvitations([])
      @invitationsDataGrid.search("").draw() if @searchDataGridContainer.val()

AdminProvisionController = Paloma.controller('Admin/Invitations', {
  index: ->
    $container = $("body main")
    viewModel = new PageInvitationsView(@params)
    ko.applyBindings(viewModel, $container[0])

    $('#invitations_data_grid').on 'change', 'tbody td', (e) ->
      if e.target.classList.contains('select-user')
        idx = viewModel.invitationsDataGrid.cell(this).index().row
        data = viewModel.invitationsDataGrid.cells( idx, '' ).render( 'display' )
        viewModel.selectUser(e, data.data()[idx])

        invCount = viewModel.selectedInvitations().length + viewModel.invitations().length
        disabled = invCount >= MAX_USERS

        $('input.select-user').each((index, checkbox) ->
          checkbox.setAttribute('disabled', true) if disabled and !checkbox.checked
          checkbox.removeAttribute('disabled') if !disabled
        )

      return false
})
