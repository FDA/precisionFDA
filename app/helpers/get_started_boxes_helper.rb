module GetStartedBoxesHelper

  def get_started_box_title(box)
    first = box.completed?(@context) ? '' : ' first'
    case box.kind
    when 'upload_file'    then "Upload#{first} file"
    when 'add_asset'      then "Add#{first} asset"
    when 'create_app'     then "Create#{first} app"
    when 'launch_app'     then "Launch#{first} app"
    when 'run_comparison' then "Run#{first} comparison"
    when 'create_note'    then "Create#{first} note"
    else
      box.title
    end
  end

  def get_started_box_style(box)
    box.completed?(@context) ? 'default' : 'warning'
  end

end
