class AddChallengeBot < ActiveRecord::Migration
  def up
    return unless defined? CHALLENGE_BOT_DX_USER
    return unless defined? CHALLENGE_BOT_PRIVATE_FILES_PROJECT
    return unless defined? CHALLENGE_BOT_PUBLIC_FILES_PROJECT

    user = User.new(
      dxuser: CHALLENGE_BOT_DX_USER,
      private_files_project: CHALLENGE_BOT_PRIVATE_FILES_PROJECT,
      public_files_project: CHALLENGE_BOT_PUBLIC_FILES_PROJECT
    )
    user.save(validate: false)
  end

  def down
    return unless defined? CHALLENGE_BOT_DX_USER

    User.where(dxuser: CHALLENGE_BOT_DX_USER).delete_all
  end

end
