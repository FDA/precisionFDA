module ParticipantsManager

  def self.save(context, participant, params)
    file = UserFile.accessible_by(context).find_by_uid(params[:node_dxid])
    file_id = file.id if file && file.state == "closed" && file.file_size <= 5000000

    participant.node_id = file_id
    participant.title = params[:title]
    participant.image_url = params[:image_url]

    return unless participant.valid?

    if participant.node_id_changed?
      participant.image_url = DNAnexusAPI.new(context.token).generate_permanent_link(file)
    end

    participant.save
  end

end

