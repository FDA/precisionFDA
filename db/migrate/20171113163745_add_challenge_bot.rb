class AddChallengeBot < ActiveRecord::Migration
  def up
    return unless defined? CHALLENGE_BOT_DX_USER
    return unless defined? CHALLENGE_BOT_PRIVATE_FILES_PROJECT
    return unless defined? CHALLENGE_BOT_PUBLIC_FILES_PROJECT

    user = User.find_or_initialize_by(dxuser: CHALLENGE_BOT_DX_USER)

    user.attributes = {
      private_files_project: CHALLENGE_BOT_PRIVATE_FILES_PROJECT,
      public_files_project: CHALLENGE_BOT_PUBLIC_FILES_PROJECT
    }

    user.save(validate: false)
  end
end
