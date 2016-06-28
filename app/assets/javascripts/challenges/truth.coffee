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

    if $container.find('#table-truth-overview').length > 0
      overviewTable = new Tablesort(document.getElementById('table-truth-overview'))

    if $container.find('#table-truth-datasets').length > 0
      datasetTable = new Tablesort(document.getElementById('table-truth-datasets'))
)
