class FilesController < ApplicationController
  def index
    @toolbar = {
      fixed: [
        {icon: "fa fa-plus-square fa-fw", label: "Add Files", link: "#"}
      ]
    }

    @grid = {
      header: [
        {field: "name", display: "Name"},
        {field: "size", display: "Size"},
        {field: "created", display: "Created"},
        {field: "addedBy", display: "Added by"}
      ],
      rows: [
        [
          {
            field: "name",
            display: "File A",
            icon: "fa fa-lock fa-fw",
            link: "#"
          },
          {
            field: "size",
            display: "10 GB"
          },
          {
            field: "created",
            display: "8/15/2015"
          },
          {
            field: "addedBy",
            display: "Doogie Howser"
          }
        ],
        [
          {
            field: "name",
            display: "File B",
            link: "#"
          },
          {
            field: "size",
            display: "5 GB"
          },
          {
            field: "created",
            display: "6/8/2015"
          },
          {
            field: "addedBy",
            display: "Doogie Howser"
          }
        ]
      ]
    }
  end
end
