class PageProvisionNewUserView
  constructor: () ->
    @selectedRequest = ko.observable(null)
    @enableNext = ko.computed(() => !!@selectedRequest())
    @org_admin = ko.observable()

ProfileController = Paloma.controller('Profile', {
  provision_new_user: ->
    ### Page Model ###
    $container = $("body main")
    viewModel = new PageProvisionNewUserView()
    ko.applyBindings(viewModel, $container[0])
### Page Model ###
})
