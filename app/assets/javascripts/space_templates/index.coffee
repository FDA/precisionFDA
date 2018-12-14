class SpaceTemplateIndexView
  constructor: (duplicateMessage) ->
    @toDelete = null
    @toDeleteSpace = ko.observable("")
    @toDeleteSpaceName = ko.observable("")
    @spaceName = ko.observable("")
    @duplicateMessage = ko.observable(duplicateMessage)
  deleteTemplate: () ->
    if @toDelete != null
      $.ajax(@toDelete, {
        method: 'DELETE',
        success: (data) =>
          $("#delete-confirm").modal("hide")
          @toDelete = null
      })

  confirmDelete: (data, event) ->
    url = $(event.currentTarget).prop('href')
    name = $(event.currentTarget).prop('name')
    @toDelete = url
    @toDeleteSpaceName(name)
    $("#delete-confirm").modal("show")
    @toDeleteSpace(url)
    return false

SpaceTemplatesController = Paloma.controller('SpaceTemplates', {
  index: ->
    $container = $('body main')
    viewModel = new SpaceTemplateIndexView(@params.duplicated)
    ko.applyBindings(viewModel, $container[0])

    if @params.template_created
      viewModel.spaceName(@params.template_created)
      $("#template-created").modal("show")

    if @params.duplicated?
      $("#duplicated").modal("show")

    $('.short-description').on 'click', (e) ->
      e.preventDefault()
      if $(e.target).hasClass('description-uncover')
        $(e.currentTarget).parent().find('.full-description').show()
        $(e.currentTarget).hide()

    $('.full-description').on 'click', (e) ->
      e.preventDefault()
      if $(e.target).hasClass('description-cover')
        $(e.currentTarget).parent().find('.short-description').show()
        $(e.currentTarget).hide()
})
