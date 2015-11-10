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
      # loop: 1
      playlist: 'kn4J4bqJG2Q'
      modestbranding: 1
      rel: 0
      playsinline: 1
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