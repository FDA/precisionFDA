enum PARENT_TYPE {
  USER = 'User',
  JOB = 'Job',
  COMMENT = 'Comment',
}

enum SPACE_EVENT_OBJECT_TYPE {
  SPACE = 0,
  MEMBERSHIP = 1,
  // deprecated?
  TASK = 2,
  COMMENT = 3,
  APP = 4,
  JOB = 5,
  FILE = 6,
  ASSET = 7,
  COMPARISON = 8,
  WORKFLOW = 9,
  NOTE = 10,
}

// we count on numeric values generated automatically
enum SPACE_EVENT_ACTIVITY_TYPE {
  membership_added,
  membership_disabled,
  membership_changed,
  task_created,
  task_reassigned,
  task_completed,
  task_declined,
  task_deleted,
  job_added,
  job_completed,
  file_added,
  file_deleted,
  note_added,
  app_added,
  asset_added,
  asset_deleted,
  comparison_added,
  workflow_added,
  comment_added,
  comment_edited,
  comment_deleted,
  space_locked,
  space_unlocked,
  space_deleted,
  task_accepted,
  task_reopened,
  membership_enabled,
}

export { PARENT_TYPE, SPACE_EVENT_ACTIVITY_TYPE, SPACE_EVENT_OBJECT_TYPE }
