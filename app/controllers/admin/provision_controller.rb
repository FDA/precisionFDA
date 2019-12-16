module Admin
  # Responsible for users provisioning.
  class ProvisionController < BaseController
    include ErrorProcessable
    include Naming

    before_action :init_provision_params, only: %i(provision_new_user), if: -> { request.post? }

    STEP_1 = "step1".freeze
    STEP_2 = "step2".freeze
    STEP_3 = "step3".freeze
    STEP_4 = "step4".freeze

    def provision_new_user
      if request.get?
        @state = STEP_1
        @invitations = Invitation.
          includes(space_invitations: :space).
          order(id: :desc).
          page(params[:page])

        render "admin/provision/provision_new_user"
        return
      end

      case unsafe_params[:state]
      when STEP_2
        step_2
      when STEP_3
        begin
          step_3
        rescue GenericError
          nil
        end
      when STEP_4
        step_4
      end
    end

    private

    def init_provision_params
      @inv = unsafe_params[:inv]
      @invitation = Invitation.find(@inv)

      if @invitation.user
        editable_params = User.provision_params(@invitation.user_id)
        @first_name = clean_param(unsafe_params[:first_name] || editable_params[:first_name])
        @last_name = clean_param(unsafe_params[:last_name] || editable_params[:last_name])
        @email = clean_param(unsafe_params[:email] || editable_params[:email])
      else
        @first_name = clean_param(unsafe_params[:first_name] || @invitation.first_name)
        @last_name = clean_param(unsafe_params[:last_name] || @invitation.last_name)
        @email = clean_param(unsafe_params[:email] || @invitation.email)
      end

      username = User.construct_username(@first_name, @last_name)
      @suggested_username = find_unused_username(username)
      @org = "#{@first_name} #{@last_name} (#{@suggested_username})"
      @org_handle = @suggested_username
      @address1 = clean_param(unsafe_params[:address1] || @invitation.address1)
      @address2 = clean_param(unsafe_params[:address2] || @invitation.address2)
      @postal_code = clean_param(unsafe_params[:postal_code] || @invitation.postal_code)
      @country = clean_param(unsafe_params[:country] || @invitation.country.name)
      @city = clean_param(unsafe_params[:city] || @invitation.city)
      @us_state = clean_param(unsafe_params[:us_state] || @invitation.us_state)
      @full_phone = clean_param(unsafe_params[:full_phone] || @invitation.full_phone)
      @duns = clean_param(unsafe_params[:duns] || @invitation.duns)
    end

    def clean_param(param)
      param.to_s.strip
    end

    def step_2
      @state = STEP_2
    end

    def step_3
      errors_verifiable_attributes = {
        first_name: @first_name,
        last_name: @last_name,
        email: @email,
        org: @org,
        org_handle: @org_handle,
      }

      @errors = add_errors(errors_verifiable_attributes)

      if @errors.any?
        @state = STEP_2
        raise GenericError, "Errors encountered"
      end

      @warnings = add_warnings(@invitation, @org, @org_handle, @suggested_username)
      @state = STEP_3
    end

    def step_4
      provision_params = {
        org: @org,
        username: @suggested_username,
        org_handle: @org_handle,
        email: @email,
        first_name: @first_name,
        last_name: @last_name,
        address: @address1,
        duns: @duns,
        phone: @full_phone,
        singular: true,
      }

      service = DIContainer.resolve("orgs.provisioner")
      service.call(@user, @invitation, provision_params)

      @state = STEP_4
    end
  end
end
