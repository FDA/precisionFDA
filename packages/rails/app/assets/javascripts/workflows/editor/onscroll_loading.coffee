createOnScrollHandler = window.Precision.utils.createOnScrollHandler

addLoadAppsOnScroll = (viewModel) ->
  dataCont = '.scrollable-apps-container'
  createOnScrollHandler('private-apps-scrollable', dataCont, viewModel.getPrivateApps)
  createOnScrollHandler('public-apps-scrollable', dataCont, viewModel.getPublicApps)
  createOnScrollHandler('all-apps-scrollable', dataCont, viewModel.getAllApps)

window.Precision ||= {}
window.Precision.wfEditor ||= {}
window.Precision.wfEditor.addLoadAppsOnScroll = addLoadAppsOnScroll
