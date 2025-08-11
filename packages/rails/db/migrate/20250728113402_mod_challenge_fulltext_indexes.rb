class ModChallengeFulltextIndexes < ActiveRecord::Migration[6.1]
  def up
    # Drop previously used fulltext index
    execute <<-SQL.squish
        ALTER TABLE challenges
        DROP INDEX ft_challenges_name_description_contents
    SQL

    # For Challenges in pre-registration state
    execute <<-SQL.squish
      ALTER TABLE challenges
      ADD FULLTEXT INDEX ft_challenges_name_description_pre_registration_content
      (name, description, pre_registration_content)
    SQL

    # For Challenges in open, paused and archived state
    execute <<-SQL.squish
      ALTER TABLE challenges
      ADD FULLTEXT INDEX ft_challenges_name_description_info_content
      (name, description, info_content)
    SQL

    # For Challenges in results announced state
    execute <<-SQL.squish
      ALTER TABLE challenges
      ADD FULLTEXT INDEX ft_challenges_name_description_info_content_results_content
      (name, description, info_content, results_content)
    SQL
  end

  def down
    # Remove fulltext indexes
    execute "ALTER TABLE challenges DROP INDEX ft_challenges_name_description_pre_registration_content"
    execute "ALTER TABLE challenges DROP INDEX ft_challenges_name_description_info_content"
    execute "ALTER TABLE challenges DROP INDEX ft_challenges_name_description_info_content_results_content"

    execute <<-SQL.squish
      ALTER TABLE challenges
      ADD FULLTEXT INDEX ft_challenges_name_description_contents
      (name, description, info_content, pre_registration_content)
    SQL
  end
end
