RSpec.shared_context "type_controller", type: :controller do

  before do
    rack = PlatformRack.new
    stub_request(:any, /^#{rack.path}/).to_rack(rack)
  end

  def authenticate!(user)
    context_attributes_for(user).each do |key, value|
      @request.session[key] = value
    end
  end

  def authenticate_as_guest!
    @request.session[:user_id] = -1
    @request.session[:username] = "Guest-1"
    @request.session[:token] = "INVALID"
    @request.session[:expiration] = 30.day.since.to_i
    @request.session[:org_id] = -1
  end

  def expire_session!
    @request.session[:expired_at] = 1.minute.ago.iso8601
  end

  def response_with_authorization_key!(user)
    rails_encryptor = ApplicationController.new.send(:rails_encryptor)
    key = rails_encryptor.encrypt_and_sign({ context: context_attributes_for(user) }.to_json)
    @request.headers["Authorization"] = "Key #{key}"
  end

  private

  def context_attributes_for(user)
    {
      user_id: user.id,
      username: user.dxuser,
      token: "token",
      expiration: 1.day.since.to_i,
      org_id: user.org_id
    }
  end

end
