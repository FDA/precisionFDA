NewsItem = undefined
NewsViewModel = undefined
newsModel = undefined
NewsItemsData = undefined

init_admin_news = ->

  NewsItem = (id, title, link, video, content, urlFor) ->
    self = this
    self.id = ko.observable(id)
    self.title = ko.observable(title)
    self.link = ko.observable(link)
    self.video = ko.observable(video)
    self.content = ko.observable(content)
    return

  NewsItem::clone = ->
    new NewsItem(@id(), @title(), @link(), @video(), @content(), @urlFor())

  NewsViewModel = ->
    self = this
    self.news_items = ko.observableArray([])
    self.displaySave = ko.observable('visibility:hidden')

    self.handleDraggedItem = (item, event, ui) ->
      ui.item.clone()

    self.saveSortBoxes = ->
      $('.btn-success .fa-save').addClass 'fa-pulse'
      items = newsModel.news_items()
      pos = []
      for i of items
        `i = i`
        pos[i] =
          id: items[i].id
          position: i

      posUpdateError = ->
        Precision.alert.show 'Error updating news items around.'
        return

      posUpdateSuccess = ->
        $('.btn-success .fa-save').removeClass 'fa-pulse'
        self.displaySave 'visibility:hidden'
        return

      window.Precision.api '/admin/news/positions', { news_items: pos }, posUpdateSuccess, posUpdateError
      return

    self.movedItem = (arg) ->
      # mark it for upload 
      self.displaySave 'visibility:visible'
      return

    return

  newsModel = new NewsViewModel
  ko.applyBindings newsModel, document.getElementById('news-main')
  $('.news_reorder_save').click ->
    submitChanges()
    return
  $('.drag-item').draggable
    connectToSortable: '#news-main'
    helper: 'clone'
    start: (event, ui) ->
      ko.utils.domData.set event.target, 'ko_dragItem', true
      return
  $.ajax
    url: '/admin/news'
    type: 'GET'
    cache: false
    dataType: 'json'
    success: (data) ->
      NewsItemsData = data
      for i of data
        `i = i`
        data[i].urlFor = '/admin/news/' + data[i].id
        data[i].editUrl = '/admin/news/' + data[i].id + '/edit'
        data[i].authToken = window._token
        data[i].publishedClass = if data[i].published then '' else 'news_item_private'
      newsModel.news_items data
      return
  return

NewsItemsController = Paloma.controller('Admin/NewsItems',
  index: ->
    $("#new_news_item").click ->
      item = $("#news_item").clone()
      item.appendTo('.pfda-cards-news')
      item.css('visibility', 'visible')
    $('.create-new-post').click ->
      this.getParent.ajaxSend()
    init_admin_news();
)
