class NewCommentModel
  initEditable: () ->

  changeCommentTextArea: (e) =>
    $(@textarea).val(e.target.innerText)
    @newCommentValue(e.target.innerText)

  constructor: (@commentForm, @spaceId) ->
    @editable = $(@commentForm).find('.new-comment-editable')[0]
    @textarea = $(@commentForm).find('.new-comment-textarea')[0]
    @submitButton = $(@commentForm).find('button[type="submit"]')[0]

    @newCommentValue = ko.observable(@textarea.value)
    @newCommnentSubmitDisabled = ko.computed(=>
      noCommentValue = !(@newCommentValue() and @newCommentValue().trim().length)
      if noCommentValue
        @submitButton.setAttribute('disabled', true)
      else
        @submitButton.removeAttribute('disabled')
    )
    @initEditable()

class CommentsEditView
  constructor: (commentForm, spaceId) ->
    @commentForm = new NewCommentModel(commentForm, spaceId)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

CommentsController = Paloma.controller('Comments', {
  edit: ->
    if @params.klass and @params.klass == 'space'
      $container = $("body main")
      viewModel = new CommentsEditView($('.pfda-comment--with-mentions form')[0], @params.space_id)
      ko.applyBindings(viewModel, $container[0])

      form = viewModel.commentForm
      $(form.editable).on 'input', form.changeCommentTextArea
})
