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

renderJobRow = (job, analysis_id, parent_id) ->
  $job = $("<tr>")

  if parent_id
    id = getBatchId(analysis_id, parent_id)
    $job.addClass("child-analysis-#{parent_id}")
  else
    id = "analysis-#{analysis_id}"

  if job.workflow_uid
    execution_url = "/workflows/#{job.workflow_uid}"
    app_url = "/workflows/#{job.workflow_uid}"
  else
    execution_url = "/jobs/#{job.uid}"
    app_url = "/apps/#{job.app_uid}"

  $job.addClass(id).css("display", "none")
  rows = []
  rows.push $("<td>")
  rows.push $("<td>").addClass("col-state").addClass("state-#{job.state}").html(job.state)
  rows.push $("<td>").append($("<a>").attr("href", execution_url).html(job.execution))
  if parent_id or (!parent_id and !job.workflow_uid)
    rows.push $("<td>").append($("<a>").attr("href", app_url).html(job.app_title))
   if !parent_id and job.workflow_uid
    rows.push $("<td>").html('N/A')
  rows.push $("<td>").html(job.duration)
  rows.push $("<td>").html(job.created)
  rows.push $("<td>")
  rows.push $("<td>")

  $job.append(rows)
  return $job

renderTd = (td, batch_id) ->
  $i = $('<i class="wf-indicator fa fa-caret-down fa-fw"></i>').attr('id', batch_id)
  td.addClass('toggle-row').append($i)

renderBatchJobRow = (job, analysis_id, index) ->
  batch_id = "#{job.batch_id}_#{index}"
  rows = []
  $job = renderJobRow(job, analysis_id)
  renderTd($job.find('td').first(), getBatchId(batch_id, analysis_id))
  rows.push($job)
  $job.addClass('workflow-run')
  for child_job in job.jobs
    $child_job = renderJobRow(child_job, batch_id, analysis_id)
    rows.push($child_job)
  return rows

renderSimpleAnalysis = (analyses_jobs) ->
  for own analysis_id, jobs of analyses_jobs
    $analysis_row = $("#analysis-#{analysis_id}")
    for job in jobs
      $job = renderJobRow(job, analysis_id)
      $analysis_row.after($job)

renderBatchAnalysis = (batches) ->
  for own analysis_id, batch_runs of batches
    $analysis_row = $("#analysis-#{analysis_id}")
    for batch, index in batch_runs
      $batch = renderBatchJobRow(batch, analysis_id, index)
      $analysis_row.after($batch)

WorkflowsController = Paloma.controller('Workflows', {
  show: ->
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

    renderSimpleAnalysis(@params.analyses_jobs)
    renderBatchAnalysis(@params.batches)

})
