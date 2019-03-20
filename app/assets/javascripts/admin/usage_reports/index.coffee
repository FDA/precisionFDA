class PageUsageReportsView
  setDateRange: (type = 'week') ->

    date_at = moment()
    date_to = moment()
    show_custom_dates = false

    switch type
      when 'day' then date_at = date_at.startOf('day')
      when 'week' then date_at = date_at.startOf('week')
      when 'month' then date_at = date_at.startOf('month')
      when 'year' then date_at = date_at.startOf('year')
      when 'custom' then show_custom_dates = true
      else return false

    @dateAtDatepicker.setValue(date_at)
    @dateToDatepicker.setValue(date_to)
    @showCustomDates(show_custom_dates)
    @filterType(type)

  constructor: () ->
    $dateAtDatepicker = $('.add-datetimepicker[name="custom_range[date_from]"]')
    @dateAtDatepicker = new Precision.Datepicker $dateAtDatepicker[0], {
      icon: true,
      noDefaultValue: true,
      format: 'MM/DD/YYYY'
    }
    $dateToDatepicker = $('.add-datetimepicker[name="custom_range[date_to]"]')
    @dateToDatepicker = new Precision.Datepicker $dateToDatepicker[0], {
      icon: true,
      noDefaultValue: true,
      format: 'MM/DD/YYYY'
    }
    @showCustomDates = ko.observable(false)
    @filterType = ko.observable('')
    @setDateRange()

#########################################################
#
#
# PALOMA CONTROLLER
#
#
#########################################################

UsageReportsController = Paloma.controller('Admin/UsageReports', {
  index: ->
    $container = $("body main")
    viewModel = new PageUsageReportsView(@params)
    ko.applyBindings(viewModel, $container[0])
    initWiceGrid()

    $('#select_date_range').on 'click', (e) ->
      e.preventDefault()
      $(this).find('button').removeClass('active')
      $(e.target).addClass('active')
      viewModel.setDateRange $(e.target).attr('data-type')

    $('#select_date_range').find("[data-type=\"#{@params.selected_range}\"]").click()
    if @params.custom_range_begin
      viewModel.dateAtDatepicker.setValue(moment(@params.custom_range_begin))
    if @params.custom_range_end
      viewModel.dateToDatepicker.setValue(moment(@params.custom_range_end))
})
