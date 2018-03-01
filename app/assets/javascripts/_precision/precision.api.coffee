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
      if errorCallback? then errorCallback(status, err) else console.error(status, err)
