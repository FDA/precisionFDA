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

ActiveRecord::Schema.define(version: 20151213040641) do

  create_table "app_series", force: :cascade do |t|
    t.string   "dxid"
    t.string   "name"
    t.integer  "latest_revision_app_id"
    t.integer  "latest_version_app_id"
    t.integer  "user_id"
    t.string   "scope"
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  add_index "app_series", ["dxid"], name: "index_app_series_on_dxid"
  add_index "app_series", ["latest_revision_app_id"], name: "index_app_series_on_latest_revision_app_id"
  add_index "app_series", ["latest_version_app_id"], name: "index_app_series_on_latest_version_app_id"
  add_index "app_series", ["scope"], name: "index_app_series_on_scope"
  add_index "app_series", ["user_id"], name: "index_app_series_on_user_id"

  create_table "apps", force: :cascade do |t|
    t.string   "dxid"
    t.string   "version"
    t.integer  "revision"
    t.string   "title"
    t.text     "readme"
    t.integer  "user_id"
    t.string   "scope"
    t.text     "spec"
    t.text     "internal"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.integer  "app_series_id"
  end

  add_index "apps", ["app_series_id"], name: "index_apps_on_app_series_id"
  add_index "apps", ["dxid"], name: "index_apps_on_dxid"
  add_index "apps", ["scope"], name: "index_apps_on_scope"
  add_index "apps", ["user_id"], name: "index_apps_on_user_id"
  add_index "apps", ["version"], name: "index_apps_on_version"

  create_table "apps_assets", force: :cascade do |t|
    t.integer "app_id"
    t.integer "asset_id"
  end

  add_index "apps_assets", ["app_id"], name: "index_apps_assets_on_app_id"
  add_index "apps_assets", ["asset_id"], name: "index_apps_assets_on_asset_id"

  create_table "archive_entries", force: :cascade do |t|
    t.text    "path"
    t.string  "name"
    t.integer "asset_id"
  end

  add_index "archive_entries", ["asset_id"], name: "index_archive_entries_on_asset_id"
  add_index "archive_entries", ["name"], name: "index_archive_entries_on_name"

  create_table "attachments", force: :cascade do |t|
    t.integer "note_id"
    t.integer "item_id"
    t.string  "item_type"
  end

  add_index "attachments", ["item_type", "item_id"], name: "index_attachments_on_item_type_and_item_id"
  add_index "attachments", ["note_id"], name: "index_attachments_on_note_id"

  create_table "comparison_inputs", force: :cascade do |t|
    t.integer "comparison_id"
    t.integer "user_file_id"
    t.string  "role"
  end

  add_index "comparison_inputs", ["comparison_id"], name: "index_comparison_inputs_on_comparison_id"
  add_index "comparison_inputs", ["user_file_id"], name: "index_comparison_inputs_on_user_file_id"

  create_table "comparisons", force: :cascade do |t|
    t.string   "name"
    t.text     "description"
    t.integer  "user_id"
    t.string   "state"
    t.string   "dxjobid"
    t.string   "project"
    t.text     "meta"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.string   "scope"
  end

  add_index "comparisons", ["scope"], name: "index_comparisons_on_scope"
  add_index "comparisons", ["state"], name: "index_comparisons_on_state"
  add_index "comparisons", ["user_id"], name: "index_comparisons_on_user_id"

  create_table "invitations", force: :cascade do |t|
    t.string   "first_name"
    t.string   "last_name"
    t.string   "email"
    t.string   "org"
    t.boolean  "singular"
    t.string   "address"
    t.string   "phone"
    t.string   "duns"
    t.string   "ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text     "extras"
    t.integer  "user_id"
    t.string   "state"
    t.string   "code"
  end

  add_index "invitations", ["code"], name: "index_invitations_on_code", unique: true
  add_index "invitations", ["email"], name: "index_invitations_on_email"
  add_index "invitations", ["state"], name: "index_invitations_on_state"
  add_index "invitations", ["user_id"], name: "index_invitations_on_user_id"

  create_table "job_inputs", force: :cascade do |t|
    t.integer "job_id"
    t.integer "user_file_id"
  end

  add_index "job_inputs", ["job_id"], name: "index_job_inputs_on_job_id"
  add_index "job_inputs", ["user_file_id"], name: "index_job_inputs_on_user_file_id"

  create_table "jobs", force: :cascade do |t|
    t.string   "dxid"
    t.integer  "app_id"
    t.string   "project"
    t.text     "run_data"
    t.text     "describe"
    t.text     "provenance"
    t.string   "state"
    t.string   "name"
    t.integer  "user_id"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.integer  "app_series_id"
    t.string   "scope"
  end

  add_index "jobs", ["app_id"], name: "index_jobs_on_app_id"
  add_index "jobs", ["app_series_id"], name: "index_jobs_on_app_series_id"
  add_index "jobs", ["dxid"], name: "index_jobs_on_dxid"
  add_index "jobs", ["scope"], name: "index_jobs_on_scope"
  add_index "jobs", ["state"], name: "index_jobs_on_state"
  add_index "jobs", ["user_id"], name: "index_jobs_on_user_id"

  create_table "notes", force: :cascade do |t|
    t.string   "title"
    t.text     "content"
    t.integer  "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string   "scope"
  end

  add_index "notes", ["scope"], name: "index_notes_on_scope"
  add_index "notes", ["user_id"], name: "index_notes_on_user_id"

  create_table "orgs", force: :cascade do |t|
    t.string   "handle"
    t.string   "name"
    t.integer  "admin_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text     "address"
    t.string   "duns"
    t.string   "phone"
    t.string   "state"
    t.boolean  "singular"
  end

  add_index "orgs", ["admin_id"], name: "index_orgs_on_admin_id"
  add_index "orgs", ["handle"], name: "index_orgs_on_handle", unique: true

  create_table "user_files", force: :cascade do |t|
    t.string   "dxid"
    t.string   "project"
    t.string   "name"
    t.string   "state"
    t.text     "description"
    t.integer  "user_id"
    t.integer  "file_size",   limit: 8
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
    t.integer  "parent_id"
    t.string   "parent_type"
    t.string   "scope"
  end

  add_index "user_files", ["parent_type", "parent_id"], name: "index_user_files_on_parent_type_and_parent_id"
  add_index "user_files", ["scope"], name: "index_user_files_on_scope"
  add_index "user_files", ["state"], name: "index_user_files_on_state"
  add_index "user_files", ["user_id"], name: "index_user_files_on_user_id"

  create_table "users", force: :cascade do |t|
    t.string   "dxuser"
    t.string   "private_files_project"
    t.string   "public_files_project"
    t.string   "private_comparisons_project"
    t.string   "public_comparisons_project"
    t.integer  "open_files_count",            default: 0
    t.integer  "closing_files_count",         default: 0
    t.integer  "pending_comparisons_count",   default: 0
    t.integer  "schema_version"
    t.datetime "created_at",                              null: false
    t.datetime "updated_at",                              null: false
    t.integer  "org_id"
    t.integer  "pending_jobs_count"
    t.integer  "open_assets_count"
    t.integer  "closing_assets_count"
    t.string   "first_name"
    t.string   "last_name"
    t.string   "email"
    t.string   "normalized_email"
    t.datetime "last_login"
    t.text     "extras"
  end

  add_index "users", ["dxuser"], name: "index_users_on_dxuser", unique: true
  add_index "users", ["normalized_email"], name: "index_users_on_normalized_email"
  add_index "users", ["org_id"], name: "index_users_on_org_id"

end
