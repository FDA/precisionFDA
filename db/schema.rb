# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_12_16_201523) do

  create_table "accepted_licenses", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "license_id"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "state"
    t.text "message"
    t.index ["license_id"], name: "index_accepted_licenses_on_license_id"
    t.index ["user_id"], name: "index_accepted_licenses_on_user_id"
  end

  create_table "admin_groups", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "role", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["role"], name: "index_admin_groups_on_role", unique: true
  end

  create_table "admin_memberships", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "user_id", null: false
    t.bigint "admin_group_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["admin_group_id"], name: "index_admin_memberships_on_admin_group_id"
    t.index ["user_id", "admin_group_id"], name: "index_admin_memberships_on_user_id_and_admin_group_id", unique: true
    t.index ["user_id"], name: "index_admin_memberships_on_user_id"
  end

  create_table "analyses", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "name"
    t.string "dxid"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "workflow_id"
    t.string "batch_id"
    t.index ["user_id"], name: "index_analyses_on_user_id"
    t.index ["workflow_id"], name: "fk_rails_ea76af2894"
  end

  create_table "answers", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "user_id"
    t.integer "discussion_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "note_id"
    t.index ["discussion_id"], name: "index_answers_on_discussion_id"
    t.index ["note_id"], name: "index_answers_on_note_id"
    t.index ["user_id"], name: "index_answers_on_user_id"
  end

  create_table "app_series", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "dxid"
    t.string "name"
    t.integer "latest_revision_app_id"
    t.integer "latest_version_app_id"
    t.integer "user_id"
    t.string "scope"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "verified", default: false, null: false
    t.boolean "featured", default: false
    t.boolean "deleted", default: false, null: false
    t.index ["deleted"], name: "index_app_series_on_deleted"
    t.index ["dxid"], name: "index_app_series_on_dxid"
    t.index ["latest_revision_app_id"], name: "index_app_series_on_latest_revision_app_id"
    t.index ["latest_version_app_id"], name: "index_app_series_on_latest_version_app_id"
    t.index ["scope"], name: "index_app_series_on_scope"
    t.index ["user_id"], name: "index_app_series_on_user_id"
  end

  create_table "appathons", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "name"
    t.integer "admin_id"
    t.integer "meta_appathon_id"
    t.text "description"
    t.string "flag"
    t.string "location"
    t.datetime "start_at"
    t.datetime "end_at"
    t.text "meta"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["admin_id"], name: "index_appathons_on_admin_id"
    t.index ["meta_appathon_id"], name: "index_appathons_on_meta_appathon_id"
  end

  create_table "apps", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "dxid"
    t.string "version"
    t.integer "revision"
    t.string "title"
    t.text "readme"
    t.integer "user_id"
    t.string "scope"
    t.text "spec"
    t.text "internal"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "app_series_id"
    t.boolean "verified", default: false, null: false
    t.string "uid"
    t.string "dev_group"
    t.string "release", null: false
    t.boolean "featured", default: false
    t.boolean "deleted", default: false, null: false
    t.index ["app_series_id"], name: "index_apps_on_app_series_id"
    t.index ["deleted"], name: "index_apps_on_deleted"
    t.index ["dxid"], name: "index_apps_on_dxid"
    t.index ["scope"], name: "index_apps_on_scope"
    t.index ["uid"], name: "index_apps_on_uid", unique: true
    t.index ["user_id"], name: "index_apps_on_user_id"
    t.index ["version"], name: "index_apps_on_version"
  end

  create_table "apps_assets", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "app_id"
    t.integer "asset_id"
    t.index ["app_id"], name: "index_apps_assets_on_app_id"
    t.index ["asset_id"], name: "index_apps_assets_on_asset_id"
  end

  create_table "archive_entries", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.text "path"
    t.string "name"
    t.integer "asset_id"
    t.index ["asset_id"], name: "index_archive_entries_on_asset_id"
    t.index ["name"], name: "index_archive_entries_on_name"
  end

  create_table "attachments", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "note_id"
    t.integer "item_id"
    t.string "item_type"
    t.index ["item_type", "item_id"], name: "index_attachments_on_item_type_and_item_id"
    t.index ["note_id"], name: "index_attachments_on_note_id"
  end

  create_table "challenge_resources", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "challenge_id"
    t.integer "user_file_id"
    t.integer "user_id"
    t.text "url"
    t.text "meta"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["challenge_id"], name: "index_challenge_resources_on_challenge_id"
    t.index ["user_file_id"], name: "index_challenge_resources_on_user_file_id"
    t.index ["user_id"], name: "index_challenge_resources_on_user_id"
  end

  create_table "challenges", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "name"
    t.integer "admin_id"
    t.integer "app_owner_id"
    t.integer "app_id"
    t.text "description"
    t.text "meta", size: :medium
    t.datetime "start_at"
    t.datetime "end_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "status"
    t.boolean "automated", default: true
    t.string "card_image_url"
    t.string "card_image_id"
    t.integer "space_id"
    t.integer "specified_order"
    t.string "scope", default: "public", null: false
    t.index ["admin_id"], name: "index_challenges_on_admin_id"
    t.index ["app_id"], name: "index_challenges_on_app_id"
    t.index ["app_owner_id"], name: "index_challenges_on_app_owner_id"
    t.index ["space_id"], name: "index_challenges_on_space_id"
    t.index ["status"], name: "index_challenges_on_status"
  end

  create_table "comments", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "commentable_id"
    t.string "commentable_type"
    t.string "title"
    t.text "body"
    t.string "subject"
    t.integer "user_id", null: false
    t.integer "parent_id"
    t.integer "lft"
    t.integer "rgt"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer "content_object_id"
    t.string "content_object_type"
    t.integer "state", default: 0
    t.index ["commentable_id", "commentable_type"], name: "index_comments_on_commentable_id_and_commentable_type"
    t.index ["content_object_type", "content_object_id"], name: "index_comments_on_content_object_type_and_content_object_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "comparison_inputs", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "comparison_id"
    t.integer "user_file_id"
    t.string "role"
    t.index ["comparison_id"], name: "index_comparison_inputs_on_comparison_id"
    t.index ["user_file_id"], name: "index_comparison_inputs_on_user_file_id"
  end

  create_table "comparisons", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.integer "user_id"
    t.string "state"
    t.string "dxjobid"
    t.string "project"
    t.text "meta"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "scope"
    t.string "app_dxid", null: false
    t.text "run_input"
    t.index ["scope"], name: "index_comparisons_on_scope"
    t.index ["state"], name: "index_comparisons_on_state"
    t.index ["user_id"], name: "index_comparisons_on_user_id"
  end

  create_table "countries", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "name"
    t.string "dial_code"
    t.index ["name"], name: "index_countries_on_name", unique: true
  end

  create_table "discussions", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "note_id"
    t.index ["note_id"], name: "index_discussions_on_note_id"
    t.index ["user_id"], name: "index_discussions_on_user_id"
  end

  create_table "events", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "type"
    t.string "org_handle"
    t.string "dxuser"
    t.string "param1"
    t.string "param2"
    t.string "param3"
    t.datetime "created_at", null: false
    t.string "param4"
    t.index ["type", "created_at"], name: "index_events_on_type_and_created_at"
  end

  create_table "expert_answers", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "expert_id"
    t.integer "expert_question_id"
    t.text "body"
    t.string "state"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expert_id"], name: "index_expert_answers_on_expert_id"
    t.index ["expert_question_id"], name: "index_expert_answers_on_expert_question_id"
    t.index ["state"], name: "index_expert_answers_on_state"
  end

  create_table "expert_questions", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "expert_id"
    t.integer "user_id"
    t.text "body"
    t.text "meta"
    t.string "state"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expert_id"], name: "index_expert_questions_on_expert_id"
    t.index ["state"], name: "index_expert_questions_on_state"
    t.index ["user_id"], name: "index_expert_questions_on_user_id"
  end

  create_table "experts", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "user_id"
    t.string "image"
    t.string "state"
    t.string "scope"
    t.text "meta"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["image"], name: "index_experts_on_image"
    t.index ["scope"], name: "index_experts_on_scope"
    t.index ["state"], name: "index_experts_on_state"
    t.index ["user_id"], name: "index_experts_on_user_id"
  end

  create_table "follows", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "followable_id", null: false
    t.string "followable_type", null: false
    t.integer "follower_id", null: false
    t.string "follower_type", null: false
    t.boolean "blocked", default: false, null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["followable_id", "followable_type"], name: "fk_followables"
    t.index ["follower_id", "follower_type"], name: "fk_follows"
  end

  create_table "get_started_boxes", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "title"
    t.string "feature_url"
    t.string "documentation_url"
    t.text "description"
    t.boolean "public"
    t.integer "kind", default: 0
    t.integer "position", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "invitations", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.string "org"
    t.boolean "singular"
    t.string "phone"
    t.string "duns"
    t.string "ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "extras"
    t.integer "user_id"
    t.string "state"
    t.string "code"
    t.string "city"
    t.string "us_state"
    t.string "postal_code"
    t.string "address1"
    t.string "address2"
    t.boolean "organization_admin", default: false, null: false
    t.integer "country_id"
    t.integer "phone_country_id"
    t.index ["code"], name: "index_invitations_on_code", unique: true
    t.index ["country_id"], name: "index_invitations_on_country_id"
    t.index ["email"], name: "index_invitations_on_email"
    t.index ["phone_country_id"], name: "fk_rails_ddca68253c"
    t.index ["state"], name: "index_invitations_on_state"
    t.index ["user_id"], name: "index_invitations_on_user_id"
  end

  create_table "job_inputs", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "job_id"
    t.integer "user_file_id"
    t.index ["job_id"], name: "index_job_inputs_on_job_id"
    t.index ["user_file_id"], name: "index_job_inputs_on_user_file_id"
  end

  create_table "jobs", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "dxid"
    t.integer "app_id"
    t.string "project"
    t.text "run_data"
    t.text "describe"
    t.text "provenance"
    t.string "state"
    t.string "name"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "app_series_id"
    t.string "scope"
    t.integer "analysis_id"
    t.string "uid"
    t.integer "local_folder_id"
    t.boolean "featured", default: false
    t.index ["analysis_id"], name: "fk_rails_0a95efec7a"
    t.index ["app_id"], name: "index_jobs_on_app_id"
    t.index ["app_series_id"], name: "index_jobs_on_app_series_id"
    t.index ["dxid"], name: "index_jobs_on_dxid"
    t.index ["scope"], name: "index_jobs_on_scope"
    t.index ["state"], name: "index_jobs_on_state"
    t.index ["uid"], name: "index_jobs_on_uid", unique: true
    t.index ["user_id"], name: "index_jobs_on_user_id"
  end

  create_table "licensed_items", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "license_id"
    t.integer "licenseable_id"
    t.string "licenseable_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["license_id"], name: "index_licensed_items_on_license_id"
    t.index ["licenseable_type", "licenseable_id"], name: "index_licensed_items_on_licenseable_type_and_licenseable_id"
  end

  create_table "licenses", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.text "content"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "title"
    t.string "scope"
    t.boolean "approval_required", default: false, null: false
    t.index ["scope"], name: "index_licenses_on_scope"
    t.index ["user_id"], name: "index_licenses_on_user_id"
  end

  create_table "meta_appathons", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "name"
    t.string "handle"
    t.string "template"
    t.text "description"
    t.text "meta"
    t.datetime "start_at"
    t.datetime "end_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["handle"], name: "index_meta_appathons_on_handle", unique: true
  end

  create_table "news_items", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "title"
    t.string "link"
    t.date "when"
    t.text "content"
    t.integer "user_id"
    t.string "video"
    t.integer "position", default: 0, null: false
    t.boolean "published"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["position"], name: "position_news_items_idx"
  end

  create_table "nodes", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "dxid"
    t.string "project"
    t.string "name"
    t.string "state"
    t.text "description"
    t.integer "user_id", null: false
    t.bigint "file_size"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "parent_id"
    t.string "parent_type"
    t.string "scope"
    t.integer "parent_folder_id"
    t.string "sti_type"
    t.integer "scoped_parent_folder_id"
    t.string "uid"
    t.boolean "featured", default: false
    t.index ["parent_type", "parent_id"], name: "index_nodes_on_parent_type_and_parent_id"
    t.index ["scope"], name: "index_nodes_on_scope"
    t.index ["state"], name: "index_nodes_on_state"
    t.index ["uid"], name: "index_nodes_on_uid", unique: true
    t.index ["user_id"], name: "index_nodes_on_user_id"
  end

  create_table "notes", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "title"
    t.text "content"
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "scope"
    t.string "note_type"
    t.index ["scope"], name: "index_notes_on_scope"
    t.index ["user_id"], name: "index_notes_on_user_id"
  end

  create_table "notification_preferences", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "user_id"
    t.text "data"
    t.index ["user_id"], name: "index_notification_preferences_on_user_id", unique: true
  end

  create_table "org_action_requests", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "org_id", null: false
    t.integer "initiator_id", null: false
    t.string "action_type", null: false
    t.string "state", null: false
    t.integer "member_id"
    t.datetime "created_at", null: false
    t.integer "approver_id"
    t.datetime "approved_at"
    t.datetime "resolved_at"
    t.text "info"
    t.index ["approver_id"], name: "index_org_action_requests_on_approver_id"
    t.index ["initiator_id"], name: "index_org_action_requests_on_initiator_id"
    t.index ["member_id"], name: "index_org_action_requests_on_member_id"
    t.index ["org_id"], name: "index_org_action_requests_on_org_id"
  end

  create_table "orgs", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "handle"
    t.string "name"
    t.integer "admin_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "address"
    t.string "duns"
    t.string "phone"
    t.string "state"
    t.boolean "singular"
    t.index ["admin_id"], name: "index_orgs_on_admin_id"
    t.index ["handle"], name: "index_orgs_on_handle", unique: true
  end

  create_table "participants", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "title"
    t.string "image_url"
    t.integer "node_id"
    t.boolean "public"
    t.integer "kind", default: 0
    t.integer "position", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["node_id"], name: "fk_rails_12f54662db"
  end

  create_table "phone_confirmations", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "number", null: false
    t.string "code", null: false
    t.datetime "expired_at", null: false
  end

  create_table "profiles", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "address1"
    t.string "address2"
    t.string "city"
    t.string "email"
    t.boolean "email_confirmed", default: false
    t.string "postal_code"
    t.string "phone"
    t.boolean "phone_confirmed", default: false
    t.string "us_state"
    t.integer "user_id"
    t.integer "country_id"
    t.integer "phone_country_id"
    t.index ["country_id"], name: "index_profiles_on_country_id"
    t.index ["email"], name: "index_profiles_on_email", unique: true
    t.index ["phone_country_id"], name: "fk_rails_2bcf548678"
    t.index ["user_id"], name: "index_profiles_on_user_id"
  end

  create_table "saved_queries", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "name"
    t.string "grid_name"
    t.text "query"
    t.text "description"
    t.integer "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["grid_name", "id"], name: "index_saved_queries_on_grid_name_and_id"
    t.index ["grid_name"], name: "index_saved_queries_on_grid_name"
    t.index ["user_id"], name: "index_saved_queries_on_user_id"
  end

  create_table "sessions", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "key", null: false
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "settings", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "key", null: false
    t.text "value", null: false
  end

  create_table "space_events", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "space_id", null: false
    t.integer "entity_id", null: false
    t.string "entity_type", null: false
    t.integer "activity_type", null: false
    t.integer "side", null: false
    t.datetime "created_at", null: false
    t.integer "object_type", null: false
    t.integer "role", null: false
    t.text "data"
    t.index ["entity_type", "entity_id"], name: "index_space_events_on_entity_type_and_entity_id"
    t.index ["space_id"], name: "index_space_events_on_space_id"
    t.index ["user_id"], name: "index_space_events_on_user_id"
  end

  create_table "space_invitations", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "space_id", null: false
    t.integer "inviter_id"
    t.string "email", null: false
    t.string "role", null: false
    t.datetime "created_at", null: false
    t.index ["inviter_id"], name: "index_space_invitations_on_inviter_id"
    t.index ["space_id", "email"], name: "index_space_invitations_on_space_id_and_email", unique: true
    t.index ["space_id"], name: "index_space_invitations_on_space_id"
  end

  create_table "space_memberships", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "user_id"
    t.text "meta"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "active", default: true
    t.integer "role", default: 0, null: false
    t.integer "side", default: 0, null: false
    t.index ["user_id"], name: "index_space_memberships_on_user_id"
  end

  create_table "space_memberships_spaces", id: false, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "space_id"
    t.integer "space_membership_id"
    t.index ["space_id"], name: "index_space_memberships_spaces_on_space_id"
    t.index ["space_membership_id"], name: "index_space_memberships_spaces_on_space_membership_id"
  end

  create_table "spaces", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "host_project"
    t.string "guest_project"
    t.string "host_dxorg"
    t.string "guest_dxorg"
    t.text "meta"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "space_id"
    t.integer "state", default: 0, null: false
    t.integer "space_type", default: 0, null: false
    t.boolean "verified", default: false, null: false
    t.integer "sponsor_org_id"
    t.boolean "restrict_to_template", default: false
    t.boolean "inactivity_notified", default: false
  end

  create_table "submissions", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "challenge_id"
    t.integer "user_id"
    t.integer "job_id"
    t.text "desc"
    t.text "meta"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["challenge_id"], name: "index_submissions_on_challenge_id"
    t.index ["job_id"], name: "index_submissions_on_job_id"
    t.index ["user_id"], name: "index_submissions_on_user_id"
  end

  create_table "taggings", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "tag_id"
    t.integer "taggable_id"
    t.string "taggable_type"
    t.integer "tagger_id"
    t.string "tagger_type"
    t.string "context", limit: 128
    t.datetime "created_at"
    t.index ["context"], name: "index_taggings_on_context"
    t.index ["tag_id", "taggable_id", "taggable_type", "context", "tagger_id", "tagger_type"], name: "taggings_idx", unique: true
    t.index ["tag_id"], name: "index_taggings_on_tag_id"
    t.index ["taggable_id", "taggable_type", "context"], name: "index_taggings_on_taggable_id_and_taggable_type_and_context"
    t.index ["taggable_id", "taggable_type", "tagger_id", "context"], name: "taggings_idy"
    t.index ["taggable_id"], name: "index_taggings_on_taggable_id"
    t.index ["taggable_type"], name: "index_taggings_on_taggable_type"
    t.index ["tagger_id", "tagger_type"], name: "index_taggings_on_tagger_id_and_tagger_type"
    t.index ["tagger_id"], name: "index_taggings_on_tagger_id"
  end

  create_table "tags", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "name", collation: "utf8_bin"
    t.integer "taggings_count", default: 0
    t.index ["name"], name: "index_tags_on_name", unique: true
  end

  create_table "tasks", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "user_id"
    t.integer "space_id"
    t.integer "assignee_id", null: false
    t.integer "status", default: 0, null: false
    t.string "name"
    t.text "description"
    t.datetime "response_deadline"
    t.datetime "completion_deadline"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "response_time"
    t.datetime "complete_time"
    t.index ["space_id"], name: "index_tasks_on_space_id"
    t.index ["user_id"], name: "index_tasks_on_user_id"
  end

  create_table "truth_challenge_results", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "answer_id"
    t.string "entry"
    t.string "type"
    t.string "subtype"
    t.string "subset"
    t.string "filter"
    t.string "genotype"
    t.string "qq_field"
    t.string "qq"
    t.decimal "metric_recall", precision: 7, scale: 6
    t.decimal "metric_precision", precision: 7, scale: 6
    t.decimal "metric_frac_na", precision: 7, scale: 6
    t.decimal "metric_f1_score", precision: 7, scale: 6
    t.integer "truth_total"
    t.integer "truth_tp"
    t.integer "truth_fn"
    t.integer "query_total"
    t.integer "query_tp"
    t.integer "query_fp"
    t.integer "query_unk"
    t.integer "fp_gt"
    t.integer "fp_al"
    t.decimal "pct_fp_ma", precision: 10, scale: 6
    t.decimal "truth_total_titv_ratio", precision: 10, scale: 6
    t.decimal "truth_total_het_hom_ratio", precision: 10, scale: 6
    t.decimal "truth_fn_titv_ratio", precision: 10, scale: 6
    t.decimal "truth_fn_het_hom_ratio", precision: 10, scale: 6
    t.decimal "truth_tp_titv_ratio", precision: 10, scale: 6
    t.decimal "truth_tp_het_hom_ratio", precision: 10, scale: 6
    t.decimal "query_fp_titv_ratio", precision: 10, scale: 6
    t.decimal "query_fp_het_hom_ratio", precision: 10, scale: 6
    t.decimal "query_tp_titv_ratio", precision: 10, scale: 6
    t.decimal "query_total_titv_ratio", precision: 10, scale: 6
    t.decimal "query_total_het_hom_ratio", precision: 10, scale: 6
    t.decimal "query_tp_het_hom_ratio", precision: 10, scale: 6
    t.decimal "query_unk_titv_ratio", precision: 10, scale: 6
    t.decimal "query_unk_het_hom_ratio", precision: 10, scale: 6
    t.text "meta"
    t.index ["answer_id"], name: "index_truth_challenge_results_on_answer_id"
    t.index ["entry"], name: "index_truth_challenge_results_on_entry"
    t.index ["fp_al"], name: "index_truth_challenge_results_on_fp_al"
    t.index ["fp_gt"], name: "index_truth_challenge_results_on_fp_gt"
    t.index ["genotype"], name: "index_truth_challenge_results_on_genotype"
    t.index ["metric_f1_score"], name: "index_truth_challenge_results_on_metric_f1_score"
    t.index ["metric_frac_na"], name: "index_truth_challenge_results_on_metric_frac_na"
    t.index ["metric_precision"], name: "index_truth_challenge_results_on_metric_precision"
    t.index ["metric_recall"], name: "index_truth_challenge_results_on_metric_recall"
    t.index ["query_fp"], name: "index_truth_challenge_results_on_query_fp"
    t.index ["query_fp_het_hom_ratio"], name: "index_truth_challenge_results_on_query_fp_het_hom_ratio"
    t.index ["query_fp_titv_ratio"], name: "index_truth_challenge_results_on_query_fp_titv_ratio"
    t.index ["query_total"], name: "index_truth_challenge_results_on_query_total"
    t.index ["query_total_het_hom_ratio"], name: "index_truth_challenge_results_on_query_total_het_hom_ratio"
    t.index ["query_total_titv_ratio"], name: "index_truth_challenge_results_on_query_total_titv_ratio"
    t.index ["query_tp"], name: "index_truth_challenge_results_on_query_tp"
    t.index ["query_tp_het_hom_ratio"], name: "index_truth_challenge_results_on_query_tp_het_hom_ratio"
    t.index ["query_tp_titv_ratio"], name: "index_truth_challenge_results_on_query_tp_titv_ratio"
    t.index ["query_unk"], name: "index_truth_challenge_results_on_query_unk"
    t.index ["query_unk_het_hom_ratio"], name: "index_truth_challenge_results_on_query_unk_het_hom_ratio"
    t.index ["query_unk_titv_ratio"], name: "index_truth_challenge_results_on_query_unk_titv_ratio"
    t.index ["subset"], name: "index_truth_challenge_results_on_subset"
    t.index ["subtype"], name: "index_truth_challenge_results_on_subtype"
    t.index ["truth_fn"], name: "index_truth_challenge_results_on_truth_fn"
    t.index ["truth_fn_het_hom_ratio"], name: "index_truth_challenge_results_on_truth_fn_het_hom_ratio"
    t.index ["truth_fn_titv_ratio"], name: "index_truth_challenge_results_on_truth_fn_titv_ratio"
    t.index ["truth_total"], name: "index_truth_challenge_results_on_truth_total"
    t.index ["truth_total_het_hom_ratio"], name: "index_truth_challenge_results_on_truth_total_het_hom_ratio"
    t.index ["truth_total_titv_ratio"], name: "index_truth_challenge_results_on_truth_total_titv_ratio"
    t.index ["truth_tp"], name: "index_truth_challenge_results_on_truth_tp"
    t.index ["truth_tp_het_hom_ratio"], name: "index_truth_challenge_results_on_truth_tp_het_hom_ratio"
    t.index ["truth_tp_titv_ratio"], name: "index_truth_challenge_results_on_truth_tp_titv_ratio"
    t.index ["type"], name: "index_truth_challenge_results_on_type"
  end

  create_table "usage_metrics", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "user_id", null: false
    t.bigint "storage_usage"
    t.decimal "daily_compute_price", precision: 30, scale: 20
    t.decimal "weekly_compute_price", precision: 30, scale: 20
    t.decimal "monthly_compute_price", precision: 30, scale: 20
    t.decimal "yearly_compute_price", precision: 30, scale: 20
    t.datetime "created_at"
    t.bigint "daily_byte_hours"
    t.bigint "weekly_byte_hours"
    t.bigint "monthly_byte_hours"
    t.bigint "yearly_byte_hours"
    t.bigint "custom_range_byte_hours"
    t.decimal "custom_range_compute_price", precision: 30, scale: 20
    t.decimal "cumulative_compute_price", precision: 30, scale: 20
    t.bigint "cumulative_byte_hours"
  end

  create_table "users", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "dxuser"
    t.string "private_files_project"
    t.string "public_files_project"
    t.string "private_comparisons_project"
    t.string "public_comparisons_project"
    t.integer "schema_version"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "org_id"
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.string "normalized_email"
    t.datetime "last_login"
    t.text "extras"
    t.string "time_zone"
    t.string "review_app_developers_org", default: ""
    t.integer "user_state", default: 0, null: false
    t.integer "expiration"
    t.string "disable_message"
    t.index ["dxuser"], name: "index_users_on_dxuser", unique: true
    t.index ["normalized_email"], name: "index_users_on_normalized_email"
    t.index ["org_id"], name: "index_users_on_org_id"
  end

  create_table "versions", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "item_type", limit: 191, null: false
    t.integer "item_id", null: false
    t.string "event", null: false
    t.string "whodunnit"
    t.text "object", size: :long
    t.datetime "created_at"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

  create_table "votes", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.integer "votable_id"
    t.string "votable_type"
    t.integer "voter_id"
    t.string "voter_type"
    t.boolean "vote_flag"
    t.string "vote_scope"
    t.integer "vote_weight"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["votable_id", "votable_type", "vote_scope"], name: "index_votes_on_votable_id_and_votable_type_and_vote_scope"
    t.index ["voter_id", "voter_type", "vote_scope"], name: "index_votes_on_voter_id_and_voter_type_and_vote_scope"
  end

  create_table "workflow_series", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "dxid"
    t.string "name"
    t.integer "latest_revision_workflow_id"
    t.integer "user_id"
    t.string "scope"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "featured", default: false
    t.boolean "deleted", default: false, null: false
    t.index ["deleted"], name: "index_workflow_series_on_deleted"
    t.index ["latest_revision_workflow_id"], name: "index_workflow_series_on_latest_revision_workflow_id"
    t.index ["user_id"], name: "index_workflow_series_on_user_id"
  end

  create_table "workflows", id: :integer, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci", force: :cascade do |t|
    t.string "title"
    t.string "name"
    t.string "dxid"
    t.integer "user_id"
    t.text "readme"
    t.string "edit_version"
    t.text "spec"
    t.string "default_instance"
    t.string "scope"
    t.integer "revision"
    t.integer "workflow_series_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "uid"
    t.string "project"
    t.boolean "featured", default: false
    t.boolean "deleted", default: false, null: false
    t.index ["deleted"], name: "index_workflows_on_deleted"
    t.index ["uid"], name: "index_workflows_on_uid", unique: true
    t.index ["user_id"], name: "index_workflows_on_user_id"
    t.index ["workflow_series_id"], name: "index_workflows_on_workflow_series_id"
  end

  add_foreign_key "accepted_licenses", "licenses"
  add_foreign_key "accepted_licenses", "users"
  add_foreign_key "admin_memberships", "admin_groups"
  add_foreign_key "admin_memberships", "users"
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
  add_foreign_key "challenge_resources", "nodes", column: "user_file_id"
  add_foreign_key "challenge_resources", "users"
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
  add_foreign_key "invitations", "countries", column: "phone_country_id", on_delete: :nullify
  add_foreign_key "invitations", "countries", on_delete: :nullify
  add_foreign_key "invitations", "users"
  add_foreign_key "jobs", "analyses"
  add_foreign_key "jobs", "app_series"
  add_foreign_key "jobs", "apps"
  add_foreign_key "jobs", "users"
  add_foreign_key "licensed_items", "licenses"
  add_foreign_key "licenses", "users"
  add_foreign_key "nodes", "users"
  add_foreign_key "notes", "users"
  add_foreign_key "notification_preferences", "users"
  add_foreign_key "org_action_requests", "orgs"
  add_foreign_key "org_action_requests", "users", column: "approver_id"
  add_foreign_key "org_action_requests", "users", column: "initiator_id"
  add_foreign_key "org_action_requests", "users", column: "member_id"
  add_foreign_key "orgs", "users", column: "admin_id"
  add_foreign_key "participants", "nodes"
  add_foreign_key "profiles", "countries"
  add_foreign_key "profiles", "countries", column: "phone_country_id", on_delete: :nullify
  add_foreign_key "profiles", "users"
  add_foreign_key "saved_queries", "users"
  add_foreign_key "space_events", "spaces"
  add_foreign_key "space_events", "users"
  add_foreign_key "space_invitations", "spaces"
  add_foreign_key "space_invitations", "users", column: "inviter_id"
  add_foreign_key "space_memberships", "users"
  add_foreign_key "submissions", "challenges"
  add_foreign_key "submissions", "jobs"
  add_foreign_key "submissions", "users"
  add_foreign_key "tasks", "spaces"
  add_foreign_key "tasks", "users"
  add_foreign_key "users", "orgs"
end
