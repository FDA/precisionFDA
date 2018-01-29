package precisionFDA.data;

import precisionFDA.model.ExpertProfile;

import static precisionFDA.utils.Utils.generateTestPngFileName;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

public class TestExpertsData {

    public static final String TEST_NEW_EXPERT_PREFERRED_PREFIX = "AT Expert ";

    public static final String TEST_NEW_EXPERT_ABOUT_PREFIX = "AT About ";

    public static final String TEST_NEW_EXPERT_BLOG_TITLE_PREFIX = "AT Blog Title ";

    public static final String TEST_NEW_EXPERT_BLOG_PREFIX = "AT Blog ";

    public static final String TEST_NEW_EXPERT_BLOG_PREVIEW_PREFIX = "AT Blog Preview 1234 ";

    public static String getTestNewExpertPreferredPrefix() {
        return TEST_NEW_EXPERT_PREFERRED_PREFIX;
    }

    public static String getTestNewExpertAboutPrefix() {
        return TEST_NEW_EXPERT_ABOUT_PREFIX;
    }

    public static String getTestNewExpertBlogTitlePrefix() {
        return TEST_NEW_EXPERT_BLOG_TITLE_PREFIX;
    }

    public static String getTestNewExpertBlogPrefix() {
        return TEST_NEW_EXPERT_BLOG_PREFIX;
    }

    public static String getTestNewExpertBlogPreviewPrefix() {
        return TEST_NEW_EXPERT_BLOG_PREVIEW_PREFIX;
    }

    public static String getMainExpertPreferredName() {
        return getTestNewExpertPreferredPrefix() + getRunTimeLocalUniqueValue();
    }

    public static String getMainExpertAbout() {
        return getTestNewExpertAboutPrefix() + getRunTimeLocalUniqueValue();
    }

    public static String getMainExpertBlogTitle() {
        return getTestNewExpertBlogTitlePrefix() + getRunTimeLocalUniqueValue();
    }

    public static String getMainExpertBlog() {
        return getTestNewExpertBlogPrefix() + getRunTimeLocalUniqueValue();
    }

    public static String getMainExpertBlogPreview() {
        return getTestNewExpertBlogPreviewPrefix() + getRunTimeLocalUniqueValue();
    }

    public static String getMainExpertImage() {
        return generateTestPngFileName();
    }

    public static String getMainExpertUser() {
        return TestUserData.getTestUserOne().getApplUsername();
    }

    public static ExpertProfile mainExpertProfile = new ExpertProfile(
            getMainExpertUser(),
            getMainExpertPreferredName(),
            getMainExpertAbout(),
            getMainExpertBlogTitle(),
            getMainExpertBlog(),
            getMainExpertBlogPreview(),
            getMainExpertImage()
    );

    public static ExpertProfile getMainExpertProfile() {
        return mainExpertProfile;
    }



}
