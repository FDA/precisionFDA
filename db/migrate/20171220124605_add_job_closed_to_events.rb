class AddJobClosedToEvents < ActiveRecord::Migration
  def change

    add_column :events, :param4, :string

    reversible do |dir|
      dir.up do
        execute <<-SQL
          DELETE FROM events WHERE type = 'Event::JobCoreUsed' OR type = 'Event::JobFailed'
        SQL

        Job.terminal.find_each do |job|
          event = Event::JobClosed.create(job, job.user)
          event.update(created_at: job.created_at)
        end
      end

      dir.down do
        execute <<-SQL
          DELETE FROM events WHERE type = 'Event::JobClosed'
        SQL
      end
    end
  end
end
