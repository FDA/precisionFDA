# Migration to fix Event::JobClosed records where param2 (runtime) incorrectly
# contains an app dxid (e.g. "app-xxxx") instead of a numeric runtime in seconds.
#
# Root cause: createJobClosed adds app dxid instead of a calculated value
# for some records at the time the event was created.
#
# Fix: for each affected event, look up the job by param1 (dxid) and recalculate
# runtime as (describe["stoppedRunning"] - describe["startedRunning"]) / 1000.
# If the job is not found or describe data is missing, param2 is set to 0.
class FixJobClosedEventsRuntime < ActiveRecord::Migration[7.1]
  def up
    affected = Event.where(type: "Event::JobClosed").where("param2 REGEXP ? OR param4 IS NULL", "^app-")

    return if affected.none?

    say "Found #{affected.count} affected Event::JobClosed records. Fixing..."

    affected.each do |event|
      job = Job.find_by(dxid: event.param1)
      runtime = calculate_runtime(job)
      event.update_columns(param2: runtime.to_s, param4: job&.state)
    end

    say "Done fixing #{affected.count} Event::JobClosed records."
  end

  def down
  end

  private

  def calculate_runtime(job)
    return 0 if job.nil?

    describe = job.describe
    return 0 if describe.blank?

    started = describe["startedRunning"]
    stopped = describe["stoppedRunning"]
    return 0 if started.blank? || stopped.blank?

    ((stopped.to_i - started.to_i) / 1000).to_i
  end
end
