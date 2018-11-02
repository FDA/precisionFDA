class UpdateInstanceTypesFromBaseline32To36 < ActiveRecord::Migration
  def up
    change_instance("baseline-32", "baseline-36")
  end
  
  def down
    change_instance("baseline-36", "baseline-32")
  end

  def change_instance(from, to)

    App.find_each do |app|
      if(app[:spec]["instance_type"] == from)
        app[:spec]["instance_type"] = to
        app.save!
      end
    end

  end
end
