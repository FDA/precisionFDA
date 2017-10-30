package staging.model;

import static staging.data.TestAppData.*;
import static staging.utils.Utils.getCurrentDateTimeValue;

public class AppProfile {

    private String appInitNameText;

    private String appInitTitleText;

    private String appInitScriptCodeText;

    private String appInitCreationDateTimeText;

    private String appInitReadMeRowText;

    private String appInitReadMeRichText;

    private String appCurRevNameText;

    private String appCurRevTitleText;

    private String appCurRevScriptCodeText;

    private String appCurRevCreationDateTimeText;

    private String appCurRevReadMeRowText;

    private String appCurRevReadMeRichText;

    private String appTempReadMeRowText;

    private String appTempReadMeRichText;

    private String jobNameText;

    private String jobCreationDateTimeText;

    private String expectedJobOutputText;

    public AppProfile(final String appInitNameText, final String appInitTitleText,
                      final String appInitScriptCodeText, final String appInitCreationDateTimeText,
                      final String appInitReadMeRowText, final String appInitReadMeRichText,
                      final String appCurRevNameText, final String appCurRevTitleText,
                      final String appCurRevScriptCodeText, final String appCurRevCreationDateTimeText,
                      final String appCurRevReadMeRowText, final String appCurRevReadMeRichText,
                      final String appTempReadMeRowText, final String appTempReadMeRichText,
                      final String jobNameText, final String jobCreationDateTimeText,
                      final String expectedJobOutputText) {
        this.appInitNameText = appInitNameText;
        this.appInitTitleText = appInitTitleText;
        this.appInitScriptCodeText = appInitScriptCodeText;
        this.appInitCreationDateTimeText = appInitCreationDateTimeText;
        this.appInitReadMeRowText = appInitReadMeRowText;
        this.appInitReadMeRichText = appInitReadMeRichText;
        this.appCurRevNameText = appCurRevNameText;
        this.appCurRevTitleText = appCurRevTitleText;
        this.appCurRevScriptCodeText = appCurRevScriptCodeText;
        this.appCurRevCreationDateTimeText = appCurRevCreationDateTimeText;
        this.appCurRevReadMeRowText = appCurRevReadMeRowText;
        this.appCurRevReadMeRichText = appCurRevReadMeRichText;
        this.appTempReadMeRowText = appTempReadMeRowText;
        this.appTempReadMeRichText = appTempReadMeRichText;
        this.jobNameText = jobNameText;
        this.jobCreationDateTimeText = jobCreationDateTimeText;
        this.expectedJobOutputText = expectedJobOutputText;
    }

    public String getAppInitNameText() {
        return this.appInitNameText.replace(" ", "-");
    }

    public String getAppInitTitleText() {
        return this.appInitTitleText;
    }

    public String getAppInitScriptCodeText() {
        return this.appInitScriptCodeText;
    }

    public String getAppInitCreationDateTimeText() {
        return this.appInitCreationDateTimeText;
    }

    public String getInitReadMeRowText() {
        return this.appInitReadMeRowText;
    }

    public String getInitReadMeRichText() {
        return this.appInitReadMeRichText;
    }

    public String getAppCurRevNameText() {
        return this.appCurRevNameText;
    }

    public String getAppCurRevTitleText() {
        return this.appCurRevTitleText;
    }

    public String getAppCurRevScriptCodeText() {
        return this.appCurRevScriptCodeText;
    }

    public String getAppCurRevCreationDateTimeText() {
        return this.appCurRevCreationDateTimeText;
    }

    public String getCurRevReadMeRowText() {
        return this.appCurRevReadMeRowText;
    }

    public String getCurRevReadMeRichText() {
        return this.appCurRevReadMeRichText;
    }

    public String getTempReadMeRowText() {
        return this.appTempReadMeRowText;
    }

    public String getTempReadMeRichText() {
        return this.appTempReadMeRichText;
    }

    public String getJobNameText() {
        return jobNameText;
    }

    public String getJobCreationDateTimeText() {
        return this.jobCreationDateTimeText;
    }

    public String getExpectedJobOutputText() {
        return this.expectedJobOutputText;
    }

    public void setAppInitCreationDateTimeText() {
        this.appInitCreationDateTimeText = getCurrentDateTimeValue(TIME_ZONE);
    }

    public void setJobCreationDateTimeText() {
        this.jobCreationDateTimeText = getCurrentDateTimeValue(TIME_ZONE);
    }

    public void setAppCurRevNameText(String name) {
        this.appCurRevNameText = name;
    }

    public void setAppCurRevTitleText(String title) {
        this.appCurRevTitleText = title;
    }

    public void setAppCurRevScriptCodeText(String code) {
        this.appCurRevScriptCodeText = code;
    }

    public void setAppCurRevCreationDateTimeText() {
        this.appCurRevCreationDateTimeText =  getCurrentDateTimeValue(TIME_ZONE);
    }

    public void setAppCurRevReadMeRowText(String row) {
        this.appCurRevReadMeRowText = row;
    }

    public void setAppCurRevReadMeRichText(String rich) {
        this.appCurRevReadMeRichText = rich;
    }

    public void setAppTempReadMeRowText(String row) {
        this.appTempReadMeRowText = row;
    }

    public void setAppTempReadMeRichText(String rich) {
        this.appTempReadMeRichText = rich;
    }

}
