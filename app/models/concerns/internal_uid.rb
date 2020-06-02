module InternalUid
  extend ActiveSupport::Concern

  included do
    before_validation :generate_uid
    validates :uid, :dxid, presence: true

    scope :origin, -> { where("#{table_name}.uid LIKE ?", '%-1' ) }

    private

    def generate_uid
      return if persisted?

      self.uid = "#{dxid}-#{max_uid_number + 1}"
    end

    def max_uid_number
      self.class.where(dxid: dxid).pluck(:uid).map { |uid| uid[/(?<=-)\d+$/].to_i }.max.to_i
    end
  end
end
