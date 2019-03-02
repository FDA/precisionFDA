class WorkflowShowModel
  constructor: (workflow) ->
    if workflow?
      @noteAttachModel = new Precision.models.NoteAttachModel(workflow.id, 'Workflow')
      @readmeDisplay = Precision.md.render(workflow.readme)
      @stages = workflow.spec.input_spec.stages
      @length = ko.computed( => @stages.length - 1)
      @firstStage = ko.computed( -> workflow.spec.input_spec.stages[0])
      @lastStage = ko.computed(=> workflow.spec.input_spec.stages[@length()])
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

getBatchId = (batch_id, analysis_id) -> "#{batch_id}-analisys-#{analysis_id}"

renderSimpleJobRow = (job, analysis_id, workflow) ->
  $job = $("<tr>").addClass("analysis-#{analysis_id}").css("display", "none")
  rows = [
    $spacer1 = $("<td>"),
    $state = $("<td>").addClass("col-state").addClass("state-#{job.state}").html(job.state),
    $execution = $("<td>").append($("<a>")
                                  .attr("href", "/jobs/#{job.uid}")
                                  .html(job.execution)
                                  .prepend($("<span>")
                                  .addClass("fa #{job.icon} fa-fw"))),
    $app = $("<td>").append($("<a>")
                              .attr("href", "/apps/#{job.app_uid}")
                              .html(" #{job.app_title}")
                              .prepend($("<span>")
                              .addClass("fa fa-cube fa-fw"))),
    $duration = $("<td>").html(job.duration),
    $created = $("<td>").html(job.created),
    $spacer2 = $("<td>"),
    $spacer2 = $("<td>")
  ]
  if !workflow
    $workflow = $("<td>").append($("<a>")
                                  .attr("href", "/workflows/#{job.workflow_uid}")
                                  .html(" #{job.workflow_title}")
                                  .prepend($("<span>")
                                  .addClass("fa fa-flash fa-fw")))
    rows.splice(3, 0, $workflow)
  $job.append(rows)

renderChildJobRow = (job, analysis_id, parent_id, wf, workflow = null) ->
  $job = $("<tr>")
  execution_url = "/jobs/#{job.uid}"
  app_url = "/apps/#{job.app_uid}"
  id = getBatchId(analysis_id, parent_id)
  $job.addClass("child-analysis-#{parent_id}").addClass(id).css("display", "none")

  rows = []
  rows.push $("<td>")
  rows.push $("<td>").addClass("col-state").addClass("state-#{job.state}").html(job.state)
  rows.push $("<td>").append($("<a>")
                    .attr("href", execution_url)
                    .html(job.execution)
                    .prepend($("<i>")
                    .addClass("fa #{job.icon} fa-fw")))
  if !workflow
    rows.push $("<td>").append($("<a>")
                        .attr("href", wf.url)
                        .html(wf.name)
                        .prepend($("<i>")
                        .addClass("fa fa-flash fa-fw")))
  rows.push $("<td>").append($("<a>")
                    .attr("href", app_url)
                    .html(job.app_title)
                    .prepend($("<i>")
                    .addClass("fa fa-cube fa-fw")))
  rows.push $("<td>").html(job.duration)
  rows.push $("<td>").html(job.created)
  rows.push $("<td>")
  rows.push $("<td>")

  $job.append(rows)
  return $job

renderBatchJobRow = (job, analysis_id, wf, workflow = null) ->
  $job = $("<tr>")
  execution_url = "/workflows/#{job.workflow_uid}"
  app_url = "/workflows/#{job.workflow_uid}"
  id = "analysis-#{analysis_id}"

  $job.addClass(id).css("display", "none")
  rows = []
  rows.push $("<td>")
  rows.push $("<td>").addClass("col-state").addClass("state-#{job.state}").html(job.state)
  rows.push $("<td>").append($("<a>")
                      .attr("href", execution_url)
                      .html(job.execution)
                      .prepend($("<i>")
                      .addClass("fa #{job.icon} fa-fw")))
  if !workflow
    rows.push $("<td>").append($("<a>")
                        .attr("href", wf.url)
                        .html(wf.name)
                        .prepend($("<i>")
                        .addClass("fa fa-flash fa-fw")))
  else
    rows.push $("<td>").html('N/A')
  rows.push $("<td>").html('N/A') if !workflow
  rows.push $("<td>").html(job.duration)
  rows.push $("<td>").html(job.created)
  rows.push $("<td>")
  rows.push $("<td>")

  $job.append(rows)
  return $job

renderTd = (td, batch_id) ->
  $i = $('<i class="wf-indicator fa fa-caret-down fa-fw"></i>').attr('id', batch_id)
  td.addClass('toggle-row').append($i)

renderBatchRow = (job, analysis_id, index, workflow) ->
  batch_id = "#{job.batch_id}_#{index}"
  rows = []
  wf = { name: job.execution, url: "/workflows/#{job.workflow_uid}" }
  $job = renderBatchJobRow(job, analysis_id, wf, workflow)
  renderTd($job.find('td').first(), getBatchId(batch_id, analysis_id))
  rows.push($job)
  $job.addClass('workflow-run')
  for child_job in job.jobs
    $child_job = renderChildJobRow(child_job, batch_id, analysis_id, wf, workflow)
    rows.push($child_job)
  return rows

renderSimpleAnalysis = (analyses_jobs, workflow) ->
  for own analysis_id, jobs of analyses_jobs
    $analysis_row = $("#analysis-#{analysis_id}")
    for job in jobs
      $job = renderSimpleJobRow(job, analysis_id, workflow)
      $analysis_row.after($job)

renderBatchAnalysis = (batches, workflow) ->
  for own analysis_id, batch_runs of batches
    $analysis_row = $("#analysis-#{analysis_id}")
    for batch, index in batch_runs
      $batch = renderBatchRow(batch, analysis_id, index, workflow)
      $analysis_row.after($batch)

WorkflowsController = Paloma.controller('Workflows', {
  index: ->
    $container = $("body main")
    viewModel = new WorkflowShowModel(@params.workflow)

    ko.applyBindings(viewModel, $container[0])

    $container.find('[data-toggle="tooltip"]').tooltip({
      container: 'body'
    })
    $container.on("click", ".wice-grid .indicator", (e) ->
      e.preventDefault()
      analysis = e.currentTarget.parentElement.parentElement.id
      $(".#{analysis}").toggle()
      $(".child-#{analysis}").hide()
    )
    $container.on("click", ".wice-grid .wf-indicator", (e) ->
      e.preventDefault()
      batch_id = e.currentTarget.id
      $(".#{batch_id}").toggle()
    )

    renderSimpleAnalysis(@params.analyses_jobs, @params.workflow)
    renderBatchAnalysis(@params.batches, @params.workflow)

})

# if !@params.workflow
#   $workflow = $("<td>").append($("<a>").attr("href", "/workflows/#{job.workflow_uid}").html(" #{job.workflow_title}").prepend($("<span>").addClass("fa fa-flash fa-fw")))
#   rows.splice(3, 0, $workflow)
