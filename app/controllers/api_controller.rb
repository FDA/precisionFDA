class ApiController < ApplicationController
  # TODO change all of this when this API will be called from the command-line.
  # For now don't skip the :require_login middleware, since this API is called from the web.
  skip_before_action :verify_authenticity_token

  before_action :enforce_json_post

  def enforce_json_post
  end

  def list_files
    result = UserFile.accessible_by(@context.user_id).map do |file|
      f = file.as_json
      f["username"] = file.user["dxuser"]
      #TODO assumes biospecimens are all public
      f["biospecimen"] = file.biospecimen.as_json
      if f["biospecimen"].present?
        f["biospecimen"]["username"] = file.biospecimen.user["dxuser"]
      end
      f
    end

    render json: result
  end

  def create_file
    name = params["name"]
    raise unless name.is_a?(String) && name != ""

    biospecimen_id = params["biospecimen_id"]
    if !biospecimen_id.nil?
      raise unless biospecimen_id.is_a?(Fixnum)
      # TODO: For now assume all biospecimens are public
      biospecimen = Biospecimen.find(params["biospecimen_id"])
    end

    description = params["description"]
    if !description.nil?
      raise unless description.is_a?(String)
    end

    project = User.find(@context.user_id).private_files_project
    dxid = DNAnexusAPI.new(@context.token).("file", "new", {"name": params["name"], "project": project})["id"]

    User.transaction do
      UserFile.create!(dxid: dxid,
                       project: project,
                       name: name,
                       state: "open",
                       description: description,
                       user_id: @context.user_id,
                       biospecimen_id: biospecimen_id,
                       parent: User.find(@context.user_id),
                       public: false)
      # Must get a fresh user inside the transaction
      user = User.find(@context.user_id)
      user.open_files_count = user.open_files_count + 1
      user.save!
    end

    render json: {id: dxid}
  end

  def get_upload_url
    size = params["size"]
    raise unless size.is_a?(Fixnum)

    md5 = params["md5"]
    raise unless md5.is_a?(String)

    index = params["index"]
    raise unless index.is_a?(Fixnum)

    id = params["id"]
    raise unless id.is_a?(String) && id != ""

    file = UserFile.find_by!(dxid: id, state: "open", user_id: @context.user_id)

    result = DNAnexusAPI.new(@context.token).(id, "upload", {size: size, md5: md5, index: index})

    render json: result
  end

  def close_file
    id = params["id"]
    raise unless id.is_a?(String) && id != ""

    file = UserFile.find_by!(dxid: id, user_id: @context.user_id)
    if file.state == "open"
      DNAnexusAPI.new(@context.token).(id, "close")
      User.transaction do
        # Must recheck inside the transaction
        file.reload
        if file.state == "open"
          user = User.find(@context.user_id)
          user.open_files_count = user.open_files_count - 1
          user.closing_files_count = user.closing_files_count + 1
          file.state = "closing"
          file.save!
        end
      end
    end

    render json: {}
  end
end
