require_relative 'base_rack'
# Rack for testing platform requests
class PlatformRack < BaseRack

  def path
    DNANEXUS_APISERVER_URI
  end

  def call(env)
    send(parse_method_name(env), parse_params(env))
  end

  private

  def post_greet(_params)
    [200, {}, [{}.to_json]]
  end

  def post_describe(_params)
    [404, {}, [{}.to_json]]
  end

  def post_org_new(params)
    [200, {}, [{ id: params["handle"] }.to_json]]
  end

  def post_invite(_params)
    [200, {}, [{}.to_json]]
  end

  def post_remove_member(_params)
    [200, {}, [{}.to_json]]
  end

  def post_run(_params)
    [200, {}, [{ id: "job-FKpFJPQ0yYxY0gqGKpFxGfqZ" }.to_json]]
  end

  def post_project_new(params)
    [200, {}, [{ id: "project-#{params["name"]}"}.to_json]]
  end

  def post_set_member_access(params)
    [200, {}, [{}.to_json]]
  end

  def post_applet_new(params)
    [200, {}, [{}.to_json]]
  end

  def post_app_new(params)
    [200, {}, [{ id: 'app-1' }.to_json]]
  end

  def post_remove_objects(params)
    [200, {}, [{}.to_json]]
  end

  def post_add_authorized_users(_params)
    [200, {}, [{}.to_json]]
  end

  def post_publish(_params)
    [200, {}, [{}.to_json]]
  end

  def parse_method_name(env)
    request_type = env["REQUEST_METHOD"].downcase

    method_name =
      case env["PATH_INFO"]
      when "/system/greet"
        "greet"
      when /.*\/addAuthorizedUsers/
        "add_authorized_users"
      when /.*\/describe/
        "describe"
      when /.*\/publish/
        "publish"
      when /.*\/invite/
        "invite"
      when /.*\/removeMember/
        "remove_member"
      when /.*\/run/
        "run"
      when "/org/new"
        "org_new"
      when "/project/new"
        "project_new"
      when /.*\/setMemberAccess/
        "set_member_access"
      when "/applet/new"
        "applet_new"
      when "/app/new"
        "app_new"
      when /.*\/removeObjects/
        "remove_objects"
      else
        raise "Method for '#{env["PATH_INFO"]}' isn't implemented yet"
      end

    "#{request_type}_#{method_name}"
  end

end
