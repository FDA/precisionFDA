require "rails_helper"

RSpec.describe ErrorProcessable do
  let(:controller_class) { ProfileController.new }

  describe "add errors in provision_org" do
    let(:user) { create(:user, dxuser: "user") }
    let(:exist_email) { user.email }
    let(:non_pfda_email) { FFaker::Internet.email }

    context "when email exists" do
      before do
        allow(DNAnexusAPI).to receive(:email_exists?).and_return(true)
      end

      it "show message for DNAnexus for platform user email" do
        expect(controller_class.email_exists_error(non_pfda_email)).to include "used for a DNAnexus account."
      end

      it "show message for PrecisionFDA for pfda user email" do
        expect(controller_class.email_exists_error(exist_email)).to include "used for a precisionFDA account."
      end
    end

    context "when email does not exists" do
      before do
        allow(DNAnexusAPI).to receive(:email_exists?).and_return(false)
      end

      it "do not show any message for platform user email" do
        expect(controller_class.email_exists_error(non_pfda_email)).to be_nil
      end
      it "do not show any message for pfda user email" do
        expect(controller_class.email_exists_error(exist_email)).to be_nil
      end
    end

    context "when user attributes are valid" do
      let(:first_name) { FFaker::Name.first_name }
      let(:last_name) { FFaker::Name.last_name }
      let(:email) { FFaker::Internet.email }

      let(:opts) { { first_name: first_name, last_name: last_name, email: email } }

      it "do not show any error message" do
        expect(controller_class.user_invalid_errors(opts)).to eq []
      end
    end

    context "when name and email are invalid" do
      let(:first_name) {}
      let(:last_name) { FFaker::Name.last_name }
      let(:email) { "" }
      let(:opts) { { first_name: first_name, last_name: last_name, email: email } }
      let(:errors) { controller_class.user_invalid_errors(opts) }

      it "get array of error messages" do
        expect(errors).to be_kind_of(Array)
      end

      it "get array of error messages of proper size" do
        expect(errors.size).to eq 4
      end

      it "get error messages describing first name" do
        expect(errors.first).to include "First name"
      end

      it "get error messages describing first name should not be blank" do
        expect(errors.second).to include "blank"
      end

      it "get error messages describing email" do
        expect(errors.third).to include "Email"
      end
    end

    context "when username_pattern_error and name is valid" do
      it "do not show any error message" do
        expect(controller_class.username_pattern_error("harry.potter")).to be_nil
      end
    end

    context "when username_pattern_error and name is invalid" do
      it "get error messages describing first name" do
        expect(controller_class.username_pattern_error("###.potter")).to include \
          "not have been acceptable"
      end
    end
  end
end
