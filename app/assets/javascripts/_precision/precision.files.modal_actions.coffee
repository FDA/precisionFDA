class ActionsWithFilesModal

  getItems: () ->
    @loading(true)
    @sendingItems([])
    $.ajax({
      url: @selectedListURL,
      method: 'POST',
      data: {
        ids: @selectedItems(),
        scope: @scope,
        task: @task
      },
      success: (data) =>
        @loading(false)
        @showError(false)
        @displayingItems(data)
        for item in data
          @sendingItems.push(item.id)
      error: () =>
        @displayingItems([])
        @loading(false)
        @showError(true)
    })

  constructor: (data) ->
    @loading = ko.observable(false)

    @selectedListURL = data.selectedListURL
    @selectedItems = data.selectedItems
    @scope = data.scope
    @task = data.task

    @displayingItems = ko.observableArray()

    @sendingItems = ko.observableArray()
    @sendingItemsCnt = ko.computed( => @sendingItems().length )

    @showNoData = ko.computed( =>
      !@loading() and !@displayingItems().length
    )
    @showError = ko.observable(false)
    @defaultErrorText = 'Something went wrong.'
    @errorText = ko.observable(@defaultErrorText)

window.Precision ||= {}
window.Precision.models ||= {}
window.Precision.models.ActionsWithFilesModal = ActionsWithFilesModal
