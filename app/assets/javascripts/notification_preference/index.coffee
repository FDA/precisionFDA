#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

NotificationPreferencesController = Paloma.controller('NotificationPreferences',
  index: ->
    params = @params
    $container = $("body main")
    console.log(params)
)
