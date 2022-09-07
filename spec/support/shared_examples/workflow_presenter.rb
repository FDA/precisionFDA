shared_examples 'workflow_presenter' do
  subject { presenter }

  let(:user) { create(:user, resources: CloudResourceDefaults::RESOURCES) }
  let(:locale_scope) { "activemodel.errors.models.workflow/presenter.attributes" }
  let(:presenter) { described_class.new(raw, context) }
  let(:subject_response) { presenter.build }
  let(:result) do
    { project: user.private_files_project, name: params["workflow_name"],
      title: params["workflow_title"], stages: presenter_result }
  end

  it "returns workflow json" do
    expect(subject_response).to eq(result)
  end

  context "when the input data is correct" do
    it { is_expected.to be_valid }
  end

  context "when name has invalid format" do
    before do
      presenter.instance_variable_set(:@name, ",")
      presenter.valid?
    end

    it "add errors for name attribute" do
      expect(presenter.errors[:name]).to include(I18n.t("name.format", scope: locale_scope))
    end
  end

  context "when title has invalid format" do
    before do
      presenter.instance_variable_set(:@title, "")
      presenter.valid?
    end

    it "add errors for name attribute" do
      expect(presenter.errors[:title])
          .to include(I18n.t("title.non_empty_string", scope: locale_scope))
    end
  end

  context "when workflow has invalid stages" do
    before do
      presenter.instance_variable_set(:@slots, [","])
      presenter.valid?
    end

    it "add errors for stages attribute" do
      expect(presenter.errors[:slots])
          .to include(I18n.t("slots.array_of_hashes", scope: locale_scope))
    end
  end
end