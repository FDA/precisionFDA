require 'rails_helper'

RSpec.describe App::CwlParser do
  let(:cwl_file_content) { IO.read(Rails.root.join('spec/support/files/docker_pull.cwl')) }
  let!(:cwl) { CwlPresenter.new(cwl_file_content) }

  describe '.parse' do
    subject { described_class.parse(cwl) }

    it 'returns a proper code with input settings' do
      expect(subject[:code]).to include \
        %(cat <<EOF > input_settings.json\n) +
        %({"in_file":{"class":"File","path":"${in_file_path}"},"post_address":"${post_address}",) +
        %("optional_string":"${optional_string}","bool_flag": ${bool_flag},) +
        %("int_input": ${int_input},"float_input": ${float_input},) +
        %("double_input": ${double_input}}\nEOF)
    end

    it 'returns a proper code with a cwltool command' do
      expect(subject[:code]).to include \
        "cwltool --user-space-docker-cmd=dx-docker description.cwl " +
        "input_settings.json > cwl_job_outputs.json"
    end

    it 'returns a proper code with a python script' do
      expect(subject[:code]).to include <<-SUBCODE
python <<EOF
import os
import json
      SUBCODE
    end
  end
end
