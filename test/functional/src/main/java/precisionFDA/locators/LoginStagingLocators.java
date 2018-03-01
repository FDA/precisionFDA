package precisionFDA.locators;

public class LoginStagingLocators {

    public static final String LOGIN_LOGIN_FORM = "//div[contains(@class, 'login')]//form[contains(@class, 'login')]";

    public static final String LOGIN_USERNAME_INPUT = "//input[@name='username']";

    public static final String LOGIN_PASSWORD_INPUT = "//input[@name='password']";

    public static final String LOGIN_SUBMIT_BUTTON = "//button[@name='submit']";

    public static final String LOGIN_WRONG_CREDS_MESSAGE = "//strong[text()='Invalid username or password']";

}
