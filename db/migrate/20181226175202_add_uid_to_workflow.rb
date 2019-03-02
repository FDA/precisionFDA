class AddUidToWorkflow < ActiveRecord::Migration
  def change
    add_column :workflows, :uid, :string

    reversible do |dir|
      dir.up do
        execute "UPDATE `workflows` SET uid=CONCAT(dxid, '-1')"
        fix_duplicates
        fix_stages
      end
    end

    add_index :workflows, :uid, unique: true
  end

  def fix_stages
    Workflow.find_each do |workflow|
      workflow.update_stages!(
         workflow.stages.map do |stage|
          stage["app_uid"] = App.find_by_dxid(stage["app_dxid"]).try(:uid)
          stage
        end
      )
    end
  end

  def fix_duplicates
    ids = Workflow.group(:dxid).having("count(*) > 1").map(&:dxid)
    ids.each do |dxid|
      Workflow.where(dxid: dxid).order(:id).each_with_index do |file, index|
        next if index == 0

        file.update(uid: "#{file.dxid}-#{index + 1}")
      end
    end
  end
end
