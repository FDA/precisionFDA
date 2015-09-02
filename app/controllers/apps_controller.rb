class AppsController < ApplicationController
  def index
    @toolbar = {
      fixed: [
        {icon: "fa fa-plus-square fa-fw", label: "Add an App", link: "#"}
      ]
    }

    @grid = {
      header: [
        {field: "state", display: "State"},
        {field: "name", display: "Name"},
        {field: "duration", display: "Duration"},
        {field: "created", display: "Created"},
        {field: "addedBy", display: "Added by"}
      ],
      rows: [
        [
          {field: "state", display: "Running", classes: "state-running"},
          {field: "name", display: "Job XYZ", link: "#"},
          {field: "duration", display: "5 hrs"},
          {field: "created", display: "5/15/2015"},
          {field: "addedBy", display: "Doogie Howser", link: "#"}
        ],
        [
          {field: "state", display: "Done", classes: "state-done"},
          {field: "name", display: "Job ABC", link: "#"},
          {field: "duration", display: "2 hrs"},
          {field: "created", display: "2/15/2015"},
          {field: "addedBy", display: "Doogie Howser", link: "#"}
        ],
        [
          {field: "state", display: "Failed", classes: "state-failed"},
          {field: "name", display: "Job PKR", link: "#"},
          {field: "duration", display: "5 min"},
          {field: "created", display: "1/15/2015"},
          {field: "addedBy", display: "Doogie Howser", link: "#"}
        ]
      ]
    }
  end
end
