#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

FilesController = Paloma.controller('Files')
FilesController::show = ->
  $container = $("body main")
  viewModel = {
    noteAttachModel: new Precision.models.NoteAttachModel(@params.id, 'UserFile')
  }

  ko.applyBindings(viewModel, $container[0])

  $tabs = $container.find(".nav-tabs > li")
  if $tabs.length > 0 && !$tabs.hasClass("active")
    $tabs.first().find("a[data-toggle='tab']").trigger("click")
