# == Schema Information
#
# Table name: workflows
#
#  id                 :integer          not null, primary key
#  title              :string(255)
#  name               :string(255)
#  dxid               :string(255)
#  user_id            :integer
#  readme             :text(65535)
#  edit_version       :string(255)
#  spec               :text(65535)
#  default_instance   :string(255)
#  scope              :string(255)
#  revision           :integer
#  workflow_series_id :integer
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  uid                :string(255)
#  project            :string(255)
#

require "wdl_object/input"
require "wdl_object/output"
require "wdl_object/workflow/call"

class WDLObject
  class Workflow
    include ActiveModel::Validations
    include WDLObject::Parseable
    include WDLObject::Validatable::InputsOutputs

    validates :name, presence: { message: "is not found!" }
    validates :calls, presence: { message: "statements are not found!" }
    validate :calls_should_be_valid

    validate :inputs_should_be_valid,
             :outputs_should_be_valid,
             :inputs_should_be_unique,
             :outputs_should_be_unique

    attr_reader :raw, :name
    alias_method :to_s, :raw

    def initialize(raw)
      @raw = raw
      @name = parse_section_identifier(raw, section_name)
    end

    def calls
      @calls ||= begin
        calls_with_block = parse_sections(raw, "call", with_identifier: true)

        # try to find if there just a call statements without a block
        calls_without_block = raw.each_line.each_with_object([]) do |line, outputs|
          outputs << line.strip if line =~ /^\s*call\s+[a-zA-Z][a-zA-Z0-9_]+\s*$/
        end

        (calls_with_block + calls_without_block).map do |call_raw|
          Call.new(call_raw)
        end
      end
    end

    def inputs
      @inputs ||= parse_inputs(raw).map do |input_string|
        WDLObject::Input.new(input_string)
      end
    end

    def outputs
      @outputs ||= parse_outputs(raw).map do |output_string|
        WDLObject::Output.new(output_string)
      end
    end

    private

    def section_name
      "workflow"
    end

    def calls_should_be_valid
      calls.each do |call|
        next if call.valid?

        call.errors.full_messages.each do |msg|
          errors.add("base", "call #{msg}")
        end
      end
    end
  end
end
