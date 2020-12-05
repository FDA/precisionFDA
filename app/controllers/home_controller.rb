# Home - will be the main client enter to the pFDA
class HomeController < ApplicationController
  # temporal action for Home page render
  def index
    flash.now[:success] =
      "This view can be accessed temporarily in Development or UI-test environments ONLY!"
  end
end
