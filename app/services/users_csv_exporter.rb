class UsersCsvExporter

  def self.export_active_users
    csv = CSV.generate { |csv_string| csv_string << %w(id first_name last_name email created_at last_login) }

    limit = 100
    offset = 0

    loop do
      users = User.real
                .where.not(id: Invitation.guest.select(:id))
                .order(created_at: :desc)
                .limit(limit)
                .offset(offset)

      users.each do |user|
        csv << CSV.generate_line([
                                   user.dxuser,
                                   user.first_name,
                                   user.last_name,
                                   user.email,
                                   user.created_at,
                                   user.last_login
                                 ])
      end

      break if users.length < limit
      offset += limit
    end

    csv
  end

end
