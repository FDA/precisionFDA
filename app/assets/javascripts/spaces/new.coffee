class SpaceTypes
  constructor: (id, name) ->
    @Id = ko.observable(id);
    @Name = ko.observable(name);

class SpacesNewView
  constructor: (params) ->

    @hostLead = ko.observable(params.host_lead_dxuser)
    @guestLead = ko.observable(params.guest_lead_dxuser)
    @sponsorLead = ko.observable(params.sponsor_lead_dxuser)
    @restrict_to_template = ko.observable(params.restrict_to_template)

    @spaceTypes = ko.observableArray(
      _.map(params.space_types, (type) =>
        new SpaceTypes(type, type)
      )
    )
    @chosenSpaceType = ko.observable(params.space_type)
    @hostLeadLabel = ko.computed(() =>
      if @chosenSpaceType() == 'groups' || @chosenSpaceType() == 'verification'
        'Host Lead'
      else
        'Reviewer Lead'
    )

    @guestPlaceholder = ko.computed(() =>
      if @chosenSpaceType() == 'verification'
        'Guest username...(optional)'
      else
        'Guest username...'
    )

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

SpacesController = Paloma.controller('Spaces',
  new: ->
    params = @params
    $container = $("body main")
    console.log params
    viewModel = new SpacesNewView(params)

    ko.applyBindings(viewModel, $container[0])

  create: ->
    params = @params
    $container = $("body main")
    console.log params
    viewModel = new SpacesNewView(params)

    ko.applyBindings(viewModel, $container[0])
)
