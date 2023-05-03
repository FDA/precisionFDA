module Api
  module Spaces
    # Space Memberships API controller.
    # rubocop:disable Metrics/ClassLength
    class MembershipsController < ApiController
      include SpaceConcern

      before_action :find_space, :can_edit?, only: %i(invite update)
      before_action :role_valid?, :can_change_membership?, only: %i(update)
      before_action :fetch_membership, only: %i(invite)

      # POST /api/spaces/:id/invite
      # Creates new space members.
      def invite
        space_invite_form = SpaceInviteForm.new(space_invite_params.merge(
          space: @space,
          current_user: @context.user,
        ))

        if space_invite_form.valid?
          membership =
            if @membership.nil? && @context.user.review_space_admin?
              @space.space_memberships.active.find_by(user: @space.host_lead)
            else
              @membership
            end

          api = membership.persisted? ? @context.api : DIContainer.resolve("api.admin")

          begin
            invited_emails = space_invite_form.invite(membership, api)
          rescue StandardError => e
            error = e.message
            logger.error error
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
          unless membership_service.call(api, @space, member, admin_member)
            raise ApiError, "Can't designate user #{member.user.full_name} as #{role}"
          end
        end

        render json: { member: member.user.dxuser, role: role }, adapter: :json
      end

      private

      # Fetch objects necessary for invite.
      def fetch_membership
        @membership = @space.space_memberships.active.find_by(user: current_user)

        head(:forbidden) unless @membership || current_user.review_space_admin?
      end

      # Adds invitees attributes to fit SpaceInviteForm.
      def space_invite_params
        params.permit(:invitees, :invitees_role, :space_id, :side)
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

      def all_roles
        SpaceMembership::ROLES + [SpaceMembership::ENABLE, SpaceMembership::DISABLE]
      end

      def role
        @role ||= (Array(params[:role]) & all_roles).first
      end

      def role_valid?
        raise ApiError, "Role '#{params[:role]}' is invalid!" unless role
      end

      def membership_service
        @membership_service ||= "SpaceMembershipService::To#{role.camelize}".constantize
      end

      def admin_member
        @admin_member ||= @space.
          space_memberships.
          lead_or_admin.
          find_by(user: current_user)
      end

      def member
        @member ||= @space.space_memberships.find(params[:id])
      end

      def api
        @api ||= DNAnexusAPI.new(RequestContext.instance.token)
      end

      def can_change_membership?
        head(:forbidden) unless admin_member
      end
    end
    # rubocop:enable Metrics/ClassLength
  end
end
