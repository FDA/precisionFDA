class AddReviewAppDevelopersOrg < ActiveRecord::Migration
  def change
    add_column :users, :review_app_developers_org, :string, default: ''
  end
end
