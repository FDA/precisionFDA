module ProfileHelper
  def countries
    Country.pluck(:name, :id)
  end

  def dial_codes
    Country.pluck(:dial_code, :id)
      .reject { |i| i[0].empty? }
      .to_h
      .to_a
      .sort
  end

  def user_org_admin?
    return false if @context.guest?
    current_user.id == current_user.org.admin_id
  end
end
