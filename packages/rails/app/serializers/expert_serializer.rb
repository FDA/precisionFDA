# Expert serializer.
class ExpertSerializer < ApplicationSerializer
  attributes(
    :id,
    :user_id,
    :image,
    :state,
    :scope,
    :created_at,
    :updated_at,
    :title,
    :about,
    :blog_title,
    :blog_preview,
    :blog,
    :total_question_count,
    :total_answer_count,
    :total_comment_count,
  )

  delegate :scope, :title, :total_comment_count, to: :object
  def about
    object._about
  end

  def blog_title
    object._blog_title
  end

  # blog_preview - A short preview text of the blog to be displayed in a list as a preview.
  #                Changing the attribute name from _challenge (which is how it is stored
  #                in the 'meta' column) to avoid confusion to the consumers of the API
  #
  def blog_preview
    object._challenge
  end

  # blog - the main body of the blog
  def blog
    object._blog
  end

  def total_question_count
    object.answered_questions.count + object.ignored_questions.count + object.open_questions.count
  end

  def total_answer_count
    object.answered_questions.count
  end
end
