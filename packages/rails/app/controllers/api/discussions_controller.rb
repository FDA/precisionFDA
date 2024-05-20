module Api
  # Discussions API controller.
  class DiscussionsController < ApiController
    include Paginationable
    include Sanitizable

    before_action :require_login_or_guest

    # POST /api/discussions
    def create
      response = https_apps_client.discussion_create(sanitize_field(params[:discussion], "content"))
      render json: response, adapter: :json
    end

    # PUT /api/discussions
    def update
      response = https_apps_client.discussion_update(params[:id], sanitize_field(params[:discussion], "content"))
      render json: response, adapter: :json
    end

    # GET /api/discussions
    def index
      response = https_apps_client.discussions_list(unsafe_params)
      render json: { discussions: response }, adapter: :json
    end

    # GET /api/discussions/:id
    def show
      response = https_apps_client.discussion_show(params[:id])
      render json: response, adapter: :json
    end

    # DELETE /api/discussions/:id
    def destroy
      response = https_apps_client.discussion_destroy(params[:id])
      render json: response, adapter: :json
    end

    # DELETE /api/discussions/:id/answers/:answer_id
    def answer_destroy
      response = https_apps_client.answer_destroy(params[:discussion_id], params[:answer_id])
      render json: response, adapter: :json
    end

    # DELETE /api/discussions/:id/comments/:comment_id
    def comment_destroy
      response = https_apps_client.comment_destroy(params[:discussion_id], params[:comment_id])
      render json: response, adapter: :json
    end

    # DELETE /api/discussions/:id/answers/:answer_id/comments/:comment_id
    def answer_comment_destroy
      response = https_apps_client.answer_comment_destroy(
        params[:discussion_id],
        params[:answer_id],
        params[:comment_id],
      )
      render json: response, adapter: :json
    end

    # GET /api/discussions/:id/attachments
    # the id in path is actually note_id, will refactor later
    def attachments
      response = https_apps_client.note_attachments(params[:id])
      render json: { attachments: response }, adapter: :json
    end

    # GET /api/discussions/:id/describe
    # used by CLI.
    def describe
      response = https_apps_client.cli_discussion_describe(params[:id])
      render json: response, adapter: :json
    end
    # GET /api/discussions/:id/answers/:answer_id
    def answer_show
      response = https_apps_client.answer_show(params[:discussion_id], params[:answer_id])
      render json: response, adapter: :json
    end

    # PUT /api/discussions/:id/answers/:answer_id
    def answer_update
      response = https_apps_client.answer_update(params[:discussion_id], params[:answer_id], sanitize_field(params[:answer], "content"))
      render json: response, adapter: :json
    end

    # POST /api/discussions/:id/publish
    def publish
      response = https_apps_client.discussion_publish(params[:discussion])
      render json: response, adapter: :json
    end

    # POST /api/discussions/:id/answers
    def answer_create
      response = https_apps_client.answer_create(params[:discussion_id], sanitize_field(params[:answer], "content"))
      render json: response, adapter: :json
    end

    # POST /api/discussions/:id/answers/:answer_id/publish
    def answer_publish
      response = https_apps_client.answer_publish(params[:discussion_id], sanitize_field(params[:answer], "content"))
      render json: response, adapter: :json
    end

    # POST /api/discussions/:id/comments
    def discussion_comment_create
      response = https_apps_client.discussion_comment_create(params[:id], sanitize_field(params[:comment], "content"))
      render json: response, adapter: :json
    end

    # PUT /api/discussions/:id/comments/:comment_id
    def discussion_comment_update
      response = https_apps_client.discussion_comment_update(params[:discussion_id],
                                                             params[:comment_id],
                                                             sanitize_field(params[:comment], "content"))
      render json: response, adapter: :json
    end

    # GET /api/discussions/:id/comments/:comment_id
    def discussion_comment_show
      response = https_apps_client.discussion_comment_show(params[:discussion_id],
                                                           params[:comment_id])
      render json: response, adapter: :json
    end

    # GET /api/discussions/:id/answers/:answer_id/comments/:comment_id
    def answer_comment_show
      response = https_apps_client.answer_comment_show(params[:discussion_id],
                                                       params[:answer_id],
                                                       params[:comment_id])
      render json: response, adapter: :json
    end

    # POST /api/discussions/:id/answers/:answer_id/comments
    def answer_comment_create
      response = https_apps_client.answer_comment_create(params[:discussion_id],
                                                         params[:answer_id],
                                                         sanitize_field(params[:comment], "content"))
      render json: response, adapter: :json
    end

    # PUT /api/discussions/:id/answers/:answer_id/comments/:comment_id
    def answer_comment_update
      response = https_apps_client.answer_comment_update(params[:discussion_id],
                                                         params[:answer_id],
                                                         params[:comment_id],
                                                         sanitize_content(params[:comment]))
      render json: response, adapter: :json
    end
  end
end
