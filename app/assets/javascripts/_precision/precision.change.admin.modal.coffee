class User
  constructor: (data) ->
    @id = data.id
    @name = "#{data.first_name} #{data.last_name} (#{data.dxuser})"
    @dxuser = data.dxuser
    @selected = ko.observable(false)

class ChangeAdminModal
  selectNewAdmin: () =>
    @isLoading(true)
    @form.submit()

  resetModalData: () ->
    @isLoading(false)
    @selectedUser(null)
    @searchString('')
    @searchInput.val('')
    @users([])

  getUsers: () ->
    if !@searchString() or !@searchString().length
      @users([])
      return false
    @isLoading(true)
    $.get('/admin/users', { search: @searchString(), org: @orgid }).then(
      (data) =>
        users = data.users.map((user) -> new User(user))
        @users(users)
        @isLoading(false)
      () =>
        Precision.alert.showAboveAll('Something went wrong!')
        @isLoading(false)
    )

  showChangeAdminModal: (orgid = null) ->
    @orgid(orgid) if orgid
    @modal.modal('show')

  selectUser: (user) =>
    @users().map((user) -> user.selected(false))
    user.selected(true)
    @selectedUser(user)

  constructor: (orgid = null) ->
    @modal = $('#change_admin_modal')
    @searchInput = $('#change_admin_modal_search')
    @form = $('#change_admin_modal_form')
    @isLoading = ko.observable(false)
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

    @modal.on 'hidden.bs.modal', () =>
      @resetModalData()

window.Precision ||= {}
window.Precision.ChangeAdminModal = ChangeAdminModal
