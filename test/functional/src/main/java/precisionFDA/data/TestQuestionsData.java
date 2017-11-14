package precisionFDA.data;

import precisionFDA.model.QuestionProfile;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

public class TestQuestionsData {

    public static final String TEST_QUESTION_PREFIX = "AT Question ";

    public static final String TEST_ANSWER_PREFIX = "AT Answer ";

    public static String getTestQuestionPrefix() {
        return TEST_QUESTION_PREFIX;
    }

    public static String getTestAnswerPrefix() {
        return TEST_ANSWER_PREFIX;
    }

    public static String getMainQAQuestion1() {
        return getTestQuestionPrefix() + "#1 " + getRunTimeLocalUniqueValue();
    }

    public static String getMainQAQuestion2() {
        return getTestQuestionPrefix() + "#2 " + getRunTimeLocalUniqueValue();
    }

    public static String getMainQAAnswer1() {
        return getTestAnswerPrefix() + "#1 " + getRunTimeLocalUniqueValue();
    }

    public static String getMainQAAnswer2() {
        return getTestAnswerPrefix() + "#2 " + getRunTimeLocalUniqueValue();
    }

    public static QuestionProfile mainQAProfile = new QuestionProfile(
            getMainQAQuestion1(),
            getMainQAQuestion2(),
            getMainQAAnswer1(),
            getMainQAAnswer2()
    );

    public static QuestionProfile getMainQAProfile() {
        return mainQAProfile;
    }

}
