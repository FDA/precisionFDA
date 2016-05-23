Rails.application.routes.draw do
  #
  # Remove the ability to switch formats (i.e. /foo vs /foo.json or /foo.xml)
  # by wrapping everything into a scope
  #
  scope(format: false) do

    # Main controller
    get 'login' => 'main#login'
    delete 'logout' => 'main#destroy'
    get 'return_from_login' => 'main#return_from_login'
    post 'publish' => 'main#publish'
    get 'track' => 'main#track'
    get 'request_access' => 'main#request_access'
    post 'request_access' => 'main#request_access'
    get 'browse_access' => 'main#browse_access'
    post 'browse_access' => 'main#browse_access'
    get 'about' => 'main#about'
    get 'about/:section' => 'main#about'
    get 'terms' => 'main#terms'
    post 'tokify' => 'main#tokify'
    get 'guidelines' => 'main#guidelines'
    get 'exception_test' => "main#exception_test"

    # API
    post '/api/create_file', to: 'api#create_file'
    post '/api/get_upload_url', to: 'api#get_upload_url'
    post '/api/close_file', to: 'api#close_file'
    post '/api/list_files', to: 'api#list_files'
    post '/api/describe_file', to: 'api#describe_file'
    post '/api/describe_license', to: 'api#describe_license'
    post '/api/accept_licenses', to: 'api#accept_licenses'
    post '/api/run_app', to: 'api#run_app'
    post '/api/list_assets', to: 'api#list_assets'
    post '/api/describe_asset', to: 'api#describe_asset'
    post '/api/search_assets', to: 'api#search_assets'
    post '/api/create_asset', to: 'api#create_asset'
    post '/api/close_asset', to: 'api#close_asset'
    post '/api/create_app', to: 'api#create_app'
    post '/api/list_notes', to: 'api#list_notes'
    post '/api/describe_note', to: 'api#describe_note'
    post '/api/attach_to_notes', to: 'api#attach_to_notes'
    post '/api/update_note', to: 'api#update_note'
    post '/api/upvote', to: 'api#upvote'
    post '/api/remove_upvote', to: 'api#remove_upvote'
    post '/api/follow', to: 'api#follow'
    post '/api/unfollow', to: 'api#unfollow'

    # Profile
    get 'profile', to: 'profile#index'
    post 'profile/provision_user', to: 'profile#provision_user', as: 'provision_user'
    post 'profile/provision_org', to: 'profile#provision_org', as: 'provision_org'
    post 'profile/run_report', to: 'profile#run_report', as: 'run_report'

    resources :apps do
      resources :jobs, shallow: true, except: :index do
        member do
          get 'log'
        end
      end
      get 'jobs', on: :member, to: 'apps#index'
      member do
        get 'fork'
      end
      get 'featured', on: :collection, as: 'featured'
      get 'explore', on: :collection, as: 'explore'
    end
    resources :comparisons do
      post 'rename', on: :member
      get 'visualize', on: :member
      get 'featured', on: :collection, as: 'featured'
      get 'explore', on: :collection, as: 'explore'
    end
    resources :files do
      post 'download', on: :member
      post 'link', on: :member
      post 'rename', on: :member
      get 'featured', on: :collection, as: 'featured'
      get 'explore', on: :collection, as: 'explore'
    end
    resources :notes do
      post 'rename', on: :member
      get 'featured', on: :collection, as: 'featured'
      get 'explore', on: :collection, as: 'explore'
    end
    resources :assets, path: '/app_assets' do
      post 'rename', on: :member
      get 'featured', on: :collection, as: 'featured'
      get 'explore', on: :collection, as: 'explore'
    end
    resources :challenges do
      get 'consistency(/:tab)', on: :collection, action: :consistency, as: 'consistency'
      get 'truth(/:tab)', on: :collection, action: :truth, as: 'truth'
      get 'join', on: :member
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
      post 'license_item/:item_uid', on: :member, action: :license_item, as: 'license_item'
      post 'remove_item/:item_uid(/:redirect_to_uid)', on: :member, action: :remove_item, as: 'remove_item'
      post 'remove_user/:user_uid(/:redirect_to_uid)', on: :member, action: :remove_user, as: 'remove_user'
      post 'remove_items', on: :member
      post 'remove_users', on: :member
      post 'rename', on: :member
    end

    user_constraints = { username: /[^\/]*/ }
    get "/users/:username(/:tab)", to: 'users#show', constraints: user_constraints, as: 'user'

    # You can have the root of your site routed with "root"
    root 'main#index'
  end

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
