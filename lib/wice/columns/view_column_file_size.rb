module Wice
  module Columns
    class ViewColumnFileSize < ViewColumn

      include ActionView::Helpers::FormOptionsHelper

      def render_filter_internal(params)
        @query_from, _, param_name_from,  @dom_from = form_parameter_name_id_and_query(fr: '')
        @query_to, _, param_name_to, @dom_to = form_parameter_name_id_and_query(to: '')
        @query_unit, _, param_name_unit, @dom_unit = form_parameter_name_id_and_query(u: '')

        opts1 = { size: 3, id: @dom_from,  class: 'form-control input-sm range-start' }
        opts2 = { size: 3, id: @dom_to, class: 'form-control input-sm range-end' }
        opts3 = { id: @dom_unit, class: 'form-control custom-dropdown', name: param_name_unit }

        params_for_select = params.fetch(:u, nil)

        content_tag(
          :div,
          text_field_tag(param_name_from,  params[:fr], opts1) +
            text_field_tag(param_name_to, params[:to], opts2) +
              content_tag(
                :select,
                options_for_select(options_for_filter,params_for_select),
                opts3
              ),
          class: 'form-inline'
        )
      end

      def yield_declaration_of_column_filter
        {
          templates: [@query_from, @query_to, @query_unit],
          ids:       [@dom_from, @dom_to, @dom_unit]
        }
      end

      def options_for_filter
        ::Wice::Columns::ConditionsGeneratorColumnFileSize::MP.keys.map do |key|
          [I18n.t("wice_grid.file_size_filter.#{key}"), key]
        end
      end

    end
  end
end
