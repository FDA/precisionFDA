class SpaceReportPdf
  include Prawn::View

  attr :filters, :context
  def initialize(context, filters, results)
    @context = context
    @filters = filters
    @results = results
    content
  end

  def content
    #stroke_axis
    fill_color 'e3edfa'
    rectangle [-100, 800], 700, 210
    fill

    fill_color '000000'
    text "Interaction Report", align: :center, size: 34, style: :bold
    text "Reported by: #{@context.user.full_name}", align: :right
    text "Report created: #{Date.today.strftime("%m/%d/%Y")}", align: :right
        stroke_color 'aaaaaa'
        stroke_horizontal_rule
        stroke_color '000000'
    move_down 4
    text "Filters", size: 24, style: :bold
    text "Report dates from  #{ @filters[:dates][:start_date]}  to  #{ @filters[:dates][:end_date]}"
    text "Users: #{ @filters[:users] || "all"}"

    text "\n", size: 20

    @results.each do |content_type|
      object_type = content_type[0]
      objects = content_type[1]
      text "#{object_type.capitalize} (#{objects.size})", size: 20, style: :bold
      objects.each do |item|
        text "\t #{item[:object_name]}", indent_paragraphs: 20
        text "\t #{item[:created_at]}", align: :right
        move_up 14
        indent(20) do
          text "\t Created by #{item[:user_fullname]}"

          stroke_color 'e3edfa'
          stroke_horizontal_rule
          stroke_color '000000'
        end
        move_down 8
      end
    end
  end
end