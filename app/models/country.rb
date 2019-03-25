# == Schema Information
#
# Table name: countries
#
#  id            :integer          not null, primary key
#  name          :string
#  dial_code     :string
#

class Country < ActiveRecord::Base
  US_STATES_LIST =
    {
      "AL": "Alabama",
      "AK": "Alaska",
      "AS": "American Samoa",
      "AZ": "Arizona",
      "AR": "Arkansas",
      "CA": "California",
      "CO": "Colorado",
      "CT": "Connecticut",
      "DE": "Delaware",
      "DC": "District Of Columbia",
      "FM": "Federated States Of Micronesia",
      "FL": "Florida",
      "GA": "Georgia",
      "GU": "Guam",
      "HI": "Hawaii",
      "ID": "Idaho",
      "IL": "Illinois",
      "IN": "Indiana",
      "IA": "Iowa",
      "KS": "Kansas",
      "KY": "Kentucky",
      "LA": "Louisiana",
      "ME": "Maine",
      "MH": "Marshall Islands",
      "MD": "Maryland",
      "MA": "Massachusetts",
      "MI": "Michigan",
      "MN": "Minnesota",
      "MS": "Mississippi",
      "MO": "Missouri",
      "MT": "Montana",
      "NE": "Nebraska",
      "NV": "Nevada",
      "NH": "New Hampshire",
      "NJ": "New Jersey",
      "NM": "New Mexico",
      "NY": "New York",
      "NC": "North Carolina",
      "ND": "North Dakota",
      "MP": "Northern Mariana Islands",
      "OH": "Ohio",
      "OK": "Oklahoma",
      "OR": "Oregon",
      "PW": "Palau",
      "PA": "Pennsylvania",
      "PR": "Puerto Rico",
      "RI": "Rhode Island",
      "SC": "South Carolina",
      "SD": "South Dakota",
      "TN": "Tennessee",
      "TX": "Texas",
      "UT": "Utah",
      "VT": "Vermont",
      "VI": "Virgin Islands",
      "VA": "Virginia",
      "WA": "Washington",
      "WV": "West Virginia",
      "WI": "Wisconsin",
      "WY": "Wyoming"
    }

  def self.us_states_list
    US_STATES_LIST.values
  end

  def self.state_full_name(code)
    US_STATES_LIST[code.to_sym]
  end

  def self.state_matches_zip_code?(state, zip_code)
    result = ZipCodeAPI.new.zip_code_to_location(zip_code)
    return false unless result

    result_state = Country.state_full_name(result["state"])
    state == result_state
  end

  def usa?
    name == "United States"
  end

  def self.countries_for_codes
    country_codes_array = Country.pluck(:dial_code, :id)
                           .reject {|i| i[0].empty? }
    country_codes_hash = country_codes_array.to_h
    new_hash = {}
    country_codes_hash.keys.each { |key| new_hash[key] = [] }
    country_codes_array.each { |country, id| new_hash[country] << id }
    new_hash
  end
end
