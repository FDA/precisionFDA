class CreateTruthChallengeResults < ActiveRecord::Migration
  def change
    create_table :truth_challenge_results do |t|
      t.string :entry, required: true
      t.string :type
      t.string :subtype
      t.string :subset
      t.string :filter
      t.string :genotype
      t.string :qq_field
      t.string :qq
      t.string :recall
      t.string :precision
      t.string :frac_na
      t.string :f1_score
      t.string :truth_total
      t.string :truth_tp
      t.string :truth_fn
      t.string :query_total
      t.string :query_tp
      t.string :query_fp
      t.string :query_unk
      t.string :fp_gt
      t.string :fp_al
      t.string :truth_total_titv_ratio
      t.string :truth_total_het_hom_ratio
      t.string :truth_fn_titv_ratio
      t.string :truth_fn_het_hom_ratio
      t.string :truth_tp_titv_ratio
      t.string :truth_tp_het_hom_ratio
      t.string :query_fp_titv_ratio
      t.string :query_fp_het_hom_ratio
      t.string :query_tp_titv_ratio
      t.string :query_total_titv_ratio
      t.string :query_total_het_hom_ratio
      t.string :query_tp_het_hom_ratio
      t.string :query_unk_titv_ratio
      t.string :query_unk_het_hom_ratio
      t.text :meta
    end

    add_index :truth_challenge_results, :entry
    add_index :truth_challenge_results, :type
    add_index :truth_challenge_results, :subtype
    add_index :truth_challenge_results, :subset
    add_index :truth_challenge_results, :genotype
    add_index :truth_challenge_results, :recall
    add_index :truth_challenge_results, :precision
    add_index :truth_challenge_results, :frac_na
    add_index :truth_challenge_results, :f1_score
    add_index :truth_challenge_results, :truth_total
    add_index :truth_challenge_results, :truth_tp
    add_index :truth_challenge_results, :truth_fn
    add_index :truth_challenge_results, :query_total
    add_index :truth_challenge_results, :query_tp
    add_index :truth_challenge_results, :query_fp
    add_index :truth_challenge_results, :query_unk
    add_index :truth_challenge_results, :fp_gt
    add_index :truth_challenge_results, :fp_al
    add_index :truth_challenge_results, :truth_total_titv_ratio
    add_index :truth_challenge_results, :truth_total_het_hom_ratio
    add_index :truth_challenge_results, :truth_fn_titv_ratio
    add_index :truth_challenge_results, :truth_fn_het_hom_ratio
    add_index :truth_challenge_results, :truth_tp_titv_ratio
    add_index :truth_challenge_results, :truth_tp_het_hom_ratio
    add_index :truth_challenge_results, :query_fp_titv_ratio
    add_index :truth_challenge_results, :query_fp_het_hom_ratio
    add_index :truth_challenge_results, :query_tp_titv_ratio
    add_index :truth_challenge_results, :query_total_titv_ratio
    add_index :truth_challenge_results, :query_total_het_hom_ratio
    add_index :truth_challenge_results, :query_tp_het_hom_ratio
    add_index :truth_challenge_results, :query_unk_titv_ratio
    add_index :truth_challenge_results, :query_unk_het_hom_ratio
  end

  def self.down
    drop_table :truth_challenge_results
  end
end
