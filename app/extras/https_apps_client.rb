# The client for communicating with nodejs-api service.
class HttpsAppsClient
  # @param token [String] User access token.
  # @param user [User] A user.
  def initialize(token, user)
    @token = token
    @user = user
  end

  # Run an app.
  # @param app_dxid [String] App dxid.
  # @param opts [Hash] Request body options.
  def app_run(app_dxid, opts)
    request(
      "/apps/#{app_dxid}/run",
      opts,
      Net::HTTP::Post::METHOD,
    )
  end

  # Terminate a job.
  # @param job_dxid [String] Job dxid to terminate.
  # @param opts [Hash] Request body options.
  def job_terminate(job_dxid)
    request(
      "/jobs/#{job_dxid}/terminate",
      {},
      Net::HTTP::Patch::METHOD,
    )
  end

  # Sync files for a running HTTPS app job.
  # @param job_dxid [String] Job dxid to terminate.
  # @param opts [Hash] Request body options.
  def job_sync_files(job_dxid)
    request(
      "/jobs/#{job_dxid}/syncFiles",
      {},
      Net::HTTP::Patch::METHOD,
    )
  end

  # Rename a folder.
  # @param folder_id [Integer] Folder ID.
  # @param new_name [String] New folder name.
  def folder_rename(folder_id, new_name)
    request(
      "/folders/#{folder_id}/rename",
      { newName: new_name },
      Net::HTTP::Patch::METHOD,
    )
  end

  # Delete a folder.
  # @param folder_id [Integer] Folder ID.
  def folder_remove(folder_id)
    request(
      "/folders/#{folder_id}",
      {},
      Net::HTTP::Delete::METHOD,
    )
  end

  # Send notification email
  def email_send(email_type_id, opts)
    request(
      "/emails/#{email_type_id}/send",
      { input: opts },
      Net::HTTP::Post::METHOD,
    )
  end

  def dbcluster_action(dxids, action)
    raise Error, "Wrong action #{action}" unless %w(start stop terminate).include?(action)

    request(
      "/dbclusters/#{action}",
      { dxids: dxids },
      Net::HTTP::Post::METHOD,
    )
  end

  def dbcluster_create(opts)
    request(
      "/dbclusters/create",
      opts,
      Net::HTTP::Post::METHOD,
    )
  end

  def experts_list(page, limit, year)
    query_args = { page: page, limit: limit }
    query_args[:year] = year if year
    request(
      "/experts",
      {},
      Net::HTTP::Get::METHOD,
      query_args,
    )
  end

  def experts_years
    request(
      "/experts/years",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  private

  def request(path, body = {}, method_name = Net::HTTP::Post::METHOD, additional_query = {})
    query = auth_query.merge(additional_query).to_query
    uri = URI("#{ENV['HTTPS_APPS_API_URL']}#{path}?#{query}")
    use_ssl = uri.scheme == "https"

    conn_opts = connection_opts.merge(use_ssl: use_ssl)
    conn_opts.merge!(verify_mode: OpenSSL::SSL::VERIFY_NONE) if use_ssl

    Net::HTTP.start(uri.host, uri.port, conn_opts) do |http|
      handle_response(http.send_request(method_name, uri.request_uri, body.to_json, headers))
    end
  rescue Errno::ECONNREFUSED
    raise Error, "Can't connect to nodejs-api service"
  end

  # Returns connection options.
  # @return [Hash] Connection options.
  def connection_opts
    @connection_opts ||= { read_timeout: 120 }
  end

  def auth_query
    {
      id: @user&.id,
      dxuser: @user&.dxuser,
      accessToken: @token,
    }.compact_blank
  end

  # Returns HTTP headers to be sent during every request.
  # @return [Hash] Headers to be sent.
  def headers
    @headers ||= { "Content-Type" => "application/json" }
  end

  # Builds hash from response.
  # @param response [String] Response string.
  # @return [Hash] Response from server converted to hash.
  def handle_response(response)
    response.value
    parsed = JSON.parse(response.body || "")
    parsed.is_a?(Hash) ? parsed.with_indifferent_access : parsed
  rescue JSON::ParserError
    response.body
  rescue Net::HTTPClientException
    raise Error, response
  rescue StandardError
    raise Error, "Something went wrong"
  end
end
