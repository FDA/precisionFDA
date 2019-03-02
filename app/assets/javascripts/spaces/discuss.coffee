class NewCommentModel
  initAssocWith: () =>
    @assocSelect = $(@commentForm).find('.search-row--select select')[0]
    @search = new Precision.autocomplete({
      inputNode: $(@commentForm).find('.search-row--searchfield input')[0],
      disabled: true,
      getOptionsAsync: (searchStr) =>
        return $.post("/spaces/#{@spaceId}/search_content", {
          query: searchStr,
          content_type: @assocSelectValue()
        }).then (data) ->
          data.map (item) ->
            return {
              value: item.id,
              label: item.name
            }
    })

    $(@assocSelect).on 'change', (e) =>
      value = e.target.value
      @assocSelectValue(value)
      @search.clearInput()
      if value and value.length
        @search.disabled(false)
      else
        @search.disabled(true)

    $(@search.nodes.inputNode).on @search.eventNames.SETVALUE, () =>
      @searchValue(@search.value)

  changeCommentTextArea: (e) =>
    $(@textarea).val(e.target.innerText)
    @newCommentValue(e.target.innerText)

  constructor: (@commentForm, @spaceId) ->
    @editable = $(@commentForm).find('.new-comment-editable')[0]
    @textarea = $(@commentForm).find('.new-comment-textarea')[0]
    @submitButton = $(@commentForm).find('button[type="submit"]')[0]
    @assocWith = $(@commentForm).attr('data-assoc-with')

    @newCommentValue = ko.observable('')
    @assocSelectValue = ko.observable(null)
    @searchValue = ko.observable(null)
    @newCommnentSubmitDisabled = ko.computed(=>
      noCommentValue = !(@newCommentValue() and @newCommentValue().trim().length)
      hasSelectValue = !!@assocSelectValue()
      noSearchValue = !@searchValue()


      if @assocWith == 'true'
        disabled = false
        disabled = true if noCommentValue
        disabled = true if hasSelectValue and noSearchValue
      else
        disabled = noCommentValue

      if disabled
        @submitButton.setAttribute('disabled', true)
      else
        @submitButton.removeAttribute('disabled')
    )

    @initAssocWith() if @assocWith == 'true'

class SpacesDiscussView
  constructor: (commentForms = [], spaceId) ->
    @commentForms = commentForms.map (index, commentForm) ->
      new NewCommentModel(commentForm, spaceId)


#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

SpacesController = Paloma.controller('Spaces', {
  discuss: ->
    $container = $("#ko_spaces_discuss_container")
    viewModel = new SpacesDiscussView($('.pfda-comment--with-mentions form'), @params.space_id)
    ko.applyBindings(viewModel, $container[0])

    viewModel.commentForms.map (index, form) =>
      $(form.editable).atwho({
        at: "@",
        insertTpl: '<a href="/users/${name}" target="_blank">@${name}</a>',
        data: @params.users
      })
      $(form.editable).on 'input', form.changeCommentTextArea
      $(form.editable).on 'inserted.atwho', form.changeCommentTextArea

    $(document).ready ->
      Precision.nestedComments.init()

      commentsBodies = $(".pfda-comment-body p")
      regex = Precision.MENTIONS_CONST.regex
      replace = Precision.MENTIONS_CONST.replace

      commentsBodies.each (index, commentsBody) ->
        commentsBody.innerHTML = commentsBody.innerHTML.replace(regex, replace)

})
