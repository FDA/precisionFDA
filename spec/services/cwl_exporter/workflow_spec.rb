require 'rails_helper'

RSpec.describe CwlExporter::Workflow do

  let(:input) do
    {
      "stages": [
        {
          "name": "app_a",
          "prev_slot": nil,
          "next_slot": "stage-log9c5j2v40000",
          "slotId": "stage-k3kd2nw4bk0000",
          "app_dxid": "app-F82kv3Q0Y54PYgF30xyjPpV0",
          "inputs": [
            {
              "name": "any_a",
              "class": "string",
              "parent_slot": "stage-k3kd2nw4bk0000",
              "stageName": "app_a",
              "values": {
                "id": nil,
                "name": nil
              },
              "optional": false,
              "requiredRunInput": false,
              "label": "any_a"
            }
          ],
          "outputs": [
            {
              "name": "out_a",
              "class": "file",
              "parent_slot": "stage-k3kd2nw4bk0000",
              "stageName": "app_a",
              "values": {
                "id": "stage-log9c5j2v40000",
                "name": "app_b"
              },
              "optional": false,
              "requiredRunInput": false,
              "label": "out_a"
            }
          ],
          "instanceType": "baseline-8"
        },
        {
          "name": "app_b",
          "prev_slot": "stage-k3kd2nw4bk0000",
          "next_slot": nil,
          "slotId": "stage-log9c5j2v40000",
          "app_dxid": "app-F85KFQ00P26Kq7v3JVpkZk7J",
          "inputs": [
            {
              "name": "any_b",
              "class": "string",
              "parent_slot": "stage-log9c5j2v40000",
              "stageName": "app_b",
              "values": {
                "id": nil,
                "name": nil
              },
              "optional": false,
              "requiredRunInput": true,
              "label": "any_b"
            },
            {
              "name": "file_b",
              "class": "file",
              "parent_slot": "stage-log9c5j2v40000",
              "stageName": "app_b",
              "values": {
                "id": "stage-k3kd2nw4bk0000",
                "name": "out_a"
              },
              "optional": false,
              "requiredRunInput": false,
              "label": "file_b"
            }
          ],
          "outputs": [
            {
              "name": "out_b",
              "class": "file",
              "parent_slot": "stage-log9c5j2v40000",
              "stageName": "app_b",
              "values": {
                "id": nil,
                "name": nil
              },
              "optional": false,
              "requiredRunInput": false,
              "label": "out_b"
            }
          ],
          "instanceType": "baseline-8"
        }
      ]
    }
  end

  let(:workflow) { build(:workflow, input_spec: input) }
  let(:cwl_workflow) { described_class.new(workflow) }

  describe "#to_s" do
    it "generates a correct string" do
      expect(cwl_workflow.to_s).to eq IO.read(Rails.root.join("spec/support/files/workflow.cwl"))
    end
  end

end
