class NotesController < ApplicationController
  def index
    @notes_toolbar = {
      fixed: [
        {icon: "fa fa-sticky-note fa-fw", label: "New Note", link: new_note_path}
      ]
    }

    @notes_list = {
      header: [
        {field: "name", display: "Name"},
        {field: "created", display: "Created"},
        {field: "addedBy", display: "Added by"}
      ],
      rows: [
        [
          {field: "name", display: "PrecisionFDA Benchmark VCFs", link: note_path(1)},
          {field: "created", display: "9/17/2015"},
          {field: "addedBy", display: "George Asimenos", link: user_path("george.fdauser")}
        ],
        [
          {field: "name", display: "Studying NA12878 from an Illumina X Ten via the precisionFDA lens", link: note_path(1)},
          {field: "created", display: "9/16/2015"},
          {field: "addedBy", display: "George Asimenos", link: user_path("george.fdauser")}
        ],
        [
          {field: "name", display: "How related are NA12878 and NA12877?", link: note_path(1)},
          {field: "created", display: "9/15/2015"},
          {field: "addedBy", display: "George Asimenos", link: user_path("george.fdauser")}
        ]
      ]
    }
  end

  def show
  end
end
