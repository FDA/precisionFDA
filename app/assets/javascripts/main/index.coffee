window.Precision ||= {}
window.Precision.player = null

window.onYouTubePlayerAPIReady = ->
  window.Precision.player = new YT.Player('ytplayer',
    width: '100%'
    videoId: 'kn4J4bqJG2Q'
    playerVars:
      autoplay: 0
      controls: 2
      enablejsapi: 1
      loop: 0
      playlist: 'kn4J4bqJG2Q'
      modestbranding: 1
      rel: 0
      showinfo: 0
    events:
      'onReady': (event) ->
        event.target.setPlaybackQuality("hd720")
  )

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

MainController = Paloma.controller('Main')
MainController::index = ->
  $container = $("body main")

  # Load the IFrame Player API code asynchronously.
  tag = document.createElement('script')

  tag.src = 'https://www.youtube.com/player_api'
  firstScriptTag = document.getElementsByTagName('script')[0]
  firstScriptTag.parentNode.insertBefore tag, firstScriptTag
  # Replace the 'ytplayer' element with an <iframe> and
  # YouTube player after the API code downloads.

  $container.on("click", ".btn-player", (e) ->
    Precision.player.playVideo()
    $(e.target).closest(".btn-player-wrapper").addClass("player-playing")
  )

  $modal = $("#guidelines-modal")
  if @params['show_guidelines'] && $modal.length > 0
    $modal.modal({
      backdrop: 'static'
      keyboard: false
    }).modal('show')

    $modal.on("shown.bs.modal", () =>
      Precision.carousel.setHeight("#guidelines-carousel")
    )

    $carousel = $modal.find('.carousel')
    $carousel.on('slid.bs.carousel', (e) =>
      $(".btn-previous").addClass('hide')
      $(".btn-next").addClass('hide')
      $(".btn-done").addClass('hide')
      if $carousel.find(".item:last").is('.active')
        $(".btn-previous").removeClass('hide')
        $(".btn-done").removeClass('hide')
      else if $carousel.find(".item:first").is('.active')
        $(".btn-next").removeClass('hide')
      else
        $(".btn-previous").removeClass('hide')
        $(".btn-next").removeClass('hide')
    )
