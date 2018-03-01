module Admin
  class ActivityReportsController < BaseController

    def index      
      js other_data: other_data
    end

    def data_upload
      render json: FilesUploaded.new(start_date, end_date)
    end

    def data_download
      render json: FilesDownloaded.new(start_date, end_date)
    end

    def data_generated
      render json: FilesGenerated.new(start_date, end_date)
    end

    def app_created
      render json: AppsCreated.new(start_date, end_date)
    end

    def app_published
      render json: AppsPublished.new(start_date, end_date)
    end

    def app_run
      render json: AppsRun.new(start_date, end_date)
    end

    def user_access_requested
      render json: UsersAccessRequested.new(start_date, end_date)
    end

    def user_logged_in
      render json: UsersLoggedIn.new(start_date, end_date)
    end

    def user_viewed
      render json: UsersViewed.new(start_date, end_date)
    end

    def job_run
      render json: JobsRun.new(start_date, end_date)
    end

    def job_failed
      render json: JobsFailed.new(start_date, end_date)
    end

    def submissions_created
      render json: SubmissionsCreated.new(start_date, end_date)
    end

    def users_signed_up_for_challenge
      render json: UsersSignedUpForChallenge.new(start_date, end_date)
    end

    private

    def start_date
      Time.parse(permitted_params[:date_at])
    rescue
      Date.today.beginning_of_day
    end

    def end_date
      Time.parse(permitted_params[:date_to])
    rescue
      Time.now
    end

    def permitted_params
      params.permit(:date_at, :date_to)
    end

    def other_data
      {
        apps: Event::AppCreated.count,
        public_apps: Event::AppPublished.count,
        runtime: Event::JobClosed.sum_by(:runtime).to_i,
        data_storage: Event::FileCreated.sum_by(:file_size).to_i - Event::FileDeleted.sum_by(:file_size).to_i,
        number_of_files: Event::FileCreated.count - Event::FileDeleted.count
      }
    end

  end
end
