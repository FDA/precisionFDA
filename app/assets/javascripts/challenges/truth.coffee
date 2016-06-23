#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ChallengesController = Paloma.controller('Challenges',
  truth: ->
    params = @params
    $container = $("body main")

    $popover = $container.find('[data-toggle="popover"]')
    if $popover.length > 0
      $popover.popover()

    truthTable = new Tablesort(document.getElementById('table-truth-overview'))
)
