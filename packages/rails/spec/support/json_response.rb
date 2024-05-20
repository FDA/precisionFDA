# Helper for request of controller specs
module JsonResponse
  def response_body
    JSON.parse(response.body).with_indifferent_access
  end
end
