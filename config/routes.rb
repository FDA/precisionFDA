Rails.application.routes.draw do
  #
  # Remove the ability to switch formats (i.e. /foo vs /foo.json or /foo.xml)
  # by wrapping everything into a scope
  #
  scope(format: false) do
    get 'login' => 'main#login'
    delete 'logout' => 'main#destroy'
    get 'return_from_login' => 'main#return_from_login'

    # API
    post '/api/create_file', to: 'api#create_file'
    post '/api/get_upload_url', to: 'api#get_upload_url'
    post '/api/close_file', to: 'api#close_file'
    post '/api/list_files', to: 'api#list_files'
    post '/api/run_app', to: 'api#run_app'
    post '/api/list_assets', to: 'api#list_assets'
    post '/api/describe_asset', to: 'api#describe_asset'
    post '/api/search_assets', to: 'api#search_assets'
    post '/api/create_app', to: 'api#create_app'

    # The priority is based upon order of creation: first created -> highest priority.
    # See how all your routes lay out with "rake routes".

    resources :apps do
      resources :jobs, shallow: true, except: :index do
        member do
          get 'log'
        end
      end
      get 'jobs', on: :member, to: 'apps#index'
    end
    resources :comparisons do
      get 'visualize', on: :member
    end
    resources :files do
      post 'download', on: :member
    end
    resources :notes
    resources :assets, only: ['show', 'index']

    get '/users', to: 'users#index'
    get "/users/:username", to: 'users#show', constraints: { username: /[^\/]*/ }, as: 'user'

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
