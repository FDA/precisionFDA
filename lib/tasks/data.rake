namespace :data do
  desc "Seed basic entities into the database"
  task seed_models: :environment do
    User.transaction do
      george = User.find_or_initialize_by(dxuser: "george.fdauser")
      george.update!(
        private_files_project: "project-BgbZ27Q0F3xvq3JgY02VGpb3",
        public_files_project: "project-BgbZ27j0F3Yb1f8XQQ2z1xjQ",
        private_comparisons_project: "project-BgbZ27Q0bYz6475PP42gjbP9",
        public_comparisons_project: "project-BgbZ2800zZqp0qk1Qj2VvKP2",
        open_files_count: 0,
        closing_files_count: 0,
        pending_comparisons_count: 0,
        schema_version: 1
      )

      evan = User.find_or_initialize_by(dxuser: "eworley.fda")
      evan.update!(
        private_files_project: "project-Bgggq7Q0VvgYy1K3GbjpPfG5",
        public_files_project: "project-Bgggq7j003pzF4zY50967jQv",
        private_comparisons_project: "project-Bgggq7Q0fPx7Fj1JFxjZFYP3",
        public_comparisons_project: "project-Bgggq8009FP0KxQK809G6Bjg",
        open_files_count: 0,
        closing_files_count: 0,
        pending_comparisons_count: 0,
        schema_version: 1
      )

      fahd = User.find_or_initialize_by(dxuser: "fahdoo_fda1")
      fahd.update!(
        private_files_project: "project-Bgj75980Y9XQKxQK809G6KGK",
        public_files_project: "project-Bgj759Q0XKbz5zzJ489Kb8gY",
        private_comparisons_project: "project-Bgj75980byj44J962j98g8qB",
        public_comparisons_project: "project-Bgj759Q0QXYVz65ZBJjpjPBz",
        open_files_count: 0,
        closing_files_count: 0,
        pending_comparisons_count: 0,
        schema_version: 1
      )

      na12878 = Biospecimen.find_or_initialize_by(name: "NA12878")
      na12878.update!(description: "CEPH/Utah pedigree 1463, mother of proband", user_id: george.id)

      UserFile.find_or_initialize_by(dxid: "file-Bb1FG900bZ430X20Zk86Y6V3").update!(
        project: "project-BgbZ27j0F3Yb1f8XQQ2z1xjQ",
        name: "SRR504516.vcf.gz",
        state: "closed",
        user_id: george.id,
        biospecimen_id: na12878.id,
        public: true,
        file_size: 2307445
      )

      UserFile.find_or_initialize_by(dxid: "file-Bb1FG9Q0bZ4Gvj6fYk858Py1").update!(
        project: "project-BgbZ27j0F3Yb1f8XQQ2z1xjQ",
        name: "SRR504516.vcf.gz.tbi",
        state: "closed",
        user_id: george.id,
        biospecimen_id: na12878.id,
        public: true,
        file_size: 230078
      )
    end
  end
end
