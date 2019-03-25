class PageProvisionOrgView
  constructor: () ->
    @selectedRequest = ko.observable(null)
    @enableNext = ko.computed(() => !!@selectedRequest())

ProfileController = Paloma.controller('Profile', {
  provision_org: ->
    ### Page Model ###
    $container = $("body main")
    viewModel = new PageProvisionOrgView()
    ko.applyBindings(viewModel, $container[0])
    ### Page Model ###
})
