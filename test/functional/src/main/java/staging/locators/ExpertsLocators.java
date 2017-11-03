package staging.locators;

public class ExpertsLocators {

    public static final String EXPERTS_MAIN_DIV = "//*[contains(@class, 'pfda-controller-experts')]";

    public static final String EXPERTS_ACTIVATED_ICON = "//*[@class='active']/a[@href='/experts']";

    public static final String CREATE_EXPERT_BUTTON_ON_EXPERTS_PAGE = "//a[@href='/experts/new']";

    public static final String CREATE_EXPERT_BUTTON_ON_NEW_EXPERT_FORM = "//input[@value='Create Expert']";

    public static final String CREATE_EXPERT_FORM_USERNAME_SELECT = "//select[@id='expert_username']";

    public static final String CREATE_EXPERT_FORM_PREFERRED_INPUT = "//textarea[@id='expert__prefname']";

    public static final String CREATE_EXPERT_FORM_ABOUT_INPUT = "//textarea[@id='expert__about']";

    public static final String CREATE_EXPERT_FORM_BLOG_TITLE_INPUT = "//textarea[@id='expert__blog_title']";

    public static final String CREATE_EXPERT_FORM_BLOG_INPUT = "//textarea[@id='expert__blog']";

    public static final String CREATE_EXPERT_FORM_PREVIEW_INPUT = "//textarea[@id='expert__challenge']";

    public static final String CREATE_EXPERT_FORM_VISIBILITY_SELECT = "//textarea[@id='expert_scope']";

    public static final String CREATE_EXPERT_FORM_UPLOAD_IMAGE_BUTTON = "//button[text()='Upload image']";

    public static final String CREATE_EXPERT_IMAGE_UPLOAD_BROWSE_VISIBLE_BUTTON = "//*[@id='image-upload-modal']//*[contains(@class, 'browse-files')]";

    public static final String CREATE_EXPERT_IMAGE_UPLOAD_BROWSE_INPUT = "//input[@class='event-browse-files']";

    public static final String CREATE_EXPERT_IMAGE_UPLOAD_BUTTON = "//button[contains(@class, 'btn btn-success btn-lg event-upload-image')]";

    public static final String CREATE_EXPERT_IMAGE_UPLOAD_COMPLETE = "//*[text()='Upload(s) complete']";

    public static final String CREATE_EXPERT_IMAGE_UPLOAD_COMPLETE_OK_BUTTON = "//button[text()='OK']";

    public static final String CREATE_EXPERT_ALERT_SUCCESS = "//*[contains(@class, 'alert-success')]";

    public static final String CREATED_EXPERT_COMMON_LINK = "//*[@class='pfda-card-title']/a[text()='{EXPERT_PREF_NAME}']";

    public static final String CREATED_EXPERT_COMMON_IMAGE = "//img[contains(@src, '{EXPERT_IMAGE_FILE_NAME}')]";


}
