class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.string :type
      t.string :org_handle
      t.string :dxuser
      t.string :param1
      t.string :param2
      t.string :param3
      t.datetime :created_at, null: false
    end
  end
end

