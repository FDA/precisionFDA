module FileService
  # The ToggleFeaturePublicFolderService used for toggling files and folders
  # it toggles all available records Nodes#featured
  #
  class ToggleFeaturePublicFolderService
    def initialize(params, context)
      @featured = params[:featured]
      @ids = params[:item_ids].presence || []
      @context = context
      @node = Node.arel_table
    end

    def call
      return [] unless context.user.site_admin?

      featured? ? update_records : toggle_records

      records
    end

    private

    attr_reader :featured, :node, :context, :ids

    def featured?
      featured.present?
    end

    def records
      nodes = Node.where(
        (node[:id].in ids).
          or((node[:uid].in ids)).
          or((node[:parent_folder_id].in ids)).
          and((node[:scope].in ::Scopes::SCOPE_PUBLIC)),
      )
      children = nodes.folders.flat_map(&:children)
      nodes.to_a.concat(children).uniq
    end

    def toggle_records
      Node.transaction do
        records.map do |record|
          raise ActiveRecord::Rollback unless record.toggle(:featured).save
        end
      end
    end

    def update_records
      Node.transaction do
        records.map do |record|
          raise ActiveRecord::Rollback unless record.update(featured: featured)
        end
      end
    end
  end
end
