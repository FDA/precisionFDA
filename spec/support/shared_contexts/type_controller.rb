RSpec.shared_context "type_controller", type: :controller do
  before do
    rack = PlatformRack.new
    stub_request(:any, /^#{rack.path}/).to_rack(rack)

    auth_rack = PlatformAuthRack.new
    stub_request(:any, /^#{auth_rack.path}/).to_rack(auth_rack)
  end

  def authenticate!(user)
    context_attributes_for(user).each do |key, value|
      @request.session[key] = value
    end
    Session.create(user_id: user.id, key: session.id)
  end

  def reset_session
    @request.reset_session
  end

  def authenticate_as_guest!
    @request.session[:user_id] = -1
    @request.session[:username] = "Guest-1"
    @request.session[:token] = "INVALID"
    @request.session[:expiration] = 30.day.since.to_i
    @request.session[:org_id] = -1
  end

  def expire_session!
    ar_session = Session.find_by(key: session.id)
    ar_session.update(updated_at: MAX_MINUTES_INACTIVITY.minutes.ago) if ar_session
  end

  def response_with_authorization_key!(user)
    rails_encryptor = ApplicationController.new.send(:rails_encryptor)
    key = rails_encryptor.encrypt_and_sign({ context: context_attributes_for(user) }.to_json)
    @request.headers["Authorization"] = "Key #{key}"
  end

  def parsed_response
    @parsed_response ||= JSON.parse(response.body)
  end

  def last_app
    @app ||= App.last
  end

  def expect_valid(variable_name)
    return unless assigns(variable_name).present?

    assigns(variable_name).valid?
    expect(assigns(variable_name).errors.messages).to be_eql({})
  end

  private

  def context_attributes_for(user)
    {
      user_id: user.id,
      username: user.dxuser,
      token: "token",
      expiration: 1.day.since.to_i,
      org_id: user.org_id,
    }
  end
end
