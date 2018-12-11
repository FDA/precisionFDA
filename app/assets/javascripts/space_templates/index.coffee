class SpaceTemplateIndexView
  constructor: (duplicateMessage) ->
    @toDelete = null
    @toDeleteSpace = ko.observable("")
    @toDeleteSpaceName = ko.observable("")
    @spaceName = ko.observable("")
    @duplicateMessage = ko.observable(duplicateMessage)
  deleteTemplate: () ->
    if @toDelete != null
      $.ajax @toDelete,
        method: 'DELETE',
        success: (data) =>
          $("#delete-confirm").modal("hide")
          @toDelete = null

  confirmDelete: (data,event) ->
    url = $(event.currentTarget).prop('href')
    name = $(event.currentTarget).prop('name')
    @toDelete = url
    @toDeleteSpaceName(name)
    $("#delete-confirm").modal("show")
    @toDeleteSpace(url)
    return false

SpaceTemplatesController = Paloma.controller('SpaceTemplates',
  index: ->
    $container = $('body main')
    viewModel = new SpaceTemplateIndexView(@params.duplicated)
    ko.applyBindings(viewModel, $container[0])

    if @params.template_created
      viewModel.spaceName(@params.template_created)
      $("#template-created").modal("show")

    if @params.duplicated?
      $("#duplicated").modal("show")

    $('.description-uncover').click((e) ->
      parent = $(e.target).parent()
      if $(e.target).hasClass('fa-chevron-down')
        $(e.target).attr('class', 'fa fa-chevron-right description-uncover')
        $(parent.children('.full-description')[0]).hide()
        $(parent.children('.short-description')[0]).show()
      else
        $(e.target).attr('class', 'fa fa-chevron-down description-uncover')
        $(parent.children('.full-description')[0]).show()
        $(parent.children('.short-description')[0]).hide()
    )
)