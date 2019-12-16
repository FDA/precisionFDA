class PageInvitationsView
  constructor: () ->
    @searchValue = document.getElementById('search_input')
    @search = new Precision.autocomplete({
      inputNode: @searchValue,
      onOptionClick: (e, autocomplete) -> console.log autocomplete,
      getOptionsAsync: (searchStr) ->
        return $.get('/admin/search_invitations', {
          query: searchStr
        }).then(
          (data) ->
            data.map (item) ->
              return {
                value: item.id,
                label: item.email
              }
          (error) -> console.log error
        )
    })

AdminProvisionController = Paloma.controller('Admin/Provision', {
  invitations: ->
    $container = $("body main")
    viewModel = new PageInvitationsView()
    ko.applyBindings(viewModel, $container[0])
})
