Rails.application.config.to_prepare do
  module Gravtastic
    module InstanceMethods
      def gravatar_id
        source = send(self.class.gravatar_source).to_s.downcase

        `echo -n #{source} | md5sum | cut -d ' ' -f 1`.strip
      end
    end
  end
end
