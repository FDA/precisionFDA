class UploadUrlFetcher
  API_ENDPOINT = "upload".freeze

  def initialize(context, uid)
    @context = context
    @uid = uid
  end

  # Returns:
  # url (string, where HTTP PUT must be performed)
  # expires (int, timestamp)
  # headers (hash of string key/values, headers must be given to HTTP PUT)
  def fetch_url(options)
    size, md5, index = options.values_at(:size, :md5, :index)

    result =
      api.call(
        file.dxid,
        API_ENDPOINT,
        {
          size: size,
          md5: md5,
          index: index
        }
      )

    if (missed = %w(url headers) - result.keys).present?
      raise "Missed the following required fields in response: #{missed.join(', ')}"
    end

    result
  end

  private

  def file
    # Check that the file exists, is accessible by the user
    #   and is in the open state. Throw 404 if otherwise.
    @file ||= UserFile.open.find_by_uid!(uid)
  end

  def token
    @token ||= begin
      if file.user_id != context.user_id
        if file.created_by_challenge_bot? && context.user.is_challenge_admin?
          CHALLENGE_BOT_TOKEN
        else
          raise "The current user does not have access to the file."
        end
      else
        context.token
      end
    end
  end

  def api
    api ||= DNAnexusAPI.new(token)
  end

  attr_reader :context, :uid
end
