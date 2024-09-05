class CopyService
  class ComparisonCopier
    def initialize(api:, user:, file_copier: nil)
      @api = api
      @user = user
      @file_copier = file_copier || FileCopier.new(api: api, user: user)
    end

    def copy(comparison, scope)
      new_comparison = comparison.dup
      new_comparison.scope = scope
      new_comparison.save!

      copy_dependencies(new_comparison, comparison, scope)
      new_comparison
    end

    private

    attr_reader :api, :user, :file_copier

    def copy_dependencies(new_comparison, comparison, scope)
      comparison.inputs.map do |input|
        new_input = input.dup
        new_input.user_file = file_copier.copy(input.user_file, scope).first
        raise "ComparisonInput is invalid!" if new_input.user_file.blank?
        new_comparison.inputs << new_input
      end

      new_comparison.outputs = file_copier.copy(comparison.outputs, scope).all
      new_comparison.save!
    end
  end
end
