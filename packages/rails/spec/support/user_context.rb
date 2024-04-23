# Use user_context instead stubbing Context. Useful for testing serializers or other
# tight coupled user related classes.
module UserContext
  def user_context(record_owner)
    Context.new(record_owner.id, record_owner.dxid, "token", 1.day.after, record_owner.org.id)
  end
end
