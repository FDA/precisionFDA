class FileViewModel
  constructor: (file, license) ->
    @id = file.id
    @licenseDisplay = Precision.md.render(license?.content)
    @noteAttachModel = new Precision.models.NoteAttachModel(@id, 'UserFile')

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

FilesController = Paloma.controller('Files',
  show: ->
    $container = $("body main")
    viewModel = new FileViewModel(@params.file, @params.license)

    ko.applyBindings(viewModel, $container[0])

    $tabs = $container.find(".nav-tabs > li")
    if $tabs.length > 0 && !$tabs.hasClass("active")
      $tabs.first().find("a[data-toggle='tab']").trigger("click")

    $container.find('[data-toggle="tooltip"]').tooltip({
      container: 'body'
    })
)
