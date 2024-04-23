class Participant
  constructor: (participant) ->
    @id = participant.id
    @href = ko.observable("/admin/participants/#{@id}/edit")
    @title = ko.observable(participant.title)
    @imageUrl = ko.observable(participant.image_url)

class adminParticipantsModel
  constructor: (org_participants, person_participants, invisible_participants) ->
    @displaySave = ko.observable(false)

    @orgParticipants = ko.observableArray(_.map(org_participants, (participant) =>
      new Participant(participant)
    ))
    @orgParticipants.id = "org"

    @personParticipants = ko.observableArray(_.map(person_participants, (participant) =>
      new Participant(participant)
    ))
    @orgParticipants.id = "person"

    @invisibleParticipants = ko.observableArray(_.map(invisible_participants, (participant) =>
      new Participant(participant)
    ))
    @invisibleParticipants.id = "invisible"

  myDropCallback: (arg) =>
    @displaySave(true)

  saveSortBoxes: =>
    Precision.api("/admin/participants/update_positions", {
        org_participants: _.map(@orgParticipants.peek(), (participant) -> participant.id),
        person_participants: _.map(@personParticipants.peek(), (participant) -> participant.id),
        invisible_participants: _.map(@invisibleParticipants.peek(), (participant) -> participant.id)
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

ParticipantsController = Paloma.controller('Admin/Participants',
  index: ->
    $container = $("body main")
    viewModel = new adminParticipantsModel(@params.org_participants, @params.person_participants, @params.invisible_participants)
    ko.applyBindings(viewModel, $container[0])
)
