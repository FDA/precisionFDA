window.Precision ||= {}

window.Precision.api = (route, input, successCallback, errorCallback, async=true) ->
  $.ajax route,
    contentType: 'application/json'
    data: JSON.stringify(input)
    dataType: 'json'
    jsonp: false
    async: async
    method: 'POST'
    mimeType: 'application/json'
    processData: false
    success: (data, status, xhr) ->
      successCallback?(data)
    error: (xhr, status, err) ->
      Precision.errors.unconditional_handle(xhr)
      if errorCallback? then errorCallback(status, err) else Precision.errors.handle(xhr)
