module AppathonsHelper
  def flag_image_tag(icon, opts)
    image_tag("appathons/icons/#{icon}.png", opts)
  end
end
