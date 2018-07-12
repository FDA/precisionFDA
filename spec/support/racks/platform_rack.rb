# Rack for testing platform requests
class PlatformRack

  def initialize
    @path_parts = []
  end

  def path
    DNANEXUS_APISERVER_URI
  end

  def call(env)
    send(parse_method_name(env), parse_params(env))
  end

  private

  def post_describe(_params)
    [404, {}, [{}.to_json]]
  end

  def post_org_new(_params)
    [200, {}, [{}.to_json]]
  end

  def post_invite(_params)
    [200, {}, [{}.to_json]]
  end

  def post_remove_member(_params)
    [200, {}, [{}.to_json]]
  end

  def post_run(_params)
    [200, {}, [{}.to_json]]
  end

  def post_project_new(params)
    [200, {}, [{ id: "project-#{params["name"]}"}.to_json]]
  end

  def parse_method_name(env)
    request_type = env["REQUEST_METHOD"].downcase

    method_name =
      case env["PATH_INFO"]
      when /.*\/describe/
        "describe"
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
      else
        raise "Method for '#{env["PATH_INFO"]}' isn't implemented yet"
      end

    "#{request_type}_#{method_name}"
  end

  def parse_params(env)
    params = CGI.parse(env["QUERY_STRING"])

    if env["CONTENT_TYPE"] == "application/json"
      params.merge!(JSON.parse(env["rack.input"].string))
    end

    params
  end

end
