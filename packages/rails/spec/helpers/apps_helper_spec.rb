require "rails_helper"

RSpec.describe AppsHelper, type: :helper do
  describe "#app_added_to_comparators?" do
    context "when app is added to comparators list" do
      it "returns true" do
        app = instance_double("App", dxid: "app-1")
        allow(Setting).to receive(:comparator_apps).and_return([app.dxid])
        expect(helper).to be_app_added_to_comparators(app)
      end
    end

    context "when app is not added to comparators list" do
      it "returns false" do
        app = instance_double("App", dxid: "app-1")
        allow(Setting).to receive(:comparator_apps).and_return(%w(app-2))
        expect(helper).not_to be_app_added_to_comparators(app)
      end
    end
  end

  describe "#default_comparator_app?" do
    context "when app is default comparator" do
      it "returns true" do
        app = instance_double("App", dxid: "app-1")
        allow(Setting).to receive(:comparison_app).and_return(app.dxid)
        expect(helper).to be_default_comparator_app(app)
      end
    end

    context "when app is not a default comparator" do
      it "returns false" do
        app = instance_double("App", dxid: "app-1")
        allow(Setting).to receive(:comparison_app).and_return("app-2")
        expect(helper).not_to be_default_comparator_app(app)
      end
    end
  end

  describe "#global_comparison_app?" do
    context "when app is a global default comparator" do
      it "returns true" do
        app = instance_double("App", dxid: "app-1")
        stub_const("DEFAULT_COMPARISON_APP", app.dxid)
        expect(helper).to be_global_comparison_app(app)
      end
    end

    context "when app is not a global default comparator" do
      it "returns false" do
        app = instance_double("App", dxid: "app-1")
        stub_const("DEFAULT_COMPARISON_APP", "app-2")
        expect(helper).not_to be_global_comparison_app(app)
      end
    end
  end
end
