module Imports
  module AppSpecHelper
    def app_spec
      {
        "input_spec"=>
          [
            {
              "name"=>"input_file_param_1",
              "class"=>"file",
              "optional"=>false,
              "label"=>"", "help"=>""
            },
            {
              "name"=>"input_string_param_1",
              "class"=>"string",
              "optional"=>false,
              "label"=>"",
              "help"=>""
            }
          ],
        "output_spec"=>
          [
            {
              "name"=>"output_file_param_1",
              "class"=>"file",
              "optional"=>false,
              "label"=>"",
              "help"=>""
            },
            {
              "name"=>"output_string_param_1",
              "class"=>"string",
              "optional"=>false,
              "label"=>"",
              "help"=>""
            }
          ],
        "internet_access"=>false,
        "instance_type"=>"baseline-8"
      }
    end
  end
end