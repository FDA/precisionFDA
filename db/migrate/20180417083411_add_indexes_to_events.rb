class AddIndexesToEvents < ActiveRecord::Migration
  ATTRIBUTES = %w(type org_handle dxuser param1 param2 created_at)

  def change
    reversible do |dir|
      dir.up do

        execute <<-SQL
          UPDATE events SET dxuser = param1 WHERE type = 'Event::UserViewed';
        SQL

        Event::UserViewed.where("param3 > 1").find_in_batches(batch_size: 500) do |group|
          values = []

          group.each do |event|
            values += ["(#{attributes_for(event).join(',')})"] * (event.param3.to_i - 1)
          end

          multi_insert(values)
        end
      end
    end

    add_index :events, [:type, :created_at]
  end

  private

  def attributes_for(event)
    [
      ActiveRecord::Base.sanitize(event.type),
      ActiveRecord::Base.sanitize(event.org_handle),
      ActiveRecord::Base.sanitize(event.dxuser),
      ActiveRecord::Base.sanitize(event.param1),
      ActiveRecord::Base.sanitize(event.param2),
      ActiveRecord::Base.sanitize(event.created_at.to_s(:db)),
    ]
  end

  def multi_insert(records)
    execute <<-SQL
      INSERT INTO events (#{ATTRIBUTES.join(', ')})
      VALUES #{records.join(',')};
    SQL
  end
end
