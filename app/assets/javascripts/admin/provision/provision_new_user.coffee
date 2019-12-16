class PageProvisionNewUserView
  constructor: () ->
    @selectedRequest = ko.observable(null)
    @enableNext = ko.computed(() => !!@selectedRequest())
    @org_admin = ko.observable()

AdminProvisionController = Paloma.controller('Admin/Provision', {
  provision_new_user: ->
    ### Page Model ###
    $container = $("body main")
    viewModel = new PageProvisionNewUserView()
    ko.applyBindings(viewModel, $container[0])
### Page Model ###
})
