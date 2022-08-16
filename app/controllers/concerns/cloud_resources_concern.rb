# Concern of cloud resources
module CloudResourcesConcern
  COMPUTE_RESOURCE_LABELS = [
    { value: "baseline-2", label: "Baseline 2", pricing: 0.286 },
    { value: "baseline-4", label: "Baseline 4", pricing: 0.572 },
    { value: "baseline-8", label: "Baseline 8", pricing: 1.144 },
    { value: "baseline-16", label: "Baseline 16", pricing: 2.288 },
    { value: "baseline-36", label: "Baseline 36", pricing: 5.148 },
    { value: "himem-2", label: "High Mem 2", pricing: 0.474 },
    { value: "himem-4", label: "High Mem 4", pricing: 0.948 },
    { value: "himem-8", label: "High Mem 8", pricing: 1.896 },
    { value: "himem-16", label: "High Mem 16", pricing: 3.792 },
    { value: "himem-32", label: "High Mem 32", pricing: 7.584 },
    { value: "hidisk-2", label: "High Disk 2", pricing: 0.372 },
    { value: "hidisk-4", label: "High Disk 4", pricing: 0.744 },
    { value: "hidisk-8", label: "High Disk 8", pricing: 1.488 },
    { value: "hidisk-16", label: "High Disk 16", pricing: 2.976 },
    { value: "hidisk-36", label: "High Disk 36", pricing: 6.696 },
    { value: "gpu-8", label: "GPU 8", pricing: 7.584 },
  ].freeze

  # TODO(samuel) define 
  # https://confluence.internal.dnanexus.com/display/PFDA/Cloud+Resource+Governance+and+Enhanced+User+Administration#CloudResourceGovernanceandEnhancedUserAdministration-ConstrainDatabaseInstanceTypesandPresentPrice
  DATABASE_RESOURCE_LABELS = [
    { value: "db_std1_x2", label: "DB Baseline 1 x 2", pricing: 0.273 },
    { value: "db_mem1_x2", label: "DB Mem 1 x 2", pricing: 0.967 },
    { value: "db_mem1_x4", label: "DB Mem 1 x 4", pricing: 1.933 },
    { value: "db_mem1_x8", label: "DB Mem 1 x 8", pricing: 3.867 },
    { value: "db_mem1_x16", label: "DB Mem 1 x 16", pricing: 7.733 },
    { value: "db_mem1_x32", label: "DB Mem 1 x 32", pricing: 15.467 },
    { value: "db_mem1_x48", label: "DB Mem 1 x 48", pricing: 23.200 },
    { value: "db_mem1_x64", label: "DB Mem 1 x 64", pricing: 30.933 },
  ].freeze

  def user_compute_resource_labels
    format_resource_labels_by_whitelist(
      COMPUTE_RESOURCE_LABELS,
      @context.user.resources.intersection(Job::INSTANCE_TYPES.keys),
    )
  end

  def user_database_resource_labels
    format_resource_labels_by_whitelist(
      DATABASE_RESOURCE_LABELS,
      @context.user.resources.intersection(DbCluster::DX_INSTANCE_CLASSES.keys),
    )
  end

  def format_resource_labels_by_whitelist(labels, allowed_keys)
    user_labels = labels.select { |label| allowed_keys.include?(label[:value]) }
    user_labels.map { |label| { value: label[:value], label: "#{label[:label]}    #{label[:pricing]}$/hour" } }
  end

  def user_has_no_compute_resources_allowed
    @context.user.resources.intersection(Job::INSTANCE_TYPES.keys).empty?
  end

  def user_has_no_database_resources_allowed
    @context.user.resources.intersection(DbCluster::DX_INSTANCE_CLASSES.keys).empty?
  end

  # +-----------------------------+
  # |                             |
  # | Charges checkers start here |
  # |                             |
  # +-----------------------------+

  def check_total_charges_limit
    check_charges_limit([validate_total_limit])
  end

  def check_total_and_job_charges_limit
    check_charges_limit([validate_job_limit, validate_total_limit])
  end

  def check_charges_limit(charges_validation_results)
    charges_errors = charges_validation_results.compact
    return if charges_errors.empty?

    respond_to do |format|
      e_msg = charges_errors.join("\n")

      format.html do
        flash[:error] = e_msg
        redirect_back(fallback_location: root_path)
      end

      # Normally I would pass array, but the message gets stringified along the way
      format.json { raise_api_error e_msg }
    end
  end

  def validate_total_limit
    api = DIContainer.resolve("api.user")
    I18n.t("api.errors.exceeded_charges_limit") if Users::ChargesFetcher.exceeded_charges_limit?(api, current_user)
  end

  def validate_job_limit
    I18n.t("api.errors.job_limit_zero") unless current_user.can_run_jobs?
  end
end
