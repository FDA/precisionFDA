
class ProtocolErrors

  handle: (xhr) ->
    if 400 <= xhr.status <= 499
      @status400(xhr)
    if 500 <= xhr.status <= 599
      @status500(xhr)

  unconditional_handle: (xhr) ->
    switch xhr.status
      when 401, 403
        @handle(xhr)

  status400: (xhr) ->
    switch xhr.status
      when 401, 403
        Precision.alert.showPermanent("Your session is no longer valid, please <a href=\"/login\">Login</a>")
        $(document).delay(10000).queue ->
          window.location = "/login"
      when 404
        Precision.alert.showPermanent("Action not found")
      else
        Precision.alert.showPermanent("There was a server error")

  status500: (xhr) ->
    Precision.alert.showPermanent("There was a server error")

  constructor: () ->
    # blank controller

window.Precision ||= {}
window.Precision.errors = new ProtocolErrors()
