class Job::IOCollection

  delegate :each, to: :records

  def self.build(spec, data)
    records = []

    spec.each do |piece_of_spec|
      data.each do |name, value|
        next unless piece_of_spec[:name] == name
        records.push(Record.new(piece_of_spec, value))
      end
    end

    new(records)
  end

  def initialize(records)
    @records = records
  end

  private

  attr_reader :records

end
