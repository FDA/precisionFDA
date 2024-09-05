# Controller for data portals ui
class DataPortalsController < ApplicationController
  layout "react", only: %i(index show)

  def index; end
end
