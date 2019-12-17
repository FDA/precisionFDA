class PageInvitationsView
  renderSearchInvLabel: (item) ->
    "#{item.email} | #{item.first_name} #{item.last_name}"

  clearInvitations: () ->
    @invitations.removeAll()

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
            data = data.filter((item) =>
              filter = true
              @invitations().forEach((inv) -> filter = false if inv.id == item.id)
              return filter
            )
            @searchedInvitations = data
            return data.map (item) => { value: item.id, label: @renderSearchInvLabel(item) }
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
