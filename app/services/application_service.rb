# The base service for all the services
class ApplicationService
  def self.call(*args, &block)
    new(*args, &block).call
  end
end
