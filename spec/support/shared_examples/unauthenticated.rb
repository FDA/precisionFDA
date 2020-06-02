RSpec.shared_examples "unauthenticated" do
  it "responds with unauthorized" do
    expect(response).to be_unauthorized
  end
end
