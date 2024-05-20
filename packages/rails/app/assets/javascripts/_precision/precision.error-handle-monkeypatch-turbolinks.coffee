# Monkey patch Turbolinks to render 403, 404 & 500 normally
# See https://github.com/turbolinks/turbolinks/issues/179
window.Turbolinks.HttpRequest::requestLoaded = ->
    @endRequest (->
        code = @xhr.status
        if 200 <= code and code < 300 or code == 403 or code == 404 or code == 500
            @delegate.requestCompletedWithResponse @xhr.responseText, @xhr.getResponseHeader('Turbolinks-Location')
        else
            @failed = true
            @delegate.requestFailedWithStatusCode code, @xhr.responseText
        return
  ).bind(this)
