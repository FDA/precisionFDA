# frozen_strting_literal: true

# Message class to use with ApiExceptionHander
class Message
  class << self
    def not_found(content = "")
      content.blank? ? "Not found" : "#{content} is not found"
    end

    def bad_request(error = "")
      ["Bad request", error].compact.join(" ")
    end

    def not_allowed(message = "")
      ["You are not allowed to perform this request.", message].compact.join(" ")
    end
  end
end
