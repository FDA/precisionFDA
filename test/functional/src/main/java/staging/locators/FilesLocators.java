package staging.locators;

public class FilesLocators {

    public static final String FILES_MY_FILES_LINK = "//*[@class='pill-label'][text()='My Files']/../../a";

    public static final String FILES_MY_FILES_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='My Files']";

    public static final String FILES_FEATURED_LINK = "//*[@class='pill-label'][text()='Featured']";

    public static final String FILES_FEATURED_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Featured']";

    public static final String FILES_EXPLORE_LINK = "//*[@class='pill-label'][text()='Explore']";

    public static final String FILES_EXPLORE_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Explore']";

    public static final String FILES_ADD_FILES_LINK = "//*[@class='btn-group']//a[@href='/files/new']/span";

    public static final String FILES_BROWSE_FILES_INPUT = "//input[@class='event-browse-files']";

    public static final String FILES_BROWSE_FILES_VISIBLE_FORM = "//*[contains(@class, 'form-upload-files')]";

    public static final String FILES_UPLOAD_ALL_BUTTON = "//button[contains(@class, 'upload-files')]";

    public static final String FILES_UPLOAD_PREVIEW_FILE_NAME = "//*[@class='file-name']";

    public static final String FILES_UPLOADS_COMPLETE_MESSAGE = "//span[text()='Upload(s) complete']";

    public static final String FILES_COMMON_LINK_TO_UPLOADED_FILE = "//*[@id='files']//a[contains(@href, 'file-')]";

}
