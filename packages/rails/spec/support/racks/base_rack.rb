# @abstract implement #path, #parse_method_name
class BaseRack

  def path
  end

  def call(env)
    send(parse_method_name(env), parse_params(env))
  end

  private

  def parse_method_name(env)
  end

  def parse_params(env)
    params = CGI.parse(env["QUERY_STRING"])

    if env["CONTENT_TYPE"] == "application/json"
      params.merge!(JSON.parse(env["rack.input"].string))
    end

    params
  end

end
