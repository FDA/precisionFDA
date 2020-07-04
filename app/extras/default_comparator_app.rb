# Represents default comparator app.
module DefaultComparatorApp
  extend self

  # Returns comparator's dxid.
  # @return [String]
  def dxid
    DEFAULT_COMPARISON_APP
  end

  # Returns input spec.
  # @return [Array<Hash>]
  def input_spec
    [
      {
        "name" => "test_vcf",
        "class" => "file",
        "optional" => false,
        "label" => "Test VCF",
        "help" => "",
      },
      {
        "name" => "test_bed",
        "class" => "file",
        "optional" => true,
        "label" => "Test BED",
        "help" => "",
      },
      {
        "name" => "ref_vcf",
        "class" => "file",
        "optional" => false,
        "label" => "Benchmark VCF",
        "help" => "",
      },
      {
        "name" => "ref_bed",
        "class" => "file",
        "optional" => true,
        "label" => "Benchmark BED",
        "help" => "",
      },
    ]
  end
end
