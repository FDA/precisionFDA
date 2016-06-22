require 'csv'

# rake challenge:seed_truth[app/assets/csv/challenge2-full-output.csv]
desc "Starting seed for Truth Challenge Results"
namespace :challenge do
  task :seed_truth, [:path] => :environment do |task, args|
    TruthChallengeResult.transaction do
      # TruthChallengeResult.delete_all
      CSV.foreach(args.path, headers: true) do |row|
        row_hash = row.to_hash
        result = {}
        row_hash.each do |key, value|
          _key = key.downcase.strip.gsub(/\./, '_')
          _value = value.to_s.strip
          result[_key] = _value if _value.length != 0 && _value != '-'
        end
        # TruthChallengeResult.create!(result)
        puts "#{result['entry']}'s entry added"
        # puts result.inspect
        break
      end
    end
  end
end
