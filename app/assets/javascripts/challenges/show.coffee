#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

MainController = Paloma.controller('Challenges',
  show: ->
    $container = $("body main")

    $popover = $container.find('[data-toggle="popover"]')
    if ($popover.length > 0)
      $.each($popover, () ->
        $(this).popover({title: $(this).attr("name"), html: true, content: Precision.md.render($(this).attr("desc"))})
      )

    if $container.find('#table-results-overview').length > 0
      overviewTable = new Tablesort(document.getElementById('table-results-overview'))
)
