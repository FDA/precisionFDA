# == Schema Information
#
# Table name: dbclusters
#
#  id                :bigint           not null, primary key
#  dxid              :string(255)      not null
#  name              :string(255)      not null
#  status            :integer          not null
#  scope             :string(255)      not null
#  user_id           :integer          not null
#  project           :string(255)      not null
#  dx_instance_class :string(255)      not null
#  engine            :integer          not null
#  engine_version    :string(255)      not null
#  host              :string(255)
#  port              :string(255)
#  description       :string(255)
#  status_as_of      :datetime
#  uid               :string(255)      not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
class DbCluster < ApplicationRecord
  self.table_name = "dbclusters"

  include Auditor
  include Licenses
  include Permissions
  include TagsContainer
  include ObjectLocation
  include CommonPermissions
  include InternalUid
  include EnumSortable

  paginates_per 10

  belongs_to :user

  has_one :licensed_item, as: :licenseable, dependent: :destroy
  has_one :license, through: :licensed_item
  has_many :accepted_licenses, through: :license
  has_many :properties, -> { where(target_type: "dbCluster") }, foreign_key: "target_id"

  STATUS_CREATING = "creating".freeze
  STATUS_AVAILABLE = "available".freeze
  STATUS_STOPPING = "stopping".freeze
  STATUS_STOPPED = "stopped".freeze
  STATUS_STARTING = "starting".freeze
  STATUS_TERMINATING = "terminating".freeze
  STATUS_TERMINATED = "terminated".freeze

  ALLOWED_ENGINE_VERSIONS = %w(
    8.0.mysql_aurora.3.04.1
    11.9
    12.9
    13.9
    14.6
  ).freeze

  # TODO(samuel) validate that I'm not starting db_std1_x1, db_mem1_x96 instance
  DX_INSTANCE_CLASSES = {
    "db_std1_x2" => "DB Baseline 1 x 2",
    "db_mem1_x2" => "DB Mem 1 x 2",
    "db_mem1_x4" => "DB Mem 1 x 4",
    "db_mem1_x8" => "DB Mem 1 x 8",
    "db_mem1_x16" => "DB Mem 1 x 16",
    "db_mem1_x32" => "DB Mem 1 x 32",
    "db_mem1_x48" => "DB Mem 1 x 48",
    "db_mem1_x64" => "DB Mem 1 x 64",
  }.freeze

  ENGINE_MYSQL = "aurora-mysql".freeze
  ENGINE_POSTGRESQL = "aurora-postgresql".freeze

  validates :name, :engine, :engine_version, :status, :scope,
            :status_as_of, :project, :dx_instance_class, :user_id, presence: true

  validates :dxid, :uid, uniqueness: { case_sensitive: true }
  validates :dx_instance_class, inclusion: { in: DX_INSTANCE_CLASSES.keys }
  validates :engine, inclusion: { in: [ENGINE_MYSQL, ENGINE_POSTGRESQL] }
  validates :engine_version, inclusion: { in: ALLOWED_ENGINE_VERSIONS }

  enum engine: {
    ENGINE_MYSQL => 0,
    ENGINE_POSTGRESQL => 1,
  }

  enum status: {
    STATUS_AVAILABLE => 0,
    STATUS_CREATING => 1,
    STATUS_STOPPING => 2,
    STATUS_STOPPED => 3,
    STATUS_STARTING => 4,
    STATUS_TERMINATING => 5,
    STATUS_TERMINATED => 6,
  }

  alias_attribute :title, :name

  def klass
    "db-cluster"
  end
end
