window.Precision ||= {}

# TODO: These traps don't work when you go back and then forward due to turbolinks
window.Precision.bind =
  save: (vm, callback) ->
    console.log "Enabled: Edit Save Bindings"
    Mousetrap.bindGlobal(['ctrl+s', 'command+s'], (e) =>
      e.stopPropagation()
      callback.call(vm)
      return false
    )

  traps: () ->
    namespace = ".traps"
    console.log "Enabled: Edit Trap Bindings"
    msg = 'You may have unsaved changes. If you leave this page, you will lose those changes!'
    $(window).on "beforeunload#{namespace}", () -> msg
    $(document).on "page:before-change#{namespace}", (e) -> confirm(msg)

    Mousetrap.bind('backspace', (e) =>
      e.stopPropagation()
      e.preventDefault()
      return false
    )

    $(document).on "page:before-unload#{namespace}", () => Precision.unbind.traps()
    $(window).on "unload#{namespace}", () => Precision.unbind.traps()

window.Precision.unbind =
  traps: () ->
    console.log "Disabled: Edit Trap Bindings"
    $(window).off(".traps")
    $(document).off(".traps")
    Mousetrap.reset()
