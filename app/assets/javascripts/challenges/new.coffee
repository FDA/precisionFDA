#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

init_datetimepickers = () ->
  $('.add-datetimepicker').datetimepicker({
      format: 'MM/DD/YYYY hh:mm A'
  })

MainController = Paloma.controller('Challenges',
  create: ->
    do init_datetimepickers
  new: ->
    do init_datetimepickers
)
