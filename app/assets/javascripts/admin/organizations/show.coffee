class User
  constructor: (data) ->
    @id = data.id
    @name = "#{data.first_name} #{data.last_name} (#{data.dxuser})"
    @dxuser = data.dxuser
    @selected = ko.observable(false)

class PageAdminOrgView
  selectNewAdmin: () ->
    @changeAdminModalForm.submit()

  resetModalData: () ->
    @changeAdminModalIsLoading(false)
    @selectedUser(null)
    @searchString('')
    @changeAdminModalSearch.val('')

  getUsers: () ->
    if !@searchString() or !@searchString().length
      @users([])
      return false
    @changeAdminModalIsLoading(true)
    $.get('/admin/users', { search: @searchString() }).then(
      (data) =>
        users = data.users.map((user) -> new User(user))
        @users(users)
        @changeAdminModalIsLoading(false)
      () =>
        Precision.alert.showAboveAll('Something went wrong!')
        @changeAdminModalIsLoading(false)
    )

  showChangeAdminModal: () ->
    @changeAdminModal.modal('show')

  selectUser: (user) =>
    @users().map((user) -> user.selected(false))
    user.selected(true)
    @selectedUser(user)

  constructor: (orgid = null) ->
    @changeAdminModal = $('#change_admin_modal')
    @changeAdminModalSearch = $('#change_admin_modal_search')
    @changeAdminModalForm = $('#change_admin_modal_form')
    @changeAdminModalIsLoading = ko.observable(false)
    @orgid = ko.observable(orgid)
    @users = ko.observableArray([])
    @selectedUser = ko.observable()
    @selectedUserDxuser = ko.computed(() =>
      return null if !@selectedUser()
      return @selectedUser().dxuser
    )
    @isUserSelected = ko.computed(() => !!@selectedUser())

    @searchString = ko.observable()
    @showNoUsersFound = ko.computed(() =>
      return !!@searchString() and @searchString().length and !@users().length
    )
    @searchInputListener = _.debounce((root, e) =>
      e.preventDefault()
      @searchString(e.target.value)
      @getUsers()
    , 300)

    @changeAdminModal.on 'hidden.bs.modal', () =>
      @resetModalData()

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################


ParticipantsController = Paloma.controller('Admin/Organizations', {
  show: ->
    $container = $("body main")
    viewModel = new PageAdminOrgView(@params.org.dxid)
    ko.applyBindings(viewModel, $container[0])
})
