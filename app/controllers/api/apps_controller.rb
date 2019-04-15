module Api
  class AppsController < ApiController
    before_action :validate_app, only: :create

    # Inputs
    #
    # name, title, readme, input_spec, output_spec, internet_access,
    # instance_type, ordered_assets, packages, code, is_new
    #
    # Outputs
    #
    # id (string, only on success): the id of the created app, if success
    # failure (string, only on failure): a message that can be shown to the user due to failure
    def create
      app = create_app(params)

      render json: { id: app.uid }
    rescue => e
      render json: { errors: [e.message], status: 422 }
    end

    def import
      if presenter.valid?
        app, asset = nil

        ActiveRecord::Base.transaction do
          asset = DockerImporter.import(
            context: @context,
            attached_image: params[:attached_image],
            docker_image: presenter.docker_image
          )

          presenter.asset = asset

          opts = params[:format] == "wdl" ? presenter.build : App::CwlParser.parse(presenter)

          app = create_app(opts)
        end

        render json: { id: app.uid, asset_uid: asset.try(:uid) }
      else
        render json: { errors: presenter.errors.full_messages }, status: :unprocessable_entity
      end
    rescue Psych::SyntaxError
      render json: { errors: ["CWL has incorrect format"] }, status: :unprocessable_entity
    rescue => e
      logger.error e.message
      logger.error e.backtrace.join("\n")
      render json: { errors: ["Something went wrong"] }, status: :unprocessable_entity
    end

    private

    def create_app(opts)
      AppService.create_app(@context, opts)
    end

    def presenter
      @presenter ||= begin
        klass = params[:format] == "wdl" ? App::WdlPresenter : CwlPresenter
        klass.new(params[:file])
      end
    end

    def validate_app
      name = params[:name]

      if !name.is_a?(String) || name.empty?
        fail "The app 'name' must be a nonempty string."
      end

      unless name =~ /^[a-zA-Z0-9._-]+$/
        fail "The app 'name' can only contain the characters A-Z, a-z, 0-9, " \
             "'.' (period), '_' (underscore) and '-' (dash)."
      end

      title = params[:title]

      if !title.is_a?(String) || title.empty?
        fail "The app 'title' must be a nonempty string."
      end

      readme = params[:readme]

      unless readme.is_a?(String)
        fail "The app 'Readme' must be a string."
      end

      internet_access = params[:internet_access]

      unless [true, false].include?(internet_access)
        fail "The app 'Internet Access' must be a boolean, true or false."
      end

      instance_type = params[:instance_type]

      unless Job::INSTANCE_TYPES.include?(instance_type)
        fail "The app 'instance type' must be one of: " \
             "#{Job::INSTANCE_TYPES.keys.join(', ')}."
      end

      packages = params[:packages] || []

      if !packages.is_a?(Array) || !packages.all? { |a| a.is_a?(String) }
        fail "The app 'packages' must be an array of package names (strings)."
      end

      packages.sort!.uniq!

      packages.each do |package|
        unless UBUNTU_PACKAGES.bsearch { |p| package <=> p }
          fail "The package '#{package}' is not a valid Ubuntu package."
        end
      end

      params[:packages] = packages

      code = params[:code]

      fail "The app 'code' must be a string." unless code.is_a?(String)

      ordered_assets = params[:ordered_assets] || []

      if !ordered_assets.is_a?(Array) ||
         !ordered_assets.all? { |a| a.is_a?(String) }
        fail "The app 'assets' must be an array of asset uids (strings)."
      end

      missed_assets = ordered_assets.group_by do |asset_uid|
        Asset.closed.accessible_by(@context).where(uid: asset_uid).exists?
      end[false]

      unless missed_assets.blank?
        fail "The app assets with uids '#{missed_assets.join(', ')}' do " \
             "not exist or are not accessible by you."
      end

      validate_app_input_spec
      validate_app_output_spec
    end

    def validate_app_input_spec
      input_spec = params[:input_spec] || []

      if !input_spec.is_a?(Array) || !input_spec.all? { |s| s.is_a?(Hash) }
        fail "The app 'input spec' must be an array of hashes."
      end

      inputs_seen = Set.new

      params[:input_spec] = input_spec.each_with_index.map do |spec, i|
        i_name = spec["name"]

        if !i_name.is_a?(String) || i_name.empty?
          fail "The #{(i + 1).ordinalize} input is missing a name."
        end

        unless i_name =~ /^[a-zA-Z_][0-9a-zA-Z_]*$/
          fail "The input name '#{i_name}' contains invalid characters. " \
               "It must start with a-z, A-Z or '_', " \
               "and continue with a-z, A-Z, '_' or 0-9."
        end

        if inputs_seen.include?(i_name)
          fail "Duplicate definitions for the input named '#{i_name}'."
        end

        inputs_seen << i_name

        i_class = spec["class"]

        if !i_class.is_a?(String) || i_class.empty?
          fail "The input named '#{i_name}' is missing a type."
        end

        unless App::VALID_IO_CLASSES.include?(i_class)
          fail "The input named '#{i_name}' contains an invalid type. " \
               "Valid types are: #{App::VALID_IO_CLASSES.join(', ')}."
        end

        i_optional = spec["optional"]

        unless [true, false].include?(i_optional)
          fail "The input named '#{i_name}' is missing " \
               "the 'optional' designation."
        end

        i_label = spec["label"]

        unless i_label.is_a?(String)
          fail "The input named '#{i_name}' is missing a label."
        end

        i_help = spec["help"]

        unless i_help.is_a?(String)
          fail "The input named '#{i_name}' is missing help text."
        end

        i_default = spec["default"]

        if i_default
          unless compatible(i_default, i_class)
            fail "The default value provided for the input named " \
                 "'#{i_name}' is not of the right type."
          end

          # Fix for JSON ambiguity of float/int for ints.
          i_default = i_default.to_i if i_class == "int"
        end

        i_choices = spec["choices"].try(:uniq)

        if i_choices.present?
          unless i_choices.is_a?(Array)
            fail "The 'choices' (possible values) provided for the input " \
                 "named '#{i_name}' is not an array."
          end

          unless i_choices.all? { |choice| compatible(choice, i_class) }
            fail "The 'choices' (possible values) provided for the input " \
                 "named '#{i_name}' is incompatible with the input type."
          end

          unless %w(string int float).include?(i_class)
            fail "You cannot provide 'choices' (possible values) for " \
                 "the input named '#{i_name}' because it's not of type " \
                 "'string' or 'int' or 'float'."
          end
        end

        i_patterns = spec["patterns"].try(:uniq)

        if i_patterns.present?
          unless i_patterns.is_a?(Array)
            fail "The filename patterns provided for the input named " \
                 "'#{i_name}' is not an array"
          end

          if i_class != "file"
            fail "You cannot provide filename patterns for " \
                 "the non-file input named '#{i_name}'."
          end

          if i_patterns.any?(&:empty?)
            fail "The filename patterns provided for the input named " \
                 "'#{i_name}' is not an array of nonempty strings."
          end
        end

        ret = {
          "name": i_name,
          "class": i_class,
          "optional": i_optional,
          "label": i_label,
          "help": i_help,
        }

        ret["default"] = i_default if !i_default.nil?
        ret["choices"] = i_choices if i_choices
        ret["patterns"] = i_patterns if i_patterns

        ret
      end
    end

    def validate_app_output_spec
      output_spec = params[:output_spec] || []

      if !output_spec.is_a?(Array) || !output_spec.all? { |s| s.is_a?(Hash) }
        fail "The app 'output spec' must be an array of hashes."
      end

      outputs_seen = Set.new

      params[:output_spec] = output_spec.each_with_index.map do |spec, i|
        i_name = spec["name"]

        if !i_name.is_a?(String) || i_name.empty?
          fail "The #{(i + 1).ordinalize} output is missing a name."
        end

        unless i_name =~ /^[a-zA-Z_][0-9a-zA-Z_]*$/
          fail "The output name '#{i_name}' contains invalid characters. " \
               "It must start with a-z, A-Z or '_', " \
               "and continue with a-z, A-Z, '_' or 0-9."
        end

        if outputs_seen.include?(i_name)
          fail "Duplicate definitions for the output named '#{i_name}'."
        end

        outputs_seen << i_name

        i_class = spec["class"]

        if !i_class.is_a?(String) || i_class.empty?
          fail "The output named '#{i_name}' is missing a type."
        end

        unless App::VALID_IO_CLASSES.include?(i_class)
          fail "The output named '#{i_name}' contains an invalid type. " \
               "Valid types are: #{App::VALID_IO_CLASSES.join(', ')}."
        end

        i_optional = spec["optional"]

        unless [true, false].include?(i_optional)
          fail "The output named '#{i_name}' is missing the 'optional'" \
               "designation."
        end

        i_label = spec["label"]

        unless i_label.is_a?(String)
          fail "The output named '#{i_name}' is missing a label."
        end

        i_help = spec["help"]

        unless i_help.is_a?(String)
          fail "The output named '#{i_name}' is missing help text."
        end

        i_patterns = spec["patterns"].try(:uniq)

        if i_patterns.present?
          unless i_patterns.is_a?(Array)
            fail "The filename patterns provided for the output named " \
                 "'#{i_name}' is not an array"
          end

          if i_class != "file"
            fail "You cannot provide filename patterns for " \
                 "the non-file output named '#{i_name}'."
          end

          if i_patterns.any?(&:empty?)
            fail "The filename patterns provided for the output named " \
                 "'#{i_name}' is not an array of nonempty strings."
          end
        end

        ret = {
          "name": i_name,
          "class": i_class,
          "optional": i_optional,
          "label": i_label,
          "help": i_help,
        }

        ret["patterns"] = i_patterns if i_patterns

        ret
      end
    end

    def compatible(value, klass)
      if klass == "file"
        value.is_a?(String)
      elsif klass == "int"
        value.is_a?(Numeric) && (value.to_i == value)
      elsif klass == "float"
        value.is_a?(Numeric)
      elsif klass == "boolean"
        [true, false].include?(value)
      elsif klass == "string"
        value.is_a?(String)
      end
    end
  end
end
