class AddFulltextIndexes < ActiveRecord::Migration[6.1]
  def up
    # For Challenges table
    execute <<-SQL.squish
      ALTER TABLE challenges
      ADD FULLTEXT INDEX ft_challenges_name_description_contents
      (name, description, info_content, pre_registration_content)
    SQL

    # For Expert blogs
    execute <<-SQL.squish
      ALTER TABLE experts
      ADD FULLTEXT INDEX ft_experts_meta (meta)
    SQL

    # For Expert Q&A
    execute <<-SQL.squish
      ALTER TABLE expert_questions
      ADD FULLTEXT INDEX ft_expert_questions_body (body)
    SQL

    execute <<-SQL.squish
      ALTER TABLE expert_answers
      ADD FULLTEXT INDEX ft_expert_answers_body (body)
    SQL
  end

  def down
    # Remove fulltext indexes
    execute "ALTER TABLE challenges DROP INDEX ft_challenges_name_description_contents"
    execute "ALTER TABLE experts DROP INDEX ft_experts_meta"
    execute "ALTER TABLE expert_questions DROP INDEX ft_expert_questions_body"
    execute "ALTER TABLE expert_answers DROP INDEX ft_expert_answers_body"
  end
end
