window.Precision ||= {}

createDefaultParams = (input, successCallback, errorCallback, async = true) ->
  return {
    contentType: 'application/json',
    data: JSON.stringify(input),
    dataType: 'json',
    jsonp: false,
    async: async,
    method: 'POST'
    mimeType: 'application/json',
    processData: false,
    success: (data, status, xhr) ->
      successCallback?(data)
    error: (xhr, status, err) ->
      Precision.errors.unconditional_handle(xhr)
      if errorCallback? then errorCallback(status, err) else Precision.errors.handle(xhr)
  }

window.Precision.api = (route, input, successCallback, errorCallback, async) ->
  params = createDefaultParams(input, successCallback, errorCallback, async)
  $.ajax(route, params)

window.Precision.promisifyApi = (route, input, async) ->
  return new Promise((resolve, reject) ->
    params = createDefaultParams(input, resolve, reject, async)
    return $.ajax(route, params)
  )
