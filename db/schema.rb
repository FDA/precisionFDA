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

ActiveRecord::Schema.define(version: 20170620221240) do

  create_table "accepted_licenses", force: :cascade do |t|
    t.integer  "license_id"
    t.integer  "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string   "state"
    t.text     "message"
  end

  add_index "accepted_licenses", ["license_id"], name: "index_accepted_licenses_on_license_id"
  add_index "accepted_licenses", ["user_id"], name: "index_accepted_licenses_on_user_id"

  create_table "answers", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "discussion_id"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.integer  "note_id"
  end

  add_index "answers", ["discussion_id"], name: "index_answers_on_discussion_id"
  add_index "answers", ["note_id"], name: "index_answers_on_note_id"
  add_index "answers", ["user_id"], name: "index_answers_on_user_id"

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

  create_table "appathons", force: :cascade do |t|
    t.string   "name"
    t.integer  "admin_id"
    t.integer  "meta_appathon_id"
    t.text     "description"
    t.string   "flag"
    t.string   "location"
    t.datetime "start_at"
    t.datetime "end_at"
    t.text     "meta"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
  end

  add_index "appathons", ["admin_id"], name: "index_appathons_on_admin_id"
  add_index "appathons", ["meta_appathon_id"], name: "index_appathons_on_meta_appathon_id"

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

  create_table "challenges", force: :cascade do |t|
    t.string   "name"
    t.integer  "admin_id"
    t.integer  "app_owner_id"
    t.integer  "app_id"
    t.text     "description"
    t.text     "meta"
    t.datetime "start_at"
    t.datetime "end_at"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
  end

  add_index "challenges", ["admin_id"], name: "index_challenges_on_admin_id"
  add_index "challenges", ["app_id"], name: "index_challenges_on_app_id"
  add_index "challenges", ["app_owner_id"], name: "index_challenges_on_app_owner_id"

  create_table "comments", force: :cascade do |t|
    t.integer  "commentable_id"
    t.string   "commentable_type"
    t.string   "title"
    t.text     "body"
    t.string   "subject"
    t.integer  "user_id",          null: false
    t.integer  "parent_id"
    t.integer  "lft"
    t.integer  "rgt"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "comments", ["commentable_id", "commentable_type"], name: "index_comments_on_commentable_id_and_commentable_type"
  add_index "comments", ["user_id"], name: "index_comments_on_user_id"

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

  create_table "discussions", force: :cascade do |t|
    t.integer  "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "note_id"
  end

  add_index "discussions", ["note_id"], name: "index_discussions_on_note_id"
  add_index "discussions", ["user_id"], name: "index_discussions_on_user_id"

  create_table "expert_answers", force: :cascade do |t|
    t.integer  "expert_id"
    t.integer  "expert_question_id"
    t.text     "body"
    t.string   "state"
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
  end

  add_index "expert_answers", ["expert_id"], name: "index_expert_answers_on_expert_id"
  add_index "expert_answers", ["expert_question_id"], name: "index_expert_answers_on_expert_question_id"
  add_index "expert_answers", ["state"], name: "index_expert_answers_on_state"

  create_table "expert_questions", force: :cascade do |t|
    t.integer  "expert_id"
    t.integer  "user_id"
    t.text     "body"
    t.text     "meta"
    t.string   "state"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "expert_questions", ["expert_id"], name: "index_expert_questions_on_expert_id"
  add_index "expert_questions", ["state"], name: "index_expert_questions_on_state"
  add_index "expert_questions", ["user_id"], name: "index_expert_questions_on_user_id"

  create_table "experts", force: :cascade do |t|
    t.integer  "user_id"
    t.string   "image"
    t.string   "state"
    t.string   "scope"
    t.text     "meta"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "experts", ["image"], name: "index_experts_on_image"
  add_index "experts", ["scope"], name: "index_experts_on_scope"
  add_index "experts", ["state"], name: "index_experts_on_state"
  add_index "experts", ["user_id"], name: "index_experts_on_user_id"

  create_table "follows", force: :cascade do |t|
    t.integer  "followable_id",                   null: false
    t.string   "followable_type",                 null: false
    t.integer  "follower_id",                     null: false
    t.string   "follower_type",                   null: false
    t.boolean  "blocked",         default: false, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "follows", ["followable_id", "followable_type"], name: "fk_followables"
  add_index "follows", ["follower_id", "follower_type"], name: "fk_follows"

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

  create_table "licensed_items", force: :cascade do |t|
    t.integer  "license_id"
    t.integer  "licenseable_id"
    t.string   "licenseable_type"
    t.datetime "created_at",       null: false
    t.datetime "updated_at",       null: false
  end

  add_index "licensed_items", ["license_id"], name: "index_licensed_items_on_license_id"
  add_index "licensed_items", ["licenseable_type", "licenseable_id"], name: "index_licensed_items_on_licenseable_type_and_licenseable_id"

  create_table "licenses", force: :cascade do |t|
    t.text     "content"
    t.integer  "user_id"
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.string   "title"
    t.string   "scope"
    t.boolean  "approval_required", default: false, null: false
  end

  add_index "licenses", ["scope"], name: "index_licenses_on_scope"
  add_index "licenses", ["user_id"], name: "index_licenses_on_user_id"

  create_table "meta_appathons", force: :cascade do |t|
    t.string   "name"
    t.string   "handle"
    t.string   "template"
    t.text     "description"
    t.text     "meta"
    t.datetime "start_at"
    t.datetime "end_at"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "meta_appathons", ["handle"], name: "index_meta_appathons_on_handle", unique: true

  create_table "notes", force: :cascade do |t|
    t.string   "title"
    t.text     "content"
    t.integer  "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string   "scope"
    t.string   "note_type"
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

  create_table "saved_queries", force: :cascade do |t|
    t.string   "name"
    t.string   "grid_name"
    t.text     "query"
    t.text     "description"
    t.integer  "user_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
  end

  add_index "saved_queries", ["grid_name", "id"], name: "index_saved_queries_on_grid_name_and_id"
  add_index "saved_queries", ["grid_name"], name: "index_saved_queries_on_grid_name"
  add_index "saved_queries", ["user_id"], name: "index_saved_queries_on_user_id"

  create_table "space_memberships", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "space_id"
    t.string   "role"
    t.string   "side"
    t.text     "meta"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "space_memberships", ["space_id"], name: "index_space_memberships_on_space_id"
  add_index "space_memberships", ["user_id"], name: "index_space_memberships_on_user_id"

  create_table "spaces", force: :cascade do |t|
    t.string   "name"
    t.text     "description"
    t.string   "host_project"
    t.string   "guest_project"
    t.string   "host_dxorg"
    t.string   "guest_dxorg"
    t.string   "space_type"
    t.string   "state"
    t.text     "meta"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
  end

  add_index "spaces", ["space_type"], name: "index_spaces_on_space_type"
  add_index "spaces", ["state"], name: "index_spaces_on_state"

  create_table "submissions", force: :cascade do |t|
    t.integer  "challenge_id"
    t.integer  "user_id"
    t.integer  "job_id"
    t.text     "desc"
    t.text     "meta"
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
  end

  add_index "submissions", ["challenge_id"], name: "index_submissions_on_challenge_id"
  add_index "submissions", ["job_id"], name: "index_submissions_on_job_id"
  add_index "submissions", ["user_id"], name: "index_submissions_on_user_id"

  create_table "taggings", force: :cascade do |t|
    t.integer  "tag_id"
    t.integer  "taggable_id"
    t.string   "taggable_type"
    t.integer  "tagger_id"
    t.string   "tagger_type"
    t.string   "context",       limit: 128
    t.datetime "created_at"
  end

  add_index "taggings", ["context"], name: "index_taggings_on_context"
  add_index "taggings", ["tag_id", "taggable_id", "taggable_type", "context", "tagger_id", "tagger_type"], name: "taggings_idx", unique: true
  add_index "taggings", ["tag_id"], name: "index_taggings_on_tag_id"
  add_index "taggings", ["taggable_id", "taggable_type", "context"], name: "index_taggings_on_taggable_id_and_taggable_type_and_context"
  add_index "taggings", ["taggable_id", "taggable_type", "tagger_id", "context"], name: "taggings_idy"
  add_index "taggings", ["taggable_id"], name: "index_taggings_on_taggable_id"
  add_index "taggings", ["taggable_type"], name: "index_taggings_on_taggable_type"
  add_index "taggings", ["tagger_id", "tagger_type"], name: "index_taggings_on_tagger_id_and_tagger_type"
  add_index "taggings", ["tagger_id"], name: "index_taggings_on_tagger_id"

  create_table "tags", force: :cascade do |t|
    t.string  "name"
    t.integer "taggings_count", default: 0
  end

  add_index "tags", ["name"], name: "index_tags_on_name", unique: true

  create_table "truth_challenge_results", force: :cascade do |t|
    t.integer "answer_id"
    t.string  "entry"
    t.string  "type"
    t.string  "subtype"
    t.string  "subset"
    t.string  "filter"
    t.string  "genotype"
    t.string  "qq_field"
    t.string  "qq"
    t.decimal "metric_recall",             precision: 7,  scale: 6
    t.decimal "metric_precision",          precision: 7,  scale: 6
    t.decimal "metric_frac_na",            precision: 7,  scale: 6
    t.decimal "metric_f1_score",           precision: 7,  scale: 6
    t.integer "truth_total"
    t.integer "truth_tp"
    t.integer "truth_fn"
    t.integer "query_total"
    t.integer "query_tp"
    t.integer "query_fp"
    t.integer "query_unk"
    t.integer "fp_gt"
    t.integer "fp_al"
    t.decimal "pct_fp_ma",                 precision: 10, scale: 6
    t.decimal "truth_total_titv_ratio",    precision: 10, scale: 6
    t.decimal "truth_total_het_hom_ratio", precision: 10, scale: 6
    t.decimal "truth_fn_titv_ratio",       precision: 10, scale: 6
    t.decimal "truth_fn_het_hom_ratio",    precision: 10, scale: 6
    t.decimal "truth_tp_titv_ratio",       precision: 10, scale: 6
    t.decimal "truth_tp_het_hom_ratio",    precision: 10, scale: 6
    t.decimal "query_fp_titv_ratio",       precision: 10, scale: 6
    t.decimal "query_fp_het_hom_ratio",    precision: 10, scale: 6
    t.decimal "query_tp_titv_ratio",       precision: 10, scale: 6
    t.decimal "query_total_titv_ratio",    precision: 10, scale: 6
    t.decimal "query_total_het_hom_ratio", precision: 10, scale: 6
    t.decimal "query_tp_het_hom_ratio",    precision: 10, scale: 6
    t.decimal "query_unk_titv_ratio",      precision: 10, scale: 6
    t.decimal "query_unk_het_hom_ratio",   precision: 10, scale: 6
    t.text    "meta"
  end

  add_index "truth_challenge_results", ["answer_id"], name: "index_truth_challenge_results_on_answer_id"
  add_index "truth_challenge_results", ["entry"], name: "index_truth_challenge_results_on_entry"
  add_index "truth_challenge_results", ["fp_al"], name: "index_truth_challenge_results_on_fp_al"
  add_index "truth_challenge_results", ["fp_gt"], name: "index_truth_challenge_results_on_fp_gt"
  add_index "truth_challenge_results", ["genotype"], name: "index_truth_challenge_results_on_genotype"
  add_index "truth_challenge_results", ["metric_f1_score"], name: "index_truth_challenge_results_on_metric_f1_score"
  add_index "truth_challenge_results", ["metric_frac_na"], name: "index_truth_challenge_results_on_metric_frac_na"
  add_index "truth_challenge_results", ["metric_precision"], name: "index_truth_challenge_results_on_metric_precision"
  add_index "truth_challenge_results", ["metric_recall"], name: "index_truth_challenge_results_on_metric_recall"
  add_index "truth_challenge_results", ["query_fp"], name: "index_truth_challenge_results_on_query_fp"
  add_index "truth_challenge_results", ["query_fp_het_hom_ratio"], name: "index_truth_challenge_results_on_query_fp_het_hom_ratio"
  add_index "truth_challenge_results", ["query_fp_titv_ratio"], name: "index_truth_challenge_results_on_query_fp_titv_ratio"
  add_index "truth_challenge_results", ["query_total"], name: "index_truth_challenge_results_on_query_total"
  add_index "truth_challenge_results", ["query_total_het_hom_ratio"], name: "index_truth_challenge_results_on_query_total_het_hom_ratio"
  add_index "truth_challenge_results", ["query_total_titv_ratio"], name: "index_truth_challenge_results_on_query_total_titv_ratio"
  add_index "truth_challenge_results", ["query_tp"], name: "index_truth_challenge_results_on_query_tp"
  add_index "truth_challenge_results", ["query_tp_het_hom_ratio"], name: "index_truth_challenge_results_on_query_tp_het_hom_ratio"
  add_index "truth_challenge_results", ["query_tp_titv_ratio"], name: "index_truth_challenge_results_on_query_tp_titv_ratio"
  add_index "truth_challenge_results", ["query_unk"], name: "index_truth_challenge_results_on_query_unk"
  add_index "truth_challenge_results", ["query_unk_het_hom_ratio"], name: "index_truth_challenge_results_on_query_unk_het_hom_ratio"
  add_index "truth_challenge_results", ["query_unk_titv_ratio"], name: "index_truth_challenge_results_on_query_unk_titv_ratio"
  add_index "truth_challenge_results", ["subset"], name: "index_truth_challenge_results_on_subset"
  add_index "truth_challenge_results", ["subtype"], name: "index_truth_challenge_results_on_subtype"
  add_index "truth_challenge_results", ["truth_fn"], name: "index_truth_challenge_results_on_truth_fn"
  add_index "truth_challenge_results", ["truth_fn_het_hom_ratio"], name: "index_truth_challenge_results_on_truth_fn_het_hom_ratio"
  add_index "truth_challenge_results", ["truth_fn_titv_ratio"], name: "index_truth_challenge_results_on_truth_fn_titv_ratio"
  add_index "truth_challenge_results", ["truth_total"], name: "index_truth_challenge_results_on_truth_total"
  add_index "truth_challenge_results", ["truth_total_het_hom_ratio"], name: "index_truth_challenge_results_on_truth_total_het_hom_ratio"
  add_index "truth_challenge_results", ["truth_total_titv_ratio"], name: "index_truth_challenge_results_on_truth_total_titv_ratio"
  add_index "truth_challenge_results", ["truth_tp"], name: "index_truth_challenge_results_on_truth_tp"
  add_index "truth_challenge_results", ["truth_tp_het_hom_ratio"], name: "index_truth_challenge_results_on_truth_tp_het_hom_ratio"
  add_index "truth_challenge_results", ["truth_tp_titv_ratio"], name: "index_truth_challenge_results_on_truth_tp_titv_ratio"
  add_index "truth_challenge_results", ["type"], name: "index_truth_challenge_results_on_type"

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
    t.integer  "schema_version"
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.integer  "org_id"
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

  create_table "votes", force: :cascade do |t|
    t.integer  "votable_id"
    t.string   "votable_type"
    t.integer  "voter_id"
    t.string   "voter_type"
    t.boolean  "vote_flag"
    t.string   "vote_scope"
    t.integer  "vote_weight"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "votes", ["votable_id", "votable_type", "vote_scope"], name: "index_votes_on_votable_id_and_votable_type_and_vote_scope"
  add_index "votes", ["voter_id", "voter_type", "vote_scope"], name: "index_votes_on_voter_id_and_voter_type_and_vote_scope"

end
