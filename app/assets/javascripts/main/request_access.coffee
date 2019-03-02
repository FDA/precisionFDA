#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

MainController = Paloma.controller('Main',
  request_access: ->
    $container = $("body main")
    $modal = $("#confirm-request-access-modal")

    isFormValid = ->
      $requiredInputs = $("#new_invitation :required")

      $requiredInputs.toArray().every (el) ->
        el.validity.valid

    $container.on "click", ".accessible-btn-success", (e) ->
      if isFormValid()
        e.preventDefault()
        $modal.modal()
)
