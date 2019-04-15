class MapSlotIOModal
  checkOutoutClass: (output) => @editingInput() and output.class == @editingInput().class

  checkAvailableOutputs: (slot) =>
    outputs = slot.outputs().filter((output) => @checkOutoutClass(output))
    return !outputs.length

  showModal: (input, nextStage) =>
    @editingInput(input)
    @nextStage(nextStage)
    @modal.modal('show')

  mapIO: (output) =>
    @editingInput().mapIO(output)
    @modal.modal('hide')

  constructor: () ->
    @editingInput = ko.observable(null)
    @nextStage = ko.observable(null)
    @nextStageSlots = ko.computed( => if @nextStage() then @nextStage().slots() else [] )

    @modal = $('#mapper-modal')
    @modal.on 'hidden.bs.modal', () =>
      @editingInput(null)
      @nextStage(null)
      $('body').addClass('modal-open') if $('.modal.in').length > 0


class ConfigureSlotIOModal
  showModal: (slot) =>
    @editingSlot(slot)
    @modal.modal('show')

  constructor: () ->
    @editingSlot = ko.observable(null)
    @mainTitle = ko.computed( => @editingSlot()?.appName())
    @revisionTitle = ko.computed( => "Revision: #{@editingSlot()?.revision}")

    @inputs = ko.computed( => @editingSlot()?.inputs())
    @hasInputs = ko.computed( => @inputs()?.length > 0)

    @outputs = ko.computed( => @editingSlot()?.outputs())
    @hasOutputs = ko.computed( => @outputs()?.length > 0)

    @modal = $('#configure-stage-modal')
    @modal.on 'hidden.bs.modal', () =>
      @editingSlot(null)

window.Precision ||= {}
window.Precision.wfEditor ||= {}
window.Precision.wfEditor.ConfigureSlotIOModal = ConfigureSlotIOModal
window.Precision.wfEditor.MapSlotIOModal = MapSlotIOModal
