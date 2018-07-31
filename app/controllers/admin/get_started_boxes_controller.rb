module Admin
  class GetStartedBoxesController < BaseController
    before_action :set_admin_get_started_box, only: [:edit, :update, :destroy]

    def index
      @public_boxes = GetStartedBox.visible.positioned
      @private_boxes = GetStartedBox.invisible.positioned
      js public_boxes: @public_boxes,
         private_boxes: @private_boxes
    end

    def new
      @admin_get_started_box = GetStartedBox.new
    end

    def edit
    end

    def create
      @admin_get_started_box = GetStartedBox.new(admin_get_started_box_params)

      if @admin_get_started_box.save
        redirect_to admin_get_started_boxes_path
      else
        render :new
      end
    end

    def update
      if @admin_get_started_box.update(admin_get_started_box_params)
        redirect_to admin_get_started_boxes_path
      else
        render :edit
      end
    end

    def destroy
      @admin_get_started_box.destroy
      head :no_content
    end

    def update_positions
      Array.wrap(params['public_boxes']).each_with_index do |id, index|
        GetStartedBox.update(id, position: index, public: true)
      end

      Array.wrap(params['private_boxes']).each_with_index do |id, index|
        GetStartedBox.update(id, position: index, public: false)
      end

      head :no_content
    end

    private

    def set_admin_get_started_box
      @admin_get_started_box = GetStartedBox.find(params[:id])
    end

    def admin_get_started_box_params
      params.require(:get_started_box).permit(:title, :feature_url, :documentation_url, :description, :public)
    end
  end
end
