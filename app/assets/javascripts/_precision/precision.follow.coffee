window.Precision ||= {}
window.Precision.follow =
  on: () ->
    $("body").on("click.follow", ".event-follow", window.Precision.follow.submitFollow)

  off: () ->
    $("body").off(".follow")

  submitFollow: (e) ->
    $target = $(e.currentTarget)
    followable_uid = $target.attr("data-followable-uid")
    follower_uid = $target.attr("data-follower-uid")
    count = $target.attr("data-follow-count")

    params =
      followable_uid: followable_uid,
      follower_uid: follower_uid

    $target.addClass("disabled")
    $follower = $(".pfda-follower[data-followable-uid=#{followable_uid}][data-follower-uid=#{follower_uid}]")
    if $target.is(".active")
      Precision.api('/api/unfollow', params)
        .done((data) =>
          $target.removeClass("active")
          $target.find(".follow-count").text(data.follow_count)
          $follower.parent().hide()
        )
        .fail((error) =>
          console.error(error)
        )
        .always(=>
          $target.removeClass("disabled")
        )
    else
      Precision.api('/api/follow', params)
        .done((data) =>
          $target.addClass("active")
          $target.find(".follow-count").text(data.follow_count)
          $follower.parent().show()
        )
        .fail((error) =>
          console.error(error)
        )
        .always(=>
          $target.removeClass("disabled")
        )
