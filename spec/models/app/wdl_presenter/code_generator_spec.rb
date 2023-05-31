require "rails_helper"

RSpec.describe App::WdlPresenter::CodeGenerator do
  let(:wdl) { File.read("spec/support/files/task.wdl") }

  let(:workflow_name) { "single_task" }
  let(:app_name) { "app_a" }
  let(:image_filepath) { "#{app_name}.tar.gz" }

  let(:wdl_object) do
    instance_double(
      WDLObject,
      raw: wdl,
      tasks: [
        instance_double(
          WDLObject::Task,
          name: app_name,
          inputs: [
            instance_double(WDLObject::Input, name: "in_boolean", object_type: "Boolean"),
            instance_double(WDLObject::Input, name: "in_string", object_type: "String"),
            instance_double(WDLObject::Input, name: "in_file", object_type: "File"),
          ],
        ),
      ],
      workflow: instance_double(WDLObject::Workflow, name: workflow_name),
    )
  end

  describe ".generate" do
    subject(:code) { described_class.generate(wdl_object, image_filepath) }

    it "code includes correct inputs settings in json" do
      inputs = JSON.parse(code[/inputs.json\s*?\n(.+?)(?=EOF)/m, 1])
      expected = {
        "#{workflow_name}.#{app_name}.in_boolean" => "${in_boolean}",
        "#{workflow_name}.#{app_name}.in_string" => "${in_string}",
        "#{workflow_name}.#{app_name}.in_file" => "${in_file_path}",
      }

      expect(inputs.size).to eq(3)
      expect(inputs).to include(expected)
    end

    it "returns a proper code with a python script" do
      py_code = code[/python\s*<<EOF(.+?)(?=EOF)/m, 1]

      expect(py_code).to include(%{re.sub("#{workflow_name}.#{app_name}.})
    end

    context "when asset doesn't exist" do
      let(:image_filepath) { nil }

      it "doesn't return the code that loads uploaded docker image and parses image ID" do
        expect(code).not_to include(docker_load_code)
      end

      it "doesn't return the code that replaces docker image url by parsed image ID in WDL-file" do
        expect(code).not_to include(replace_docker_pull_code)
      end
    end

    context "when asset exists" do
      it "returns the code that loads uploaded docker image and parses image ID" do
        expect(code).to include(docker_load_code)
      end

      it "returns the code that replaces docker image url by parsed image ID in WDL-file" do
        expect(code).to include(replace_docker_pull_code)
      end
    end

    def replace_docker_pull_code
      %(sed -i "s|docker:.*|docker: \\"$dockerImageId\\"|g" #{workflow_name}.wdl)
    end

    def docker_load_code
      "dockerImageId=`docker load < #{image_filepath} | sed -n -e 's/^Loaded image: //p'`"
    end
  end
end
