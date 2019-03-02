class SeedNewsItems < ActiveRecord::Migration
  def up
    NewsItem.create([
      {
        title: "x",
        content: "y",
        link: "https://example.com",
        video: "https://example.com",
        position: 1,
        published: true
      }])


  end
end
