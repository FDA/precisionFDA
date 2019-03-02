module InternalUid
  extend ActiveSupport::Concern

  included do
    before_validation :generate_uid
    validates :uid, :dxid, presence: true

    scope :origin, -> { where("#{table_name}.uid LIKE ?", '%-1' ) }

    private

    def generate_uid
      return if persisted?

      self.uid = "#{dxid}-#{self.class.where(dxid: dxid).count + 1}"
    end
  end

end
