# == Schema Information
#
# Table name: truth_challenge_results
#
#  id                        :integer          not null, primary key
#  entry                     :string
#  type                      :string
#  subtype                   :string
#  subset                    :string
#  filter                    :string
#  genotype                  :string
#  qq_field                  :string
#  qq                        :string
#  recall                    :string
#  precision                 :string
#  frac_na                   :string
#  f1_score                  :string
#  truth_total               :string
#  truth_tp                  :string
#  truth_fn                  :string
#  query_total               :string
#  query_tp                  :string
#  query_fp                  :string
#  query_unk                 :string
#  fp_gt                     :string
#  fp_al                     :string
#  truth_total_titv_ratio    :string
#  truth_total_het_hom_ratio :string
#  truth_fn_titv_ratio       :string
#  truth_fn_het_hom_ratio    :string
#  truth_tp_titv_ratio       :string
#  truth_tp_het_hom_ratio    :string
#  query_fp_titv_ratio       :string
#  query_fp_het_hom_ratio    :string
#  query_tp_titv_ratio       :string
#  query_total_titv_ratio    :string
#  query_total_het_hom_ratio :string
#  query_tp_het_hom_ratio    :string
#  query_unk_titv_ratio      :string
#  query_unk_het_hom_ratio   :string
#  meta                      :text
#


class TruthChallengeResult < ActiveRecord::Base
  store :meta, {coder: JSON}
end
