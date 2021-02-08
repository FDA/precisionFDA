# Assets concern.
module AssetsConcern
  # Finds a asset by uid, accessible by current user.
  # @param id [Integer]
  # @return [asset] An Asset Object if it is accessible by user.
  #   raise ApiError if not.
  def find_asset
    @asset = Asset.accessible_by(@context).find_by(uid: params[:id])

    raise ApiError, I18n.t("asset_not_accessible") if @asset.nil?

    @asset
  end
end
