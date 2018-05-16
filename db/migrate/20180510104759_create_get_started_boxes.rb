class CreateGetStartedBoxes < ActiveRecord::Migration
  def up
    GetStartedBox.create(
      [
        {
          title: 'Upload file',
          feature_url: '/files/new',
          documentation_url: '/docs/files',
          description: 'Upload files to your private space to use as inputs for apps or comparisons',
          public: true,
          kind: :upload_file,
        },
        {
          title: 'Add asset',
          feature_url: '/app_assets/new',
          documentation_url: '/docs/creating_apps#dev-assets',
          description: 'Contribute a tarball with software that can be used by apps',
          public: true,
          kind: :add_asset,
        },
        {
          title: 'Create app',
          feature_url: '/apps/new',
          documentation_url: '/docs/creating_apps',
          description: 'Combine assets with a shell script, and achieve just about anything',
          public: true,
          kind: :create_app,
        },
        {
          title: 'Launch app',
          feature_url: '/apps',
          documentation_url: '/docs/apps#apps-listing',
          description: 'Run bioinformatics or other Linux-based software on the cloud',
          public: true,
          kind: :launch_app,
        },
        {
          title: 'Run comparison',
          feature_url: '/comparisons/new',
          documentation_url: '/docs/comparisons',
          description: 'Look at the differences between a test set and a benchmark set of genomic variants',
          public: true,
          kind: :run_comparison,
        },
        {
          title: 'Create note',
          feature_url: '/notes',
          documentation_url: '/docs/notes',
          description: 'Write and publish rich notes describing your thoughts and your work',
          public: true,
          kind: :create_note,
        },
      ]
    )
  end

  def down
    GetStartedBox.delete_all
  end
end
