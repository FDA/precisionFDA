# == Schema Information
#
# Table name: news_items
#
#  id         :integer          not null, primary key
#  title      :string(255)
#  link       :string(255)
#  when       :date
#  content    :text(65535)
#  user_id    :integer
#  video      :string(255)
#  position   :integer          default(0), not null
#  published  :boolean
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class NewsItem < ApplicationRecord
  paginates_per 10

  belongs_to :user
  validates :link, :video, url: true
  validates :title, presence: true

  scope :published, -> { where(published: true) }
  scope :positioned, -> { order("position ASC") }
  after_create :set_position

  before_save :make_video_url_embedded

  def href
    link || "#"
  end

  private
  def make_video_url_embedded
    if video =~ /youtube/ && video !~ /embed/
      self[:video].sub!(/watch\?v=/,'embed/')
    end
  end

  def set_position
    self.position = NewsItem.order('position ASC').first.position - 1 rescue 0;
    save
  end
end
