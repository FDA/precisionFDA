#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ProfileController = Paloma.controller('Profile',
  index: ->
    $time_zone_select = $(".JS-TimeZone-selector")

    $time_zone_select.on('change', (e) ->
      return unless this.value
      Precision.api("/api/update_time_zone", { time_zone: this.value })
        .done((data) =>
          Turbolinks.visit(location.toString())
        ).fail((error) ->
          console.error(error)
        )
    )
)
