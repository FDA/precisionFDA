module SpaceTemplatesHelper
  def extract_options(space_templates)
    if space_templates.present?
      elements = space_templates.map do |t|
        [(t.name||"") + (t.private? ? " [private]":""), t.id]
      end
      [["",nil]].concat(elements)
    else
      [["",nil]]
    end
  end
end
