package precisionFDA.data;

import precisionFDA.model.ChallProfile;

import java.text.SimpleDateFormat;
import java.util.Date;

import static precisionFDA.data.TestDict.getDictSetup;
import static precisionFDA.data.TestRunData.getTestImageHttpsUrl;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

public class TestChallsData {

    public static final String TEST_NEW_CHALL_NAME_PREFIX = "AT Challenge ";

    public static final String TEST_NEW_CHALL_DESCR_PREFIX = "AT Description ";

    public static final String TEST_NEW_CHALL_INFO_PREFIX = "AT Information ";

    public static final String TEST_NEW_CHALL_RESULTS_PREFIX = "AT Result ";

    public static String getTestNewChallNamePrefix() {
        return TEST_NEW_CHALL_NAME_PREFIX;
    }

    public static String getTestNewChallDescrPrefix() {
        return TEST_NEW_CHALL_DESCR_PREFIX;
    }

    public static String getTestNewChallInfoPrefix() { return TEST_NEW_CHALL_INFO_PREFIX; }

    public static String getTestNewChallResultsPrefix() { return TEST_NEW_CHALL_RESULTS_PREFIX; }

    public static String getMainChallName() {
        return getTestNewChallNamePrefix() + getRunTimeLocalUniqueValue();
    }

    public static String getMainChallDescr() {
        return getTestNewChallDescrPrefix() + getRunTimeLocalUniqueValue();
    }

    public static String getMainChallScoringUser() {
        return TestUserData.getTestUser().getApplUsername();
    }

    public static String getChallCardImage() {
        return getTestImageHttpsUrl();
    }

    public static String getMainChallStartsAt() {
        return getChallAtDateTime(3);
    }

    public static String getMainChallEndsAt() {
        return getChallAtDateTime(6);
    }

    public static String getMainChallInfo() {
        return getTestNewChallInfoPrefix() + getRunTimeLocalUniqueValue();
    }

    public static String getMainChallResults() {
        return getTestNewChallResultsPrefix() + getRunTimeLocalUniqueValue() + "1 &&" + getTestNewChallResultsPrefix() + getRunTimeLocalUniqueValue() + "2";
    }

    public static String getChallAtDateTime(int delayMinutes) {
        Date d = new Date(System.currentTimeMillis() + delayMinutes * 60 * 1000);
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
        String string = dateFormat.format(d);
        return string;
    }

    public static String getExpectedChallDateTimeValue(String initDateTime) {
        return initDateTime.replace("T", " ");
    }

    public static ChallProfile mainChallProfile = new ChallProfile(
            getMainChallName(),
            getMainChallDescr(),
            getMainChallScoringUser(),
            getMainChallStartsAt(),
            getMainChallEndsAt(),
            getChallCardImage(),
            getDictSetup(),
            getMainChallInfo(),
            getMainChallResults()
    );

    public static ChallProfile getMainChallProfile() {
        return mainChallProfile;
    }



}
