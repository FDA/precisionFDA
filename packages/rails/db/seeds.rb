module PrecisionFda
  module Seeders
    extend self

    def create_admin_groups!
      AdminGroup::ROLES.each { |role| AdminGroup.create!(role:) }
    end

    def create_user!
      first_name = ENV.fetch("PFDA_USER_FIRST_NAME", "Pfda")
      last_name = ENV.fetch("PFDA_USER_LAST_NAME", "Default")
      email = ENV.fetch("PFDA_USER_EMAIL", "pfda_default@dnanexus.com")
      dxuser = ENV.fetch("PFDA_USER_DXUSER", "automationtestuser")
      org_handle = ENV.fetch("PFDA_USER_ORG_HANDLE", "automationtestinggmbh")

      user = User.create!(
        dxuser:,
        schema_version: 1,
        first_name:,
        last_name:,
        email:,
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

      user.update!(org:)
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
        user:,
        title: "#{user.last_name}'s challenge note title",
        scope: "public",
        content: "#{user.last_name}'s challenge note content",
      )

      truth_note = Note.create!(
        user:,
        title: "#{user.last_name}'s truth note title",
        content: "#{user.last_name}'s truth note content",
      )

      consistency_note = Note.create!(
        user:,
        title: "#{user.last_name}'s consistency note title",
        content: "#{user.last_name}'s consistency note content",
        scope: "public",
      )

      Discussion.create!(id: TRUTH_DISCUSSION_ID, user:, note: truth_note)
      Discussion.create!(id: CONSISTENCY_DISCUSSION_ID, user:, note: consistency_note)
      Discussion.create!(user:, note: challenge_note)
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
          user:,
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

    def create_participants!
      participants = [
        { title: "Personalis", image_url: "participants/personalis.png", kind: :org },
        { title: "Seracare", image_url: "participants/seracare.png", kind: :org },
        { title: "Sequenom", image_url: "participants/sequenom.png", kind: :org },
        { title: "Emory Genetics Lab", image_url: "participants/emory.png", kind: :org },
        { title: "Roche", image_url: "participants/roche.png", kind: :org },
        { title: "NIH", image_url: "participants/nih.png", kind: :org },
        { title: "Broad Institute", image_url: "participants/broad.png", kind: :org },
        { title: "DNAnexus", image_url: "participants/dnanexus.png", kind: :org },
        { title: "Edico Genome", image_url: "participants/edico.png", kind: :org },
        { title: "Macrogen", image_url: "participants/macrogen.png", kind: :org },
        { title: "Human Longevity Inc.", image_url: "participants/humanlongevity.png", kind: :org },
        { title: "Crystal Genetics", image_url: "participants/crystal_genetics.png", kind: :org },
        { title: "Illumina", image_url: "participants/illumina.png", kind: :org },
        { title: "23andMe", image_url: "participants/23andme.png", kind: :org },
        { title: "GeneDx", image_url: "participants/genedx.png", kind: :org },
        { title: "NIST", image_url: "participants/nist.png", kind: :org },
        { title: "White House Office of Science and Technology Policy", image_url: "participants/ostp.png", kind: :org },
        { title: "American Heart Association", image_url: "participants/aha.png", kind: :org },
        { title: "Baylor College of Medicine", image_url: "participants/baylor.png", kind: :org },
        { title: "Garvan", image_url: "participants/garvan.png", kind: :org },
        { title: "US House of Representatives", image_url: "participants/us-house-of-representatives.png", kind: :org },
        { title: "Natera", image_url: "participants/natera.png", kind: :org },
        { title: "PharmGKB", image_url: "participants/pharmgkb.png", kind: :org },
        { title: "Qiagen", image_url: "participants/qiagen.png", kind: :org },
        { title: "Counsyl", image_url: "participants/counsyl.png", kind: :org },
        { title: "Intel", image_url: "participants/intel.png", kind: :org },
        { title: "Blueprint Genetics", image_url: "participants/blueprint_genetics.png", kind: :org },
        { title: "Centers for Disease Control and Prevention", image_url: "participants/cdc.png", kind: :org },
        { title: "George Washington University", image_url: "participants/george_washington_university.png", kind: :org },
        { title: "NCI", image_url: "participants/nci.png", kind: :org },
        { title: "Georgetown University", image_url: "participants/georgetown_university.png", kind: :org },
        { title: "Veterans Health Administration (VHA) Innovation Ecosystem", image_url: "participants/vha_ie.png", kind: :org },
        { title: "DREAM", image_url: "participants/dream.png", kind: :org },
        { title: "MIODx", image_url: "participants/miodx.png", kind: :org },
        { title: "iReceptor Platform", image_url: "participants/ireceptor.png", kind: :org },
        { title: "Friends of Cancer Research", image_url: "participants/friends_of_cancer_research.png", kind: :org },
        { title: "Dr. Lester Carter", image_url: "participants/lester_carter.jpg", kind: :person },
        { title: "Dr. Euan Ashley", image_url: "participants/euan_ashley.jpg", kind: :person },
        { title: "Dr. Teri Klein", image_url: "participants/teri_klein.jpg", kind: :person },
        { title: "Dr. Dennis P. Wall", image_url: "participants/dennis_wall.jpg", kind: :person },
        { title: "Rachel Goldfeder", image_url: "participants/rachel_goldfeder.png", kind: :person },
        { title: "Hans Nelsen", image_url: "participants/hans_nelsen.jpg", kind: :person },
        { title: "Dr. Russ Altman", image_url: "participants/russ_altman.jpg", kind: :person },
        { title: "Dr. Peter Tonellato", image_url: "participants/peter_tonellato.jpg", kind: :person },
        { title: "Mark Woon", image_url: "participants/mark_woon.jpg", kind: :person },
        { title: "Dr. Snehit Prabhu", image_url: "participants/snehit_prabhu.jpg", kind: :person },
        { title: "Dr. Mark Wright", image_url: "participants/mark_wright.jpg", kind: :person },
      ]

      Participant.create!(participants)
    end

    def create_countries!
      countries = [
        { name: "Afghanistan", dial_code: "+93" },
        { name: "\u00C5land Islands", dial_code: "+358" },
        { name: "Albania", dial_code: "+355" },
        { name: "Algeria", dial_code: "+213" },
        { name: "AmericanSamoa", dial_code: "+1 684" },
        { name: "Andorra", dial_code: "+376" },
        { name: "Angola", dial_code: "+244" },
        { name: "Anguilla", dial_code: "+1 264" },
        { name: "Antarctica", dial_code: "" },
        { name: "Antigua and Barbuda", dial_code: "+1268" },
        { name: "Argentina", dial_code: "+54" },
        { name: "Armenia", dial_code: "+374" },
        { name: "Aruba", dial_code: "+297" },
        { name: "Australia", dial_code: "+61" },
        { name: "Austria", dial_code: "+43" },
        { name: "Azerbaijan", dial_code: "+994" },
        { name: "Bahamas", dial_code: "+1 242" },
        { name: "Bahrain", dial_code: "+973" },
        { name: "Bangladesh", dial_code: "+880" },
        { name: "Barbados", dial_code: "+1 246" },
        { name: "Belarus", dial_code: "+375" },
        { name: "Belgium", dial_code: "+32" },
        { name: "Belize", dial_code: "+501" },
        { name: "Benin", dial_code: "+229" },
        { name: "Bermuda", dial_code: "+1 441" },
        { name: "Bhutan", dial_code: "+975" },
        { name: "Bolivia, Plurinational State of", dial_code: "+591" },
        { name: "Bosnia and Herzegovina", dial_code: "+387" },
        { name: "Botswana", dial_code: "+267" },
        { name: "Brazil", dial_code: "+55" },
        { name: "British Indian Ocean Territory", dial_code: "+246" },
        { name: "Brunei Darussalam", dial_code: "+673" },
        { name: "Bulgaria", dial_code: "+359" },
        { name: "Burkina Faso", dial_code: "+226" },
        { name: "Burundi", dial_code: "+257" },
        { name: "Cambodia", dial_code: "+855" },
        { name: "Cameroon", dial_code: "+237" },
        { name: "Canada", dial_code: "+1" },
        { name: "Cape Verde", dial_code: "+238" },
        { name: "Cayman Islands", dial_code: "+345" },
        { name: "Central African Republic", dial_code: "+236" },
        { name: "Chad", dial_code: "+235" },
        { name: "Chile", dial_code: "+56" },
        { name: "China", dial_code: "+86" },
        { name: "Christmas Island", dial_code: "+61" },
        { name: "Cocos (Keeling) Islands", dial_code: "+61" },
        { name: "Colombia", dial_code: "+57" },
        { name: "Comoros", dial_code: "+269" },
        { name: "Congo, The Democratic Republic of the", dial_code: "+243" },
        { name: "Congo", dial_code: "+242" },
        { name: "Cook Islands", dial_code: "+682" },
        { name: "Costa Rica", dial_code: "+506" },
        { name: "Cote d'Ivoire", dial_code: "+225" },
        { name: "Croatia", dial_code: "+385" },
        { name: "Cuba", dial_code: "+53" },
        { name: "Cyprus", dial_code: "+537" },
        { name: "Czech Republic", dial_code: "+420" },
        { name: "Denmark", dial_code: "+45" },
        { name: "Djibouti", dial_code: "+253" },
        { name: "Dominica", dial_code: "+1 767" },
        { name: "Dominican Republic", dial_code: "+1 849" },
        { name: "Ecuador", dial_code: "+593" },
        { name: "Egypt", dial_code: "+20" },
        { name: "El Salvador", dial_code: "+503" },
        { name: "Equatorial Guinea", dial_code: "+240" },
        { name: "Eritrea", dial_code: "+291" },
        { name: "Estonia", dial_code: "+372" },
        { name: "Ethiopia", dial_code: "+251" },
        { name: "Falkland Islands (Malvinas)", dial_code: "+500" },
        { name: "Faroe Islands", dial_code: "+298" },
        { name: "Fiji", dial_code: "+679" },
        { name: "Finland", dial_code: "+358" },
        { name: "France", dial_code: "+33" },
        { name: "French Guiana", dial_code: "+594" },
        { name: "French Polynesia", dial_code: "+689" },
        { name: "Gabon", dial_code: "+241" },
        { name: "Gambia", dial_code: "+220" },
        { name: "Georgia", dial_code: "+995" },
        { name: "Germany", dial_code: "+49" },
        { name: "Ghana", dial_code: "+233" },
        { name: "Gibraltar", dial_code: "+350" },
        { name: "Greece", dial_code: "+30" },
        { name: "Greenland", dial_code: "+299" },
        { name: "Grenada", dial_code: "+1 473" },
        { name: "Guadeloupe", dial_code: "+590" },
        { name: "Guam", dial_code: "+1 671" },
        { name: "Guatemala", dial_code: "+502" },
        { name: "Guernsey", dial_code: "+44" },
        { name: "Guinea-Bissau", dial_code: "+245" },
        { name: "Guinea", dial_code: "+224" },
        { name: "Guyana", dial_code: "+595" },
        { name: "Haiti", dial_code: "+509" },
        { name: "Holy See (Vatican City State)", dial_code: "+379" },
        { name: "Honduras", dial_code: "+504" },
        { name: "Hong Kong", dial_code: "+852" },
        { name: "Hungary", dial_code: "+36" },
        { name: "Iceland", dial_code: "+354" },
        { name: "India", dial_code: "+91" },
        { name: "Indonesia", dial_code: "+62" },
        { name: "Iran, Islamic Republic of", dial_code: "+98" },
        { name: "Iraq", dial_code: "+964" },
        { name: "Ireland", dial_code: "+353" },
        { name: "Isle of Man", dial_code: "+44" },
        { name: "Israel", dial_code: "+972" },
        { name: "Italy", dial_code: "+39" },
        { name: "Jamaica", dial_code: "+1 876" },
        { name: "Japan", dial_code: "+81" },
        { name: "Jersey", dial_code: "+44" },
        { name: "Jordan", dial_code: "+962" },
        { name: "Kazakhstan", dial_code: "+7 7" },
        { name: "Kenya", dial_code: "+254" },
        { name: "Kiribati", dial_code: "+686" },
        { name: "Korea, Democratic People's Republic of", dial_code: "+850" },
        { name: "Korea, Republic of", dial_code: "+82" },
        { name: "Kuwait", dial_code: "+965" },
        { name: "Kyrgyzstan", dial_code: "+996" },
        { name: "Lao People's Democratic Republic", dial_code: "+856" },
        { name: "Latvia", dial_code: "+371" },
        { name: "Lebanon", dial_code: "+961" },
        { name: "Lesotho", dial_code: "+266" },
        { name: "Liberia", dial_code: "+231" },
        { name: "Libyan Arab Jamahiriya", dial_code: "+218" },
        { name: "Liechtenstein", dial_code: "+423" },
        { name: "Lithuania", dial_code: "+370" },
        { name: "Luxembourg", dial_code: "+352" },
        { name: "Macao", dial_code: "+853" },
        { name: "Macedonia, The Former Yugoslav Republic of", dial_code: "+389" },
        { name: "Madagascar", dial_code: "+261" },
        { name: "Malawi", dial_code: "+265" },
        { name: "Malaysia", dial_code: "+60" },
        { name: "Maldives", dial_code: "+960" },
        { name: "Mali", dial_code: "+223" },
        { name: "Malta", dial_code: "+356" },
        { name: "Marshall Islands", dial_code: "+692" },
        { name: "Martinique", dial_code: "+596" },
        { name: "Mauritania", dial_code: "+222" },
        { name: "Mauritius", dial_code: "+230" },
        { name: "Mayotte", dial_code: "+262" },
        { name: "Mexico", dial_code: "+52" },
        { name: "Micronesia, Federated States of", dial_code: "+691" },
        { name: "Moldova, Republic of", dial_code: "+373" },
        { name: "Monaco", dial_code: "+377" },
        { name: "Mongolia", dial_code: "+976" },
        { name: "Montenegro", dial_code: "+382" },
        { name: "Montserrat", dial_code: "+1664" },
        { name: "Morocco", dial_code: "+212" },
        { name: "Mozambique", dial_code: "+258" },
        { name: "Myanmar", dial_code: "+95" },
        { name: "Namibia", dial_code: "+264" },
        { name: "Nauru", dial_code: "+674" },
        { name: "Nepal", dial_code: "+977" },
        { name: "Netherlands Antilles", dial_code: "+599" },
        { name: "Netherlands", dial_code: "+31" },
        { name: "New Caledonia", dial_code: "+687" },
        { name: "New Zealand", dial_code: "+64" },
        { name: "Nicaragua", dial_code: "+505" },
        { name: "Niger", dial_code: "+227" },
        { name: "Nigeria", dial_code: "+234" },
        { name: "Niue", dial_code: "+683" },
        { name: "Norfolk Island", dial_code: "+672" },
        { name: "Northern Mariana Islands", dial_code: "+1 670" },
        { name: "Norway", dial_code: "+47" },
        { name: "Oman", dial_code: "+968" },
        { name: "Pakistan", dial_code: "+92" },
        { name: "Palau", dial_code: "+680" },
        { name: "Palestinian Territory, Occupied", dial_code: "+970" },
        { name: "Panama", dial_code: "+507" },
        { name: "Papua New Guinea", dial_code: "+675" },
        { name: "Paraguay", dial_code: "+595" },
        { name: "Peru", dial_code: "+51" },
        { name: "Philippines", dial_code: "+63" },
        { name: "Pitcairn", dial_code: "+872" },
        { name: "Poland", dial_code: "+48" },
        { name: "Portugal", dial_code: "+351" },
        { name: "Puerto Rico", dial_code: "+1 939" },
        { name: "Qatar", dial_code: "+974" },
        { name: "R\u00E9union", dial_code: "+262" },
        { name: "Romania", dial_code: "+40" },
        { name: "Russia", dial_code: "+7" },
        { name: "Rwanda", dial_code: "+250" },
        { name: "Saint Barth\u00E9lemy", dial_code: "+590" },
        { name: "Saint Helena, Ascension and Tristan Da Cunha", dial_code: "+290" },
        { name: "Saint Kitts and Nevis", dial_code: "+1 869" },
        { name: "Saint Lucia", dial_code: "+1 758" },
        { name: "Saint Martin", dial_code: "+590" },
        { name: "Saint Pierre and Miquelon", dial_code: "+508" },
        { name: "Saint Vincent and the Grenadines", dial_code: "+1 784" },
        { name: "Samoa", dial_code: "+685" },
        { name: "San Marino", dial_code: "+378" },
        { name: "Sao Tome and Principe", dial_code: "+239" },
        { name: "Saudi Arabia", dial_code: "+966" },
        { name: "Senegal", dial_code: "+221" },
        { name: "Serbia", dial_code: "+381" },
        { name: "Seychelles", dial_code: "+248" },
        { name: "Sierra Leone", dial_code: "+232" },
        { name: "Singapore", dial_code: "+65" },
        { name: "Slovakia", dial_code: "+421" },
        { name: "Slovenia", dial_code: "+386" },
        { name: "Solomon Islands", dial_code: "+677" },
        { name: "Somalia", dial_code: "+252" },
        { name: "South Africa", dial_code: "+27" },
        { name: "South Georgia and the South Sandwich Islands", dial_code: "+500" },
        { name: "Spain", dial_code: "+34" },
        { name: "Sri Lanka", dial_code: "+94" },
        { name: "Sudan", dial_code: "+249" },
        { name: "Suriname", dial_code: "+597" },
        { name: "Svalbard and Jan Mayen", dial_code: "+47" },
        { name: "Swaziland", dial_code: "+268" },
        { name: "Sweden", dial_code: "+46" },
        { name: "Switzerland", dial_code: "+41" },
        { name: "Syrian Arab Republic", dial_code: "+963" },
        { name: "Taiwan, Province of China", dial_code: "+886" },
        { name: "Tajikistan", dial_code: "+992" },
        { name: "Tanzania, United Republic of", dial_code: "+255" },
        { name: "Thailand", dial_code: "+66" },
        { name: "Timor-Leste", dial_code: "+670" },
        { name: "Togo", dial_code: "+228" },
        { name: "Tokelau", dial_code: "+690" },
        { name: "Tonga", dial_code: "+676" },
        { name: "Trinidad and Tobago", dial_code: "+1 868" },
        { name: "Tunisia", dial_code: "+216" },
        { name: "Turkey", dial_code: "+90" },
        { name: "Turkmenistan", dial_code: "+993" },
        { name: "Turks and Caicos Islands", dial_code: "+1 649" },
        { name: "Tuvalu", dial_code: "+688" },
        { name: "Uganda", dial_code: "+256" },
        { name: "Ukraine", dial_code: "+380" },
        { name: "United Arab Emirates", dial_code: "+971" },
        { name: "United Kingdom", dial_code: "+44" },
        { name: "United States", dial_code: "+1" },
        { name: "Uruguay", dial_code: "+598" },
        { name: "Uzbekistan", dial_code: "+998" },
        { name: "Vanuatu", dial_code: "+678" },
        { name: "Venezuela, Bolivarian Republic of", dial_code: "+58" },
        { name: "Viet Nam", dial_code: "+84" },
        { name: "Virgin Islands, British", dial_code: "+1 284" },
        { name: "Virgin Islands, U.S.", dial_code: "+1 340" },
        { name: "Wallis and Futuna", dial_code: "+681" },
        { name: "Yemen", dial_code: "+967" },
        { name: "Zambia", dial_code: "+260" },
        { name: "Zimbabwe", dial_code: "+263" },
      ]

      Country.create!(countries)
    end

    def create_get_started_boxes!
      get_started_boxes = [
        {
          title: "Upload file",
          feature_url: "/files/new",
          documentation_url: "/docs/files",
          description: "Upload files to your private space to use as inputs for apps or comparisons",
          public: true,
          kind: :upload_file,
        },
        {
          title: "Add asset",
          feature_url: "/app_assets/new",
          documentation_url: "/docs/creating_apps#dev-assets",
          description: "Contribute a tarball with software that can be used by apps",
          public: true,
          kind: :add_asset,
        },
        {
          title: "Create app",
          feature_url: "/apps/new",
          documentation_url: "/docs/creating_apps",
          description: "Combine assets with a shell script, and achieve just about anything",
          public: true,
          kind: :create_app,
        },
        {
          title: "Launch app",
          feature_url: "/apps",
          documentation_url: "/docs/apps#apps-listing",
          description: "Run bioinformatics or other Linux-based software on the cloud",
          public: true,
          kind: :launch_app,
        },
        {
          title: "Run comparison",
          feature_url: "/comparisons/new",
          documentation_url: "/docs/comparisons",
          description: "Look at the differences between a test set and a benchmark set of genomic variants",
          public: true,
          kind: :run_comparison,
        },
        {
          title: "Create note",
          feature_url: "/notes",
          documentation_url: "/docs/notes",
          description: "Write and publish rich notes describing your thoughts and your work",
          public: true,
          kind: :create_note,
        },
      ]

      GetStartedBox.create!(get_started_boxes)
    end

    def load_migrations_data!; end

    def run_seed
      ActiveRecord::Base.transaction do
        create_admin_groups! unless Rails.env.test?
        user = create_user!
        create_notes_and_discussions!(user)
        create_challenge_bot!
        create_various_items!
        create_db_clusters!(10)
        create_participants!
        create_countries! unless Rails.env.test?
        create_get_started_boxes!
        load_migrations_data!
      end
    end
  end
end

PrecisionFda::Seeders.run_seed
