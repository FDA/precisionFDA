module ComparisonsHelper
  def comparison_description(comparison)
    comparison.description.presence || "This comparison has no description."
  end

  def benchmark?(name)
    name.starts_with?("ref_") || name.starts_with?("benchmark_")
  end

  def test_set?(name)
    name.starts_with?("test_")
  end

  def benchmark_spec?(spec)
    benchmark?(spec["name"])
  end

  def test_set_spec?(spec)
    test_set?(spec["name"])
  end
end
