package staging.locators;

public class FilesLocators {

    public static final String FILES_MY_FILES_LINK = "//a[@href='/files']//span";

    public static final String FILES_MY_FILES_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='My Files']";

    public static final String FILES_FEATURED_LINK = "//*[@class='pill-label'][text()='Featured']";

    public static final String FILES_FEATURED_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Featured']";

    public static final String FILES_EXPLORE_LINK = "//*[@class='pill-label'][text()='Explore']";

    public static final String FILES_EXPLORE_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Explore']";

    public static final String FILES_ADD_FILES_LINK = "//*[@class='btn-group']//a[@href='/files/new']/span";

    public static final String FILES_BROWSE_FILES_INPUT = "//form[@class='form form-upload-files']//span[contains(@class, 'browse-files')]";

}
