class PageInvitationsView
  removeInvitation: (data) =>
    @invitations.remove(data)

  constructor: () ->
    @invitations = ko.observableArray([])
    @searchValue = document.getElementById('search_input')
    @searchedInvitations = []
    @search = new Precision.autocomplete({
      inputNode: @searchValue,
      getOptionsAsync: (searchStr) =>
        return $.get('/admin/search_invitations', { query: searchStr })
        .then(
          (data) =>
            @searchedInvitations = data
            return data.map (item) -> { value: item.id, label: item.email }
          (error) -> console.log error
        )
    })
    $(@search.nodes.inputNode).on @search.eventNames.OPTION_CLICK, (e, data) =>
      @search.clearInput()
      _invitation = @searchedInvitations.filter((invitation) -> invitation.id.toString() == data)
      invitation = _invitation.length and _invitation[0]
      @invitations.push(invitation)

AdminProvisionController = Paloma.controller('Admin/Provision', {
  invitations: ->
    $container = $("body main")
    viewModel = new PageInvitationsView()
    ko.applyBindings(viewModel, $container[0])
})
