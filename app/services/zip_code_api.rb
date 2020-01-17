class ZipCodeAPI
  def initialize
    @application_key = ENV["ZIP_CODE_API_APPLICATION_KEY"]
  end

  def zip_code_to_location(zip_code)
    uri = URI("#{build_url}info.json/#{zip_code}/degrees")
    call(uri)
  end

  def call(uri)
    Net::HTTP.start(uri.host, uri.port, {read_timeout: 180, use_ssl: true}) do |http|
      handle_response(
        http.get(uri.path)
      )
    end
  end

  private

  def build_url
    "https://www.zipcodeapi.com/rest/#{@application_key}/"
  end

  def handle_response(response)
    response.value
    JSON.parse(response.body)
  rescue Net::HTTPClientException => e
    if e.message =~ /^4/
      return false
    else
      raise e, "#{e.message}. #{response.body}", e.backtrace
    end
  end
end
