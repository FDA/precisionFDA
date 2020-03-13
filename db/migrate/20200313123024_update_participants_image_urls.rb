class UpdateParticipantsImageUrls < ActiveRecord::Migration[5.2]
  def change
    reversible do |dir|
      dir.up do
        query = ActiveRecord::Base.sanitize_sql([%{
          UPDATE participants SET image_url = REPLACE(image_url, '/participants/', 'participants/')
        }])

        ActiveRecord::Base.connection.execute(query)
      end
    end
  end
end
