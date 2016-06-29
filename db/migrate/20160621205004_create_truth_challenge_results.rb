class CreateTruthChallengeResults < ActiveRecord::Migration
  def change
    create_table :truth_challenge_results do |t|
      t.integer :answer_id
      t.string :entry, required: true
      t.string :type
      t.string :subtype
      t.string :subset
      t.string :filter
      t.string :genotype
      t.string :qq_field
      t.string :qq
      t.decimal :metric_recall, precision: 7, scale: 6
      t.decimal :metric_precision, precision: 7, scale: 6
      t.decimal :metric_frac_na, precision: 7, scale: 6
      t.decimal :metric_f1_score, precision: 7, scale: 6
      t.integer :truth_total
      t.integer :truth_tp
      t.integer :truth_fn
      t.integer :query_total
      t.integer :query_tp
      t.integer :query_fp
      t.integer :query_unk
      t.integer :fp_gt
      t.integer :fp_al
      t.decimal :pct_fp_ma, precision: 10, scale: 6
      t.decimal :truth_total_titv_ratio, precision: 10, scale: 6
      t.decimal :truth_total_het_hom_ratio, precision: 10, scale: 6
      t.decimal :truth_fn_titv_ratio, precision: 10, scale: 6
      t.decimal :truth_fn_het_hom_ratio, precision: 10, scale: 6
      t.decimal :truth_tp_titv_ratio, precision: 10, scale: 6
      t.decimal :truth_tp_het_hom_ratio, precision: 10, scale: 6
      t.decimal :query_fp_titv_ratio, precision: 10, scale: 6
      t.decimal :query_fp_het_hom_ratio, precision: 10, scale: 6
      t.decimal :query_tp_titv_ratio, precision: 10, scale: 6
      t.decimal :query_total_titv_ratio, precision: 10, scale: 6
      t.decimal :query_total_het_hom_ratio, precision: 10, scale: 6
      t.decimal :query_tp_het_hom_ratio, precision: 10, scale: 6
      t.decimal :query_unk_titv_ratio, precision: 10, scale: 6
      t.decimal :query_unk_het_hom_ratio, precision: 10, scale: 6
      t.text :meta
    end

    add_index :truth_challenge_results, :entry
    add_index :truth_challenge_results, :type
    add_index :truth_challenge_results, :subtype
    add_index :truth_challenge_results, :subset
    add_index :truth_challenge_results, :genotype
    add_index :truth_challenge_results, :metric_recall
    add_index :truth_challenge_results, :metric_precision
    add_index :truth_challenge_results, :metric_frac_na
    add_index :truth_challenge_results, :metric_f1_score
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
