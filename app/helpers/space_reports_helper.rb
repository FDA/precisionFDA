module SpaceReportsHelper
  def generate_report(user, data, filters)
    """
      <h3>Interaction Report</h3>
      <div>Report date: #{Date.today.strftime("%m/%d/%Y")}</div>
      <div>Report by: #{user.full_name}</div>
      <br>
      <div>Filters</div>
      <div>Start date: #{filters[:dates][:start_date]}</div>
      <div>End date: #{filters[:dates][:end_date]}</div>
      <div>Users: #{filters[:users] || "all"}</div>

      #{content_objects(data)}
    """
  end

  def content_objects(data)
    result = ""
    data.each do |content_type|
      object_type = content_type[0]
      objects = content_type[1]

      raw = """
        <h5>#{object_type.upcase}</h5>
        <div>Items found: #{objects.size}</div>
        <br>
        <table>
        #{content_object(objects)}
        </table>
      """
      result.concat(raw)
    end

    result
  end

  def content_object(data)
    result = ""
    data.each do |item|
      raw = """
        <tr>
          <td>
            <div>User: #{item[:user_fullname]}</div>
          </td>
          <td>
            <div>Created at: #{item[:created_at]}</div>
          </td>
        </tr>
        <tr>
          <td>
            <div>#{item[:object_name]}</div>
          </td>
        </tr>
      """
      result.concat(raw)
    end

    result
  end
end
