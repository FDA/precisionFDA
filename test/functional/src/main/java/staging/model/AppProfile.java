package staging.model;

import static staging.data.TestAppData.*;
import static staging.utils.Utils.getCurrentDateTimeValue;

public class AppProfile {

    private final String appNameText;

    private final String appTitleText;

    private final String appScriptCodeText;

    private static String appCreationDateTimeText;

    private static String appReadMeRowText;

    private static String appReadMeRichText;

    private static String jobNameText;

    private static String jobCreationDateTimeText;

    private static String expectedJobOutputText;

    public AppProfile(final String appNameText, final String appTitleText,
                      final String appScriptCodeText, final String appCreationDateTimeText,
                      final String appReadMeRowText, final String appReadMeRichText,
                      final String jobNameText, final String jobCreationDateTimeText,
                      final String expectedJobOutputText) {
        this.appNameText = appNameText;
        this.appTitleText = appTitleText;
        this.appScriptCodeText = appScriptCodeText;
        this.appCreationDateTimeText = appCreationDateTimeText;
        this.appReadMeRowText = appReadMeRowText;
        this.appReadMeRichText = appReadMeRichText;
        this.jobNameText = jobNameText;
        this.jobCreationDateTimeText = jobCreationDateTimeText;
        this.expectedJobOutputText = expectedJobOutputText;
    }

    public String getAppNameText() {
        return appNameText;
    }

    public String getAppTitleText() {
        return appTitleText;
    }

    public String getAppScriptCodeText() {
        return appScriptCodeText;
    }

    public String getAppCreationDateTimeText() {
        return appCreationDateTimeText;
    }

    public String getReadMeRowText() {
        return appReadMeRowText;
    }

    public String getReadMeRichText() {
        return appReadMeRichText;
    }

    public String getJobNameText() {
        return jobNameText;
    }

    public String getJobCreationDateTimeText() {
        return jobCreationDateTimeText;
    }

    public String getExpectedJobOutputText() {
        return expectedJobOutputText;
    }

    public void setAppCreationDateTimeText() {
        this.appCreationDateTimeText = getCurrentDateTimeValue(TIME_ZONE);
    }

    public void setJobCreationDateTimeText() {
        this.jobCreationDateTimeText = getCurrentDateTimeValue(TIME_ZONE);
    }

    public static AppProfile getMainApp() {
        return new AppProfile(getMainAppName(), getMainAppTitle(),
                getMainAppJobScriptBody(), appCreationDateTimeText,
                getMainAppReadMeRowText(), getMainAppReadMeRichText(),
                getMainAppJobName(), jobCreationDateTimeText,
                getMainAppExpJobOutput());
    }

    public static AppProfile getUpdatedApp() {
        return new AppProfile(getMainAppName(), getUpdatedAppTitle(),
                getMainAppJobScriptBody(), appCreationDateTimeText,
                getMainAppReadMeRowText(), getMainAppReadMeRichText(),
                getMainAppJobName(), jobCreationDateTimeText,
                getMainAppExpJobOutput());
    }
}
