# == Schema Information
#
# Table name: orgs
#
#  id         :integer          not null, primary key
#  handle     :string
#  name       :string
#  admin_id   :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  address    :text
#  duns       :string
#  phone      :string
#  state      :string
#  singular   :boolean
#

class Org < ActiveRecord::Base
  has_many :users
  belongs_to :admin, {class_name: 'User'}

  def real_org?
    !singular
  end

  def self.construct_dxorg(handle)
    raise unless handle.present? && handle =~ /^[0-9a-z][0-9a-z_.]*$/
    "org-pfda..#{handle}"
  end

  def self.featured
    Org.find_by(handle: ORG_EVERYONE_HANDLE)
  end

  def self.real_orgs
    return where(singular: false)
  end

  def dxorg
    Org.construct_dxorg(handle)
  end

  def self.provision_dxorg(context, org, billable = false)
    api = DNAnexusAPI.new(context.token)
    papi = DNAnexusAPI.new(ADMIN_TOKEN)

    raise "We did not expect #{org[:id]} to exist on DNAnexus" if api.entity_exists?(org[:id])

    org = papi.call("org", "new", {handle: org[:handle], name: org[:name]})

    AUDIT_LOGGER.info("The system is about to start provisioning a new dxorg '#{org[:id]}'")

    if billable
      auth = DNAnexusAPI.new(ADMIN_TOKEN, DNANEXUS_AUTHSERVER_URI)
      billing_info = {
        email: "billing@dnanexus.com",
        name: "Elaine Johanson",
        companyName: "FDA",
        address1: "10903 New Hampshire Ave",
        address2: "Bldg. 32 room 2254",
        city: "Silver Spring",
        state: "MD",
        postCode: "20993",
        country: "USA",
        phone: "(301) 706-1836"
      }
      auth.call(org[:dxorg], "updateBillingInformation", {billingInformation: billing_info, autoConfirm: BILLING_CONFIRMATION})
    end

    return org
  end
end
