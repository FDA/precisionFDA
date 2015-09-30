class AppsController < ApplicationController
  def index
    app = params[:app]

    @apps_list = {
      community: [
        {name:"bwa", display: "BWA", link: appjobs_path("bwa")},
        {name:"gatk", display: "GATK", link: appjobs_path("gatk")},
        {name:"art", display: "ART Illumina Read Simulation", link: appjobs_path("art")}
      ],
      custom: [
        {name:"mycustom", display: "HugeSeq Pipeline", link: appjobs_path("mycustom")}
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
        {field: "addedBy", display: "Launched by"}
      ],
      rows: [
        [
          {field: "state", display: "Running", classes: "state-running"},
          {field: "name", display: "ART whole-genome 150bp", link: "#"},
          {field: "duration", display: "5 min"},
          {field: "created", display: "9/17/2015"},
          {field: "addedBy", display: "george.fdauser", link: "#"}
        ],
        [
          {field: "state", display: "Done", classes: "state-done"},
          {field: "name", display: "ART HiSeq 1000 simulation", link: "#"},
          {field: "duration", display: "20 min"},
          {field: "created", display: "9/16/2015"},
          {field: "addedBy", display: "george.fdauser", link: "#"}
        ],
        [
          {field: "state", display: "Failed", classes: "state-failed"},
          {field: "name", display: "ART HiSeq 1000 simulation", link: "#"},
          {field: "duration", display: "1 min"},
          {field: "created", display: "9/15/2015"},
          {field: "addedBy", display: "george.fdauser", link: "#"}
        ]
      ]
    }
  end

  def show
  end
end
