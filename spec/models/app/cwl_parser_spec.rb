require 'rails_helper'

RSpec.describe App::CwlParser do
  let!(:cwl) { CwlPresenter.new(cwl_file_content) }
  let(:cwl_file_content) { IO.read(Rails.root.join('spec/support/files/docker_pull.cwl')) }

  describe '#parse' do
    subject { described_class.parse(cwl) }

    it 'returns a proper code with input settings' do
      expect(subject[:code]).to include <<-SUBCODE
cat <<EOF > input_settings.json
{"in_file":{"class":"File","path":"${in_file_path}"},"post_address":"${post_address}","test_type_simplification":"${test_type_simplification}"}
EOF
      SUBCODE
    end

    it 'returns a proper code with a cwltool command' do
      expect(subject[:code]).to include <<-SUBCODE
cwltool --user-space-docker-cmd=dx-docker description.cwl input_settings.json > cwl_job_outputs.json
      SUBCODE
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
