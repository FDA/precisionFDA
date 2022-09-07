# Challenge serializer.
class ChallengeSerializer < ApplicationSerializer
  attributes(
    :id,
    :name,
    :description,
    :meta,
    :start_at,
    :end_at,
    :created_at,
    :updated_at,
    :status,
    :card_image_url,
    :card_image_id,
    :pre_registration_url,
    :links,
  )

  attribute :followed?, key: :is_followed
  attribute :can_edit?, key: :can_edit
  attribute :space_member?, key: :is_space_member

  def can_edit?
    current_user && object.editable_by?(current_user)
  end

  def followed?
    current_user && object.followed_by?(current_user)
  end

  def space_member?
    current_user && object.space_member?(current_user)
  end

  def links
    return unless current_user

    {}.tap do |links|
      links[:edit] = edit_challenge_path(object) if object.editable_by?(current_user)
      links[:editor] = edit_page_challenge_path(object) if object.editable_by?(current_user)
      if object.accepting_submissions?
        links[:new_submission] = new_challenge_submission_path(challenge_id: object.id,
                                                                   app_dxid: object.app)
      end
    end
  end
end
