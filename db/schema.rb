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

ActiveRecord::Schema.define(version: 20150907232719) do

  create_table "biospecimen", force: :cascade do |t|
    t.string   "name"
    t.text     "description"
    t.integer  "user_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "biospecimen", ["user_id"], name: "index_biospecimen_on_user_id"

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
  end

  add_index "users", ["dxuser"], name: "index_users_on_dxuser", unique: true

end
