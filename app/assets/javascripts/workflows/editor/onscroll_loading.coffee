createOnScrollHandler = (tabID, getApps) ->
  $tabDIV = $("##{tabID}")
  return false if !$tabDIV.length

  _getApps = _.debounce(getApps, 150)

  scrollPos = 0
  onScrollHandler = () ->
    goDown = scrollPos < $tabDIV.scrollTop()
    $appsCont = $tabDIV.find('.scrollable-apps-container')
    if($tabDIV.scrollTop() + $tabDIV.height() >= $appsCont.height() - 20 and goDown)
      _getApps()
    scrollPos = $tabDIV.scrollTop()
  $tabDIV.on 'scroll', onScrollHandler

addLoadAppsOnScroll = (viewModel) ->
  createOnScrollHandler('private-apps-scrollable', viewModel.getPrivateApps)
  createOnScrollHandler('public-apps-scrollable', viewModel.getPublicApps)
  createOnScrollHandler('all-apps-scrollable', viewModel.getAllApps)

window.Precision ||= {}
window.Precision.wfEditor ||= {}
window.Precision.wfEditor.addLoadAppsOnScroll = addLoadAppsOnScroll
