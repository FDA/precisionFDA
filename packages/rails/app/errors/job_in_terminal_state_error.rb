# Job termimation error
class JobInTerminalStateError < StandardError
  def initialize(dxid)
    msg = "Job #{dxid} is in terminal state and can not be terminated."
    super(msg)
  end
end
