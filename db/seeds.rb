first_name = ENV.fetch('PFDA_USER_FIRST_NAME', 'Alice')
last_name = ENV.fetch('PFDA_USER_LAST_NAME', 'Black')
email = ENV.fetch('PFDA_USER_EMAIL', 'alice.black@alice.black.com')
dxuser = ENV.fetch('PFDA_USER_DXUSER', 'automationtestuser')
org_handle = ENV.fetch('PFDA_USER_ORG_HANDLE', 'automationtestinggmbh')

ActiveRecord::Base.transaction do
  user = User.create!(
    dxuser: dxuser,
    schema_version: 1,
    first_name: first_name,
    last_name: last_name,
    email: email,
    normalized_email: email
  )

  org = Org.create!(
    handle: org_handle,
    name: "#{last_name}'s org",
    admin_id: user.id,
    address: "703 Market",
    duns: "",
    phone: "",
    state: "complete",
    singular: false
  )

  user.update!(org_id: org.id)

  challenge_note = Note.create!(
    user: user,
    title: "#{last_name}'s challenge note title",
    scope: "public",
    content: "#{last_name}'s challenge note content",
  )

  truth_note = Note.create!(
    user: user,
    title: "#{last_name}'s truth note title",
    content: "#{last_name}'s truth note content",
  )

  consistency_note = Note.create!(
    user: user,
    title: "#{last_name}'s consistency note title",
    content: "#{last_name}'s consistency note content",
    scope: 'public'
  )

  # Create discussions
  Discussion.create!(
    id: TRUTH_DISCUSSION_ID,
    user: user,
    note: truth_note
  )

  Discussion.create!(
    id: CONSISTENCY_DISCUSSION_ID,
    user: user,
    note: consistency_note
  )

  Discussion.create!(
    user: user,
    note: challenge_note
  )

  MetaAppathon.create!(
    handle: "app-a-thon-in-a-box",
    name: "meta appathon title placeholder",
    start_at: 2.weeks.ago,
    end_at: 2.weeks.from_now
  )

  User.create!(
    dxuser: CHALLENGE_BOT_DX_USER,
    private_files_project: CHALLENGE_BOT_PRIVATE_FILES_PROJECT,
    public_files_project: CHALLENGE_BOT_PUBLIC_FILES_PROJECT
  )
end
