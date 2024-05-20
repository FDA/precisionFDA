namespace :challenges do
  desc "Send challenge results to users"
  task results: :environment do |_, args|
    test_email = ARGV[1]
    files = Dir["./NCI-CPTAC_results/*"]

    files.each do |file_name|
      if !File.directory? file_name
        File.open(file_name) do |file|
          username = File.basename(file).split('_').last.chomp(".xlsx")
          user_id = User.find_by_dxuser(username)
          if user_id.present?
            send_result_email(file, user_id, test_email)
          end
        end
      end
    end
  end
end

def send_result_email(file, user_id, test_email)
  NotificationsMailer.challenge_results(file, user_id, test_email).deliver_now!
end