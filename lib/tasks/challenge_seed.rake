require 'csv'

# rake challenge:seed_truth[...path_to_output_csv.../challenge2-full-output.csv]
desc "Starting seed for Truth Challenge Results"
namespace :challenge do
  task :seed_truth, [:path] => :environment do |task, args|
    TruthChallengeResult.transaction do
      TruthChallengeResult.delete_all
      count = 0
      CSV.foreach(args.path, headers: true, converters: :numeric) do |row|
        row_hash = row.to_hash
        result = {}
        row_hash.each do |key, value|
          _key = key.downcase.strip.gsub(/\./, '_')
          if value.instance_of? String
            _value = value.to_s.strip
            result[_key] = _value if !_value.nil? && _value.length != 0 && _value != '-'
          else
            _value = value
            if !_value.nil?
              _value = _value.to_d if _value.instance_of? Float
              result[_key] = _value
            end
          end
        end
        t = TruthChallengeResult.create!(result)
        count += 1
        puts "#{count}: #{t['entry']}'s entry added"
        puts t.inspect
        # break
      end
    end
  end
end
