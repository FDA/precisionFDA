window.Precision ||= {}
window.Precision.upvote =
  on: () ->
    $("body").on("click.upvote", ".event-upvote", window.Precision.upvote.submitVote)

  off: () ->
    $("body").off(".upvote")

  submitVote: (e) ->
    $target = $(e.currentTarget)
    uid = $target.attr("data-uid")
    count = $target.attr("data-upvote-count")
    vote_scope = $target.attr("data-vote-scope")

    params =
      uid: uid

    if !_.isEmpty(vote_scope)
      params['vote_scope'] = vote_scope

    $target.addClass("disabled")
    if $target.is(".active")
      Precision.api('/api/remove_upvote', params)
        .done((data) =>
          $target.removeClass("active")
          $target.find(".upvote-count").text(data.upvote_count)
        )
        .fail((error) =>
          console.error(error)
        )
        .always(=>
          $target.removeClass("disabled")
        )
    else
      Precision.api('/api/upvote', params)
        .done((data) =>
          $target.addClass("active")
          $target.find(".upvote-count").text(data.upvote_count)
        )
        .fail((error) =>
          console.error(error)
        )
        .always(=>
          $target.removeClass("disabled")
        )
