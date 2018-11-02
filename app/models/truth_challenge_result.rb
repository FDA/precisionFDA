# == Schema Information
#
# Table name: truth_challenge_results
#
#  id                        :integer          not null, primary key
#  answer_id                 :integer
#  entry                     :string
#  type                      :string
#  subtype                   :string
#  subset                    :string
#  filter                    :string
#  genotype                  :string
#  qq_field                  :string
#  qq                        :string
#  metric_recall             :decimal(7, 6)
#  metric_precision          :decimal(7, 6)
#  metric_frac_na            :decimal(7, 6)
#  metric_f1_score           :decimal(7, 6)
#  truth_total               :integer
#  truth_tp                  :integer
#  truth_fn                  :integer
#  query_total               :integer
#  query_tp                  :integer
#  query_fp                  :integer
#  query_unk                 :integer
#  fp_gt                     :integer
#  fp_al                     :integer
#  pct_fp_ma                 :decimal(10, 6)
#  truth_total_titv_ratio    :decimal(10, 6)
#  truth_total_het_hom_ratio :decimal(10, 6)
#  truth_fn_titv_ratio       :decimal(10, 6)
#  truth_fn_het_hom_ratio    :decimal(10, 6)
#  truth_tp_titv_ratio       :decimal(10, 6)
#  truth_tp_het_hom_ratio    :decimal(10, 6)
#  query_fp_titv_ratio       :decimal(10, 6)
#  query_fp_het_hom_ratio    :decimal(10, 6)
#  query_tp_titv_ratio       :decimal(10, 6)
#  query_total_titv_ratio    :decimal(10, 6)
#  query_total_het_hom_ratio :decimal(10, 6)
#  query_tp_het_hom_ratio    :decimal(10, 6)
#  query_unk_titv_ratio      :decimal(10, 6)
#  query_unk_het_hom_ratio   :decimal(10, 6)
#  meta                      :text
#

class TruthChallengeResult < ActiveRecord::Base
  include Auditor
  store :meta, {coder: JSON}

  # To allow 'type':
  # http://stackoverflow.com/questions/7134559/rails-use-type-column-without-sti
  self.inheritance_column = nil
end
