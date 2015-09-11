# == Schema Information
#
# Table name: users
#
#  id                          :integer          not null, primary key
#  dxuser                      :string
#  private_files_project       :string
#  public_files_project        :string
#  private_comparisons_project :string
#  public_comparisons_project  :string
#  open_files_count            :integer
#  closing_files_count         :integer
#  pending_comparisons_count   :integer
#  schema_version              :integer
#  created_at                  :datetime         not null
#  updated_at                  :datetime         not null
#

class User < ActiveRecord::Base

  # The "schema_version" field is used to denote the schema
  # associated with this user on the platform. Changing the
  # Rails schema (for example, adding a new whatever_project
  # field in user) should increase the current schema below
  # so that users who log in and whose schema_version is
  # lower will get migrated.
  CURRENT_SCHEMA = 1

  has_many :biospecimens
  has_many :user_files
end
