# User serializer.
class UserSerializer < ApplicationSerializer
  attributes(
    :id,
    :dxuser,
    :first_name,
    :last_name,
    :email,
  )

  has_one :org
end
