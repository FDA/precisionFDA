class SpaceRequest < ActiveRecord::Base
  KIND_LOCK   = :lock_up
  KIND_UNLOCK = :unlock
  STATUS_PENDING   = :pending
  STATUS_COMPLETED = :completed
  STATUS_REJECTED  = :rejected

  belongs_to :space
  belongs_to :user

  enum kind: [KIND_LOCK, KIND_UNLOCK]
  enum status: [STATUS_PENDING, STATUS_COMPLETED, STATUS_REJECTED]
end
