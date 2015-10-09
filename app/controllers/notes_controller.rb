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
          {field: "name", display: "Taking NA12878 from a HiSeq X Ten via the precisionFDA lens", link: note_path(2)},
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
    @note = {
      title: "My first note",
      id: params[:id].to_i,
      user_id: @context.user_id
    }

    if params[:id].to_i == 1
      @name = "PrecisionFDA Benchmark VCFs"

      @comparisons = Comparison.accessible_by(@context.user_id)
      @files = UserFile.real_files.accessible_by(@context.user_id).where(id: [15, 16, 17, 43, 44, 45])
    elsif params[:id].to_i == 2
      @name = "Taking NA12878 from a HiSeq X Ten via the precisionFDA lens"

      @comparisons = Comparison.accessible_by(@context.user_id).where(id: [5, 8])

      @comparison = Comparison.find(5)
      @comparison2 = Comparison.find(8)
      @meta = ActiveSupport::JSON.decode(@comparison.meta)
      @meta2 = ActiveSupport::JSON.decode(@comparison2.meta)
      @test_vcf = @comparison.input('test_vcf').user_file
      @ref_vcf = @comparison.input('ref_vcf').user_file
      @ref_vcf2 = @comparison2.input('ref_vcf').user_file

      # NOTE: Make this be a query for both INPUT and OUTPUT UserFiles
      @files = @comparison.user_files.all + @comparison2.user_files.all
    elsif params[:id].to_i == 99
      @comparisons = Comparison.accessible_by(@context.user_id)
      @files = UserFile.real_files.accessible_by(@context.user_id)
      # @apps = App.accessible_by(@context.user_id)
    end

    if @note[:user_id] == @context.user_id
      js title: @note[:title], comparisons: @comparisons, files: @files
    end
  end

  def new
  end
end
