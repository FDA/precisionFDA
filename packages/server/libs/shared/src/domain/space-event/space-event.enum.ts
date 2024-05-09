enum PARENT_TYPE {
  USER = 'User',
  JOB = 'Job',
  COMMENT = 'Comment',
  SPACE_MEMBERSHIP = 'SpaceMembership',
  SPACE = 'Space',
}

enum ENTITY_TYPE {
  APP = 'App',
  COMMENT = 'Comment',
  COMPARISON = 'Comparison',
  JOB = 'Job',
  NODE = 'Node',
  NOTE = 'Note',
  SPACE = 'Space',
  SPACE_MEMBERSHIP = 'SpaceMembership',
  TASK = 'Task',
  WORKFLOW = 'Workflow',
  USER = 'User',
}

enum SPACE_EVENT_OBJECT_TYPE {
  SPACE = 0,
  MEMBERSHIP = 1,
  // task deprecated?
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

enum SPACE_EVENT_ACTIVITY_TYPE {
  membership_added = 0,
  membership_disabled = 1,
  membership_changed = 2,
  // task deprecated?
  task_created = 3,
  task_reassigned = 4,
  task_completed = 5,
  task_declined = 6,
  task_deleted = 7,
  job_added = 8,
  job_completed = 9,
  file_added = 10,
  file_deleted = 11,
  note_added = 12,
  app_added = 13,
  asset_added = 14,
  asset_deleted = 15,
  comparison_added = 16,
  workflow_added = 17,
  comment_added = 18,
  comment_edited = 19,
  comment_deleted = 20,
  space_locked = 21,
  space_unlocked = 22,
  space_deleted = 23,
  task_accepted = 24,
  task_reopened = 25,
  membership_enabled = 26,
  membership_deleted = 27,
  space_activated = 28,
}

export {
  PARENT_TYPE,
  ENTITY_TYPE,
  SPACE_EVENT_ACTIVITY_TYPE,
  SPACE_EVENT_OBJECT_TYPE,
}
