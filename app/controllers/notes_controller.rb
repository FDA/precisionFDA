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
          {field: "name", display: "Studying NA12878 from an Illumina X Ten via the precisionFDA lens", link: note_path(2)},
          {field: "created", display: "9/16/2015"},
          {field: "addedBy", display: "George Asimenos", link: user_path("george.fdauser")}
        ],
        [
          {field: "name", display: "How related are NA12878 and NA12877?", link: note_path(3)},
          {field: "created", display: "9/15/2015"},
          {field: "addedBy", display: "George Asimenos", link: user_path("george.fdauser")}
        ]
      ]
    }
  end

  def show
     @toolbar = {
      fixed: [
        {label: "Edit", link: "#"},
        {label: "Publish", link: "#"}
      ]
    }

    if params[:id].to_i == 1
      @name = "PrecisionFDA Benchmark VCFs"

      comparisons = Comparison.accessible_by(@context.user_id)
      # NOTE: Get benchmark vcfs
      # @files = UserFile.accessible_by(@context.user_id)
      # @files_grid = initialize_grid(@files, {
      #   order: 'name',
      #   order_direction: 'asc',
      # })
    elsif params[:id].to_i == 2
      @name = "Studying NA12878 from an Illumina X Ten via the precisionFDA lens"

      @comparisons = Comparison.accessible_by(@context.user_id)
      @comparisons_grid = initialize_grid(@comparisons, {
        order: 'name',
        order_direction: 'asc',
        conditions: {id: 1}
      })

      @comparison = @comparisons.take
      @meta = ActiveSupport::JSON.decode(@comparison.meta)
      @test_vcf = @comparison.input('test_vcf').user_file
      @ref_vcf = @comparison.input('ref_vcf').user_file

      # NOTE: Make this be a query for both INPUT and OUTPUT UserFiles
      @files = @comparison.outputs
      @files_grid = initialize_grid(@files, {
        order: 'name',
        order_direction: 'asc',
      })
    end
  end
end
