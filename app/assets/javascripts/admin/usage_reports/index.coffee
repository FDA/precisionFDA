#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ActivityReportsController = Paloma.controller('Admin/UsageReports',

  index: ->
    inputs = $('.add-datetimepicker')
    for input in inputs
      new Precision.Datepicker(input, {
        noDefaultValue: true,
        icon: true,
        format: 'MM/DD/YYYY'
      })
)
