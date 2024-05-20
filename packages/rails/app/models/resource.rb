# == Schema Information
#
# Table name: resources
#
#  id                   :integer          not null, primary key
#  user_id              :integer
#  user_file_id         :integer
#  parent_id            :integer
#  parent_type          :string
#  url                  :string
#  meta                 :text(65535)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
class Resource < ApplicationRecord
end
