# methods for UserFile business-logic
#
module FilesConcern
  include ActiveSupport::Concern
  include ActionView::Helpers::NumberHelper

  def user_real_files(params, context)
    # rubocop:disable Style/SignalException
    scopes = params[:scopes]
    states = params[:states]
    uid = params[:uid]

    files = if params[:editable]
      UserFile.real_files.not_removing.editable_by(context).accessible_by_private
    else
      UserFile.real_files.not_removing.accessible_by(context)
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

    files = files.where(uid: uid) if uid.present?

    files
  end

  def allowed?(state)
    %w(closed closing open).include?(state)
  end

  def determine_scope_name(scope)
    scope = "space" if Space.valid_scope?(scope)
    scope_names = {
      "private" => "My files",
      "public" => "Everyone",
      "featured" => "Featured",
      "space" => "Files",
    }
    scope_names[scope]
  end
end
