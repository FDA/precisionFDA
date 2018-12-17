class Job::IOCollection

  delegate :each, to: :records

  def self.build_outputs(job)
    build(Output, job.output_spec, job.run_outputs, project: job.project)
  end

  def self.build_inputs(job)
    build(Input, job.input_spec, job.run_inputs)
  end

  def self.build(record_class, spec, data, options = {})
    records = []

    spec.each do |piece_of_spec|
      data.each do |name, value|
        next unless piece_of_spec[:name] == name
        records.push(record_class.new(piece_of_spec, value, options))
      end
    end

    new(records)
  end

  attr_reader :records

  def initialize(records)
    @records = records
  end

end
