class SpacesFeedView
  getTypeColor: (typeName) ->
    typeName = typeName.toLowerCase()
    switch typeName
      when 'space' then return '#1f70b5'
      when 'membership' then return '#63a5de'
      when 'task' then return '#57b9a8'
      when 'comment' then return '#3c763d'
      when 'app' then return '#93d356'
      when 'job' then return '#754694'
      when 'file' then return '#df6dcc'
      when 'asset' then return '#56d699'
      when 'comparison' then return '#e05f5b'
      when 'workflow' then return '#983c49'
      when 'note' then return '#f0ad4e'
      else return ''

  getLabelIcon: (typeName) ->
    typeName = typeName.toLowerCase()
    switch typeName
      when 'space' then return 'fa-object-group'
      when 'membership' then return 'fa-group'
      when 'task' then return 'fa-check-square-o'
      when 'comment' then return 'fa-comment'
      when 'app' then return 'fa-cubes'
      when 'job' then return 'fa-list-ol'
      when 'file' then return 'fa-files-o'
      when 'asset' then return 'fa-file-zip-o'
      when 'comparison' then return 'fa-bullseye'
      when 'workflow' then return 'fa-flash'
      when 'note' then return 'fa-sticky-note'
      else return ''

  typesLabel: (type) -> "#{type.name} (#{type.value})"

  loadObjectTypes: (data) ->
    url = "/spaces/#{@space_id}/space_feed/object_types"
    $.get(url, data).then((data) => @objectTypes(data))

  loadFeed: (data, concat) ->
    url = "/spaces/#{@space_id}/space_feed?sort=#{@sortDirection()}&page=#{@feedPage()}"
    @feedLoading(true)
    $.get(url, data).then((data) =>
      if concat
        if data.length > 0
          @feedItems @feedItems().concat(data)
        else
          @feedPage(@feedPage() - 1) if @feedPage() > 0
      else
        @feedItems data
      @feedLoading(false)
      @moreFeedLoading(false)
    )

  loadMoreFeed: () ->
    @moreFeedLoading(true) if @feedPage() > 1
    data = @getFormData()
    @feedPage(@feedPage() + 1)
    @loadFeed(data, true)

  updateChartData: (chart, response) ->
    while(chart.series.length > 0)
      chart.series[0].remove()
    response.data.map((d) =>
      chart.addSeries({
        name: d.name,
        data: d.data,
        color: @getTypeColor(d.name)
      })
    )
    chart.update({
      legend: {
        enabled: true
      }
    })

  loadChart: (data) ->
    url = "/spaces/#{@space_id}/space_feed/chart"
    @activityChart.loadData url, data, null, (chart, response) => @updateChartData(chart, response)

  getFormData: () ->
    data = @filtersForm.serialize()
    if data.indexOf('object_type') < 0
      data += '&object_type=[]'
    return data

  submitFiltersFirstTime: () ->
    data = {
      date_at: @filtersForm.find('input[name="date_at"]').val(),
      date_to: @filtersForm.find('input[name="date_to"]').val()
    }
    @loadChart(data)
    @loadFeed(data)

  submitFilters: () ->
    @feedPage(1)
    data = @getFormData()
    @loadChart(data)
    @loadFeed(data)
    @loadObjectTypes(data)

  selectAllTypesCheckboxes: () ->
    @filtersForm[0].querySelectorAll('input[type="checkbox"]').forEach(
      (input) =>
        input.checked = true
        @saveCheckboxState(input)
    )

  clearAllTypesCheckboxes: () ->
    @filtersForm[0].querySelectorAll('input[type="checkbox"]').forEach(
      (input) =>
        input.checked = false
        @saveCheckboxState(input)
    )

  resetDateFilters: () ->
    $('#select_date_range button').removeClass('active')
    $('#select_date_range button[data-type="week"]').addClass('active')
    @setDateRange()

  resetUserFilters: () ->
    @filtersForm[0].querySelectorAll('select').forEach(
      (select) ->
        select.value = null
        $(select).trigger('change')
    )
    $('.selectpicker').selectpicker('refresh')

  resetFilters: () ->
    @feedPage(1)
    @selectAllTypesCheckboxes()
    @resetUserFilters()
    @resetDateFilters()
    data = @getFormData()
    @loadChart(data)
    @loadObjectTypes(data)

  setDateRange: (type = 'week') ->
    date_at = moment()
    date_to = moment().endOf('day')

    switch type
      when 'day' then date_at = date_at.startOf('day')
      when 'week' then date_at = date_at.startOf('week')
      when 'month' then date_at = date_at.startOf('month')
      when 'year' then date_at = date_at.startOf('year')
      else return false

    @dateAtDatepicker.setValue(date_at)
    @dateToDatepicker.setValue(date_to)

  changeSortDirection: () ->
    Precision.utils.scrollTo($(window).height() - 50)
    if @sortDirection() == 'asc'
      @sortDirection('desc')
    else
      @sortDirection('asc')
    @feedPage(1)
    data = @getFormData()
    @loadFeed(data)

  handleCheckboxChage: (item, e) ->
    @saveCheckboxState(e.target)

  saveCheckboxState: (input) -> @checkedTypes[input.value] = input.checked

  isTypeChecked: (value) ->
    if @checkedTypes.hasOwnProperty(value)
      return @checkedTypes[value]
    else
      return true

  constructor: (params) ->
    @space_id = params.space_id
    @filtersForm = $('#feed_filters_form form')
    @objectTypes = ko.observableArray(params.object_types)
    @feedItems = ko.observableArray()
    @feedLoading = ko.observable(false)
    @moreFeedLoading = ko.observable(false)
    @sortDirection = ko.observable('desc')
    @feedPage = ko.observable(1)
    @checkedTypes = {}
    @sortLabel = ko.computed(() =>
      if @sortDirection() == 'desc'
        return 'Newest to Oldest'
      else
        return 'Oldest to Newest'
    )
    @activityChart = new Precision.Chart({
      container: 'spaces_feed_chart'
      type: 'column'
    }, {
      xAxis: {
        startOnTick: true,
        endOnTick: true,
        minTickInterval: 86400000,
        type: 'datetime'
      },
      plotOptions: {
        column: {
          stacking: 'normal',
        }
      }
    })

    datePickerParams = { dafaultValue: new Date(), format: 'MM/DD/YYYY' }
    datePickerOpts = { widgetPositioning: { horizontal: 'auto', vertical: 'bottom' } }
    @dateAtDatepicker = new Precision.Datepicker $('.add-datetimepicker[name="date_at"]')[0],
      datePickerParams,
      datePickerOpts
    @dateToDatepicker = new Precision.Datepicker $('.add-datetimepicker[name="date_to"]')[0],
      datePickerParams,
      datePickerOpts

    @setDateRange()
    @submitFiltersFirstTime()

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

SpacesController = Paloma.controller('Spaces', {
  feed: () ->
    $container = $("#ko_spaces_feed_container")
    viewModel = new SpacesFeedView(@params)
    ko.applyBindings(viewModel, $container[0])

    $('#select_date_range').on 'click', (e) ->
      e.preventDefault()
      $(this).find('button').removeClass('active')
      $(e.target).addClass('active')
      viewModel.setDateRange $(e.target).attr('data-type')

    $('.selectpicker').selectpicker('refresh')

    $(document).ready(() -> Precision.utils.scrollTo(0))

    scrollPos = 0
    loadMoreFeed = () ->
      goDown = scrollPos < $(window).scrollTop()
      if($(window).scrollTop() + $(window).height() >= $(document).height() - 200 and goDown)
        viewModel.loadMoreFeed() if !viewModel.feedLoading()
      scrollPos = $(window).scrollTop()

    $(window).on 'scroll', loadMoreFeed
    $(document).on 'turbolinks:before-visit', () -> $(window).off 'scroll', loadMoreFeed


})
