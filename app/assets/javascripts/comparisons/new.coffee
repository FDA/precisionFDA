class ComparisonsNewView
  constructor: () ->
    @files = ko.observableArray()
    @getFiles()

  getFiles: (params = {}) ->
    Precision.api '/api/list_files', params, (res) =>
      console.log res
      @files(res)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

ComparisonsController = Paloma.controller('Comparisons')
ComparisonsController::new = ->
  viewModel = new ComparisonsNewView()
  console.log ComparisonsController
  console.log this
  ko.applyBindings(viewModel, $("[data-controller=comparisons][data-action=new]")[0]);
