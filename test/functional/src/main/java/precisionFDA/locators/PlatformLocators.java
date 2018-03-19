package precisionFDA.locators;

public class PlatformLocators {

    public static final String LOGIN_LOGIN_FORM = "//div[contains(@class, 'login')]//form[contains(@class, 'login')]";

    public static final String LOGIN_USERNAME_INPUT = "//input[@name='username']";

    public static final String LOGIN_PASSWORD_INPUT = "//input[@name='password']";

    public static final String LOGIN_SUBMIT_BUTTON = "//button[@name='submit']";

    public static final String LOGIN_WRONG_CREDS_MESSAGE = "//strong[text()='Invalid username or password']";

    public static final String PROJECTS_LINK = "//ul[contains(@class,  'nav')]/li/a[text()='Projects']";

    public static final String USER_DD_LINK = "//a[contains(@class, 'user dropdown')]";

    public static final String LOGOUT_DD_ITEM_LINK = "//a[text()='Log Out']";

    public static final String PLATFORM_LOGGED_OR_LOGOUT = "//input[@name='password'] | //ul[contains(@class,  'nav')]/li/a[text()='Projects']";

}
