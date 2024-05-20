# Common concern.
module CommonConcern
  # Get comments for a single workflow
  def comments_data(object)
    # TODO: to exclude three lines below when redesign will be finished
    @items_from_params = [object]
    @item_path = pathify(object)
    @item_comments_path = pathify_comments(object)

    @comments = []
    @comments = if object.in_space?
      space = item_from_uid(object.scope)
      Comment.
        where(commentable: space, content_object: object).
        order(id: :desc).
        page unsafe_params[:comments_page]
    else
      object.
        root_comments.order(id: :desc).
        page unsafe_params[:comments_page]
    end
    # TODO: add comment_serializer and map to it
    @comments = @comments.
      map { |comment| comment.slice(:id, :body, :title, :user_id, :created_at) }
  end

  # Loads common relations for Class object and
  # sets appropriate instance variables.
  def load_relations(object)
    @notes = object.
      notes.
      real_notes.
      accessible_by(@context).
      order(id: :desc).
      page(unsafe_params[:notes_page])

    @answers = object.
      notes.
      accessible_by(@context).
      answers.order(id: :desc).
      page(unsafe_params[:answers_page])

    @discussions = object.
      notes.
      accessible_by(@context).
      discussions.
      order(id: :desc).page(unsafe_params[:discussions_page])
  end

  # Loads licenses for UserFiles and Assets objects and
  # sets appropriate instance variable.
  def load_licenses(object)
    @licenses = []
    @license = {}

    @license = LicenseSerializer.new(object.license) if object.license
    return unless object.editable_by?(@context)

    @licenses = License.editable_by(@context).map do |license|
      {
        id: license.id,
        uid: license.uid,
        title: license.title,
        created_at_date_time: ApplicationSerializer.new(license).created_at_date_time,
      }
    end
  end

  # Loads common relations for Class object and
  # sets appropriate instance variables.
  # Used in App details method (show)
  #  @param context [Context] The user context.
  #  @return arrays of serialized objects, editable by Context user
  #   @user_notes [Array] -  Note objects.
  #   @user_answers [Array] - Answer objects.
  #   @user_discussions [Array] - Discussion objects.
  def user_notes_objects
    @user_notes = @context.user.
      notes.
      real_notes.
      accessible_by(@context).
      order(id: :desc).
      page(unsafe_params[:notes_page]).
      map { |note| NoteSerializer.new(note) }

    # TODO: create answers & discussions serializers and implement here
    @user_answers = @context.user.
      notes.
      accessible_by(@context).
      answers.order(id: :desc).
      page(unsafe_params[:answers_page])

    @user_discussions = @context.user.
      notes.
      accessible_by(@context).
      discussions.
      order(id: :desc).page(unsafe_params[:discussions_page])
  end

  # Set up a meta_link object
  # @param [object] An object - instance of a Class: App, UserFile, Job, Workflow
  def meta_links(object)
    return {} unless current_user

    {}.tap do |links|
      links[:comments] = pathify_comments(object)
      links[:edit_tags] = api_set_tags_path if
        (object.editable_by?(@context) && object.owned_by?(@context)) ||
        @context.can_administer_site?
    end
  end
end
