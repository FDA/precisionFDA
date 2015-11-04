class AppReleaseModel
  constructor: (@dxid) ->
    @saving = ko.observable(false)
    @errorMessage = ko.observable()
    @version = ko.observable()
    @isReleaseEnabled = ko.computed(=>
      !@saving() && @version()?.length > 0
    )

  submitRelease: () ->
    return if !@isReleaseEnabled()
    @saving(true)
    @errorMessage(null)
    params =
      id: @dxid
      version: @version.peek()

    Precision.api('/api/release_app', params)
      .done((data) =>
        if data.failure
          @errorMessage(data.failure)
          console.error(data.failure)
          @saving(false)
        else
          window.location.replace("/apps/#{@dxid}/jobs")
      )
      .fail((error) =>
        console.error(error)
        @saving(false)
      )

window.Precision ||= {}
window.Precision.models || = {}
window.Precision.models.AppReleaseModel = AppReleaseModel
