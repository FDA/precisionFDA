class BackfillJobRunEvents < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  TEMPORARY_EVENT_LOOKUP_INDEX = "idx_events_type_param1_backfill".freeze

  def up
    temporary_index_created = add_temporary_event_lookup_index

    backfill_job_run
  ensure
    remove_temporary_event_lookup_index if temporary_index_created
  end

  def down
    # Not reversible: cannot distinguish backfilled events from organic ones
  end

  private

  def add_temporary_event_lookup_index
    return false if index_exists?(:events, [:type, :param1])

    execute <<~SQL.squish
      ALTER TABLE events
      ADD INDEX #{TEMPORARY_EVENT_LOOKUP_INDEX} (type, param1),
      ALGORITHM=INPLACE, LOCK=NONE
    SQL
    true
  end

  def remove_temporary_event_lookup_index
    execute <<~SQL.squish
      ALTER TABLE events
      DROP INDEX #{TEMPORARY_EVENT_LOOKUP_INDEX},
      ALGORITHM=INPLACE, LOCK=NONE
    SQL
  end

  def backfill_job_run
    execute <<~SQL.squish
      INSERT INTO events (type, param1, param2, dxuser, org_handle, created_at)
      SELECT 'Event::JobRun', jobs.dxid, apps.dxid, users.dxuser, orgs.handle, jobs.created_at
      FROM jobs
      JOIN users ON users.id = jobs.user_id
      JOIN apps ON apps.id = jobs.app_id
      JOIN orgs ON orgs.id = users.org_id
      WHERE jobs.created_at >= '2025-01-01 00:00:00'
        AND jobs.created_at <= NOW()
        AND jobs.created_at = (
          SELECT MIN(j2.created_at)
          FROM jobs j2
          WHERE j2.dxid = jobs.dxid
        )
        AND NOT EXISTS (
          SELECT 1
          FROM events
          WHERE events.type = 'Event::JobRun'
            AND events.param1 = jobs.dxid COLLATE utf8mb3_unicode_ci
        )
    SQL
  end
end
