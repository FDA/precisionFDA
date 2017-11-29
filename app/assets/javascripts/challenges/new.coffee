#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

init_datetimepickers = () ->
  inputs = $('.add-datetimepicker')
  for input in inputs
    new Precision.Datepicker(input)

MainController = Paloma.controller('Challenges',
  create: ->
    do init_datetimepickers
  new: ->
    do init_datetimepickers
  edit: ->
    do init_datetimepickers
)
