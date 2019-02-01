class CopyService

  def initialize(api:, user:)
    @api = api
    @user = user
  end

  def copy(entity, scope)
    Copies.wrap(
      copier_class(entity).new(user: user, api: api).copy(entity, scope)
    )
  end

  private

  attr_reader :api, :user

  def copier_class(entity)
    case entity
    when UserFile   then FileCopier
    when Job        then JobCopier
    when App        then AppCopier
    when Note       then NoteCopier
    when Comparison then ComparisonCopier
    when Workflow   then WorkflowCopier
    else
      raise "'#{entity.class}' class is not supported yet"
    end
  end

end
