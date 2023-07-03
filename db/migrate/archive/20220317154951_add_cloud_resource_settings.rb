class AddCloudResourceSettings < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :cloud_resource_settings, :text

    reversible do |dir|
      dir.up do
        User.update(
          pricing_map: CloudResourceDefaults::PRICING_MAP,
          job_limit: CloudResourceDefaults::JOB_LIMIT,
          total_limit: CloudResourceDefaults::TOTAL_LIMIT,
          resources: CloudResourceDefaults::RESOURCES,
        )
      end
    end
  end
end
