module Imports
  # CWL presenter's results constant for specs.
  module StagesHelper
    def presenter_result
      [
        {
          executable: "app-FXKBg3803PFFYJjz11BgJ4b4",
          id: "stage-lnuqrt1wxs0000",
          systemRequirements: { main: { instanceType: "mem1_ssd1_x4_fedramp" } },
        },
        {
          executable: "app-FXKBjg807jkfZKYq126yx61f",
          id: "stage-ec9qciiclc0000",
          systemRequirements: { main: { instanceType: "mem1_ssd1_x4_fedramp" } },
          input: {
            "input_file_param_1" => {
              "$dnanexus_link": {
                outputField: "output_file_param_1",
                stage: "stage-lnuqrt1wxs0000",
              },
            },
            "input_string_param_1" => {
              "$dnanexus_link": {
                outputField: "output_string_param_1",
                stage: "stage-lnuqrt1wxs0000",
              },
            },
          },
        },
      ]
    end
  end
end
