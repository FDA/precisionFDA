RSpec.describe Presenters::WorkflowExecutionsPresenter do
  let(:batch_size) { 2 }
  let(:analysis) do
    create(
      :analysis,
      :batch,
      size: batch_size,
      user: record_owner,
    )
  end
  let(:request_context) { request_context(record_owner) }

  let(:params) { { id: workflow.uid } }
  let(:record_owner) { create(:user) }
  let(:workflow) { create(:workflow, user: record_owner) }
  let(:presenter) { described_class.new(analysis, user_context(record_owner), params) }
  let(:empty_presenter) { described_class.new([], user_context(record_owner), params) }
  let(:invalid_presenter) { described_class.new("foo", "bar") }

  describe "#call" do
    describe "valid presenter" do
      it "returns serialized workflow executions" do
        presenter.call

        aggregate_failures do
          expect(presenter.response).to be_a Array
          expect(presenter.response.size).to eq 2
          expect(presenter.response.first).to match(a_hash_including(
            "workflow_title": "#{workflow.title} (1 of #{batch_size})",
          ))
          expect(presenter.size).to eq 2
        end
      end
    end

    describe "empty presenter" do
      it "returns an empty array" do
        empty_presenter.call

        aggregate_failures do
          expect(presenter.response).to be_a Array
          expect(presenter.size).to eq 0
        end
      end
    end

    describe "invalid presenter" do
      it "returns error" do
        invalid_presenter.call

        aggregate_failures do
          expect(invalid_presenter.response).to be_a Array
          expect(invalid_presenter.response.first).to eq Message.can_not_serialize
        end
      end
    end
  end
end
