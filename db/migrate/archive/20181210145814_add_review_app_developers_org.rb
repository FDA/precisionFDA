class AddReviewAppDevelopersOrg < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :review_app_developers_org, :string, default: ''
  end
end
