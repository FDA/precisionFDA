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
          {field: "name", display: "PrecisionFDA Best Practices", link: note_path(1)},
          {field: "created", display: "5/15/2015"},
          {field: "addedBy", display: "George Asimenos", link: user_path("george.fdauser")}
        ],
        [
          {field: "name", display: "Setting up your first comparison", link: note_path(1)},
          {field: "created", display: "2/15/2015"},
          {field: "addedBy", display: "George Asimenos", link: user_path("george.fdauser")}
        ],
        [
          {field: "name", display: "The NA12878 Biospcimen", link: note_path(1)},
          {field: "created", display: "1/15/2015"},
          {field: "addedBy", display: "George Asimenos", link: user_path("george.fdauser")}
        ]
      ]
    }
  end

  def show
  end
end
