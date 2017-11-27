class MetaValidator < ActiveModel::EachValidator

  MAX_LENGTH = 50000

  def validate_each(entity, attribute, value)

    if value.to_json.length > MAX_LENGTH
      entity.errors.add(attribute)
    end

  end

end
