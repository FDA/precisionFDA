class BiospecimensController < ApplicationController
  def index
    @toolbar = {
      fixed: [
        {icon: "fa fa-plus-square fa-fw", label: "Add Biospecimen", link: "#"}
      ]
    }

    @grid = {
      header: [
        {field: "name", display: "Name"},
        {field: "comparisons", display: "Comparisons"},
        {field: "files", display: "Files"},
        {field: "score", display: "Highest Score"},
        {field: "created", display: "Created"},
        {field: "addedBy", display: "Added by"}
      ],
      rows: [
        [
          {field: "name", display: "Biospecimen 1", icon: "fa fa-lock fa-fw", link: "#"},
          {field: "comparisons", display: "5"},
          {field: "files", display: "10"},
          {field: "score", display: "91%"},
          {field: "created", display: "8/15/2015"},
          {field: "addedBy", display: "DNAnexus", link: "#"}
        ],
        [
          {field: "name", display: "Biospecimen 2", link: "#"},
          {field: "comparisons", display: "15"},
          {field: "files", display: "20"},
          {field: "score", display: "94%"},
          {field: "created", display: "5/15/2015"},
          {field: "addedBy", display: "George Asimenos", link: "#"}
        ]
      ]
    }
  end
end
