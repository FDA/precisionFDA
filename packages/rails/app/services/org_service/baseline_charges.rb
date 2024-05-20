module OrgService
  # Shared module for setting baseline charges
  module BaselineCharges
    # Sets user's baseline charges for compute, storage, and data egress
    # @param user [User] User to process tasks for.
    # @param api [DNAnexusAPI] User API object.
    def set_user_baseline_charges!(user, api)
      raw_update_user_baseline_charges!(user, api) if user.charges_baseline.blank?
    end

    def raw_update_user_baseline_charges!(user, api)
      charges = api.user_charges(user)
      if user.singular?
        user.update(charges_baseline: charges)
        return
      end
      # Note(samuel) This is workaround for legacy orgs
      # If every org has baseline charges initialized at different time
      # There will be difficulty upgrading user charges, if all users share billing accounts
      # but use different baselines
      User.set_legacy_org_baseline_charges!(user.org_id, charges)
    rescue StandardError => e
      Rails.logger.error "There was an error during setting the baseline charges for " \
                         "user #{user.dxid}, org handle #{user.org.handle}: #{e.message}"
    end
  end
end
