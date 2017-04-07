User.all.map do |u|
  email = u.email.split(/(^.*)\+.*(@.*)/).join
  puts "#{email} #{u.full_name.titleize}"
end

