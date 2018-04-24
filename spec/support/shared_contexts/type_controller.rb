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

  def authenticate_as_guest!
    @request.session[:user_id] = -1
    @request.session[:username] = "Guest-1"
    @request.session[:token] = "INVALID"
    @request.session[:expiration] = 30.day.since.to_i
    @request.session[:org_id] = -1
  end

end
