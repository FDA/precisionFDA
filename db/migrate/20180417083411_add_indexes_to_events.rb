class AddIndexesToEvents < ActiveRecord::Migration
  ATTRIBUTES = %w(org_handle dxuser param2 created_at)

  def change
    reversible do |dir|
      dir.up do
        ActiveRecord::Base.transaction do
          Event::UserViewed.update_all("dxuser = param1")

          Event::UserViewed.where("param3 > 1").find_each do |event|
            (event.param3.to_i - 1).times do
              Event::UserViewed.create(event.attributes.slice(*ATTRIBUTES))
            end
          end

          Event::UserViewed.update_all(param1: nil, param3: nil)
        end
      end
    end

    add_index :events, [:type, :created_at]
  end

end
