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

    if $container.find('#table-results-vaf').length > 0
      overviewTable = new Tablesort(document.getElementById('table-results-vaf'))

    $(document).ready ->
      $('#table-results-overview > tbody > tr').click ->
        $(this).toggleClass 'active'
        return

      $('#table-results-vaf > tbody > tr').click ->
        $(this).toggleClass 'active'
        return
      return
)
