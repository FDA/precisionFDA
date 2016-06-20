require 'csv'
require 'ostruct'

class Challenge
  include ActiveModel::Model

  def self.consistency(context)
    consistency_discussion = Discussion.accessible_by_public.find_by(id: CONSISTENCY_DISCUSSION_ID)
    return {
      path: Rails.application.routes.url_helpers.consistency_challenges_path,
      title: "Consistency Challenge",
      thumbnail: "challenges/pFDA-C1-Diagram-Thumbnail",
      answers_count: consistency_discussion.answers.accessible_by_public.size,
      followers_count: consistency_discussion.count_user_followers,
      launched: !consistency_discussion.nil? && consistency_discussion.public?,
      joined: context.logged_in? && !consistency_discussion.nil? && consistency_discussion.followed_by?(context.user),
      start_date: CONSISTENCY_CHALLENGE_START_DATE,
      end_date: CONSISTENCY_CHALLENGE_END_DATE,
      results_date: CONSISTENCY_CHALLENGE_RESULTS_DATE,
      active: DateTime.now.in_time_zone < CONSISTENCY_CHALLENGE_END_DATE,
      ended: DateTime.now.in_time_zone >= CONSISTENCY_CHALLENGE_END_DATE,
      results_announced: true
      # CONSISTENCY_CHALLENGE_RESULTS_DATE && DateTime.now.in_time_zone >= CONSISTENCY_CHALLENGE_RESULTS_DATE
    }
  end

  def self.truth(context)
    truth_discussion = Discussion.find_by(id: TRUTH_DISCUSSION_ID)
    return {
      path: Rails.application.routes.url_helpers.truth_challenges_path,
      title: "Truth Challenge",
      thumbnail: "challenges/pFDA-C2-Diagram-Thumbnail",
      answers_count: truth_discussion.answers.accessible_by_public.size,
      followers_count: truth_discussion.count_user_followers,
      launched: !truth_discussion.nil? && truth_discussion.public?,
      joined: context.logged_in? && !truth_discussion.nil? && truth_discussion.followed_by?(context.user),
      start_date: TRUTH_CHALLENGE_START_DATE,
      end_date: TRUTH_CHALLENGE_END_DATE,
      results_date: TRUTH_CHALLENGE_RESULTS_DATE,
      active: DateTime.now.in_time_zone < TRUTH_CHALLENGE_END_DATE,
      ended: DateTime.now.in_time_zone >= TRUTH_CHALLENGE_END_DATE,
      results_announced: false
      # TRUTH_CHALLENGE_RESULTS_DATE && DateTime.now.in_time_zone >= TRUTH_CHALLENGE_RESULTS_DATE
    }
  end

  def self.truth_results
    results_file = "app/assets/resources/dgrover-gatk-HG002.extended.csv"
    results = CSV.read(results_file, headers: true).map { |row| row.to_hash }
    return results
  end
end
