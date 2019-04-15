module Cwl
  class BaseLinkValidator < ActiveModel::EachValidator
    private

    def can_validate_link_type?(record)
      record.errors[:name].empty? && record.errors[:link].empty? &&
          record.appropriate_app_input["class"].downcase != record.link_type.downcase
    end

    def validate_link_type(record, attribute)
      record.errors.add(attribute, :wrong_type,
                        step_name: record.step.name,
                        input_name: record.name,
                        input_class: record.appropriate_app_input["class"],
                        parameter_class: record.link_type
      )
    end
  end
end
