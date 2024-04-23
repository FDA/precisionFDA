module ExpertsHelper
  def options_for_select_experts(users)
    options_for_select(
      users.map do |u|
        org_name = u.org ? u.org.name : "No Organization"
        ["#{u.username} (#{u.full_name.titleize}, #{org_name})", u.username]
      end
    )
  end
end
