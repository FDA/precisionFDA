class MyHomeController < ApplicationController
  # temporal action for My Home render
  def index
    flash.now[:success] =
      "This view can be accessed temporarily in Development or UI-test environments ONLY!"
  end
end
