# DB Cluster serializer.
class DbClusterSerializer < ApplicationSerializer
  V2_DBCLUSTERS_PATH = "/api/v2/dbclusters".freeze

  attributes(
    :id,
    :dxid,
    :uid,
    :name,
    :title,
    :status,
    :location,
    :scope_name,
    :description,
    :added_by,
    :added_by_fullname,
    :created_at,
    :created_at_date_time,
    :engine, # aurora-mysql, aurora-postgresql
    :engine_version, # see possible values in the documentation
    :dx_instance_class,
    :status_as_of,
    :status_updated_date_time,
    :host,
    :port,
    :show_license_pending,
    :tags,
    :links,
  )
  delegate :scope, to: :object
  delegate :license, to: :object, allow_nil: true

  attribute :scope_name, key: :scope
  attribute :all_tags_list, key: :tags
  attribute :properties_object, key: :properties

  # Returns formatted status_as_of time.
  # @return [String] Formatted time.
  def status_updated_date_time
    formatted_date_time(object.status_as_of)
  end

  def properties_object
    props = {}
    object.properties.each do |prop|
      props[prop.property_name] = prop.property_value
    end
    props
  end

  def title
    object.name
  end

  def scope_name
    object.scope
  end

  def added_by
    object.user.full_name
  end

  def added_by_dxuser
    object.user.dxuser
  end

  # Builds links.
  # @return [Hash] Links.
  def links
    {}.tap do |links|
      links[:user] = user_path(added_by_dxuser)
      links[:space] = space_path if object.in_space?
      links[:create] = V2_DBCLUSTERS_PATH
      links[:update] = "#{V2_DBCLUSTERS_PATH}/#{object.uid}"

      licenses_links!(links)
    end
  end

  def licenses_links!(links)
    return unless license

    links[:show_license] = license_path(license)

    if object.license_status?(current_user, AcceptedLicense::STATUS_ACTIVE)
      # no-op: run actions are now derived on the client side
    elsif license.approval_required &&
          !object.license_status?(current_user, AcceptedLicense::STATUS_PENDING)
      links[:request_approval_license] = request_approval_license_path(license)
    else
      links[:accept_license] = accept_api_license_path(license)
    end

    return unless object.owned_by_user?(current_user) && !member_viewer?

    links[:license] = "/api/licenses/:id/license_item/:item_uid" if object.user == current_user

    return unless license.owned_by_user?(current_user)

    links[:object_license] = api_license_path(license)
    links[:detach_license] = "/api/licenses/:id/remove_item/:item_uid"
  end
end
