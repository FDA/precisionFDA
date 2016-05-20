require 'json'
require 'axlsx'
require 'ostruct'

class Challenge
  include ActiveModel::Model

  def self.consistency_results

    entries = JSON.parse(File.read("app/assets/resources/entries.json")).map {|e| OpenStruct.new(e)}

    repro1_order = Proc.new do |e|
      if e.repro1_recognition == "deterministic"
        entries.find_index(e)
      elsif e.repro1_recognition == ""
        e.repro1_false_pos.to_i + e.repro1_false_neg.to_i
      else
        e.repro1_true_pos.to_i
      end
    end

    repro2_order = Proc.new do |e|
      if e.repro2_recognition != "not-considered"
        (1-e.repro2_concordance)
      else
        (2-e.repro2_concordance)
      end
    end

    nicknames = ["ebanks","sentieon","sanofi-gatk","unm-sentieon","macrogen-gatk","macrogen-vqsr","macrogen-isaac","macrogen-dragen","macrogen-genalice","mlin-fermikit","sib-vitalit","kccg-gatk","vgteam","roche","saphetor","avera","personalis-gatk","broad-gatk","egarrison-hhga","pathway","mybioinformatician"]
    other = ["","","extra-credit","","","","","","","pfda-apps","","","heroic-effort", "","","","","","","",""]
    overall = ["","best-reproducibility","best-accuracy"]

    entries.each_with_index do |e, i|
      e.nickname = nicknames[i]
      e.other_recognition = other[i]
      e.award = overall[i] || ""
    end

    recall1_order = Proc.new { |e| e.disqualified ? e.acc1_recall : 1-e.acc1_recall }
    recall2_order = Proc.new { |e| e.disqualified ? e.acc2_recall : 1-e.acc2_recall }
    recall_order = Proc.new { |e| e.disqualified ? e.acc1_recall + e.acc2_recall : e.recall_diff }
    recall1_entries = entries.sort_by(&recall1_order)
    recall2_entries = entries.sort_by(&recall2_order)
    top_recall = recall1_entries.first.acc1_recall + recall2_entries.first.acc2_recall
    entries.each { |e| e.recall_diff = top_recall - e.acc1_recall - e.acc2_recall }
    entries.sort_by(&recall_order).each_with_index {|e,i| e.recall_recognition = (i == 0 ? "highest-recall" : (i < 6 ? "high-recall" : (e.disqualified ? "not-considered" : ""))) }

    precision1_order = Proc.new { |e| e.disqualified ? e.acc1_precision : 1-e.acc1_precision }
    precision2_order = Proc.new { |e| e.disqualified ? e.acc2_precision : 1-e.acc2_precision }
    precision_order = Proc.new { |e| e.disqualified ? e.acc1_precision + e.acc2_precision : e.precision_diff }
    precision1_entries = entries.sort_by(&precision1_order)
    precision2_entries = entries.sort_by(&precision2_order)
    top_precision = precision1_entries.first.acc1_precision + precision2_entries.first.acc2_precision
    entries.each { |e| e.precision_diff = top_precision - e.acc1_precision - e.acc2_precision }
    entries.sort_by(&precision_order).each_with_index {|e,i| e.precision_recognition = (i == 0 ? "highest-precision" : (i < 14 ? "high-precision" : (e.disqualified ? "not-considered" : ""))) }

    f_measure1_order = Proc.new { |e| e.disqualified ? e.acc1_f_measure : 1-e.acc1_f_measure }
    f_measure2_order = Proc.new { |e| e.disqualified ? e.acc2_f_measure : 1-e.acc2_f_measure }
    f_measure_order = Proc.new { |e| e.disqualified ? e.acc1_f_measure + e.acc2_f_measure : e.f_measure_diff }
    f_measure1_entries = entries.sort_by(&f_measure1_order)
    f_measure2_entries = entries.sort_by(&f_measure2_order)
    top_f_measure = f_measure1_entries.first.acc1_f_measure + f_measure2_entries.first.acc2_f_measure
    entries.each { |e| e.f_measure_diff = top_f_measure - e.acc1_f_measure - e.acc2_f_measure }
    entries.sort_by(&f_measure_order).each_with_index {|e,i| e.f_measure_recognition = (i == 0 ? "highest-f-measure" : (i < 11 ? "high-f-measure" : (e.disqualified ? "not-considered" : ""))) }

    entries.each { |e| e.recognitions = [e.repro1_recognition, e.repro2_recognition, e.recall_recognition, e.precision_recognition, e.f_measure_recognition].reject { |q| q == "" || q == 'not-considered' } }

    return entries, repro1_order, repro2_order, recall_order, precision_order, f_measure_order
  end
end
