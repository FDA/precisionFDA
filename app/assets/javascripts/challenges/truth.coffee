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

    overviewTable = new Tablesort(document.getElementById('table-truth-overview'))
    datasetTable = new Tablesort(document.getElementById('table-truth-datasets'))
)
