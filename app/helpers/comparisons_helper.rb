module ComparisonsHelper

  def comparison_description(comparison)
    comparison.description.present? ? comparison.description : "This comparison has no description."
  end

end
