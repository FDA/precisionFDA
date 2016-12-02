window.Precision ||= {}
window.Precision.player = null

# This function creates an <iframe> (and YouTube player)
# after the API code downloads.
window.onYouTubeIframeAPIReady = ->
  window.Precision.player = new YT.Player('ytplayer',
    width: '100%'
    videoId: 'e5qOVz9EIuc'
    playerVars:
      autoplay: 0
      controls: 2
      enablejsapi: 1
      loop: 0
      playlist: 'e5qOVz9EIuc'
      modestbranding: 1
      rel: 0
      showinfo: 0
    events:
      'onReady': onPlayerReady
  )

# The API will call this function when the video player is ready.
window.onPlayerReady = (event) ->
  event.target.setPlaybackQuality("hd720")
  event.target.playVideo()

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

MainController = Paloma.controller('Main',
  index: ->
    $container = $("body main")

    if $('body.pfda-guest').length > 0
      $container.on("click", ".btn-player", (e) ->
        # This code loads the IFrame Player API code asynchronously.
        tag = document.createElement('script')

        tag.src = 'https://www.youtube.com/iframe_api'
        firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode.insertBefore tag, firstScriptTag
        # Replace the 'ytplayer' element with an <iframe> and
        # YouTube player after the API code downloads.

        $(e.target).closest(".btn-player-wrapper").addClass("player-playing")
      )

    $tooltips = $container.find("[data-toggle='tooltip']")
    if $tooltips.length > 0
      $tooltips.tooltip({container: 'body'})

    if $container.find("#quotes-carousel").length > 0
      Precision.carousel.setHeight("#quotes-carousel")
      pause = false
      percent = 0
      barInterval = null
      intervalTime = 30
      readingMS = 5000
      WPM = 400
      $bar = $('.transition-timer-carousel-progress-bar')
      $crsl = $('.carousel')
      $active = $crsl.find('.item.active')

      progressBarCarousel = ->
        if !pause
          percent += (intervalTime/readingMS * 100)
          if percent >= 100
            $bar.css width: '100%'
            percent = 0
            clearInterval(barInterval)
            $crsl.carousel 'next'
          else
            $bar.css width: percent + '%'

      restart = (e, $active) ->
        $active = $(e.relatedTarget) if e?
        text = $active.find('.pfda-quote-content').text()
        if _.size(text) > 0
          clearInterval(barInterval)
          percent = 0
          readingMinutes = _.size(text.split(' '))/WPM
          readingMS = readingMinutes * 60 * 1000
          barInterval = setInterval(progressBarCarousel, intervalTime)

      $crsl
        .on('slid.bs.carousel', restart)
        .on(
          mouseenter: ->
            pause = true
          mouseleave: ->
            pause = false
        )

      restart(null, $active)

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
)
