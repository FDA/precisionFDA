Rails.application.routes.draw do
  #
  # Remove the ability to switch formats (i.e. /foo vs /foo.json or /foo.xml)
  # by wrapping everything into a scope
  #
  scope(format: false) do
    get 'login' => 'main#login'
    delete 'logout' => 'main#destroy'
    get 'return_from_login' => 'main#return_from_login'

    get '/comparisons/new2' => 'comparisons#new2'

    # API
    post '/api/create_file', to: 'api#create_file'
    post '/api/get_upload_url', to: 'api#get_upload_url'
    post '/api/close_file', to: 'api#close_file'
    post '/api/list_files', to: 'api#list_files'

    # The priority is based upon order of creation: first created -> highest priority.
    # See how all your routes lay out with "rake routes".

    resources :apps
    resources :biospecimens
    resources :comparisons
    resources :files do
      post 'download', on: :member
    end
    resources :jobs
    resources :notes

    get '/apps/jobs/:app', to: 'apps#index', as: 'appjobs'

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
