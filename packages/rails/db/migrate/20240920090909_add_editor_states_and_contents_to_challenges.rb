class AddEditorStatesAndContentsToChallenges < ActiveRecord::Migration[6.0]
  def change
    change_table :challenges do |t|
      t.text :info_editor_state, limit: 16.megabytes - 1
      t.text :info_content, limit: 16.megabytes - 1
      t.text :results_editor_state, limit: 16.megabytes - 1
      t.text :results_content, limit: 16.megabytes - 1
      t.text :pre_registration_editor_state, limit: 16.megabytes - 1
      t.text :pre_registration_content, limit: 16.megabytes - 1
    end
  end
end
