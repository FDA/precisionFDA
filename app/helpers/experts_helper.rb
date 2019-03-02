module ExpertsHelper
  def options_for_select_experts(users)
    options_for_select(
      users.map do |u|
        ["#{u.username} (#{u.full_name.titleize}, #{u.org.name})", u.username]
      end
    )
  end
end
