namespace :db do
  namespace :migrate do
    desc "Archives old DB migration files"
    task archive: :environment do
      archive_directory = "db/migrate/archive"
      FileUtils.mkdir_p(archive_directory)
      FileUtils.mv(Dir["db/migrate/*.rb"], archive_directory)
    end
  end
end
