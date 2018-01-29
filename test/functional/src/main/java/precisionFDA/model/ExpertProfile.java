package precisionFDA.model;

public class ExpertProfile {

    private String expertName;

    private String expertPreferredName;

    private String expertAbout;

    private String expertBlogTitle;

    private String expertBlog;

    private String expertBlogPreview;

    private String expertImage;

    public ExpertProfile(final String expertName,
                         final String expertPreferredName, final String expertAbout,
                         final String expertBlogTitle, final String expertBlog,
                         final String expertBlogPreview, final String expertImage) {
        this.expertName = expertName;
        this.expertPreferredName = expertPreferredName;
        this.expertAbout = expertAbout;
        this.expertBlogTitle = expertBlogTitle;
        this.expertBlog = expertBlog;
        this.expertBlogPreview = expertBlogPreview;
        this.expertImage = expertImage;
    }

    public String getExpertName() {
        return expertName;
    }

    public String getExpertPreferredName() {
        return expertPreferredName;
    }

    public String getExpertAbout() {
        return expertAbout;
    }

    public String getExpertBlogTitle() {
        return expertBlogTitle;
    }

    public String getExpertBlog() {
        return expertBlog;
    }

    public String getExpertImage() {
        return expertImage;
    }

    public String getExpertBlogPreview() {
        return expertBlogPreview;
    }
}


