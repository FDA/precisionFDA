# CKEDITOR.dialog.add 'attachment', (editor) ->
#   # CKEDITOR.dialog.definition
#   dialogDefinition =
#     title: 'Attachment'
#     minWidth: 390
#     minHeight: 130
#     contents: [ {
#       id: 'attachment-settings'
#       elements: [
#         {
#           id: 'attachment-type'
#           type: 'select'
#           label: 'Select type'
#           items: [
#             ['Inline', 'inline']
#             ['Card', 'card']
#           ]
#           setup: (widget) ->
#             @setValue(widget.data['attachment-type'])
#           commit: (widget) ->
#             widget.setData('attachment-type', @getValue())
#         }
#       ]
#     } ]
#   return dialogDefinition

CKEDITOR.plugins.add 'attachment',
  requires: 'widget'
  init: (editor) ->
    # attachmentDialog = new CKEDITOR.dialog editor, 'attachment'

    editor.widgets.add 'attachment',
      # dialog: 'attachment'
      init: () ->
        if @element.hasClass('attachment-card')
          @setData('attachment-type', 'card')
        else
          @setData('attachment-type', 'inline')

        this.on 'doubleclick', ->
          type = if @data['attachment-type'] == 'inline' then 'card' else 'inline'
          @setData('attachment-type', type)
      data: () ->
        @element.removeClass('attachment-card')
        @element.removeClass('attachment-inline')
        if @data['attachment-type'] == 'card'
          @element.addClass('attachment-card')
        else
          @element.addClass('attachment-inline')
      allowedContent: 'span(!attachment); span(attachment-*); a[href](!name); span(!fa, !fa-*)'
      requiredContent: 'span(attachment)'
      pathName: 'attachment'
      upcast: (el) ->
        el.name == 'span' and el.hasClass('attachment')

    # This feature does not have a button, so it needs to be registered manually.
    editor.addFeature editor.widgets.registered['attachment']
    # Handle dropping an attachment by transforming the contact object into HTML.
    # Note: All pasted and dropped content is handled in one event - editor#paste.
    editor.on 'paste', (evt) ->
      attachment = evt.data.dataTransfer.getData('attachment')
      return if !attachment

      switch attachment.type
        when 'comparison'
          inlineHTML = """
            <span class='attachment-inline-show'>
              <span class='#{attachment.icon}'>&nbsp;</span>
              <a class='name' href='#{attachment.path}'>#{attachment.name}</a>
            </span>
          """
          cardHTML = """
            <span class='attachment-card-show'>
              <span class='#{attachment.icon}'>&nbsp;</span>
              <a class='name' href='#{attachment.path}'>#{attachment.name}</a>
              <span class='attachment-meta'>
                <span class='attachment-meta-stat'>
                  <span class='attachment-meta-stat-value'>
                    #{attachment.stats.precision}
                  </span>
                  <span class='attachment-meta-stat-label'>
                    Precision
                  </span>
                </span>
                <span class='attachment-meta-stat'>
                  <span class='attachment-meta-stat-value'>
                    #{attachment.stats.recall}
                  </span>
                  <span class='attachment-meta-stat-label'>
                    Recall
                  </span>
                </span>
                <span class='attachment-meta-stat'>
                  <span class='attachment-meta-stat-value'>
                    #{attachment.stats['f-measure']}
                  </span>
                  <span class='attachment-meta-stat-label'>
                    F-Measure
                  </span>
                </span>
              </span>
            </span>
          """

          evt.data.dataValue = """
            <span class='attachment'>
              #{inlineHTML}
              #{cardHTML}
            </span>
          """
        else
          # NOTE: ckeditor will strip out empty tags, hence the &nbsp; in the icon span
          evt.data.dataValue = """
            <span class='attachment'>
              <span class='#{attachment.icon}'>&nbsp;</span>
              <a class='name' href='#{attachment.path}'>#{attachment.name}</a>
            </span>
          """
