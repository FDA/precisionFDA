# The client for communicating with nodejs-api service.
# Token and user information is passed using RequestContext
class HttpsAppsClient # rubocop:disable Metrics/ClassLength
  # initializes the instance
  def initialize; end

  # Start sync job
  # @param job_dxid [String] Job dxid to sync.
  def job_sync(job_dxid)
    request(
      "/jobs/#{job_dxid}/syncJob",
      { jobDxId: job_dxid },
      Net::HTTP::Patch::METHOD,
    )
  end

  # Gets active users' usernames
  def active_users
    request(
      "/users/active",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  # Gets government users' usernames
  def government_users
    request(
      "/users/government",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  # Create resource for data portal
  # @param opts data about resource
  def data_portal_create_resource(portal_id, opts)
    request(
      "/data-portals/#{portal_id}/resources",
      opts,
      Net::HTTP::Post::METHOD,
    )
  end

  # List resources for data portal
  def data_portal_list_resources(portal_id)
    request(
      "/data-portals/#{portal_id}/resources",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  # Remove resource from data portal
  # @param portal_id id of the portal
  # @param resource_id id of the resource
  def data_portal_remove_resource(portal_id, resource_id)
    request(
      "/data-portals/#{portal_id}/resources/#{resource_id}",
      {},
      Net::HTTP::Delete::METHOD,
    )
  end

  # Save a data portal
  # @param opts data portal data
  def data_portal_save(opts)
    request(
      "/data-portals",
      opts,
      Net::HTTP::Post::METHOD,
    )
  end

  # Creates new data portal card image with empty content.
  # @param portal_id id of the portal
  # @param opts data about card image
  def data_portal_card_image_create(portal_id, opts)
    request(
      "/data-portals/#{portal_id}/card-image",
      opts,
      Net::HTTP::Post::METHOD,
    )
  end

  # Update a data portal
  # @param opts data portal data
  def data_portal_update(opts)
    request(
      "/data-portals/#{opts[:id]}",
      opts,
      Net::HTTP::Patch::METHOD,
    )
  end

  # Gets list of available data portals
  def data_portals_list
    request(
      "/data-portals",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  # Get data portal identified by id
  # @param id data portal identifier
  def data_portals_get(id)
    request(
      "/data-portals/#{id}",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  # User checkup
  # To be run whenever user logs in to make sure sync tasks are
  # healthy and to check the general health of the user account
  def user_checkup
    request(
      "/account/checkup",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  # Save an app.
  # @param opts app data.
  def app_save(opts)
    request(
      "/apps",
      opts,
      Net::HTTP::Post::METHOD,
    )
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

  # Returns all licenses accepted by current user
  def accepted_licenses
    request(
      "/licenses/accepted",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  # List licenses for a file
  # @param uids list of file uids
  def list_licenses_for_files(uids)
    request(
      "/licenses/files",
      {},
      Net::HTTP::Get::METHOD,
      { uids: },
    )
  end

  # Start nodes removal job
  # @param ids [Array of Integers] id's of nodes to be removed
  def remove_nodes(ids)
    request(
      "/nodes/remove",
      { ids: ids, async: true },
      Net::HTTP::Delete::METHOD,
    )
  end

  def bulk_download(id, folder_id = nil, &block)
    params = { id: }
    params[:folder_id] = folder_id unless folder_id.nil?

    request(
      "/files/bulk_download",
      {},
      Net::HTTP::Get::METHOD,
      params,
      {},
      true,
    ) do |chunk|
      block.call(chunk)
    end
  end

  # Update the CLI API key inside a workstation
  # @param job_dxid [String] Job dxid to terminate.
  # @param auth_code [String] Code generated by the auth server to authenticate with the workstation
  # @param api_key [String] API key
  def workstation_set_api_key(job_dxid, auth_code, api_key)
    request(
      "/jobs/#{job_dxid}/setAPIKey",
      {
        code: auth_code,
        key: api_key,
      },
      Net::HTTP::Patch::METHOD,
    )
  end

  # Invoke workstation snapshot
  # @param job_dxid [String] Job dxid to terminate.
  # @param auth_code [String] Code generated by the auth server to authenticate with the workstation
  # @param api_key [String] API key for the CLI
  # @param name [String] Name for the workstation snapshot
  # @param terminate [Boolean] Option to terminate the workstation after snapshot is created
  def workstation_snapshot(job_dxid, auth_code, api_key, name, terminate)
    request(
      "/jobs/#{job_dxid}/snapshot",
      {
        code: auth_code,
        key: api_key,
        name: name,
        terminate: terminate,
      },
      Net::HTTP::Patch::METHOD,
    )
  end

  # Checks all spaces where current user has ADMIN or LEAD access against platform.
  # Only checks user's side of space (Host or Guest)
  # and validates that all members saved in PFDA have their correct counterparts on Platform
  # Result of this are just logs of permission issues (for now)
  def check_spaces_permissions
    request(
      "/account/checkSpacesPermissions",
      {},
      Net::HTTP::Post::METHOD,
    )
  end

  # Get selectable spaces for given space_id
  # @param space_id [String] id of space to get selectable spaces for
  def selectable_spaces(space_id)
    request(
      "/spaces/#{space_id}/selectable-spaces",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  # Get licenses that need to be accepted for given app id
  # @param app_uid [String] App uid get licenses for
  def app_licenses_to_accept(app_uid)
    request(
      "/apps/#{app_uid}/licenses-to-accept",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  # Get licenses that need to be accepted for given workflow id
  # @param workflow_dxid [String] App dxid get licenses for
  def workflow_licenses_to_accept(workflow_uid)
    request(
      "/workflows/#{workflow_uid}/licenses-to-accept",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  def propose_challenge(proposal)
    request(
      "/challenges/propose",
      proposal,
      Net::HTTP::Post::METHOD,
    )
  end

  def discussion_create(body)
    request(
      "/discussions",
      body,
      Net::HTTP::Post::METHOD,
    )
  end

  def discussion_update(discussion_id, body)
    request(
      "/discussions/#{discussion_id}",
      body,
      Net::HTTP::Put::METHOD,
    )
  end

  def discussion_publish(body)
    request(
      "/discussions/#{body[:id]}/publish",
      body,
      Net::HTTP::Post::METHOD,
    )
  end

  def discussion_destroy(discussion_id)
    request(
      "/discussions/#{discussion_id}",
      {},
      Net::HTTP::Delete::METHOD,
    )
  end

  def answer_destroy(discussion_id, answer_id)
    request(
      "/discussions/#{discussion_id}/answers/#{answer_id}",
      {},
      Net::HTTP::Delete::METHOD,
    )
  end

  def comment_destroy(discussion_id, comment_id)
    request(
      "/discussions/#{discussion_id}/comments/#{comment_id}",
      {},
      Net::HTTP::Delete::METHOD,
    )
  end

  def answer_comment_destroy(discussion_id, answer_id, comment_id)
    request(
      "/discussions/#{discussion_id}/answers/#{answer_id}/comments/#{comment_id}",
      {},
      Net::HTTP::Delete::METHOD,
    )
  end

  def discussion_comment_create(discussion_id, body)
    request(
      "/discussions/#{discussion_id}/comments",
      body,
      Net::HTTP::Post::METHOD,
    )
  end

  def discussion_comment_update(discussion_id, comment_id, body)
    request(
      "/discussions/#{discussion_id}/comments/#{comment_id}",
      body,
      Net::HTTP::Put::METHOD,
    )
  end

  def answer_comment_update(discussion_id, answer_id, comment_id, body)
    request(
      "/discussions/#{discussion_id}/answers/#{answer_id}/comments/#{comment_id}",
      body,
      Net::HTTP::Put::METHOD,
    )
  end

  def discussion_comment_show(discussion_id, comment_id)
    request(
      "/discussions/#{discussion_id}/comments/#{comment_id}",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  def answer_comment_show(discussion_id, answer_id, comment_id)
    request(
      "/discussions/#{discussion_id}/answers/#{answer_id}/comments/#{comment_id}",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  def answer_comment_create(discussion_id, answer_id, body)
    request(
      "/discussions/#{discussion_id}/answers/#{answer_id}/comments",
      body,
      Net::HTTP::Post::METHOD,
    )
  end

  def answer_create(discussion_id, body)
    request(
      "/discussions/#{discussion_id}/answers",
      body,
      Net::HTTP::Post::METHOD,
    )
  end

  def answer_publish(discussion_id, body)
    request(
      "/discussions/#{discussion_id}/answers/#{body[:id]}/publish",
      body,
      Net::HTTP::Post::METHOD,
    )
  end

  def answer_show(discussion_id, answer_id)
    request(
      "/discussions/#{discussion_id}/answers/#{answer_id}",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  def answer_update(discussion_id, answer_id, body)
    request(
      "/discussions/#{discussion_id}/answers/#{answer_id}",
      body,
      Net::HTTP::Put::METHOD,
    )
  end

  def discussions_list(params)
    request(
      "/discussions",
      {},
      Net::HTTP::Get::METHOD,
      params,
    )
  end

  def discussion_show(id)
    request(
      "/discussions/#{id}",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  def note_attachments(id)
    request(
      "/discussions/#{id}/attachments",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  # Alerts
  def create_alert(alert_params)
    request(
      "/alerts",
      alert_params,
      Net::HTTP::Post::METHOD,
    )
  end

  def update_alert(id, alert_params)
    request(
      "/alerts/#{id}",
      alert_params,
      Net::HTTP::Put::METHOD,
    )
  end

  def delete_alert(id)
    request(
      "/alerts/#{id}",
      {},
      Net::HTTP::Delete::METHOD,
    )
  end

  def get_all_alerts(active = nil)
    query_string = active.nil? ? "" : "?active=#{active}"
    request(
      "/alerts#{query_string}",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  # News

  def news_list(params)
    request(
      "/news",
      {},
      Net::HTTP::Get::METHOD,
      params,
    )
  end

  def news_all(params)
    request(
      "/news/all",
      {},
      Net::HTTP::Get::METHOD,
      params,
    )
  end

  def news_years
    request(
      "/news/years",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  def news_create(body)
    request(
      "/news",
      body,
      Net::HTTP::Post::METHOD,
    )
  end

  def news_edit(id, body)
    request(
      "/news/#{id}",
      body,
      Net::HTTP::Put::METHOD,
    )
  end

  def news_show(id)
    request(
      "/news/#{id}",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  def news_delete(id)
    request(
      "/news/#{id}",
      {},
      Net::HTTP::Delete::METHOD,
    )
  end

  def news_positions(body)
    request(
      "/news/positions",
      body,
      Net::HTTP::Post::METHOD,
      body,
    )
  end

  # Close an uploaded file or asset
  # @param file_uid [String] uid of the file or asset
  def file_close(file_uid, ops = {})
    request(
      "/files/#{file_uid}/close",
      ops,
      Net::HTTP::Patch::METHOD,
    )
  end

  def set_properties(target_id, target_type, properties)
    request(
      "/properties",
      {
        targetId: target_id,
        targetType: target_type,
        properties: properties,
      },
    )
  end

  def get_valid_property_keys(type, scope)
    request(
      "/properties/#{type}/scope/#{scope}/keys",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  def resolve_path(path, scope, type)
    request(
      "/files/path-resolver",
      {},
      Net::HTTP::Get::METHOD,
      { path:, scope:, type: },
    )
  end

  # Update notification's delivered date time
  # @param notification_id [String] id of the notification
  # @param delivered_at [DateTime] date and time of delivery
  def update_notification(notification_id, delivered_at)
    request(
      "/notifications/#{notification_id}",
      {
        deliveredAt: delivered_at,
      },
      Net::HTTP::Put::METHOD,
    )
  end

  # Lock a folder/file.
  # @param ids [Array] Folders/Files ID.
  def nodes_lock(ids)
    request(
      "/nodes/lock",
      { ids: ids, async: true }, # rubocop:disable Style/HashSyntax
      Net::HTTP::Post::METHOD,
    )
  end

  # Sends notification
  # @param notification object
  def send_notification(notification)
    request(
      "/notifications",
      notification,
      Net::HTTP::Post::METHOD,
    )
  end

  # Unlock a folder/file.
  # @param ids [Array] Folders/Files ID.
  def nodes_unlock(ids)
    request(
      "/nodes/unlock",
      { ids: ids, async: true }, # rubocop:disable Style/HashSyntax
      Net::HTTP::Post::METHOD,
    )
  end

  def cli_node_search(arg, type, space_id, folder_id)
    request(
      "/cli/nodes",
      {
        arg: arg,
        spaceId: space_id,
        folderId: folder_id,
        type: type,
      },
      Net::HTTP::Post::METHOD,
    )
  end

  def cli_latest_version
    request(
      "/cli/version/latest",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  def cli_job_scope(dxid)
    request(
      "/cli/job/#{dxid}/scope",
      {},
      Net::HTTP::Get::METHOD,
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
      "/dbclusters",
      opts,
      Net::HTTP::Post::METHOD,
    )
  end

  def dbcluster_update(uid, opts)
    request(
      "/dbclusters/#{uid}",
      opts,
      Net::HTTP::Put::METHOD,
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

  # ┌──────────────────────────┐
  # │                          │
  # │  admin/users/ endpoints  │
  # │                          │
  # └──────────────────────────┘

  def admin_stats
    request(
      "/admin/stats",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  def users_list(page, per_page, order_by, order_dir, filters)
    pagination_args = {}
    pagination_args[:page] = page if page
    pagination_args[:per_page] = per_page if per_page
    pagination_args[:order_by] = order_by if order_by
    pagination_args[:order_dir] = order_dir if order_dir
    pagination_args[:filters] = filters if filters
    request(
      "/admin/users",
      {},
      Net::HTTP::Get::METHOD,
      pagination_args,
    )
  end

  def users_set_total_limit(ids, total_limit)
    request(
      "/admin/users/setTotalLimit",
      {
        ids: ids,
        totalLimit: total_limit,
      },
      Net::HTTP::Put::METHOD,
    )
  end

  def users_set_job_limit(ids, job_limit)
    request(
      "/admin/users/setJobLimit",
      {
        ids: ids,
        jobLimit: job_limit,
      },
      Net::HTTP::Put::METHOD,
    )
  end

  def users_reset_2fa(ids)
    request(
      "/admin/users/reset2fa",
      {
        ids: ids,
      },
      Net::HTTP::Post::METHOD,
    )
  end

  def users_unlock(ids)
    request(
      "/admin/users/unlock",
      {
        ids: ids,
      },
      Net::HTTP::Post::METHOD,
    )
  end

  def users_activate(ids)
    request(
      "/admin/users/activate",
      {
        ids: ids,
      },
      Net::HTTP::Put::METHOD,
    )
  end

  def users_deactivate(ids)
    request(
      "/admin/users/deactivate",
      {
        ids: ids,
      },
      Net::HTTP::Put::METHOD,
    )
  end

  def users_enable_resource(ids, resource)
    request(
      "/admin/users/enableResourceType",
      {
        ids: ids,
        resource: resource,
      },
      Net::HTTP::Put::METHOD,
    )
  end

  def users_enable_all_resources(ids)
    request(
      "/admin/users/enableAllResourceTypes",
      {
        ids: ids,
      },
      Net::HTTP::Put::METHOD,
    )
  end

  def users_disable_resource(ids, resource)
    request(
      "/admin/users/disableResourceType",
      {
        ids: ids,
        resource: resource,
      },
      Net::HTTP::Put::METHOD,
    )
  end

  def users_disable_all_resources(ids)
    request(
      "/admin/users/disableAllResourceTypes",
      {
        ids: ids,
      },
      Net::HTTP::Put::METHOD,
    )
  end

  # ┌──────────┐
  # │          │
  # │  spaces  │
  # │          │
  # └──────────┘

  def create_space(params)
    request(
      "/spaces",
      params,
      Net::HTTP::Post::METHOD,
      )
  end

  def accept_space(id)
    request(
      "/spaces/#{id}/accept",
      {},
      Net::HTTP::Patch::METHOD,
    )
  end

  def unlock_space(id)
    request(
      "/spaces/#{id}/unlock",
      {},
      Net::HTTP::Patch::METHOD,
    )
  end

  def lock_space(id)
    request(
      "/spaces/#{id}/lock",
      {},
      Net::HTTP::Patch::METHOD,
    )
  end

  def fix_guest_permissions(id)
    request(
      "/spaces/#{id}/fix_guest_permissions",
      {},
      Net::HTTP::Patch::METHOD,
    )
  end

  # ┌─────────────────────────┐
  # │                         │
  # │ EXCLUSIVE CLI endpoints │
  # │                         │
  # └─────────────────────────┘

  # uid in pFDA, not dxid !
  def describe(uid, options = nil)
    request(
      "/cli/#{uid}/describe",
      { options: options },
      Net::HTTP::Get::METHOD,
    )
  end

  # Start nodes removal job in a synchronous way. Used exclusively by CLI
  # @param ids [Array of Integers] id's of nodes to be removed
  def cli_remove_nodes(ids)
    request(
      "/nodes/remove",
      { ids: ids, async: false },
      Net::HTTP::Delete::METHOD,
    )
  end

  def cli_space_members(space_id)
    request(
      "/cli/spaces/#{space_id}/members",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  def cli_space_discussions(space_id)
    request(
      "/cli/spaces/#{space_id}/discussions",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  def cli_discussion_describe(discussion_id)
    request(
      "/cli/discussions/#{discussion_id}/describe",
      {},
      Net::HTTP::Get::METHOD,
    )
  end

  # ┌─────────────────────────┐
  # │                         │
  # │ site-settings endpoint  │
  # │                         │
  # └─────────────────────────┘

  def site_settings(incoming_ip = nil)
    request_headers = {}
    request_headers["X-Forwarded-For"] = incoming_ip if incoming_ip
    request(
      "/site-settings",
      {},
      Net::HTTP::Get::METHOD,
      {},
      request_headers,
    )
  end

  def create_space_report(scope, format, options)
    request(
      "/reports",
      { format:, options:, scope: },
      Net::HTTP::Post::METHOD,
    )
  end

  def get_space_reports(scope)
    request(
      "/reports",
      {},
      Net::HTTP::Get::METHOD,
      { scope: },
    )
  end

  def delete_space_reports(ids)
    request(
      "/reports",
      {},
      Net::HTTP::Delete::METHOD,
      { id: ids },
    )
  end

  def track_provenance(identifier)
    request(
      "/tracks/provenance",
      {},
      Net::HTTP::Get::METHOD,
      { identifier: },
    )
  end

  def get_file_download_link(uid, options = {})
    request(
      "/files/#{uid}/download-link",
      {},
      Net::HTTP::Get::METHOD,
      options,
    )
  end

  def list_selected_files(ids)
    request(
      "/files/selected",
      {},
      Net::HTTP::Get::METHOD,
      { ids: },
    )
  end

  def validate_copy(uids, scope)
    request(
      "/files/copy/validate",
      { uids:, scope: },
      Net::HTTP::Post::METHOD,
      {},
    )
  end

  private

  def prepare_request(uri, body, headers, method_name)
    request = Net::HTTP.const_get(method_name.capitalize).new(uri)
    request["Content-Type"] = "application/json"
    request.body = body.to_json
    headers.each { |key, value| request[key] = value }
    request
  end

  # rubocop:disable Metrics/ParameterLists
  def request(path, body = {}, method_name = Net::HTTP::Post::METHOD, query = {}, additional_headers = {}, streaming = false)
    # Rails to_query method adds a suffix "[]" to keys of query parameters with array values.
    #
    # Rails approach - { id: [0,1,2]} => ?id[]=1&id[]=2&id[]=3
    # Our approach - { id: [0,1,2]} => ?id=1&id=2&id=3
    array_query_keys = query.select { |_, v| v.is_a?(Array) }.keys

    additional_queries = query.except(*array_query_keys)
    additional_query_string = additional_queries.to_query

    array_queries = query.slice(*array_query_keys)
    array_query_string = array_queries.map do |key, values|
      values.map { |value| "#{key}=#{value}" }
    end.flatten.join("&")

    # 4. Combine the two query strings
    query = [additional_query_string, array_query_string].compact.reject(&:empty?).join("&")

    uri = URI("#{ENV['HTTPS_APPS_API_URL']}#{path}?#{query}")
    use_ssl = uri.scheme == "https"

    conn_opts = connection_opts.merge(use_ssl: use_ssl)
    conn_opts.merge!(verify_mode: OpenSSL::SSL::VERIFY_NONE) if use_ssl
    Net::HTTP.start(uri.host, uri.port, conn_opts) do |http|
      request = prepare_request(uri, body, headers.merge(additional_headers), method_name)

      if streaming
        http.request(request) do |response|
          response.read_body do |chunk|
            yield chunk
          end
        end
      else
        handle_response(http.request(request))
      end
    end
  rescue Errno::ECONNREFUSED
    raise Error, "Can't connect to nodejs-api service"
  end

  # rubocop:enable Metrics/ParameterLists

  # Returns connection options.
  # @return [Hash] Connection options.
  def connection_opts
    @connection_opts ||= { read_timeout: 120 }
  end

  def auth_headers
    unless RequestContext.instance
      Rails.logger.info("RequestContext.instance is not present, auth query part will be empty")
      return {}
    end

    {
      "x-user_id": RequestContext.instance.user_id.to_s,
      "x-dxuser": RequestContext.instance.username,
      "x-accesstoken": RequestContext.instance.token,
    }.compact_blank
  end

  # Returns HTTP headers to be sent during every request.
  # @return [Hash] Headers to be sent.
  def headers
    content_type = @headers ||= { "Content-Type" => "application/json" }
    content_type.merge(auth_headers)
  end

  # Builds hash from response.
  # @param response [String] Response string.
  # @return [Hash] Response from server converted to hash.
  def handle_response(response)
    if response.is_a?(Net::HTTPSuccess)
      response.value
      parsed = JSON.parse(response.body || "")
      parsed.is_a?(Hash) ? parsed.with_indifferent_access : parsed
    else
      error_details = JSON.parse(response.body)
      error_message = error_details.dig("error", "message")
      raise StandardError, error_message
    end
  rescue JSON::ParserError
    response.body
  rescue Net::HTTPClientException => e
    raise e
  rescue StandardError => e
    raise Error, e.message
  end
end
