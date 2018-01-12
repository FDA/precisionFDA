class Event::Attributes

  Attribute = Struct.new(:name, :db_name)
  UnknownAttributeError = Class.new(StandardError)

  def initialize
    @attributes = []
  end

  def add(name, db_name)
    attributes << Attribute.new(name, db_name)
  end

  def find_by_name(name)
    event = attributes.detect { |attribute| attribute.name == name }

    return event if event.present?

    raise UnknownAttributeError
  end

  def prepare_data(data)
    attributes.each_with_object({}) do |attribute, new_data|
      new_data[attribute.db_name] = data[attribute.name]
    end
  end

  private

  attr_reader :attributes

end
