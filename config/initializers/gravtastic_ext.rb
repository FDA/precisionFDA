Rails.application.config.to_prepare do
  module Gravtastic
    module InstanceMethods
      require "open3"

      def gravatar_id
        source = send(self.class.gravatar_source).to_s.downcase

        Open3.pipeline_r(["echo", "-n", source], "md5sum", "cut -d ' ' -f 1") do |o, _|
          o.read.strip
        end
      end
    end
  end
end
