require_relative "migrate/20180516114442_seed_news_items"
require_relative "migrate/20180510104759_create_get_started_boxes"
require_relative "migrate/20180629093507_create_participants"
require_relative "migrate/20190212131903_create_countries.rb"

module PrecisionFda
  module Seeders
    extend self

    def create_admin_groups!
      AdminGroup::ROLES.each { |role| AdminGroup.create!(role: role) }
    end

    def create_user!
      first_name = ENV.fetch("PFDA_USER_FIRST_NAME", "Alice")
      last_name = ENV.fetch("PFDA_USER_LAST_NAME", "Black")
      email = ENV.fetch("PFDA_USER_EMAIL", "alice.black@alice.black.com")
      dxuser = ENV.fetch("PFDA_USER_DXUSER", "automationtestuser")
      org_handle = ENV.fetch("PFDA_USER_ORG_HANDLE", "automationtestinggmbh")

      user = User.create!(
        dxuser: dxuser,
        schema_version: 1,
        first_name: first_name,
        last_name: last_name,
        email: email,
        normalized_email: email,
        pricing_map: CloudResourceDefaults::PRICING_MAP,
        job_limit: CloudResourceDefaults::JOB_LIMIT,
        total_limit: CloudResourceDefaults::TOTAL_LIMIT,
        resources: CloudResourceDefaults::RESOURCES,
      )

      org = Org.create!(
        handle: org_handle,
        name: "#{last_name}'s org",
        admin: user,
        address: "703 Market",
        duns: "",
        phone: "",
        state: "complete",
        singular: false,
      )

      user.update!(org: org)
      user
    end

    def create_challenge_bot!
      User.create!(
        dxuser: CHALLENGE_BOT_DX_USER,
        private_files_project: CHALLENGE_BOT_PRIVATE_FILES_PROJECT,
        public_files_project: CHALLENGE_BOT_PUBLIC_FILES_PROJECT,
        first_name: "Challenge",
        last_name: "Bot",
        email: "challengebot+123@dnanexus.com",
        pricing_map: CloudResourceDefaults::PRICING_MAP,
        job_limit: CloudResourceDefaults::JOB_LIMIT,
        total_limit: CloudResourceDefaults::TOTAL_LIMIT,
        resources: CloudResourceDefaults::RESOURCES,
      )
    end

    def create_notes_and_discussions!(user)
      challenge_note = Note.create!(
        user: user,
        title: "#{user.last_name}'s challenge note title",
        scope: "public",
        content: "#{user.last_name}'s challenge note content",
      )

      truth_note = Note.create!(
        user: user,
        title: "#{user.last_name}'s truth note title",
        content: "#{user.last_name}'s truth note content",
      )

      consistency_note = Note.create!(
        user: user,
        title: "#{user.last_name}'s consistency note title",
        content: "#{user.last_name}'s consistency note content",
        scope: "public",
      )

      Discussion.create!(id: TRUTH_DISCUSSION_ID, user: user, note: truth_note)
      Discussion.create!(id: CONSISTENCY_DISCUSSION_ID, user: user, note: consistency_note)
      Discussion.create!(user: user, note: challenge_note)
    end

    def create_various_items!
      MetaAppathon.create!(
        handle: "app-a-thon-in-a-box",
        name: "meta appathon title placeholder",
        start_at: 2.weeks.ago,
        end_at: 2.weeks.from_now,
      )
    end

    def create_db_clusters!(count)
      (1..count).each do |i|
        user = User.where.not(private_files_project: nil).order(Arel.sql("rand()")).first

        cluster = DbCluster.new(
          user: user,
          name: "Test db cluster #{i}",
          status: DbCluster.statuses.keys.sample,
          dxid: "dbcluster-#{SecureRandom.hex(12)}",
          project: user.private_files_project,
          dx_instance_class: DbCluster::DX_INSTANCE_CLASSES.keys.sample,
          engine: DbCluster.engines.keys.sample,
          engine_version: ["5.6", "5.7"].sample,
          host: "my-test-db-#{i}.rds.amazonaws.com",
          port: "3306",
          description: "Some description #{i}",
          status_as_of: Time.current - rand(500_000),
          scope: Scopes::SCOPE_PRIVATE,
        )

        cluster.tag_list.add("DB Cluster")
        cluster.save
      end
    end

    def load_migrations_data!
      SeedNewsItems.new.up
      CreateGetStartedBoxes.new.up
      CreateParticipants.new.migrate_data
      CreateCountries.migrate_data unless Rails.env.test?
    end

    def run_seed
      ActiveRecord::Base.transaction do
        create_admin_groups! unless Rails.env.test?
        user = create_user!
        create_notes_and_discussions!(user)
        create_challenge_bot!
        create_various_items!
        create_db_clusters!(10)
        load_migrations_data!
      end
    end
  end
end

PrecisionFda::Seeders.run_seed
