require "rails_helper"

RSpec.describe App::CwlParser::CodeGenerator do
  let(:cwl_file_content) { File.read("spec/support/files/docker_pull.cwl") }
  let(:cwl) { CwlPresenter.new(cwl_file_content) }
  let(:image_filepath) { "repo_image_0.1.0.tar.gz" }

  describe ".generate" do
    subject(:code) { described_class.generate(cwl) }

    it "returns a proper input settings" do
      expect(code).to include \
        %(cat <<EOF > input_settings.json\n) +
        %({"in_file":{"class":"File","path":"${in_file_path}"},"post_address":"${post_address}",) +
        %("optional_string":"${optional_string}","bool_flag": ${bool_flag},) +
        %("int_input": ${int_input},"float_input": ${float_input},) +
        %("double_input": ${double_input}}\nEOF)
    end

    it "returns a proper code with a cwltool command" do
      expect(code).to include \
        "cwltool description.cwl input_settings.json > cwl_job_outputs.json"
    end

    it "returns a proper code with a python script" do
      expect(code).to include <<~SUBCODE
        PYTHONPATH=$DNANEXUS_HOME/lib/python2.7/site-packages python2 <<EOF
        import os
        import json
        import subprocess
      SUBCODE
    end

    context "when asset doesn't exist" do
      it "doesn't return the code that loads uploaded docker image and parses dockerImageId" do
        expect(code).not_to include(docker_load_code)
      end

      it "returns the code that replaces dockerPull by dockerImageId in CWL-file" do
        expect(code).not_to include(replace_docker_pull_code)
      end
    end

    context "when asset exists" do
      let(:asset) do
        instance_double(Asset, uid: "app-1-1", file_paths: ["/work/#{image_filepath}"])
      end

      let(:cwl) do
        presenter = CwlPresenter.new(cwl_file_content)
        presenter.asset = asset
        presenter
      end

      it "returns the code that loads uploaded docker image and parses dockerImageId" do
        expect(code).to include(docker_load_code)
      end

      it "returns the code that replaces dockerPull by dockerImageId in CWL-file" do
        expect(code).to include(replace_docker_pull_code)
      end
    end

    def replace_docker_pull_code
      %(sed -i "s|dockerPull:.*|dockerImageId: "$dockerImageId"|g" description.cwl)
    end

    def docker_load_code
      "dockerImageId=`docker load < #{image_filepath} | sed -n -e 's/^Loaded image: //p'`"
    end
  end
end
