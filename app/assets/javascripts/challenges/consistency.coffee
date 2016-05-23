#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ChallengesController = Paloma.controller('Challenges',
  consistency: ->
    params = @params
    $container = $("body main")

    $popover = $container.find('[data-toggle="popover"]')
    if $popover.length > 0
      $popover.popover()
)
