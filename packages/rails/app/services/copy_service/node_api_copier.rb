class CopyService
  # Delegates node copy to Node API.
  class NodeApiCopier
    class CopyError < StandardError; end

    def initialize(api:, user:)
      @api = api
      @user = user
    end

    # NOTE: The legacy FileCopier accepted a skip_parent flag (PFDA-3325) so
    # copied assets kept parent_type = "Asset" instead of being re-parented as
    # "Node". The Node API now derives parent semantics from the node's STI
    # type unconditionally (assets get parentType 'Asset', files/folders get
    # 'Node', parentId = source node id), so the flag is no longer needed.
    def copy(nodes, scope, folder_id = nil)
      ensure_no_open_transaction!

      copies = Copies.new
      nodes = Array(nodes)
      return copies if nodes.empty?

      # Folders carry no project (project = nil) while files do, so grouping
      # by project would split one folder tree into a folders-only and a
      # files-only request. The Node API resolves target parent folders per
      # request, so files sent without their folder context would silently
      # land at the scope root while the folders get published empty. To keep
      # the hierarchy intact, the folder skeleton is attached (folders first)
      # to every per-project file batch; folders already copied by an earlier
      # batch are reused server-side and reported with copied: false.
      folders, files = nodes.partition { |node| node.klass == "folder" }
      file_batches = files.group_by(&:project).values
      batches = file_batches.empty? ? [folders] : file_batches.map { |file_batch| folders + file_batch }

      batches.each do |batch|
        copies.concat(copy_batch(batch, scope, folder_id))
      end

      copies
    end

    private

    attr_reader :api, :user

    # The Node API commits copied node rows on its own DB connection. If this
    # copier is invoked inside an open Rails transaction, InnoDB's REPEATABLE
    # READ snapshot isolation hides those freshly committed rows from the
    # read-back below, silently producing empty copies (e.g. an app copied
    # without its assets/default input files). Fail fast instead.
    def ensure_no_open_transaction!
      # Specs run inside a wrapping transactional fixture - the guard would
      # produce false positives there.
      return if Rails.env.test?
      return unless ActiveRecord::Base.connection.transaction_open?

      raise CopyError,
            "CopyService::NodeApiCopier must not be invoked inside a database transaction: " \
            "nodes committed by the Node API would be invisible to the current transaction snapshot."
    end

    def copy_batch(nodes, scope, folder_id)
      copies = Copies.new
      response = https_apps_client.nodes_copy(nodes.map(&:id), scope, folder_id, false)
      mapping_entries = normalize_mapping_response(response)
      return copies if mapping_entries.empty?

      sources = nodes.index_by(&:id)
      target_ids = mapping_entries.filter_map { |entry| entry["targetNodeId"] }
      targets = Node.where(id: target_ids).index_by(&:id)

      verify_targets_visible!(target_ids, targets)

      mapping_entries.each do |entry|
        source = sources[entry["sourceNodeId"]]
        target = targets[entry["targetNodeId"]]
        next unless source && target

        copied = entry["copied"]
        copies.push(object: target, source:, copied: copied.nil? ? true : copied)
      end

      copies
    end

    # The synchronous Node API nodes/copy endpoint returns an array of
    # { "sourceNodeId" => ..., "targetNodeId" => ..., "copied" => ... }
    # entries. HttpsAppsClient#handle_response leaves arrays as plain
    # string-keyed hashes (with_indifferent_access is applied to Hash
    # responses only). An empty array is a valid "nothing copied" result;
    # any other shape signals a contract change and must fail loudly
    # instead of being silently treated as empty.
    def normalize_mapping_response(response)
      return response if response.is_a?(Array)

      raise CopyError,
            "Unexpected Node API nodes/copy response: expected an Array of mapping entries, " \
            "got #{response.class}"
    end

    # The Node API reported these nodes as copied, so they must be readable.
    # If they are not, the copy result would be silently incomplete - raise
    # a descriptive error instead.
    def verify_targets_visible!(target_ids, targets)
      missing_ids = target_ids - targets.keys
      return if missing_ids.empty?

      raise CopyError,
            "Node API reported copied nodes #{missing_ids.join(', ')} but they are not visible " \
            "in the current DB session. Was the copy invoked inside an open transaction?"
    end

    def https_apps_client
      # The Node API authenticates via "Authorization: Key <token>" headers only.
      # The key carries the acting user's identity together with the platform
      # token from the supplied api object, which also covers "act-as" flows
      # (e.g. challenge bot token used on behalf of the bot user).
      @https_apps_client ||= HttpsAppsClient.new(
        auth_key: NodeApiAuthKey.generate(user: user, token: api.bearer_token),
      )
    end
  end
end
