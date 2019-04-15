class Workflow
  module Common
    def generate_slot_id
      slot_id = (36**15 - rand * 36**14).round.to_s(36)[1..-1]

      "stage-#{slot_id}"
    end
  end
end
