module DXClient
  module Errors
    E_DXCLIENT_CODE = "E_DXCLIENT".freeze

    class DXClientError < StandardError
      def error_code
        E_DXCLIENT_CODE
      end
    end
  end
end
