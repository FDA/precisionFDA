#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

MetaAppathonsController = Paloma.controller('MetaAppathons',
  show: ->
    params = @params
    $container = $("body main")

    $tooltips = $container.find("[data-toggle='tooltip']")
    if $tooltips.length > 0
      $tooltips.tooltip({container: 'body'})
)
