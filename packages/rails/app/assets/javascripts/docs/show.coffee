#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

DocsController = Paloma.controller('Docs',
  show: ->
    $container = $("body main")
    $('body').scrollspy({ target: '#about-docs' })
    $docs_sidebar = $container.find('.bs-docs-sidebar')
    if $docs_sidebar.length > 0
      $docs_sidebar.affix({
        offset: {
          top: $container.find('.bs-docs-sidebar').offset().top,
          bottom: () =>
            @bottom = $('footer').outerHeight(true)
        }
      })
)
