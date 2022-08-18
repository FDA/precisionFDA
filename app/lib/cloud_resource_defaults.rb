module CloudResourceDefaults
  RESOURCES = %w(
    baseline-2
    baseline-4
    hidisk-2
    hidisk-4
    himem-2
    himem-4
  ).freeze

  PRICING_MAP = {
    # Compute instances
    "baseline-2" => 0.286,
    "baseline-4" => 0.572,
    "baseline-8" => 1.144,
    "baseline-16" => 2.288,
    "baseline-36" => 5.148,
    "hidisk-2" => 0.372,
    "hidisk-4" => 0.744,
    "hidisk-8" => 1.488,
    "hidisk-16" => 2.976,
    "hidisk-36" => 6.696,
    "himem-2" => 0.474,
    "himem-4" => 0.948,
    "himem-8" => 1.896,
    "himem-16" => 3.792,
    "himem-32" => 7.584,
    "gpu-8" => 10.787,
    # Db instances
    "db_std1_x2" => 0.273,
    "db_mem1_x2" => 0.967,
    "db_mem1_x4" => 1.933,
    "db_mem1_x8" => 3.867,
    "db_mem1_x16" => 7.733,
    "db_mem1_x32" => 15.467,
    "db_mem1_x48" => 23.200,
    "db_mem1_x64" => 30.933,
  }.freeze

  JOB_LIMIT = 100
  TOTAL_LIMIT = 200
end
