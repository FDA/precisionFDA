class DxidToUid < ActiveRecord::Migration
  def change
    reversible do |dir|
      dir.up do
        migrate_apps
        migrate_jobs
      end
    end
  end

  def migrate_apps
    App.find_each do |app|
      app.ordered_assets = app.ordered_assets.each_with_object([]) do |asset_dxid, memo|
        asset = Asset.find_by_dxid(asset_dxid)
        memo.push(asset.present? ? asset.uid : asset_dxid)
      end

      app.input_spec = app.input_spec.each_with_object([]) do |input, memo|
        if input["class"] == "file"
          new_input = input.dup
          dxid = new_input["default"]
          file = UserFile.find_by_dxid(dxid)
          new_input["default"] = file.uid if file.present?
          memo << new_input
        else
          memo << input
        end
      end

      app.save
    end
  end

  def migrate_jobs
    Job.find_each do |job|
      job.run_inputs = job.run_inputs.each_with_object({}) do |(name, value), memo|
        file = UserFile.find_by_dxid(value)

        if file.present?
          memo[name] = file.uid
        else
          memo[name] = value
        end
      end
      job.save
    end
  end

end
