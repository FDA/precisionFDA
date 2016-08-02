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
    $container.find('.bs-docs-sidebar').affix({
      offset: {
        top: $container.find('.bs-docs-sidebar').offset().top,
        bottom: () =>
          @bottom = $('footer').outerHeight(true)
      }
    })
)
