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

ActiveRecord::Schema.define(version: 20150923230348) do

  create_table "biospecimen", force: :cascade do |t|
    t.string   "name"
    t.text     "description"
    t.integer  "user_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "biospecimen", ["user_id"], name: "index_biospecimen_on_user_id"

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
    t.boolean  "public"
    t.string   "state"
    t.string   "dxjobid"
    t.string   "project"
    t.text     "meta"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "comparisons", ["public"], name: "index_comparisons_on_public"
  add_index "comparisons", ["state"], name: "index_comparisons_on_state"
  add_index "comparisons", ["user_id"], name: "index_comparisons_on_user_id"

  create_table "orgs", force: :cascade do |t|
    t.string   "handle"
    t.string   "name"
    t.integer  "admin_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
    t.integer  "biospecimen_id"
    t.boolean  "public"
    t.integer  "file_size",      limit: 8
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  add_index "user_files", ["biospecimen_id"], name: "index_user_files_on_biospecimen_id"
  add_index "user_files", ["state"], name: "index_user_files_on_state"
  add_index "user_files", ["user_id"], name: "index_user_files_on_user_id"

  create_table "users", force: :cascade do |t|
    t.string   "dxuser"
    t.string   "private_files_project"
    t.string   "public_files_project"
    t.string   "private_comparisons_project"
    t.string   "public_comparisons_project"
    t.integer  "open_files_count"
    t.integer  "closing_files_count"
    t.integer  "pending_comparisons_count"
    t.integer  "schema_version"
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.integer  "org_id"
  end

  add_index "users", ["dxuser"], name: "index_users_on_dxuser", unique: true
  add_index "users", ["org_id"], name: "index_users_on_org_id"

end
