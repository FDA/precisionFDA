# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180125085602) do

  create_table "accepted_licenses", force: :cascade do |t|
    t.integer  "license_id", limit: 4
    t.integer  "user_id",    limit: 4
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.string   "state",      limit: 255
    t.text     "message",    limit: 65535
  end

  add_index "accepted_licenses", ["license_id"], name: "index_accepted_licenses_on_license_id", using: :btree
  add_index "accepted_licenses", ["user_id"], name: "index_accepted_licenses_on_user_id", using: :btree

  create_table "analyses", force: :cascade do |t|
    t.string   "name",        limit: 255
    t.string   "dxid",        limit: 255
    t.integer  "user_id",     limit: 4
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.integer  "workflow_id", limit: 4
  end

  add_index "analyses", ["user_id"], name: "index_analyses_on_user_id", using: :btree
  add_index "analyses", ["workflow_id"], name: "fk_rails_ea76af2894", using: :btree

  create_table "answers", force: :cascade do |t|
    t.integer  "user_id",       limit: 4
    t.integer  "discussion_id", limit: 4
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.integer  "note_id",       limit: 4
  end

  add_index "answers", ["discussion_id"], name: "index_answers_on_discussion_id", using: :btree
  add_index "answers", ["note_id"], name: "index_answers_on_note_id", using: :btree
  add_index "answers", ["user_id"], name: "index_answers_on_user_id", using: :btree

  create_table "app_series", force: :cascade do |t|
    t.string   "dxid",                   limit: 255
    t.string   "name",                   limit: 255
    t.integer  "latest_revision_app_id", limit: 4
    t.integer  "latest_version_app_id",  limit: 4
    t.integer  "user_id",                limit: 4
    t.string   "scope",                  limit: 255
    t.datetime "created_at",                         null: false
    t.datetime "updated_at",                         null: false
  end

  add_index "app_series", ["dxid"], name: "index_app_series_on_dxid", using: :btree
  add_index "app_series", ["latest_revision_app_id"], name: "index_app_series_on_latest_revision_app_id", using: :btree
  add_index "app_series", ["latest_version_app_id"], name: "index_app_series_on_latest_version_app_id", using: :btree
  add_index "app_series", ["scope"], name: "index_app_series_on_scope", using: :btree
  add_index "app_series", ["user_id"], name: "index_app_series_on_user_id", using: :btree

  create_table "appathons", force: :cascade do |t|
    t.string   "name",             limit: 255
    t.integer  "admin_id",         limit: 4
    t.integer  "meta_appathon_id", limit: 4
    t.text     "description",      limit: 65535
    t.string   "flag",             limit: 255
    t.string   "location",         limit: 255
    t.datetime "start_at"
    t.datetime "end_at"
    t.text     "meta",             limit: 65535
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
  end

  add_index "appathons", ["admin_id"], name: "index_appathons_on_admin_id", using: :btree
  add_index "appathons", ["meta_appathon_id"], name: "index_appathons_on_meta_appathon_id", using: :btree

  create_table "apps", force: :cascade do |t|
    t.string   "dxid",          limit: 255
    t.string   "version",       limit: 255
    t.integer  "revision",      limit: 4
    t.string   "title",         limit: 255
    t.text     "readme",        limit: 65535
    t.integer  "user_id",       limit: 4
    t.string   "scope",         limit: 255
    t.text     "spec",          limit: 65535
    t.text     "internal",      limit: 65535
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.integer  "app_series_id", limit: 4
  end

  add_index "apps", ["app_series_id"], name: "index_apps_on_app_series_id", using: :btree
  add_index "apps", ["dxid"], name: "index_apps_on_dxid", using: :btree
  add_index "apps", ["scope"], name: "index_apps_on_scope", using: :btree
  add_index "apps", ["user_id"], name: "index_apps_on_user_id", using: :btree
  add_index "apps", ["version"], name: "index_apps_on_version", using: :btree

  create_table "apps_assets", force: :cascade do |t|
    t.integer "app_id",   limit: 4
    t.integer "asset_id", limit: 4
  end

  add_index "apps_assets", ["app_id"], name: "index_apps_assets_on_app_id", using: :btree
  add_index "apps_assets", ["asset_id"], name: "index_apps_assets_on_asset_id", using: :btree

  create_table "archive_entries", force: :cascade do |t|
    t.text    "path",     limit: 65535
    t.string  "name",     limit: 255
    t.integer "asset_id", limit: 4
  end

  add_index "archive_entries", ["asset_id"], name: "index_archive_entries_on_asset_id", using: :btree
  add_index "archive_entries", ["name"], name: "index_archive_entries_on_name", using: :btree

  create_table "attachments", force: :cascade do |t|
    t.integer "note_id",   limit: 4
    t.integer "item_id",   limit: 4
    t.string  "item_type", limit: 255
  end

  add_index "attachments", ["item_type", "item_id"], name: "index_attachments_on_item_type_and_item_id", using: :btree
  add_index "attachments", ["note_id"], name: "index_attachments_on_note_id", using: :btree

  create_table "challenge_resources", force: :cascade do |t|
    t.integer  "challenge_id", limit: 4
    t.integer  "user_file_id", limit: 4
    t.integer  "user_id",      limit: 4
    t.text     "url",          limit: 65535
    t.text     "meta",         limit: 65535
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  add_index "challenge_resources", ["challenge_id"], name: "index_challenge_resources_on_challenge_id", using: :btree
  add_index "challenge_resources", ["user_file_id"], name: "index_challenge_resources_on_user_file_id", using: :btree
  add_index "challenge_resources", ["user_id"], name: "index_challenge_resources_on_user_id", using: :btree

  create_table "challenges", force: :cascade do |t|
    t.string   "name",           limit: 255
    t.integer  "admin_id",       limit: 4
    t.integer  "app_owner_id",   limit: 4
    t.integer  "app_id",         limit: 4
    t.text     "description",    limit: 65535
    t.text     "meta",           limit: 65535
    t.datetime "start_at"
    t.datetime "end_at"
    t.datetime "created_at",                                  null: false
    t.datetime "updated_at",                                  null: false
    t.string   "status",         limit: 255
    t.boolean  "automated",                    default: true
    t.string   "card_image_url", limit: 255
    t.string   "card_image_id",  limit: 255
  end

  add_index "challenges", ["admin_id"], name: "index_challenges_on_admin_id", using: :btree
  add_index "challenges", ["app_id"], name: "index_challenges_on_app_id", using: :btree
  add_index "challenges", ["app_owner_id"], name: "index_challenges_on_app_owner_id", using: :btree
  add_index "challenges", ["status"], name: "index_challenges_on_status", using: :btree

  create_table "comments", force: :cascade do |t|
    t.integer  "commentable_id",   limit: 4
    t.string   "commentable_type", limit: 255
    t.string   "title",            limit: 255
    t.text     "body",             limit: 65535
    t.string   "subject",          limit: 255
    t.integer  "user_id",          limit: 4,     null: false
    t.integer  "parent_id",        limit: 4
    t.integer  "lft",              limit: 4
    t.integer  "rgt",              limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "comments", ["commentable_id", "commentable_type"], name: "index_comments_on_commentable_id_and_commentable_type", using: :btree
  add_index "comments", ["user_id"], name: "index_comments_on_user_id", using: :btree

  create_table "comparison_inputs", force: :cascade do |t|
    t.integer "comparison_id", limit: 4
    t.integer "user_file_id",  limit: 4
    t.string  "role",          limit: 255
  end

  add_index "comparison_inputs", ["comparison_id"], name: "index_comparison_inputs_on_comparison_id", using: :btree
  add_index "comparison_inputs", ["user_file_id"], name: "index_comparison_inputs_on_user_file_id", using: :btree

  create_table "comparisons", force: :cascade do |t|
    t.string   "name",        limit: 255
    t.text     "description", limit: 65535
    t.integer  "user_id",     limit: 4
    t.string   "state",       limit: 255
    t.string   "dxjobid",     limit: 255
    t.string   "project",     limit: 255
    t.text     "meta",        limit: 65535
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
    t.string   "scope",       limit: 255
  end

  add_index "comparisons", ["scope"], name: "index_comparisons_on_scope", using: :btree
  add_index "comparisons", ["state"], name: "index_comparisons_on_state", using: :btree
  add_index "comparisons", ["user_id"], name: "index_comparisons_on_user_id", using: :btree

  create_table "discussions", force: :cascade do |t|
    t.integer  "user_id",    limit: 4
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
    t.integer  "note_id",    limit: 4
  end

  add_index "discussions", ["note_id"], name: "index_discussions_on_note_id", using: :btree
  add_index "discussions", ["user_id"], name: "index_discussions_on_user_id", using: :btree

  create_table "events", force: :cascade do |t|
    t.string   "type",       limit: 255
    t.string   "org_handle", limit: 255
    t.string   "dxuser",     limit: 255
    t.string   "param1",     limit: 255
    t.string   "param2",     limit: 255
    t.string   "param3",     limit: 255
    t.datetime "created_at",             null: false
    t.string   "param4",     limit: 255
  end

  create_table "expert_answers", force: :cascade do |t|
    t.integer  "expert_id",          limit: 4
    t.integer  "expert_question_id", limit: 4
    t.text     "body",               limit: 65535
    t.string   "state",              limit: 255
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
  end

  add_index "expert_answers", ["expert_id"], name: "index_expert_answers_on_expert_id", using: :btree
  add_index "expert_answers", ["expert_question_id"], name: "index_expert_answers_on_expert_question_id", using: :btree
  add_index "expert_answers", ["state"], name: "index_expert_answers_on_state", using: :btree

  create_table "expert_questions", force: :cascade do |t|
    t.integer  "expert_id",  limit: 4
    t.integer  "user_id",    limit: 4
    t.text     "body",       limit: 65535
    t.text     "meta",       limit: 65535
    t.string   "state",      limit: 255
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  add_index "expert_questions", ["expert_id"], name: "index_expert_questions_on_expert_id", using: :btree
  add_index "expert_questions", ["state"], name: "index_expert_questions_on_state", using: :btree
  add_index "expert_questions", ["user_id"], name: "index_expert_questions_on_user_id", using: :btree

  create_table "experts", force: :cascade do |t|
    t.integer  "user_id",    limit: 4
    t.string   "image",      limit: 255
    t.string   "state",      limit: 255
    t.string   "scope",      limit: 255
    t.text     "meta",       limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  add_index "experts", ["image"], name: "index_experts_on_image", using: :btree
  add_index "experts", ["scope"], name: "index_experts_on_scope", using: :btree
  add_index "experts", ["state"], name: "index_experts_on_state", using: :btree
  add_index "experts", ["user_id"], name: "index_experts_on_user_id", using: :btree

  create_table "follows", force: :cascade do |t|
    t.integer  "followable_id",   limit: 4,                   null: false
    t.string   "followable_type", limit: 255,                 null: false
    t.integer  "follower_id",     limit: 4,                   null: false
    t.string   "follower_type",   limit: 255,                 null: false
    t.boolean  "blocked",                     default: false, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "follows", ["followable_id", "followable_type"], name: "fk_followables", using: :btree
  add_index "follows", ["follower_id", "follower_type"], name: "fk_follows", using: :btree

  create_table "invitations", force: :cascade do |t|
    t.string   "first_name", limit: 255
    t.string   "last_name",  limit: 255
    t.string   "email",      limit: 255
    t.string   "org",        limit: 255
    t.boolean  "singular"
    t.string   "address",    limit: 255
    t.string   "phone",      limit: 255
    t.string   "duns",       limit: 255
    t.string   "ip",         limit: 255
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.text     "extras",     limit: 65535
    t.integer  "user_id",    limit: 4
    t.string   "state",      limit: 255
    t.string   "code",       limit: 255
  end

  add_index "invitations", ["code"], name: "index_invitations_on_code", unique: true, using: :btree
  add_index "invitations", ["email"], name: "index_invitations_on_email", using: :btree
  add_index "invitations", ["state"], name: "index_invitations_on_state", using: :btree
  add_index "invitations", ["user_id"], name: "index_invitations_on_user_id", using: :btree

  create_table "job_inputs", force: :cascade do |t|
    t.integer "job_id",       limit: 4
    t.integer "user_file_id", limit: 4
  end

  add_index "job_inputs", ["job_id"], name: "index_job_inputs_on_job_id", using: :btree
  add_index "job_inputs", ["user_file_id"], name: "index_job_inputs_on_user_file_id", using: :btree

  create_table "jobs", force: :cascade do |t|
    t.string   "dxid",          limit: 255
    t.integer  "app_id",        limit: 4
    t.string   "project",       limit: 255
    t.text     "run_data",      limit: 65535
    t.text     "describe",      limit: 65535
    t.text     "provenance",    limit: 65535
    t.string   "state",         limit: 255
    t.string   "name",          limit: 255
    t.integer  "user_id",       limit: 4
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.integer  "app_series_id", limit: 4
    t.string   "scope",         limit: 255
    t.integer  "analysis_id",   limit: 4
  end

  add_index "jobs", ["analysis_id"], name: "fk_rails_0a95efec7a", using: :btree
  add_index "jobs", ["app_id"], name: "index_jobs_on_app_id", using: :btree
  add_index "jobs", ["app_series_id"], name: "index_jobs_on_app_series_id", using: :btree
  add_index "jobs", ["dxid"], name: "index_jobs_on_dxid", using: :btree
  add_index "jobs", ["scope"], name: "index_jobs_on_scope", using: :btree
  add_index "jobs", ["state"], name: "index_jobs_on_state", using: :btree
  add_index "jobs", ["user_id"], name: "index_jobs_on_user_id", using: :btree

  create_table "licensed_items", force: :cascade do |t|
    t.integer  "license_id",       limit: 4
    t.integer  "licenseable_id",   limit: 4
    t.string   "licenseable_type", limit: 255
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
  end

  add_index "licensed_items", ["license_id"], name: "index_licensed_items_on_license_id", using: :btree
  add_index "licensed_items", ["licenseable_type", "licenseable_id"], name: "index_licensed_items_on_licenseable_type_and_licenseable_id", using: :btree

  create_table "licenses", force: :cascade do |t|
    t.text     "content",           limit: 65535
    t.integer  "user_id",           limit: 4
    t.datetime "created_at",                                      null: false
    t.datetime "updated_at",                                      null: false
    t.string   "title",             limit: 255
    t.string   "scope",             limit: 255
    t.boolean  "approval_required",               default: false, null: false
  end

  add_index "licenses", ["scope"], name: "index_licenses_on_scope", using: :btree
  add_index "licenses", ["user_id"], name: "index_licenses_on_user_id", using: :btree

  create_table "meta_appathons", force: :cascade do |t|
    t.string   "name",        limit: 255
    t.string   "handle",      limit: 255
    t.string   "template",    limit: 255
    t.text     "description", limit: 65535
    t.text     "meta",        limit: 65535
    t.datetime "start_at"
    t.datetime "end_at"
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  add_index "meta_appathons", ["handle"], name: "index_meta_appathons_on_handle", unique: true, using: :btree

  create_table "nodes", force: :cascade do |t|
    t.string   "dxid",                    limit: 255
    t.string   "project",                 limit: 255
    t.string   "name",                    limit: 255
    t.string   "state",                   limit: 255
    t.text     "description",             limit: 65535
    t.integer  "user_id",                 limit: 4
    t.integer  "file_size",               limit: 8
    t.datetime "created_at",                            null: false
    t.datetime "updated_at",                            null: false
    t.integer  "parent_id",               limit: 4
    t.string   "parent_type",             limit: 255
    t.string   "scope",                   limit: 255
    t.integer  "parent_folder_id",        limit: 4
    t.string   "sti_type",                limit: 255
    t.integer  "scoped_parent_folder_id", limit: 4
  end

  add_index "nodes", ["parent_type", "parent_id"], name: "index_nodes_on_parent_type_and_parent_id", using: :btree
  add_index "nodes", ["scope"], name: "index_nodes_on_scope", using: :btree
  add_index "nodes", ["state"], name: "index_nodes_on_state", using: :btree
  add_index "nodes", ["user_id"], name: "index_nodes_on_user_id", using: :btree

  create_table "notes", force: :cascade do |t|
    t.string   "title",      limit: 255
    t.text     "content",    limit: 65535
    t.integer  "user_id",    limit: 4
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.string   "scope",      limit: 255
    t.string   "note_type",  limit: 255
  end

  add_index "notes", ["scope"], name: "index_notes_on_scope", using: :btree
  add_index "notes", ["user_id"], name: "index_notes_on_user_id", using: :btree

  create_table "orgs", force: :cascade do |t|
    t.string   "handle",     limit: 255
    t.string   "name",       limit: 255
    t.integer  "admin_id",   limit: 4
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.text     "address",    limit: 65535
    t.string   "duns",       limit: 255
    t.string   "phone",      limit: 255
    t.string   "state",      limit: 255
    t.boolean  "singular"
  end

  add_index "orgs", ["admin_id"], name: "index_orgs_on_admin_id", using: :btree
  add_index "orgs", ["handle"], name: "index_orgs_on_handle", unique: true, using: :btree

  create_table "saved_queries", force: :cascade do |t|
    t.string   "name",        limit: 255
    t.string   "grid_name",   limit: 255
    t.text     "query",       limit: 65535
    t.text     "description", limit: 65535
    t.integer  "user_id",     limit: 4
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  add_index "saved_queries", ["grid_name", "id"], name: "index_saved_queries_on_grid_name_and_id", using: :btree
  add_index "saved_queries", ["grid_name"], name: "index_saved_queries_on_grid_name", using: :btree
  add_index "saved_queries", ["user_id"], name: "index_saved_queries_on_user_id", using: :btree

  create_table "space_memberships", force: :cascade do |t|
    t.integer  "user_id",    limit: 4
    t.integer  "space_id",   limit: 4
    t.string   "role",       limit: 255
    t.string   "side",       limit: 255
    t.text     "meta",       limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  add_index "space_memberships", ["space_id"], name: "index_space_memberships_on_space_id", using: :btree
  add_index "space_memberships", ["user_id"], name: "index_space_memberships_on_user_id", using: :btree

  create_table "spaces", force: :cascade do |t|
    t.string   "name",          limit: 255
    t.text     "description",   limit: 65535
    t.string   "host_project",  limit: 255
    t.string   "guest_project", limit: 255
    t.string   "host_dxorg",    limit: 255
    t.string   "guest_dxorg",   limit: 255
    t.string   "space_type",    limit: 255
    t.string   "state",         limit: 255
    t.text     "meta",          limit: 65535
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

  add_index "spaces", ["space_type"], name: "index_spaces_on_space_type", using: :btree
  add_index "spaces", ["state"], name: "index_spaces_on_state", using: :btree

  create_table "submissions", force: :cascade do |t|
    t.integer  "challenge_id", limit: 4
    t.integer  "user_id",      limit: 4
    t.integer  "job_id",       limit: 4
    t.text     "desc",         limit: 65535
    t.text     "meta",         limit: 65535
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  add_index "submissions", ["challenge_id"], name: "index_submissions_on_challenge_id", using: :btree
  add_index "submissions", ["job_id"], name: "index_submissions_on_job_id", using: :btree
  add_index "submissions", ["user_id"], name: "index_submissions_on_user_id", using: :btree

  create_table "taggings", force: :cascade do |t|
    t.integer  "tag_id",        limit: 4
    t.integer  "taggable_id",   limit: 4
    t.string   "taggable_type", limit: 255
    t.integer  "tagger_id",     limit: 4
    t.string   "tagger_type",   limit: 255
    t.string   "context",       limit: 128
    t.datetime "created_at"
  end

  add_index "taggings", ["context"], name: "index_taggings_on_context", using: :btree
  add_index "taggings", ["tag_id", "taggable_id", "taggable_type", "context", "tagger_id", "tagger_type"], name: "taggings_idx", unique: true, using: :btree
  add_index "taggings", ["tag_id"], name: "index_taggings_on_tag_id", using: :btree
  add_index "taggings", ["taggable_id", "taggable_type", "context"], name: "index_taggings_on_taggable_id_and_taggable_type_and_context", using: :btree
  add_index "taggings", ["taggable_id", "taggable_type", "tagger_id", "context"], name: "taggings_idy", using: :btree
  add_index "taggings", ["taggable_id"], name: "index_taggings_on_taggable_id", using: :btree
  add_index "taggings", ["taggable_type"], name: "index_taggings_on_taggable_type", using: :btree
  add_index "taggings", ["tagger_id", "tagger_type"], name: "index_taggings_on_tagger_id_and_tagger_type", using: :btree
  add_index "taggings", ["tagger_id"], name: "index_taggings_on_tagger_id", using: :btree

  create_table "tags", force: :cascade do |t|
    t.string  "name",           limit: 255
    t.integer "taggings_count", limit: 4,   default: 0
  end

  add_index "tags", ["name"], name: "index_tags_on_name", unique: true, using: :btree

  create_table "truth_challenge_results", force: :cascade do |t|
    t.integer "answer_id",                 limit: 4
    t.string  "entry",                     limit: 255
    t.string  "type",                      limit: 255
    t.string  "subtype",                   limit: 255
    t.string  "subset",                    limit: 255
    t.string  "filter",                    limit: 255
    t.string  "genotype",                  limit: 255
    t.string  "qq_field",                  limit: 255
    t.string  "qq",                        limit: 255
    t.decimal "metric_recall",                           precision: 7,  scale: 6
    t.decimal "metric_precision",                        precision: 7,  scale: 6
    t.decimal "metric_frac_na",                          precision: 7,  scale: 6
    t.decimal "metric_f1_score",                         precision: 7,  scale: 6
    t.integer "truth_total",               limit: 4
    t.integer "truth_tp",                  limit: 4
    t.integer "truth_fn",                  limit: 4
    t.integer "query_total",               limit: 4
    t.integer "query_tp",                  limit: 4
    t.integer "query_fp",                  limit: 4
    t.integer "query_unk",                 limit: 4
    t.integer "fp_gt",                     limit: 4
    t.integer "fp_al",                     limit: 4
    t.decimal "pct_fp_ma",                               precision: 10, scale: 6
    t.decimal "truth_total_titv_ratio",                  precision: 10, scale: 6
    t.decimal "truth_total_het_hom_ratio",               precision: 10, scale: 6
    t.decimal "truth_fn_titv_ratio",                     precision: 10, scale: 6
    t.decimal "truth_fn_het_hom_ratio",                  precision: 10, scale: 6
    t.decimal "truth_tp_titv_ratio",                     precision: 10, scale: 6
    t.decimal "truth_tp_het_hom_ratio",                  precision: 10, scale: 6
    t.decimal "query_fp_titv_ratio",                     precision: 10, scale: 6
    t.decimal "query_fp_het_hom_ratio",                  precision: 10, scale: 6
    t.decimal "query_tp_titv_ratio",                     precision: 10, scale: 6
    t.decimal "query_total_titv_ratio",                  precision: 10, scale: 6
    t.decimal "query_total_het_hom_ratio",               precision: 10, scale: 6
    t.decimal "query_tp_het_hom_ratio",                  precision: 10, scale: 6
    t.decimal "query_unk_titv_ratio",                    precision: 10, scale: 6
    t.decimal "query_unk_het_hom_ratio",                 precision: 10, scale: 6
    t.text    "meta",                      limit: 65535
  end

  add_index "truth_challenge_results", ["entry"], name: "index_truth_challenge_results_on_entry", using: :btree
  add_index "truth_challenge_results", ["fp_al"], name: "index_truth_challenge_results_on_fp_al", using: :btree
  add_index "truth_challenge_results", ["fp_gt"], name: "index_truth_challenge_results_on_fp_gt", using: :btree
  add_index "truth_challenge_results", ["genotype"], name: "index_truth_challenge_results_on_genotype", using: :btree
  add_index "truth_challenge_results", ["metric_f1_score"], name: "index_truth_challenge_results_on_metric_f1_score", using: :btree
  add_index "truth_challenge_results", ["metric_frac_na"], name: "index_truth_challenge_results_on_metric_frac_na", using: :btree
  add_index "truth_challenge_results", ["metric_precision"], name: "index_truth_challenge_results_on_metric_precision", using: :btree
  add_index "truth_challenge_results", ["metric_recall"], name: "index_truth_challenge_results_on_metric_recall", using: :btree
  add_index "truth_challenge_results", ["query_fp"], name: "index_truth_challenge_results_on_query_fp", using: :btree
  add_index "truth_challenge_results", ["query_fp_het_hom_ratio"], name: "index_truth_challenge_results_on_query_fp_het_hom_ratio", using: :btree
  add_index "truth_challenge_results", ["query_fp_titv_ratio"], name: "index_truth_challenge_results_on_query_fp_titv_ratio", using: :btree
  add_index "truth_challenge_results", ["query_total"], name: "index_truth_challenge_results_on_query_total", using: :btree
  add_index "truth_challenge_results", ["query_total_het_hom_ratio"], name: "index_truth_challenge_results_on_query_total_het_hom_ratio", using: :btree
  add_index "truth_challenge_results", ["query_total_titv_ratio"], name: "index_truth_challenge_results_on_query_total_titv_ratio", using: :btree
  add_index "truth_challenge_results", ["query_tp"], name: "index_truth_challenge_results_on_query_tp", using: :btree
  add_index "truth_challenge_results", ["query_tp_het_hom_ratio"], name: "index_truth_challenge_results_on_query_tp_het_hom_ratio", using: :btree
  add_index "truth_challenge_results", ["query_tp_titv_ratio"], name: "index_truth_challenge_results_on_query_tp_titv_ratio", using: :btree
  add_index "truth_challenge_results", ["query_unk"], name: "index_truth_challenge_results_on_query_unk", using: :btree
  add_index "truth_challenge_results", ["query_unk_het_hom_ratio"], name: "index_truth_challenge_results_on_query_unk_het_hom_ratio", using: :btree
  add_index "truth_challenge_results", ["query_unk_titv_ratio"], name: "index_truth_challenge_results_on_query_unk_titv_ratio", using: :btree
  add_index "truth_challenge_results", ["subset"], name: "index_truth_challenge_results_on_subset", using: :btree
  add_index "truth_challenge_results", ["subtype"], name: "index_truth_challenge_results_on_subtype", using: :btree
  add_index "truth_challenge_results", ["truth_fn"], name: "index_truth_challenge_results_on_truth_fn", using: :btree
  add_index "truth_challenge_results", ["truth_fn_het_hom_ratio"], name: "index_truth_challenge_results_on_truth_fn_het_hom_ratio", using: :btree
  add_index "truth_challenge_results", ["truth_fn_titv_ratio"], name: "index_truth_challenge_results_on_truth_fn_titv_ratio", using: :btree
  add_index "truth_challenge_results", ["truth_total"], name: "index_truth_challenge_results_on_truth_total", using: :btree
  add_index "truth_challenge_results", ["truth_total_het_hom_ratio"], name: "index_truth_challenge_results_on_truth_total_het_hom_ratio", using: :btree
  add_index "truth_challenge_results", ["truth_total_titv_ratio"], name: "index_truth_challenge_results_on_truth_total_titv_ratio", using: :btree
  add_index "truth_challenge_results", ["truth_tp"], name: "index_truth_challenge_results_on_truth_tp", using: :btree
  add_index "truth_challenge_results", ["truth_tp_het_hom_ratio"], name: "index_truth_challenge_results_on_truth_tp_het_hom_ratio", using: :btree
  add_index "truth_challenge_results", ["truth_tp_titv_ratio"], name: "index_truth_challenge_results_on_truth_tp_titv_ratio", using: :btree
  add_index "truth_challenge_results", ["type"], name: "index_truth_challenge_results_on_type", using: :btree

  create_table "usage_metrics", force: :cascade do |t|
    t.integer  "user_id",               limit: 4,                           null: false
    t.integer  "storage_usage",         limit: 8
    t.decimal  "daily_compute_price",             precision: 30, scale: 20
    t.decimal  "weekly_compute_price",            precision: 30, scale: 20
    t.decimal  "monthly_compute_price",           precision: 30, scale: 20
    t.decimal  "yearly_compute_price",            precision: 30, scale: 20
    t.datetime "created_at"
  end

  create_table "users", force: :cascade do |t|
    t.string   "dxuser",                      limit: 255
    t.string   "private_files_project",       limit: 255
    t.string   "public_files_project",        limit: 255
    t.string   "private_comparisons_project", limit: 255
    t.string   "public_comparisons_project",  limit: 255
    t.integer  "schema_version",              limit: 4
    t.datetime "created_at",                                null: false
    t.datetime "updated_at",                                null: false
    t.integer  "org_id",                      limit: 4
    t.string   "first_name",                  limit: 255
    t.string   "last_name",                   limit: 255
    t.string   "email",                       limit: 255
    t.string   "normalized_email",            limit: 255
    t.datetime "last_login"
    t.text     "extras",                      limit: 65535
    t.string   "time_zone",                   limit: 255
  end

  add_index "users", ["dxuser"], name: "index_users_on_dxuser", unique: true, using: :btree
  add_index "users", ["normalized_email"], name: "index_users_on_normalized_email", using: :btree
  add_index "users", ["org_id"], name: "index_users_on_org_id", using: :btree

  create_table "votes", force: :cascade do |t|
    t.integer  "votable_id",   limit: 4
    t.string   "votable_type", limit: 255
    t.integer  "voter_id",     limit: 4
    t.string   "voter_type",   limit: 255
    t.boolean  "vote_flag"
    t.string   "vote_scope",   limit: 255
    t.integer  "vote_weight",  limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "votes", ["votable_id", "votable_type", "vote_scope"], name: "index_votes_on_votable_id_and_votable_type_and_vote_scope", using: :btree
  add_index "votes", ["voter_id", "voter_type", "vote_scope"], name: "index_votes_on_voter_id_and_voter_type_and_vote_scope", using: :btree

  create_table "workflow_series", force: :cascade do |t|
    t.string   "dxid",                        limit: 255
    t.string   "name",                        limit: 255
    t.integer  "latest_revision_workflow_id", limit: 4
    t.integer  "user_id",                     limit: 4
    t.string   "scope",                       limit: 255
    t.datetime "created_at",                              null: false
    t.datetime "updated_at",                              null: false
  end

  add_index "workflow_series", ["latest_revision_workflow_id"], name: "index_workflow_series_on_latest_revision_workflow_id", using: :btree
  add_index "workflow_series", ["user_id"], name: "index_workflow_series_on_user_id", using: :btree

  create_table "workflows", force: :cascade do |t|
    t.string   "title",              limit: 255
    t.string   "name",               limit: 255
    t.string   "dxid",               limit: 255
    t.integer  "user_id",            limit: 4
    t.text     "readme",             limit: 65535
    t.string   "edit_version",       limit: 255
    t.text     "spec",               limit: 65535
    t.string   "default_instance",   limit: 255
    t.string   "scope",              limit: 255
    t.integer  "revision",           limit: 4
    t.integer  "workflow_series_id", limit: 4
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
  end

  add_index "workflows", ["user_id"], name: "index_workflows_on_user_id", using: :btree
  add_index "workflows", ["workflow_series_id"], name: "index_workflows_on_workflow_series_id", using: :btree

  add_foreign_key "accepted_licenses", "licenses"
  add_foreign_key "accepted_licenses", "users"
  add_foreign_key "analyses", "workflows"
  add_foreign_key "answers", "discussions"
  add_foreign_key "answers", "notes"
  add_foreign_key "answers", "users"
  add_foreign_key "app_series", "apps", column: "latest_revision_app_id"
  add_foreign_key "app_series", "apps", column: "latest_version_app_id"
  add_foreign_key "app_series", "users"
  add_foreign_key "appathons", "meta_appathons"
  add_foreign_key "appathons", "users", column: "admin_id"
  add_foreign_key "apps", "app_series"
  add_foreign_key "apps", "users"
  add_foreign_key "apps_assets", "apps"
  add_foreign_key "apps_assets", "nodes", column: "asset_id"
  add_foreign_key "archive_entries", "nodes", column: "asset_id"
  add_foreign_key "challenge_resources", "challenges"
  add_foreign_key "challenges", "apps"
  add_foreign_key "challenges", "users", column: "admin_id"
  add_foreign_key "challenges", "users", column: "app_owner_id"
  add_foreign_key "comparisons", "users"
  add_foreign_key "discussions", "notes"
  add_foreign_key "discussions", "users"
  add_foreign_key "expert_answers", "expert_questions"
  add_foreign_key "expert_answers", "experts"
  add_foreign_key "expert_questions", "experts"
  add_foreign_key "expert_questions", "users"
  add_foreign_key "experts", "users"
  add_foreign_key "invitations", "users"
  add_foreign_key "jobs", "analyses"
  add_foreign_key "jobs", "app_series"
  add_foreign_key "jobs", "apps"
  add_foreign_key "jobs", "users"
  add_foreign_key "licensed_items", "licenses"
  add_foreign_key "licenses", "users"
  add_foreign_key "nodes", "users"
  add_foreign_key "notes", "users"
  add_foreign_key "orgs", "users", column: "admin_id"
  add_foreign_key "saved_queries", "users"
  add_foreign_key "space_memberships", "spaces"
  add_foreign_key "space_memberships", "users"
  add_foreign_key "submissions", "challenges"
  add_foreign_key "submissions", "jobs"
  add_foreign_key "submissions", "users"
  add_foreign_key "users", "orgs"
end
