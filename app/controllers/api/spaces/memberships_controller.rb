module Api
  module Spaces
    # Space Memberships API controller.
    # rubocop:disable Metrics/ClassLength
    class MembershipsController < ApiController
      include SpaceConcern

      before_action :role_valid?, except: %i(invite can_change_role)
      before_action :can_change_membership?, except: %i(invite can_change_role)
      before_action :space, :fetch_membership, only: %i(invite can_change_role)
      before_action :find_space, :can_edit?, only: %i(invite update)

      # POST /api/spaces/:id/invite
      # Creates new space members.
      def invite
        head(:forbidden) && return unless @membership

        space_invite_form = SpaceInviteForm.new(space_invite_params.merge(space: @space))
        if space_invite_form.valid?
          api = @membership.persisted? ? @context.api : DNAnexusAPI.for_admin
          begin
            invited_emails = space_invite_form.invite(@membership, api)
          rescue StandardError
            error = "An error has occurred during inviting"
          end

          if invited_emails.present?
            message = "The invitations to the space have been sent to the following " \
                              "emails: #{invited_emails.to_sentence}"
            render json: { invited_emails: invited_emails, message: message }, adapter: :json
          else
            render json: { errors: error }, status: :unprocessable_entity, adapter: :json
          end
        else
          errors = errors(space_invite_form.errors&.messages)

          render json: { errors: errors }, status: :unprocessable_entity, adapter: :json
        end
      end

      # Update space member's role.
      def update
        member.with_lock do
          unless membership_service.call(api, space, member, admin_member)
            raise ApiError, "Can't designate user #{member.user.full_name} as #{role}"
          end
        end

        render json: { member: member.user.full_name, role: params[:role] }, adapter: :json
      end

      # Call action to determine the possibility of role changing action
      def can_change_role
        result =
          @space.space_memberships.map do |membership|
            checks = checks_list.each_with_object({}) do |role, all|
              all[role] =
                SpaceMembershipPolicy.can_change_role?(
                  @space,
                  @membership,
                  membership,
                  role,
                )
            end

            { id: membership.id, checks: checks }
          end

        render json: result, adapter: :json
      end

      private

      # Fetch objects necessary for invite.
      def fetch_membership
        @membership = @space.space_memberships.active.find_by(user_id: current_user.id)

        if @membership.nil? && current_user.review_space_admin?
          SpaceMembership.new_by_admin(current_user)
        else
          @membership
        end
      end

      # Adds invitees attributes to fit SpaceInviteForm.
      def space_invite_params
        params.permit(:invitees, :invitees_role, :space_id)
      end

      # Collects validation errors from SpaceInviteForm.
      def errors(errors_attributes)
        errors = []
        errors_messages = errors_attributes
        errors <<  errors_messages[:invitees]
        errors <<  errors_messages[:invitees_role]
        errors << errors_messages[:base]

        errors.flatten.join("\n ") if errors.size.positive?
      end

      def checks_list
        SpaceMembership::ROLES + [SpaceMembership::ENABLE, SpaceMembership::DISABLE]
      end

      def role
        @role ||= (Array(params[:role]) & checks_list).first
      end

      def membership_service
        @membership_service ||= "SpaceMembershipService::To#{role.camelize}".constantize
      end

      def space
        @space ||= Space.find(params[:space_id])
      end

      def admin_member
        @admin_member ||= space.
          space_memberships.
          lead_or_admin.
          find_by(user: current_user)
      end

      def member
        @member ||= space.space_memberships.find(params[:id])
      end

      def api
        @api ||= DIContainer.resolve("api.user")
      end

      def role_valid?
        raise ApiError, "Role '#{params[:role]}' is invalid!" unless role
      end

      def can_change_membership?
        head(:forbidden) unless admin_member
      end
    end
    # rubocop:enable Metrics/ClassLength
  end
end
