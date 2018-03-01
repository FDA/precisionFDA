class WorkflowIndexModel
  constructor: (workflow) ->
    if workflow?
      @noteAttachModel = new Precision.models.NoteAttachModel(workflow.id, 'Workflow')
      @readmeDisplay = Precision.md.render(workflow.readme)
      @stages = workflow.spec.input_spec.stages
      @length = ko.computed(=>
        @stages.length - 1)
      @firstStage = ko.computed(=>
        workflow.spec.input_spec.stages[0] )
      @lastStage = ko.computed(=>
        workflow.spec.input_spec.stages[@length()])
      @slots = workflow.spec
      @slotsWithoutFirstAndLast = ko.computed(=>
        ko.utils.arrayFilter( @stages, (stage) =>
          !(stage == @stages[0] || stage == @stages[@stages.length - 1])
        )
      )

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

WorkflowsController = Paloma.controller('Workflows',
  index: ->
    $container = $("body main")
    viewModel = new WorkflowIndexModel(@params.workflow)

    ko.applyBindings(viewModel, $container[0])

    $container.find('[data-toggle="tooltip"]').tooltip({
      container: 'body'
    })
    $container.on("click", ".wice-grid .indicator", (e) ->
      e.preventDefault()
      analysis = e.currentTarget.parentElement.parentElement.id
      $(".#{analysis}").toggle()
    )

    for own analysis_id, jobs of @params.analyses_jobs
      $analysis_row = $("#analysis-#{analysis_id}")
      for job in jobs
        $job = $("<tr>").addClass("analysis-#{analysis_id}").css("display", "none")
        rows = [
          $spacer1 = $("<td>"),
          $state = $("<td>").addClass("col-state").addClass("state-#{job.state}").html(job.state),
          $execution = $("<td>").append($("<a>").attr("href", "/jobs/#{job.dxid}").html(job.execution).prepend($("<span>").addClass("fa #{job.icon} fa-fw"))),
          $app = $("<td>").append($("<a>").attr("href", "/apps/#{job.app_dxid}").html(" #{job.app_title}").prepend($("<span>").addClass("fa fa-cube fa-fw")))
          $duration = $("<td>").html(job.duration),
          $created = $("<td>").html(job.created),
          $spacer2 = $("<td>")
        ]
        if !@params.workflow
          $workflow = $("<td>").append($("<a>").attr("href", "/workflows/#{job.workflow_dxid}").html(" #{job.workflow_title}").prepend($("<span>").addClass("fa fa-flash fa-fw")))
          rows.splice(3, 0, $workflow)
        $job.append(rows)
        $analysis_row.after($job)
)
