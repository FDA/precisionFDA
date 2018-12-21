ROOT_CLASS = 'nested-comment'
COLLAPSE_CLASS = 'nested-comment--media-collapse'
SHOW_NEW_CLASS = 'nested-comment--show-new-comment'
HIDDEN_CLASS = 'nested-comment--hidden'

class NestedCommentsModel
  toggleIcon: (node) ->
    icon = $(node).find('.fa')
    if $(icon).hasClass('fa-minus')
      $(icon).removeClass('fa-minus')
      $(icon).addClass('fa-plus')
    else
      $(icon).addClass('fa-minus')
      $(icon).removeClass('fa-plus')

  showNewCommentForm: (e) ->
    e.preventDefault()
    comment = e.target.closest(".#{ROOT_CLASS}")
    newComment = comment.getElementsByClassName("pfda-comment-new")[0]
    if newComment.classList.contains(HIDDEN_CLASS)
      newComment.classList.remove(HIDDEN_CLASS)
    else
      newComment.classList.add(HIDDEN_CLASS)

  collapseThread: (e) =>
    e.preventDefault()
    @toggleIcon(e.currentTarget)
    comment = e.target.closest(".#{ROOT_CLASS}")
    children = $(comment).find("section")
    children.each (index, child) ->
      if child.classList.contains(HIDDEN_CLASS)
        child.classList.remove(HIDDEN_CLASS)
      else
        child.classList.add(HIDDEN_CLASS)

  init: () ->
    $(".#{SHOW_NEW_CLASS}").on 'click', @showNewCommentForm
    @initTreads()

  initTreads: () ->
    $(".#{COLLAPSE_CLASS}").on 'click', @collapseThread

  constructor: () ->

window.Precision ||= {}
window.Precision.nestedComments = new NestedCommentsModel()

window.Precision ||= {}
window.Precision.MENTIONS_CONST = {
  regex: /(^|[^@\w])@([\w\.\@]+)\b/g
  replace: '$1<a href="/users/$2" target="_blank">@$2</a>'
}
