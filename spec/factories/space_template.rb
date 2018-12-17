FactoryBot.define do
  factory :space_template do

    sequence(:name) { |n| "name-#{n}" }
    sequence(:description) { |n| "description-#{n}" }
    private false

    transient do
      nodes []
    end

    after(:create) do |template, evaluator|
      evaluator.nodes.each do |node|
        template.space_template_nodes << SpaceTemplateNode.new(node: node)
      end
    end

  end
end
