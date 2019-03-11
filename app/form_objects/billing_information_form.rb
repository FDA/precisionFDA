class BillingInformationForm
  include ActiveModel::Model
  def self.attributes
   %i(

      dxuser
      email
      name
      companyName
      address1
      address2
      city
      state
      postCode
      country
      phone
      purchaseOrder
      additionalInfo
    )
  end
  attr_accessor(*attributes )

end