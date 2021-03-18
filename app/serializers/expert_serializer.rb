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
    :blog,
    :total_answer_count,
    :total_comment_count,
  )

  def title
    object.title
  end

  def about
    object._about
  end

  def blog_title
    object._blog_title
  end

  def blog
    object._blog
  end

  def total_answer_count
    object.answered_questions.count + object.ignored_questions.count + object.open_questions.count
  end

  def total_comment_count
    object.total_comment_count
  end
end
