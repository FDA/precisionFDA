class CommentItem
  constructor: (data) ->
    comments = data.comments || []

    @username = data.username
    @user = data.user_fullname
    @org = data.org
    @date = data.created_at
    @avatar = data.user_avatar
    @childComments = ko.observableArray(comments.map((comment) -> new CommentItem(comment)))

    regex = Precision.MENTIONS_CONST.regex
    replace = Precision.MENTIONS_CONST.replace
    @body = data.body.replace(regex, replace)

class ReportItem
  constructor: (data) ->
    @user_fullname = data.user_fullname
    @username = data.username
    @avatar = data.user_avatar
    @date = data.created_at
    @name = data.object_name
    @url = data.object_url
    @additional_info = data.additional_info
    @comments = ko.observableArray(data.comments.map((comment) -> new CommentItem(comment)))

class SpacesReportsView
  getLabelIcon: (type) ->
    type = type.toLowerCase()
    switch type
      when 'spaces' then return 'fa-object-group'
      when 'memberships' then return 'fa-group'
      when 'tasks' then return 'fa-check-square-o'
      when 'comments' then return 'fa-comment'
      when 'apps' then return 'fa-cubes'
      when 'jobs' then return 'fa-list-ol'
      when 'files' then return 'fa-files-o'
      when 'assets' then return 'fa-file-zip-o'
      when 'comparisons' then return 'fa-bullseye'
      when 'workflows' then return 'fa-flash'
      when 'notes' then return 'fa-sticky-note'
      else return ''

  convertRepoTypes: (repoTypes) ->
    types = []
    for k of repoTypes
      types.push { name: k, value: repoTypes[k] }
    return types.sort((a, b) -> a.name > b.name)

  loadRepoTypes: (data) ->
    url = "/spaces/#{@space_id}/space_reports/counters"
    $.get(url, data).then((data) => @reportTypes(@convertRepoTypes(data)))

  loadReport: (data, concat) ->
    params = "sort=#{@sortDirection()}&page=#{@reportPage()}&type=#{@activeReportType()}"
    url = "/spaces/#{@space_id}/space_reports?#{params}"
    @reportLoading(true)
    $.get(url, data).then(
      (data) =>
        reportItems = data.map((item) -> new ReportItem(item))
        if concat
          if data.length > 0
            @reportItems @reportItems().concat(reportItems)
          else
            @reportPage(@reportPage() - 1) if @reportPage() > 0
        else
          @reportItems reportItems
        @reportLoading(false)
        @moreReportLoading(false)
      () =>
        @reportLoading(false)
        @moreReportLoading(false)
    )

  loadMoreReports: () ->
    @moreReportLoading(true) if @reportPage() > 1
    data = @getFormData()
    @reportPage(@reportPage() + 1)
    @loadReport(data, true)

  getFormData: () -> @filtersForm.serialize()


  submitFilters: () ->
    @reportPage(1)
    data = @getFormData()
    @loadReport(data)
    @loadRepoTypes(data)

  resetDateFilters: () ->
    $('#select_date_range button').removeClass('active')
    @setDateRange('reset')

  resetUserFilters: () ->
    @filtersForm[0].querySelectorAll('select').forEach(
      (select) ->
        select.value = null
        $(select).trigger('change')
    )
    $('.selectpicker').selectpicker('refresh')

  resetFilters: () ->
    @reportPage(1)
    @resetDateFilters()
    @resetUserFilters()
    data = @getFormData()
    @loadReport(data)
    @loadRepoTypes(data)

  setDateRange: (type = 'week') ->
    date_at = moment()
    date_to = moment().endOf('day')

    switch type
      when 'day' then date_at = date_at.startOf('day')
      when 'week' then date_at = date_at.startOf('week')
      when 'month' then date_at = date_at.startOf('month')
      when 'year' then date_at = date_at.startOf('year')
      when 'reset' then date_at = moment(@spaceCreatedAt)
      else return false

    @dateAtDatepicker.setValue(date_at)
    @dateToDatepicker.setValue(date_to)

  changeSortDirection: () ->
    Precision.utils.scrollTo($(window).height() - 200)
    if @sortDirection() == 'asc'
      @sortDirection('desc')
    else
      @sortDirection('asc')
    @reportPage(1)
    data = @getFormData()
    @loadReport(data)

  isTypeActive: (type) -> @activeReportType() == type

  setActiveReportType: (type) ->
    return false if @reportLoading() or @moreReportLoading()
    @activeReportType(type)
    @submitFilters()

  getDownloadHref: () ->
    params = @getFormData()
    path = "/spaces/#{@space_id}/space_reports/download_report?#{params}"
    return path

  chooseReportFormat: () =>
    $('#chooseReportFormat').modal('show')
    return false

  constructor: (params) ->
    @spaceCreatedAt = params.space_created_at
    @space_id = params.space_id
    @filtersForm = $('#reports_filters_form form')
    @reportTypes = ko.observableArray @convertRepoTypes(params.counts)
    @activeReportType = ko.observable()
    @reportItems = ko.observableArray()
    @reportLoading = ko.observable(false)
    @moreReportLoading = ko.observable(false)
    @sortDirection = ko.observable('desc')
    @reportPage = ko.observable(1)
    @sortLabel = ko.computed(() =>
      if @sortDirection() == 'desc'
        return 'Newest to Oldest'
      else
        return 'Oldest to Newest'
    )

    @downloadHref = ko.observable()

    datePickerParams = {
      dafaultValue: new Date(),
      format: 'MM/DD/YYYY',
      onChange: () => @downloadHref(@getDownloadHref())
    }
    datePickerOpts = { widgetPositioning: { horizontal: 'auto', vertical: 'bottom' } }
    @dateAtDatepicker = new Precision.Datepicker $('.add-datetimepicker[name="date_at"]')[0],
      datePickerParams,
      datePickerOpts
    @dateToDatepicker = new Precision.Datepicker $('.add-datetimepicker[name="date_to"]')[0],
      datePickerParams,
      datePickerOpts

    @setDateRange()
    @filtersForm.on 'change', () =>
      @downloadHref(@getDownloadHref())

    @setActiveReportType(@reportTypes()[0].name)

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

SpacesController = Paloma.controller('Spaces', {
  reports: () ->
    $container = $("#ko_spaces_reports_container")
    viewModel = new SpacesReportsView(@params)
    ko.applyBindings(viewModel, $container[0])

    $('#select_date_range').on 'click', (e) ->
      e.preventDefault()
      $(this).find('button').removeClass('active')
      $(e.target).addClass('active')
      viewModel.setDateRange $(e.target).attr('data-type')

    $('.selectpicker').selectpicker('refresh')

    $(document).ready(() -> Precision.utils.scrollTo(0))

    scrollPos = 0
    loadMoreReports = () ->
      goDown = scrollPos < $(window).scrollTop()
      if($(window).scrollTop() + $(window).height() >= $(document).height() - 200 and goDown)
        viewModel.loadMoreReports() if !viewModel.reportLoading()
      scrollPos = $(window).scrollTop()

    $(window).on 'scroll', loadMoreReports
    $(document).on 'turbolinks:before-visit', () -> $(window).off 'scroll', loadMoreReports

})
