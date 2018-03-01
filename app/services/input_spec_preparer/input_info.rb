class InputSpecPreparer::InputInfo

  attr_reader :run_inputs, :dx_run_input

  def initialize
    @files = []
    @run_inputs = {}
    @dx_run_input = {}
  end

  def push_file(file)
    files.push(file)
  end

  def push_run_input(key, value, dx_value)
    run_inputs[key] = value
    dx_run_input[key] = dx_value || value
  end

  def uniq_files
    files.uniq(&:id)
  end

  def file_dxids
    files.map(&:dxid)
  end

  def file_ids
    uniq_files.map(&:id)
  end

  private

  attr_reader :files

end
