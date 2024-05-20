class ExternalLinkModal
  constructor: () ->
    @url = null
    document.addEventListener 'turbolinks:load', () =>
      @modal = $('#external_link_notify_modal')
      @saveButton = $('#external_link_notify_modal_redirect')
      @modalUrl = $('#external_link_notify_modal_url')

      $(document).ready(() =>
        $('a[href]').on 'click', (e) =>
          notMailTo = e.currentTarget.protocol != 'mailto:'
          isExternal = e.currentTarget.host != window.location.host
          notModalURL = @modalUrl[0] and @modalUrl[0] != e.currentTarget
          isSameWindow = e.currentTarget.target != "_blank"
          notJsVoid = e.currentTarget.href != "javascript: void(0)"
          if isExternal and notModalURL and notMailTo and isSameWindow and notJsVoid
            e.preventDefault()
            @url =  e.currentTarget.href
            @modalUrl.text(@url)
            @modalUrl.attr('href', @url)
            @modal.modal('show')
      )

      @saveButton.on 'click', () =>
        window.location.href = @url if @url


window.Precision ||= {}
window.Precision.externalLinkModal = new ExternalLinkModal()
