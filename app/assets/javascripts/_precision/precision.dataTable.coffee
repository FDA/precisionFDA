DataTable = $.fn.dataTable
dom = "<'row'<'col-sm-4'l><'col-sm-12'f>><'row'<'col-sm-24'tr>><'row'<'col-sm-10'i><'col-sm-14'p>>"

$.extend( true, DataTable.defaults, {
	dom: dom,
	renderer: 'bootstrap'
})
