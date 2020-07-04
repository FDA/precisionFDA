# methods for UserFile business-logic
#
module FilesConcern
  include ActiveSupport::Concern

  def user_real_files(params, context)
    # rubocop:disable Style/SignalException
    scopes = params[:scopes]
    states = params[:states]

    files = if params[:editable]
      UserFile.real_files.editable_by(context).accessible_by_private
    else
      UserFile.real_files.accessible_by(context)
    end

    if scopes.present?
      check_scope!
      files = files.where(scope: scopes)
    end

    if states.present?
      fail "Invalid states" unless states.is_a?(Array) && states.all? { |state| allowed?(state) }

      files = files.where(state: params["states"])
    end
    # rubocop:enable Style/SignalException

    files
  end

  def allowed?(state)
    %w(closed closing open).include?(state)
  end

  def determine_scope_name(scope)
    case scope
    when "private" then "My files"
    when "public" then "Explore"
    when "featured" then "Featured"
    end
  end
end
