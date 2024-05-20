class AnalysesController < ApplicationController
  include CloudResourcesConcern

  before_action :check_total_charges_limit, only: :new

  layout "react", only: [:new]

  def new
    # rendered by react
  end
end
