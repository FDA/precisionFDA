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

    public static final String APPS_EDIT_RUN_APP_JOB_NAME_INPUT = "//label[text()='Job Name']/..//input[@name='name']";

    public static final String APPS_EDIT_RUN_APP_RUN_APP_BUTTON = "//span[text()='Run App']/../../button";

    public static final String APPS_SAVED_APP_JOB_LINK_TEMPLATE = "//*[contains(@class, 'job')]//a[contains(text(), '{JOB_NAME}')]";

    public static final String APPS_JOB_PAGE_I_O_TAB_LINK = "//span[text()='Inputs and Outputs']/../../a[contains(@href, 'tab')]";

    public static final String APPS_JOB_PAGE_JOB_NAME = "//*[@class='page-title']/span[@class='name']";

    public static final String APPS_JOB_PAGE_APP_TITLE_LINK = "//*[contains(@class, 'heading')][text()='App']/..//a";

    public static final String APPS_JOB_PAGE_LAUNCHED_BY_LINK = "//*[contains(@class, 'heading')][text()='Launched by']/..//a";

    public static final String APPS_JOB_PAGE_CREATED = "//*[contains(@class, 'heading')][text()='Created']/../p";

    public static final String APPS_JOB_PAGE_RUNNING_JOB_LABEL = "//*[contains(@class, 'title')]//span[contains(@class, 'label-')]";

    public static final String APPS_JOB_PAGE_VIEW_LOG_LINK = "//*[@class='pfda-toolbar']//a[contains(@href, 'job')][contains(@href, 'log')]";

    public static final String APPS_JOB_LOG_PAGE_LOG_AREA = "//*[contains(@class, 'job-log')]";



}
