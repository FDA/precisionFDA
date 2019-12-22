findCountryName = (id, countries) ->
  name = 'No Country'
  for country in countries
    if id == country.id
      name = country.name
      break
  return name

class InvitationModel

  constructor: (@original, @countries) ->
    @id = @original.id
    @firstName = ko.observable(@original.first_name)
    @lastName = ko.observable(@original.last_name)
    @email = ko.observable(@original.email)
    @address1 = ko.observable(@original.address1)
    @address2 = ko.observable(@original.address2)
    @countryId = ko.observable(@original.country_id)
    @originalCountry = findCountryName(@countryId(), @countries)
    @country = ko.computed(() => findCountryName(@countryId(), @countries))
    @city = ko.observable(@original.city)
    @usState = ko.observable(@original.us_state)
    @postalCode = ko.observable(@original.postal_code)
    @phone = ko.observable(@original.phone)
    @duns = ko.observable(@original.duns)

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

  provisionUsers: () ->
    $('#disable-screen-modal').modal('show')
    data = {}
    @invitations().forEach((invitation) ->
      data[invitation.id] = {
        first_name: invitation.firstName(),
        last_name: invitation.lastName(),
        email: invitation.email(),
        address1: invitation.address1(),
        address2: invitation.address2(),
        country_id: invitation.countryId(),
        city: invitation.city(),
        us_state: invitation.usState(),
        postal_code: invitation.postalCode(),
        phone: invitation.phone(),
        duns: invitation.duns()
      }
    )
    $.post('/admin/invitations/provision', { invitations: data })
      .then(
        (data) ->
          Precision.alert.showAboveAll('Users successfully provisioned!', 'alert-success')
          window.location.reload()
        (error) -> Precision.alert.showAboveAll('Something went wrong while provisioning users')
      )

  selectUser: (invitation) ->
    @invitations.push(new InvitationModel(invitation, @countries))
    @gridModal.modal('hide')

  constructor: (params) ->
    @countries = params.countries.map((country) -> { id: country[1], name: country[0] })
    @gridModal = $('#invitation_grid_modal')
    @invitationGridLoading = ko.observable(false)
    @invitations = ko.observableArray([])
    @invitationsExclude = ko.computed(() =>
      @invitations().map((invitation) -> invitation.id)
    )

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
        { data: 'address1' },
        { data: 'address2' },
        { data: 'country_id' },
        { data: 'city' },
        { data: 'us_state' },
        { data: 'postal_code' },
        { data: 'phone' },
        { data: 'duns' },
      ],
      "columnDefs": [
        { 'orderable': false, 'targets': 0 },
        {
          targets: 0,
          data: 'id',
          render: (data, type, row, meta) ->
            "<a href=\"#\" class=\"select-user\">Select</a>"
        },
        {
          targets: 6,
          data: 'country_id',
          render: (data, type, row, meta) =>
            country = findCountryName(data, @countries)
            return "<span>#{country}</span>"
        }
      ]
    })

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

AdminProvisionController = Paloma.controller('Admin/Invitations', {
  index: ->
    $container = $("body main")
    viewModel = new PageInvitationsView(@params)
    ko.applyBindings(viewModel, $container[0])

    $('#invitations_data_grid').on 'click', 'tbody td', (e) ->
      if e.target.classList.contains('select-user')
        e.preventDefault()
        idx = viewModel.invitationsDataGrid.cell(this).index().row
        data = viewModel.invitationsDataGrid.cells( idx, '' ).render( 'display' )
        viewModel.selectUser(data.data()[idx])
})
