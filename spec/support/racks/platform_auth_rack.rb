require_relative 'base_rack'
# Rack for testing platform requests
class PlatformAuthRack < BaseRack

  def path
    "https://stagingauth.dnanexus.com"
  end

  def call(env)
    send(parse_method_name(env), parse_params(env))
  end

  private

  def post_token(_params)
    [200, {}, [{ access_token: "access_token", token_type: "bearer", user_id: "user-test"}.to_json]]
  end

  def post_org_update_billing_info(_params)
    [200, {}, [{ message: "Billing information has been forcibly set.", status: "BillingInfoForceSet" }.to_json]]
  end

  def parse_method_name(env)
    request_type = env["REQUEST_METHOD"].downcase

    method_name =
      case env["PATH_INFO"]
      when "/oauth2/token"
        "token"
      when %r{.*/updateBillingInformation}
        "org_update_billing_info"
      else
        raise "Method for '#{env["PATH_INFO"]}' isn't implemented yet"
      end

    "#{request_type}_#{method_name}"
  end

end
