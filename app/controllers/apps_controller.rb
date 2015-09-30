class AppsController < ApplicationController
  def index
    app = params[:app]

    @apps_list = {
      community: [
        {name:"bwa", display: "BWA", link: appjobs_path("bwa")},
        {name:"gatk", display: "GATK", link: appjobs_path("gatk")},
        {name:"art", display: "ART FASTQ Generator", link: appjobs_path("art")}
      ],
      custom: [
        {name:"mycustom", display: "My Custom App", link: appjobs_path("mycustom")}
      ],
      active: app
    }

    @apps_toolbar = {
      fixed: [
        {icon: "fa fa-plus-square fa-fw", label: "Add App", link: new_app_path}
      ]
    }

    @jobs_toolbar = {
      fixed: [
        {icon: "fa fa-bolt fa-fw", label: "Run App", link: new_job_path}
      ]
    }

    @jobs_list = {
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
          {field: "addedBy", display: "George Asimenos", link: "#"}
        ],
        [
          {field: "state", display: "Done", classes: "state-done"},
          {field: "name", display: "Job ABC", link: "#"},
          {field: "duration", display: "2 hrs"},
          {field: "created", display: "2/15/2015"},
          {field: "addedBy", display: "George Asimenos", link: "#"}
        ],
        [
          {field: "state", display: "Failed", classes: "state-failed"},
          {field: "name", display: "Job PKR", link: "#"},
          {field: "duration", display: "5 min"},
          {field: "created", display: "1/15/2015"},
          {field: "addedBy", display: "George Asimenos", link: "#"}
        ]
      ]
    }
  end

  def show
  end
end
