class Precision
  api: (route, input, cb) ->
    $.ajax route,
      'contentType': 'application/json'
      'data': JSON.stringify(input)
      'dataType': 'json'
      'error': (xhr, status, err) ->
        alert "ERROR! XHR status = #{status}, error = #{err}"
      'jsonp': false
      'method': 'POST'
      'mimeType': 'application/json'
      'processData': false
      'success': (data, status, xhr) ->
        cb data

window.Precision ||= new Precision()

$(document).on 'page:load', ->
  Paloma.executeHook()
  Paloma.engine.start()
