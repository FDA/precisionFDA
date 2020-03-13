# Responsible for comparators-related actions.
class ComparatorsController < ApplicationController
  # Redirect to new comparison path if request isn't XHR.
  before_action only: %i(show) do
    require_xhr(new_comparison_path)
  end

  # Renders selected comparator's spec.
  def show
    uid = unsafe_params[:id]

    spec = if uid == DEFAULT_COMPARISON_APP
      remapped_inputs
    else
      Comparisons::ComparatorProvider.call(uid)&.input_spec
    end

    raise I18n.t("invalid_comparator") if spec.blank?

    render json: spec
  end

  private

  # Remaps inputs for default comparison app.
  # @return [Hash] Remapped inputs.
  def remapped_inputs
    remapped = DefaultComparatorApp.input_spec.dup

    remapped.each do |input|
      input["name"] = "benchmark_vcf" if input["name"] == "ref_vcf"
      input["name"] = "benchmark_bed" if input["name"] == "ref_bed"
    end

    remapped
  end
end
