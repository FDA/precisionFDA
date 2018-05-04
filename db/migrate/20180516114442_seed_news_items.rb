class SeedNewsItems < ActiveRecord::Migration
  def up
    NewsItem.create([
      {
        title: "Q&A: FDA Dx Reviewer's Tips For Next-Gen Sequencing Sponsors",
        content: "A top reviewer in US FDA's in vitro diagnostics office offers tips to next-generation sequencing test sponsors to avoid common submission shortcomings in this interview with Medtech Insight. According to FDA's Hisani Madison, sponsors frequently fall short in providing a refined intended-use statement.",
        link: "https://medtech.pharmamedtechbi.com/MT105058/QampA-FDA-Dx-Reviewers-Tips-For-NextGen-Sequencing-Sponsors",
        video: "",
        position: 1,
        published: true
      },

      {
        title: "FDA approves first cancer treatment for any solid tumor with a specific genetic feature",
        content: "The U.S. Food and Drug Administration today granted accelerated approval to a treatment for patients whose cancers have a specific genetic feature (biomarker). This is the first time the agency has approved a cancer treatment based on a common biomarker rather than the location in the body where the tumor originated.",
        link: "https://www.fda.gov/NewsEvents/Newsroom/PressAnnouncements/ucm560167.htm",
        video: "",
        position: 2,
        published: true
      },

      {
        title: "Reference Viral DataBase v10.2",
        content: "New in May 2017, the NGS Reference Virus Database version 10.2 (unclustered and clustered).",
        link: "https://hive.biochemistry.gwu.edu/rvdb",
        video: "",
        position: 3,
        published: true
      },

      {
        title: "Optimizing regulatory oversight for Next Generation Sequencing tests",
        content: "In support of the White House’s Precision Medicine Initiative, the FDA issued two draft guidances that offer a streamlined approach to the oversight of ‘Next Generation Sequencing’ tests that detect medically important differences in a person’s genomic makeup.",
        link: "http://www.fda.gov/ScienceResearch/SpecialTopics/PrecisionMedicine/default.htm",
        video: "",
        position: 4,
        published: true
      },

      {
        title: "Interview with the former FDA Chief Health Informatics Officer about precisionFDA",
        content: "",
        link: "https://www.youtube.com/watch?v=JCcpyJz49jE",
        video: "https://www.youtube.com/embed/JCcpyJz49jE",
        position: 5,
        published: true
      }])


  end
end
