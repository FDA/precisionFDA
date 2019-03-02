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
    new Precision.Datepicker(input, {
      noDefaultValue: true,
      icon: true
    })

TasksController = Paloma.controller('Tasks',
  create: ->
    params = @params
    $container = $("body main")
    init_datetimepickers()
  copy: ->
    $container = $("body main")
    init_datetimepickers()
)
