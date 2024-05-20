class DescriptionToggleModel
  constructor: (containerId) ->
    @container = $("##{containerId}")
    @showAll = false

  toggle: (data, e) =>
    e.preventDefault()
    id = $(e.target).attr('data-id')
    desc = @container.find(".description-row[data-id=#{id}]")
    desc.toggle()

  toggleAll: (data, e) =>
    e.preventDefault()
    if !@showAll
      @container.find(".description-row").show()
      @showAll = true
    else
      @container.find(".description-row").hide()
      @showAll = false

window.Precision ||= {}
window.Precision.DescriptionToggleModel = DescriptionToggleModel
