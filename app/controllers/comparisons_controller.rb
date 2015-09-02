class ComparisonsController < ApplicationController
  def index
    @toolbar = {
      fixed: [
        {icon: "fa fa-bolt fa-fw", label: "Run Comparison", link: new_comparison_path}
      ]
    }

    @grid = {
      header: [
        {field: "comparison", display: "Comparison"},
        {field: "variant", display: "Variant"},
        {field: "reference", display: "Reference Variant"},
        {field: "score", display: "Score"},
        {field: "created", display: "Created"},
        {field: "addedBy", display: "Added by"}
      ],
      rows: [
        [
          {field: "comparison", display: "Comparison ABC", icon: "fa fa-lock fa-fw", link: "#"},
          {field: "variant", display: "variant_123.vcf.gz", link: "#"},
          {field: "reference", display: "reference_variant.vcf.gz", link: "#"},
          {field: "score", display: "92%"},
          {field: "created", display: "8/15/2015"},
          {field: "addedBy", display: "Doogie Howser", link: "#"}
        ],
        [
          {field: "comparison", display: "Comparison XYZ", link: "#"},
          {field: "variant", display: "variant_516.vcf.gz", link: "#"},
          {field: "reference", display: "reference_variant_2.vcf.gz", link: "#"},
          {field: "score", display: "95%"},
          {field: "created", display: "4/15/2015"},
          {field: "addedBy", display: "Doogie Howser", link: "#"}
        ]
      ]
    }
  end

  def show
  end

  def new
  end
end
