namespace :challenges do
  desc "Send challenge results to users"
  task results: :environment do
    files = Dir["./NCI-CPTAC_results/*"]

    files.each do |file_name|
      if !File.directory? file_name
        File.open(file_name) do |file|
          send_result_email file
        end
      end
    end
  end
end

def send_result_email file
  NotificationsMailer.challenge_results(file).deliver_now!
end