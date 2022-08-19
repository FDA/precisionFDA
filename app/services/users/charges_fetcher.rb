module Users
  # Fetches and calculates user charges from API.
  class ChargesFetcher
    class << self
      def exceeded_charges_limit?(api, user)
        charges = fetch(api, user)

        charges[:totalCharges] >= user.total_limit
      end

      def fetch(api, user)
        current_charges = api.user_charges(user)
        charges_baseline = user.charges_baseline || {}

        current_charges.each_with_object({}) do |(name, amount), memo|
          value = [amount.to_f - charges_baseline[name].to_f, 0].max
          memo[name] = value
          memo[:totalCharges] = memo[:totalCharges].to_f + value
        end
      end
    end
  end
end
