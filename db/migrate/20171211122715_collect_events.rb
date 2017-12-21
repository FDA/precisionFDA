class CollectEvents < ActiveRecord::Migration
  def change
    reversible do |dir|
      dir.up do

        execute <<-SQL
          INSERT INTO events (type, org_handle, dxuser, param1, param2, param3, created_at)
            SELECT 'Event::FileCreated' AS type, orgs.handle, users.dxuser, nodes.file_size, nodes.dxid, nodes.parent_type, nodes.created_at
            FROM nodes
            JOIN users ON users.id = nodes.user_id
            JOIN orgs ON orgs.id = users.org_id
            WHERE nodes.sti_type IN ('UserFile', 'Asset');
        SQL

        execute <<-SQL
          INSERT INTO events (type, org_handle, dxuser, param1, created_at)
            SELECT 'Event::AppCreated' AS type, orgs.handle, users.dxuser, apps.dxid, apps.created_at
            FROM apps
            JOIN users ON users.id = apps.user_id
            JOIN orgs ON orgs.id = users.org_id
        SQL

        execute <<-SQL
          INSERT INTO events (type, org_handle, dxuser, param1, created_at)
            SELECT 'Event::AppPublished' AS type, orgs.handle, users.dxuser, apps.dxid, apps.updated_at
            FROM apps
            JOIN users ON users.id = apps.user_id
            JOIN orgs ON orgs.id = users.org_id
            WHERE apps.scope = 'public'
        SQL

        execute <<-SQL
          INSERT INTO events (type, org_handle, dxuser, param1, created_at)
            SELECT 'Event::JobRun' AS type, orgs.handle, users.dxuser, jobs.dxid, jobs.created_at
            FROM jobs
            JOIN users ON users.id = jobs.user_id
            JOIN orgs ON orgs.id = users.org_id
        SQL

        execute <<-SQL
          INSERT INTO events (type, param1, created_at)
            SELECT 'Event::UserAccessRequested' AS type, invitations.id, invitations.created_at
            FROM invitations
        SQL
      end

      dir.down do
        execute <<-SQL
          DELETE FROM events
          WHERE type = 'Event::AppCreated' OR
                type = 'Event::FileCreated' OR
                type = 'Event::AppPublished' OR
                type = 'Event::JobRun' OR
                type = 'Event::UserAccessRequested'
        SQL
      end
    end
  end
end
