class Box
  constructor: (box) ->
    @id = box.id
    @title = ko.observable(box.title)
    @description = ko.observable(box.description)
    @feature_url = ko.observable(box.feature_url)
    @documentation_url = ko.observable(box.documentation_url)
    @edit_url = "/admin/get_started_boxes/#{@id}/edit"

  data: =>
    { id: @id }

class adminBoxesModel
  constructor: (public_boxes, private_boxes) ->
    @displaySave = ko.observable(false)

    @publicBoxes = ko.observableArray(_.map(public_boxes, (box) =>
      new Box(box)
    ))
    @publicBoxes.id = "public"

    @privateBoxes = ko.observableArray(_.map(private_boxes, (box) =>
      console.log box.title
      new Box(box)
    ))
    @privateBoxes.id = "private"

  removeBox: (box) =>
    if confirm('Are you sure?')
      $.ajax "/admin/get_started_boxes/#{box.id}",
        contentType: 'application/json'
        method: 'DELETE'
        mimeType: 'application/json'
        success: (data, status, xhr) =>
          @publicBoxes.remove(box)
          @privateBoxes.remove(box)
        error: (xhr, status, err) ->
          Precision.alert.showAboveAll('Internal Server Error')

  myDropCallback: (arg) =>
    @displaySave(true)

  saveSortBoxes: =>
    Precision.api("/admin/get_started_boxes/update_positions", {
        public_boxes: _.map(@publicBoxes.peek(), (box) -> box.id),
        private_boxes: _.map(@privateBoxes.peek(), (box) -> box.id)
      }
      , null
      , (objects) =>
        Precision.alert.showAboveAll('Internal Server Error')
    )
    @displaySave(false)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

GetStartedBoxesController = Paloma.controller('Admin/GetStartedBoxes',
  index: ->
    $container = $("body main")
    viewModel = new adminBoxesModel(@params.public_boxes, @params.private_boxes)
    ko.applyBindings(viewModel, $container[0])
)
