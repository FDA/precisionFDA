class MetaValidator < ActiveModel::EachValidator
  MAX_LENGTH = 16_777_215

  def validate_each(entity, attribute, value)
    if value.to_json.length > MAX_LENGTH
      entity.errors.add(attribute, :too_long, { count: MAX_LENGTH })
    end
  end
end
