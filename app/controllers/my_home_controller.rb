class MyHomeController < ApplicationController
  def index
    flash.now[:success] = "This view can be accessed temporarily in Development or UI-test environments ONLY!"
  end
end
