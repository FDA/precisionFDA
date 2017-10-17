package staging.locators;

public class AppsLocators {

    public static final String APPS_JOBS_LIST = "//div[@id='jobs']";

    public static final String APPS_MAIN_DIV = "//*[@class='container-fluid container-padded']";

    public static final String APPS_RELEVANT_LINK = "//a[@href='/apps']/span";

    public static final String APPS_RELEVANT_ACTIVATED_LINK = "//*[@class='active']//a[@href='/apps']/span";

    public static final String APPS_FEATURED_LINK = "//*[@class='pill-label'][text()='Featured']";

    public static final String APPS_FEATURED_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Featured']";

    public static final String APPS_EXPLORE_LINK = "//*[@class='pill-label'][text()='Explore']";

    public static final String APPS_EXPLORE_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Explore']";

    public static final String APPS_MANAGE_ASSETS_LINK = "//a[@href='/app_assets']/span";

    public static final String APPS_MANAGE_MY_ASSETS_LINK = "//*[@class='pill-label'][text()='My Assets']";

    public static final String APPS_MANAGE_MY_ASSETS_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='My Assets']";

    public static final String APPS_MANAGE_CREATE_ASSETS_LINK = "//a[@href='/app_assets/new']/span";

    public static final String APPS_MANAGE_MAIN_TOOLBAR = "//*[@class='pfda-toolbar']//*[contains(@class, 'nav-pills')]";

    public static final String APPS_MANAGE_FEATURED_LINK = "//*[@class='pill-label'][text()='Featured']";

    public static final String APPS_MANAGE_FEATURED_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Featured']";

    public static final String APPS_MANAGE_EXPLORE_LINK = "//*[@class='pill-label'][text()='Explore']";

    public static final String APPS_MANAGE_EXPLORE_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Explore']";

    public static final String APPS_MANAGE_CREATE_ASSETS_GENERATE_KEY_LINK = "//a[@href='/tokify']/span";

    public static final String APPS_EDIT_APP_NAME_INPUT = "//*/label[text()='App Name']/../input";

    public static final String APPS_EDIT_APP_TITLE_INPUT = "//*/label[text()='Title']/../input";

    public static final String APPS_CREATE_APP_BUTTON_LINK = "//a[contains(text(), 'Create App')]";

    public static final String APPS_EDIT_APP_SCRIPT_TAB_LINK = "//a/*[contains(text(), 'Script')]";

    public static final String APPS_EDIT_APP_SCRIPT_TEXTAREA = "//*[@id='script-editor']/textarea";

    public static final String APPS_CREATE_APP_CREATE_BUTTON = "//button/*[contains(text(), 'Create')]";

    public static final String APPS_RELEVANT_SELECTED_APP_NAME = "//li/*[contains(text(), 'name')]/../p";

    public static final String APPS_RELEVANT_SELECTED_APP_ORG = "//li/*[contains(text(), 'Org')]/../p";

    public static final String APPS_RELEVANT_SELECTED_APP_ADDED_BY = "//li/*[contains(text(), 'Added by')]/../p";

    public static final String APPS_RELEVANT_SELECTED_APP_CREATED = "//li/*[contains(text(), 'Created')]/../p";

    public static final String APPS_RELEVANT_SELECTED_APP_TITLE = "//*[contains(@class, 'list-group')]//a[contains(@class, 'active')]/*[contains(@class, 'title')]";

    public static final String APPS_SAVED_APP_RUN_APP_BUTTON = "//div[contains(@class, 'right')]//a[contains(@href, 'jobs')]";

    public static final String APPS_SAVED_APP_LINK_TEMPLATE = "//div[contains(text(), 'My Apps')]/../a/div[text()='{APP_TITLE}']";

    public static final String APPS_SAVED_APP_REVISION = "//span[@class='app-revision']";

    public static final String APPS_SAVED_APP_EDIT_BUTTON = "//span[contains(@class, 'edit')]/../../a[contains(@href, 'edit')]";

    public static final String APPS_SAVED_APP_SAVE_REVISION_BUTTON = "//span[contains(text(), 'Save Revision')]";



}
