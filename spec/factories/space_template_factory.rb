# == Schema Information
#
# Table name: space_templates
#
#  id          :integer          not null, primary key
#  name        :string(255)
#  description :text(65535)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  private     :boolean          default(FALSE), not null
#  user_id     :integer
#

FactoryBot.define do
  factory :space_template do

    sequence(:name) { |n| "name-#{n}" }
    sequence(:description) { |n| "description-#{n}" }
    private { false }

    transient do
      nodes { [] }
    end

    after(:create) do |template, evaluator|
      evaluator.nodes.each do |node|
        template.space_template_nodes << SpaceTemplateNode.new(node: node)
      end
    end

  end
end
