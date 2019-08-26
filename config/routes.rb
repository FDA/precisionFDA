Rails.application.routes.draw do
  default_url_options Rails.configuration.action_mailer.default_url_options
  #
  # Remove the ability to switch formats (i.e. /foo vs /foo.json or /foo.xml)
  # by wrapping everything into a scope
  #
  scope(format: false) do

    namespace(:admin) do

      root "dashboard#index"

      resources :news_items, path: 'news'
      post 'news/positions' => 'news_items#positions'

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
      get "users", to: "users#all_users"
      get "active_users", to: "users#active"
      get "reset_mfa_user", to: "users#reset_2fa"
      get "toggle_activate_user", to: "users#toggle_activate_user"
      post "toggle_activate_user", to: "users#toggle_activate_user"
      get "unlock_user", to: "users#unlock_user"
      post "unlock_user", to: "users#unlock_user"
      get "pending_users", to: "users#pending_users"
      get "deactivated_users", to: "users#deactivated_users"
      get "resend_activation_email", to: "users#resend_activation_email"
      get "edit_user", to: "users#edit"
      get "update_user", to: "users#update"

      get 'orgs', to: "organizations#index"
      get 'show_org', to: "organizations#show", param: :handle
      get 'provision_org', to: "organizations#provision_org"
      post 'provision_org', to: "organizations#create_org"
      post 'change_org_admin', to: "organizations#change_admin"

      resources :get_started_boxes, except: [:show] do
        post :update_positions, on: :collection
      end
      resources :participants, except: [:show] do
        post :update_positions, on: :collection
      end
    end

    # hotfix for PFDA-557
    get "/challenges/6" => redirect("/challenges/7")
    get "/mislabeling" => redirect("/challenges/5")

    # Main controller
    get 'login' => 'main#login'
    delete 'logout' => 'main#destroy'
    get 'return_from_login' => 'main#return_from_login'
    post 'publish' => 'main#publish'
    get 'track' => 'main#track'
    get 'mislabeling' => 'main#mislabeling'
    get 'request_access' => 'main#request_access'
    post 'request_access' => 'main#request_access'
    get 'browse_access' => 'main#browse_access'
    post 'browse_access' => 'main#browse_access'
    get 'about' => 'main#about'
    get 'about/:section' => 'main#about'
    get 'terms' => 'main#terms'
    post 'tokify' => 'main#tokify'
    post 'set_tags' => 'main#set_tags'
    get 'guidelines' => 'main#guidelines'
    get 'exception_test' => "main#exception_test"
    get 'presskit' => 'main#presskit'
    get 'news' => 'main#news'

    # API
    namespace "api" do
      get "update_active", to: "base#update_active"

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

      resources :challenges, only: [] do
        post 'save_editor_page', on: :member
      end

      resources :apps, only: %w(create) do
        post "import", on: :collection
      end

      resources :workflows, only: %w(create)

      post 'publish'
      post 'create_file'
      post 'create_challenge_card_image'
      post 'create_image_file'
      post 'get_upload_url'
      post 'get_file_link'
      post 'list_related'
      post 'close_file'
      post 'describe'
      post 'list_files'
      post 'folder_tree'
      post 'list_notes'
      post 'list_comparisons'
      post 'list_apps'
      post 'list_assets'
      post 'list_jobs'
      post 'list_workflows'
      post 'describe_license'
      post 'accept_licenses'
      post 'run_app'
      post 'list_app_revisions'
      post 'run_workflow'
      post 'get_app_spec'
      post 'get_app_script'
      post 'export_app'
      post 'search_assets'
      post 'create_asset'
      post 'close_asset'
      post 'share_with_fda'
      post 'attach_to_notes'
      post 'update_note'
      post 'upvote'
      post 'remove_upvote'
      post 'follow'
      post 'unfollow'
      post 'update_submission'
      post 'update_time_zone'
      post 'create_challenge_resource'
      post 'create_resource_link'
    end

    # FHIR
    scope '/fhir' do
      get 'Sequence', to: 'comparisons#fhir_index'
      get 'metadata', to: 'comparisons#fhir_cap'
      get 'Sequence/:id', to: 'comparisons#fhir_export', id: /comparison-\d+/
    end

    # Profile
    get 'profile', to: 'profile#index'
    put 'profile', to: 'profile#update'
    post 'profile/provision_user', to: 'profile#provision_user', as: 'provision_user'
    get 'profile/provision_org', to: 'profile#provision_org'
    post 'profile/provision_org', to: 'profile#provision_org', as: 'provision_org'
    post 'profile/run_report', to: 'profile#run_report', as: 'run_report'

    resources :apps do
      resources :jobs, only: [:new, :create]
      get 'jobs', on: :member, to: 'apps#index'
      member do
        get 'fork'
        post 'export'
        get 'cwl_export'
        get 'wdl_export'
        get 'batch_app'
      end
      get 'featured', on: :collection, as: 'featured'
      get 'explore', on: :collection, as: 'explore'
      resources :comments
    end

    resources :workflows, except: [:create, :update, :destroy] do
      resources :analyses, only: [:new, :create]
      member do
        get 'analyses', to: 'workflows#index'
        get 'fork'
        get 'cwl_export'
        get 'wdl_export'
        get 'batch_workflow'
        post 'run_batch'
        get 'terminate_batch'
        get 'output_folders_list'
        get 'output_folder_create'
        get 'output_folder_update'
      end
      post 'convert_file_with_strings', on: :collection, as: 'convert_file_with_strings'
      resources :comments
    end

    resources :jobs, except: :index do
      member do
        get 'log'
      end
      resources :comments
    end

    resources :comparisons do
      post 'rename', on: :member
      get 'visualize', on: :member
      get 'featured', on: :collection, as: 'featured'
      get 'explore', on: :collection, as: 'explore'
      resources :comments
    end

    resources :files do
      post 'download', on: :member
      post 'link', on: :member
      post 'rename', on: :member
      get 'featured', on: :collection, as: 'featured'
      get 'explore', on: :collection, as: 'explore'
      post 'move', on: :collection
      post 'create_folder', on: :collection
      post 'rename_folder', on: :member
      post 'download_list', on: :collection
      post 'remove', on: :collection
      post 'publish', on: :collection
      resources :comments
    end

    resources :notes do
      post 'rename', on: :member
      get 'featured', on: :collection, as: 'featured'
      get 'explore', on: :collection, as: 'explore'
      resources :comments
    end

    resources :assets, path: '/app_assets' do
      post 'rename', on: :member
      get 'featured', on: :collection, as: 'featured'
      get 'explore', on: :collection, as: 'explore'
      resources :comments
    end

    get "challenges/mislabeling" => redirect("/mislabeling")
    get "challenges/#{ACTIVE_META_APPATHON}" => "meta_appathons#show", as: 'active_meta_appathon'
    get "challenges/#{APPATHON_IN_A_BOX_HANDLE}", as: 'appathon_in_a_box'
    resources :challenges do
      get 'consistency(/:tab)', on: :collection, action: :consistency, as: 'consistency'
      get 'truth(/:tab)', on: :collection, action: :truth, as: 'truth'
      get 'join', on: :member
      get 'view(/:tab)', on: :member, action: :show, as: 'show'
      get 'editor(/:tab)', on: :member, action: :edit_page, as: 'edit_page'
      post 'editor/save_page', on: :member, action: :save_page, as: 'save_page'
      resources :challenge_resources, only: [:new, :create, :destroy] do
        post 'rename', on: :member
      end
      resources :submissions, only: [:new, :create, :edit] do
        post 'publish', on: :collection, action: :publish
        get 'log', on: :member
      end
      post 'assign_app', on: :member
      post 'announce_result', on: :member
    end

    resources :discussions, constraints: {answer_id: /[^\/]+/ } do
      get 'followers', on: :member
      post 'rename', on: :member
      resources :answers, constraints: {id: /[^\/]+/} do
        resources :comments
      end
      resources :comments
    end

    resources :licenses do
      post 'accept(/:redirect_to_uid)', on: :member, action: :accept, as: 'accept'
      match 'request_approval', on: :member, action: :request_approval, as: 'request_approval', via: [:get, :post]
      post 'license_item/:item_uid', on: :member, action: :license_item, as: 'license_item'
      post 'remove_item/:item_uid(/:redirect_to_uid)', on: :member, action: :remove_item, as: 'remove_item'
      post 'remove_user/:user_uid(/:redirect_to_uid)', on: :member, action: :remove_user, as: 'remove_user'
      post 'approve_user/:user_uid(/:redirect_to_uid)', on: :member, action: :approve_user, as: 'approve_user'
      post 'remove_items', on: :member
      post 'remove_users', on: :member
      post 'approve_users', on: :member
      post 'rename', on: :member
      get 'users', on: :member
      get 'items', on: :member
    end

    resources :experts do
      post 'ask_question', on: :member
      post 'open', on: :member
      post 'close', on: :member
      get 'dashboard', on: :member
      get 'blog', on: :member
      nested do
        scope '/dashboard' do
          resources :expert_questions, as: 'edit_question'
        end
      end
      resources :expert_questions, only: [:create, :destroy] do
          get '', on: :member, to: 'expert_questions#show_question', as: 'show_question'
          resources :comments
      end
    end

    resource :org, only: :update

    get '/spaces/verified_space_list' => 'space_templates#verified_space_list'
    get '/spaces/apps_and_files' => 'spaces#apps_and_files'
    get '/spaces/unverified_apps' => 'space_templates#unverified_apps'

    resources :space_templates do
      get 'duplicate', on: :member
      get 'app_file_list'
    end

    resources :spaces do
      get 'members', on: :member
      get 'discuss', on: :member
      get 'tasks',   on: :member
      get 'feed',    on: :member
      get 'reports', on: :member
      get 'notes',   on: :member
      get 'files',   on: :member
      get 'apps',    on: :member
      get 'jobs',    on: :member
      get 'comparisons', on: :member
      get 'assets',  on: :member
      get 'workflows', on: :member
      post 'verify', on: :member

      post 'accept', on: :member
      post 'lock', on: :member, to: 'space_requests#lock'
      post 'unlock', on: :member, to: 'space_requests#unlock'
      post 'delete', on: :member, to: 'space_requests#delete'
      post 'rename', on: :member
      post 'invite', on: :member
      post 'move', on: :member
      post 'create_folder', on: :member
      post 'rename_folder', on: :collection
      post 'download_list', on: :member
      post 'remove_folder', on: :member, as: 'remove_folder'
      post 'publish_folder', on: :member
      post 'copy_folder_to_cooperative', on: :member
      post 'copy_file_to_cooperative', on: :member
      post 'copy_to_cooperative', on: :member
      post 'search_content', on: :member
      resources :comments

      resources :tasks, only: [:create, :destroy, :update, :show] do
        post 'accept', on: :collection
        post 'complete', on: :collection
        post 'decline', on: :collection
        post 'make_active', on: :collection
        post 'reopen', on: :collection
        post 'reassign', on: :member
        post 'copy', on: :member
        get 'task', on: :member
        resources :comments
      end

      resources :space_feed, only: [:index] do
        collection do
          get 'object_types'
          get 'chart'
        end
      end
      resources :space_reports, only: [:index] do
        collection do
          get 'counters'
          get 'download_report'
        end
      end
    end

    resources :space_membership, only: [] do
      member do
        post :to_lead
        post :to_admin
        post :to_viewer
        post :to_contributor
        post :to_inactive
      end
    end

    resources :notification_preferences, only: [:index] do
      post 'change', on: :collection
    end


    resources :meta_appathons, constraints: {appathon_id: /[^\/]+/ }  do
      post 'rename', on: :member
      resources :appathons, constraints: {id: /[^\/]+/}
    end

    resources :appathons, constraints: {id: /[^\/]+/} do
      post 'rename', on: :member
      post 'join', on: :member
      resources :comments
    end

    resources :queries do
    end

    resources :docs do
      get ":section", on: :collection, action: :show, as: 'show'
    end

    resources :phone_confirmations, only: [:create] do
      get 'check_code', on: :collection
    end

    user_constraints = { username: /[^\/]*/ }
    get "/users/:username(/:tab)", to: 'users#show', constraints: user_constraints, as: 'user'

    # You can have the root of your site routed with "root"
    root 'main#index'
  end
end
