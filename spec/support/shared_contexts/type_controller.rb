RSpec.shared_context "type_controller", type: :controller do

  before do
    rack = PlatformRack.new
    stub_request(:any, /^#{rack.path}/).to_rack(rack)
  end

  def authenticate!(user)
    @request.session[:user_id] = user.id
    @request.session[:username] = user.dxuser
    @request.session[:token] = "token"
    @request.session[:expiration] = 1.day.since.to_i
    @request.session[:org_id] = user.org_id
  end

end
