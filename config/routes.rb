require "sidekiq/web"
Sidekiq::Web.app_url = "/"

Rails.application.routes.draw do
  mount Sidekiq::Web => "/admin/sidekiq", constraints: AdminConstraint.new

  default_url_options Rails.configuration.action_mailer.default_url_options

  # Remove the ability to switch formats (i.e. /foo vs /foo.json or /foo.xml)
  #   by wrapping everything into a scope.
  scope(format: false) do
    get "/admin/news" => "main#news"
    get "/admin/news/:id/edit" => "main#news"

    namespace(:admin) do
      root "dashboard#index"

      resources :activity_reports, only: [:index] do
        collection do
          get "total"
          get "data_upload"
          get "data_download"
          get "data_generated"
          get "app_created"
          get "app_published"
          get "app_run"
          get "job_run"
          get "job_failed"
          get "user_access_requested"
          get "user_logged_in"
          get "user_viewed"
          get "users_signed_up_for_challenge"
          get "submissions_created"
        end
      end

      resources :usage_reports, only: [:index] do
        post :update_custom_range, on: :collection
      end

      get "users", to: "users#index"
      get "users_list", to: "users#list"
      get "all_users", to: "users#all_users"
      get "active_users", to: "users#active"
      get "reset_mfa_user", to: "users#reset_2fa"
      get "toggle_activate_user", to: "users#toggle_activate_user"
      post "toggle_activate_user", to: "users#toggle_activate_user"
      get "unlock_user", to: "users#unlock_user"
      post "unlock_user", to: "users#unlock_user"
      get "pending_users", to: "users#pending_users"
      get "org_action_requests", to: "org_requests#index"
      get "deactivated_users", to: "users#deactivated_users"
      get "resend_activation_email", to: "users#resend_activation_email"
      post "set_total_limit", to: "users#set_total_limit"
      post "set_job_limit", to: "users#set_job_limit"
      post "bulk_reset_2fa", to: "users#bulk_reset_2fa"
      post "bulk_unlock", to: "users#bulk_unlock"
      post "bulk_activate", to: "users#bulk_activate"
      post "bulk_deactivate", to: "users#bulk_deactivate"
      post "bulk_enable_resource", to: "users#bulk_enable_resource"
      post "bulk_enable_all_resources", to: "users#bulk_enable_all_resources"
      post "bulk_disable_resource", to: "users#bulk_disable_resource"
      post "bulk_disable_all_resources", to: "users#bulk_disable_all_resources"

      resources :apps, only: [], param: :uid do
        collection do
          post :set_comparison_app
          post :remove_from_comparators
          post :add_to_comparators
        end
      end

      resources :invitations, only: %i(index) do
        collection do
          post "search"
          post "provision"
          post "browse"
        end
      end

      get "comparator_settings", to: "comparator_settings#index"

      resources :organizations, only: %i(index show create) do
        post :change_org_admin, on: :collection
        post :dissolve
      end

      resources :get_started_boxes, except: [:show] do
        post :update_positions, on: :collection
      end
      resources :participants, except: [:show] do
        post :update_positions, on: :collection
      end

      resources :org_requests do
        member do
          put "approve", to: "org_requests#approve"
        end
      end

      resources :admin_memberships, only: %i(index create destroy new)
    end

    # hotfix for PFDA-557
    get "/challenges/6" => redirect("/challenges/7")
    get "/mislabeling" => redirect("/challenges/5")
    # hotfix for PFDA-2432
    get "/challenges/14" => redirect("/challenges/13")

    # Mains controller
    get "login" => "main#login"
    delete "logout" => "main#destroy"
    get "return_from_login" => "main#return_from_login"
    get "check_webapp" => "main#check_webapp"
    post "publish" => "main#publish"
    get "track" => "main#track"
    get "request_access" => "main#request_access"
    post "request_access" => "main#create_request_access"
    get "browse_access" => "main#browse_access"
    post "browse_access" => "main#browse_access"
    get "about" => "main#about"
    get "terms" => "main#terms"
    get "security" => "main#security"
    post "tokify" => "main#tokify"
    post "set_tags" => "main#set_tags"
    get "guidelines" => "main#guidelines"
    get "presskit" => "main#presskit"
    get "news" => "main#news"

    get "db_stats" => "main#db_stats", constraints: AdminConstraint.new
    post "/spaces/:id/copy_to_cooperative",
         to: "main#copy_to_cooperative",
         as: :copy_to_cooperative_space

    resources :org_requests do
      collection do
        post "leave", to: "org_requests#create_leave"
        post "remove_member", to: "org_requests#remove_member"
        post "dissolve", to: "org_requests#create_dissolve"
      end
    end

    # My Home (Site-Wide UI & API Redesign)
    get "home" => "home#index"
    get "/home/*all", to: "home#index"
    get "docs" => "docs#index"
    get "/docs/*all", to: "docs#index"

    # Old My Home
    # TODO: remove old code once new My Home is stable for release or two,
    #       but for now it still has utility for devs
    # get "home-old" => "home#index"
    # get "home-old" => "home#index"
    # get "/home-old/*all", to: "home#index"

    get "/account/*all", to: "home#index"
    get "/challenges/propose", to: "challenges#index"
    get "/challenges/create", to: "challenges#index"

    if ENV["GSRS_ENABLED"]
      match "/ginas/app/logout", to: "main#destroy", via: :all
      get "/ginas/app/api/v1/substances:path", to: "ginas#skip_request",
        constraints: ->(request) { request.fullpath.ends_with? "(undefined)?view=internal" }
      match "/ginas/app/api/v1/substances", to: "ginas#substances", via: %i(put post)
      match "/ginas/*path", to: "ginas#index", via: :all
      match "/substances/api/v1/substances/*query" => redirect(path: "/ginas/app/api/v1/substances/%{query}"), via: :all
    end

    # API
    namespace "api" do
      get "auth_key" => "base#auth_key"
      get "update_active", to: "base#update_active"

      resource :user, only: %i(show) do
        get :cloud_resources
      end

      resources :users, only: %i(update)

      namespace "activity_reports" do
        get "total"
        get "data_upload"
        get "data_download"
        get "data_generated"
        get "app_created"
        get "app_published"
        get "app_run"
        get "job_run"
        get "job_failed"
        get "user_access_requested"
        get "user_logged_in"
        get "user_viewed"
        get "users_signed_up_for_challenge"
        get "submissions_created"
      end

      resources :site_settings do
        get :sso_button, on: :collection
        get :cdmh, on: :collection
      end

      # News
      get "news" => "news_items#index"
      get "news/all" => "news_items#all"
      post "news" => "news_items#create"
      get "news/years" => "news_items#years"
      post "news/positions" => "news_items#positions"
      put "news/:id" => "news_items#edit"
      get "news/:id" => "news_items#show"
      delete "news/:id" => "news_items#delete"

      resources :challenges, only: %i(index show create update) do
        get :years, on: :collection
        get :scoring_app_users, on: :collection
        get :host_lead_users, on: :collection
        get :guest_lead_users, on: :collection
        get :challenges_for_select, on: :collection
        get :scopes_for_select, on: :collection

        post :save_editor_page, on: :member
        post :propose, on: :collection
      end

      resources :submissions, only: %i(index) do
        get :my_entries, on: :collection
      end

      resources :experts, controller: :experts,
                param: :id, only: %i(index show ask_question blog) do
        get :years, on: :collection
        post :ask_question, on: :member
      end

      resources :participants, path: "participants" do
        get :index
      end

      resources :apps do
        get :describe, on: :member, to: "apps#describe"
        get :jobs, on: :member, to: "jobs#app"
        get :licenses_to_accept

        collection do
          post "copy"
          post "import"
          get "accessible_apps"

          get :featured
          get :everybody
          get :spaces
          get :user_compute_resources
          get :licenses_to_accept

          put :feature, to: "apps#invert_feature"
          put :delete, to: "apps#soft_delete"
        end
      end

      resources :notifications do
        member do
          put :update
        end
      end

      resources :spaces, only: %i(index show create update) do
        collection do
          get :cli
          get :editable_spaces
          get :info
        end

        member do
          get :jobs
          get :members
          get :selectable_spaces
          put :tags
          post :accept
          post :add_data
          patch :fix_guest_permissions

          post :lock, controller: :space_requests
          post :unlock, controller: :space_requests
          post :delete, controller: :space_requests
        end

        scope module: :spaces do
          resources :files, only: [] do
            collection do
              post :publish_files
              post :move
              post :remove
              post :create_folder
              get :subfolders
            end

            member do
              put :rename_folder
            end
          end

          resources :memberships, only: %(update) do
            collection do
              post :invite
            end
          end
        end
      end

      resources :folders, only: [] do
        get :children, on: :collection
        post :rename_folder, on: :collection
        post :publish_folders, on: :collection
      end

      resources :nodes, only: [] do
        post :lock, on: :collection
        post :unlock, on: :collection
      end

      resources :licenses, only: %i(index show) do
        post "accept",
             on: :member,
             action: :accept,
             as: "accept"
        post "remove_item/:item_uid",
             on: :member,
             action: :remove_item,
             as: "remove_item"
        post "license_item/:item_uid",
             on: :member,
             action: :license_item,
             as: "license_item"
        collection do
          get "accepted" => "licenses#accepted_licenses"
        end
        match "request_approval",
              on: :member,
              action: :request_approval,
              as: "request_approval",
              via: %i(get post)
      end

      resources :files, param: :uid, only: %i(index update show) do
        get :download, on: :member

        collection do
          get :featured
          get :everybody
          get :spaces
          get :cli

          post :copy
          post :bulk_download
          post :cli_node_search
          post :download_list
          post :create_folder
          post :remove
          post :cli_remove
          post :move

          put :feature, to: "files#invert_feature"
        end
      end

      resources :jobs, only: %i(index show create) do
        get :open_external, on: :member
        patch :refresh_api_key, on: :member
        patch :snapshot, on: :member
        patch :sync_files, on: :member

        collection do
          get :featured
          get :everybody
          get :spaces
          get :log
          post :copy
          post :terminate
          put :feature, to: "jobs#invert_feature"
        end
      end

      resources :workflows, only: %i(index show create) do
        get :diagram, on: :member, to: "workflows#diagram"
        get :jobs, on: :member, to: "jobs#workflow"
        get :describe, on: :member, to: "workflows#describe"
        get :licenses_to_accept

        collection do
          get :featured
          get :everybody
          get :spaces

          post :copy

          put :feature, to: "workflows#invert_feature"
          post :delete, to: "workflows#soft_delete"
        end
      end

      resources :assets do
        collection do
          get :featured
          get :everybody
          get :spaces

          post :rename
          put :feature, to: "assets#invert_feature"
        end
      end

      resources :dbclusters, controller: :db_clusters,
                             param: :dxid, only: %i(index show create update) do
        post ":api_method", on: :collection,
                            to: "db_clusters#run",
                            as: :run,
                            api_method: /(start|stop|terminate)/
        get :allowed_instances, on: :collection, to: "db_clusters#allowed_db_instances_by_user"
        resources :comments
      end

      resource :counters do
        get :index
        get :featured
        get :everybody
        get :spaces
      end

      resources :notification_preferences do
        get :index
        post "change", on: :collection
      end

      post "create_file"
      post "create_challenge_card_image"
      post "create_image_file"
      post "get_upload_url"
      post "get_file_link"
      post "list_related"
      post "close_file"
      post "describe"
      post "list_files"
      post "folder_tree"
      post "files_regex_search"
      post "list_notes"
      post "list_comparisons"
      post "list_apps"
      post "list_assets"
      post "list_jobs"
      post "list_workflows"
      post "describe_license"
      post "accept_licenses"
      post "license_items/:license_id/:items_to_license",
           action: :license_items,
           as: "license_items"
      post "run_workflow"
      post "get_app_spec"
      post "get_app_script"
      post "export_app"
      post "search_assets"
      post "create_asset"
      post "close_asset"
      post "share_with_fda"
      post "attach_to_notes"
      post "update_note"
      post "upvote"
      post "remove_upvote"
      post "follow"
      post "unfollow"
      post "update_submission"
      post "update_time_zone"
      post "create_challenge_resource"
      post "create_resource_link"
      post "set_tags"
      post "assign_app"
      get "list_licenses"
      get "cli_latest_version"
      post "list_licenses_for_files"
    end
    # end API

    # FHIR
    scope "/fhir" do
      get "Sequence", to: "comparisons#fhir_index"
      get "metadata", to: "comparisons#fhir_cap"
      get "Sequence/:id", to: "comparisons#fhir_export", id: /comparison-\d+/
    end

    # Profile
    get "profile", to: "profile#index"
    put "profile", to: "profile#update"
    post "profile/provision_user", to: "profile#provision_user", as: "provision_user"
    get "profile/provision_org", to: "profile#provision_org"
    post "profile/provision_org", to: "profile#provision_org", as: "provision_org"
    post "profile/run_report", to: "profile#run_report", as: "run_report"
    post "profile/check_spaces_permissions", to: "profile#check_spaces_permissions", as: "check_spaces_permissions"

    resources :apps do
      resources :jobs, only: %i(new create)
      get "jobs", on: :member, to: "apps#index"
      member do
        get "fork"
        post "export"
        get "cwl_export"
        get "wdl_export"
        get "batch_app"
      end
      get "featured", on: :collection, as: "featured"
      get "explore", on: :collection, as: "explore"
      post "run", on: :collection
      resources :comments
    end

    resources :workflows, except: %i(create update destroy) do
      resources :analyses, only: %i(new create)
      member do
        get "analyses", to: "workflows#index"
        get "fork"
        get "cwl_export"
        get "wdl_export"
        get "batch_workflow"
        post "run_batch"
        get "terminate_batch"
        get "output_folders_list"
        get "output_folder_create"
        get "output_folder_update"
      end
      post "convert_file_with_strings", on: :collection, as: "convert_file_with_strings"
      resources :comments
    end

    resources :jobs, except: %i(index update edit) do
      member do
        get "log"
      end
      resources :comments
    end

    resources :comparisons do
      post "rename", on: :member
      get "visualize", on: :member
      get "featured", on: :collection, as: "featured"
      get "explore", on: :collection, as: "explore"
      resources :comments
    end

    resources :comparators, only: [] do
      collection do
        get "/", to: "comparators#show"
      end
    end

    resources :files, only: [] do
      resources :comments
    end

    resources :notes do
      post "rename", on: :member
      get "featured", on: :collection, as: "featured"
      get "explore", on: :collection, as: "explore"
      resources :comments
    end

    resources :assets, only: :new do
      resources :comments
    end

    get "challenges/mislabeling" => redirect("/mislabeling")
    get "challenges/#{ACTIVE_META_APPATHON}" => "meta_appathons#show", as: "active_meta_appathon"
    get "challenges/#{APPATHON_IN_A_BOX_HANDLE}", as: "appathon_in_a_box"
    get "challenges", to: "challenges#index"
    get "old_challenges/treasure", to: "challenges#treasure_old"
    get "old_challenges/treasure(/:tab)", to: "challenges#treasure_old"

    resources :challenges do
      get "consistency(/:tab)", on: :collection, action: :consistency, as: "consistency"
      get "truth(/:tab)", on: :collection, action: :truth, as: "truth"
      get "new", on: :collection, as: "new"
      get "join", on: :member
      get "editor(/:tab)", on: :member, action: :edit_page, as: "edit_page"
      post "editor/save_page", on: :member, action: :save_page, as: "save_page"
      get "(/:tab)", on: :member, action: :show, as: "show"
      resources :challenge_resources, only: %i(new create destroy) do
        post "rename", on: :member
      end
      resources :submissions, only: %i(new create edit) do
        post "publish", on: :collection, action: :publish
        get "log", on: :member
      end
      post "assign_app", on: :member
      post "announce_result", on: :member
    end

    resources :discussions, constraints: { answer_id: %r{[^/]+} } do
      get "followers", on: :member
      post "rename", on: :member
      resources :answers, constraints: { id: %r{[^/]+} } do
        resources :comments
      end
      resources :comments
    end

    resources :licenses do
      post "accept(/:redirect_to_uid)", on: :member, action: :accept, as: "accept"
      post "license_item/:item_uid",
           on: :member,
           action: :license_item,
           as: "license_item"
      post "remove_item/:item_uid(/:redirect_to_uid)",
           on: :member,
           action: :remove_item,
           as: "remove_item"
      post "remove_user/:user_uid(/:redirect_to_uid)",
           on: :member,
           action: :remove_user,
           as: "remove_user"
      post "approve_user/:user_uid(/:redirect_to_uid)",
           on: :member,
           action: :approve_user,
           as: "approve_user"
      post "remove_items", on: :member
      post "remove_users", on: :member
      post "approve_users", on: :member
      post "rename", on: :member
      get "users", on: :member
      get "items", on: :member
      match "request_approval",
            on: :member,
            action: :request_approval,
            as: "request_approval",
            via: %i(get post)
    end

    resources :experts do
      post "ask_question", on: :member
      post "open", on: :member
      post "close", on: :member
      get "dashboard", on: :member
      get "blog", on: :member
      get "qa", on: :member
      nested do
        scope "/dashboard" do
          resources :expert_questions, as: "edit_question"
        end
      end
      resources :expert_questions, only: %i(create destroy) do
        get "", on: :member, to: "expert_questions#show_question", as: "show_question"
        resources :comments
      end
    end

    resource :org, only: :update
    resources :spaces, only: :index

    get "/spaces/*all", to: "spaces#index"
    get "/spaces-old/*all", to: "spaces#index"

    # to debug
    # resources :notification_preferences, only: [:index] do
    #   post "change", on: :collection
    # end

    resources :meta_appathons, constraints: { appathon_id: %r{[^/]+} } do
      post "rename", on: :member
      resources :appathons, constraints: { id: %r{[^/]+} }
    end

    resources :appathons, constraints: { id: %r{[^/]+} } do
      post "rename", on: :member
      post "join", on: :member
      resources :comments
    end

    resources :queries, only: %i(create destroy)

    resources :phone_confirmations, only: [:create] do
      get "check_code", on: :collection
    end

    user_constraints = { username: %r{[^/]*} }
    get "/users/:username(/:tab)", to: "users#show", constraints: user_constraints, as: "user"

    # You can have the root of your site routed with "root"
    root "main#index"
  end
end
