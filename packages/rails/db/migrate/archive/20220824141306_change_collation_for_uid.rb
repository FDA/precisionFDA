# This migration is to correct the case-insensitive indexes on uid
# e.g. platform returns two distinct file uids:
#      file-GG2z6Gj01VV90YbpFXZg77zY
#      file-GG2z6gj01VV90YbpFXZg77zy
# which are distinct but will cause UniqueConstraintViolationException in the pfda db
class ChangeCollationForUid < ActiveRecord::Migration[6.1]
  def up
    execute("ALTER TABLE apps MODIFY dxid varchar(255) CHARACTER SET utf8 COLLATE utf8_bin;")
    execute("ALTER TABLE apps MODIFY uid varchar(255) CHARACTER SET utf8 COLLATE utf8_bin;")
    execute("ALTER TABLE dbclusters MODIFY dxid varchar(255) CHARACTER SET utf8 COLLATE utf8_bin;")
    execute("ALTER TABLE dbclusters MODIFY uid varchar(255) CHARACTER SET utf8 COLLATE utf8_bin;")
    execute("ALTER TABLE jobs MODIFY dxid varchar(255) CHARACTER SET utf8 COLLATE utf8_bin;")
    execute("ALTER TABLE jobs MODIFY uid varchar(255) CHARACTER SET utf8 COLLATE utf8_bin;")
    execute("ALTER TABLE nodes MODIFY dxid varchar(255) CHARACTER SET utf8 COLLATE utf8_bin;")
    execute("ALTER TABLE nodes MODIFY uid varchar(255) CHARACTER SET utf8 COLLATE utf8_bin;")
    execute("ALTER TABLE workflows MODIFY dxid varchar(255) CHARACTER SET utf8 COLLATE utf8_bin;")
    execute("ALTER TABLE workflows MODIFY uid varchar(255) CHARACTER SET utf8 COLLATE utf8_bin;")
  end

  def down
    execute("ALTER TABLE apps MODIFY dxid varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci;")
    execute("ALTER TABLE apps MODIFY uid varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci;")
    execute("ALTER TABLE dbclusters MODIFY dxid varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci;")
    execute("ALTER TABLE dbclusters MODIFY uid varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci;")
    execute("ALTER TABLE jobs MODIFY dxid varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci;")
    execute("ALTER TABLE jobs MODIFY uid varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci;")
    execute("ALTER TABLE nodes MODIFY dxid varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci;")
    execute("ALTER TABLE nodes MODIFY uid varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci;")
    execute("ALTER TABLE workflows MODIFY dxid varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci;")
    execute("ALTER TABLE workflows MODIFY uid varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci;")
  end
end
