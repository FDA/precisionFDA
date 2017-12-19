package precisionFDA.data;

import precisionFDA.model.NewChallEntryProfile;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

public class TestNewChallEntryData {

    static final String MAIN_ENTRY_NAME_PREFIX = "AT entry ";

    static final String MAIN_ENTRY_DESCR_PREFIX = "AT description ";

    static final String SECOND_ENTRY_NAME_PREFIX = "AT second entry ";

    static final String SECOND_ENTRY_DESCR_PREFIX = "AT second description ";

    static final String getMainEntryName() {
        return MAIN_ENTRY_NAME_PREFIX + getRunTimeLocalUniqueValue();
    }

    static final String getMainEntryDescr() {
        return MAIN_ENTRY_DESCR_PREFIX + getRunTimeLocalUniqueValue();
    }

    static final String getSecondEntryName() {
        return SECOND_ENTRY_NAME_PREFIX + getRunTimeLocalUniqueValue();
    }

    static final String getSecondEntryDescr() {
        return SECOND_ENTRY_DESCR_PREFIX + getRunTimeLocalUniqueValue();
    }

    public static NewChallEntryProfile mainNewChallEntryProfile = new NewChallEntryProfile(
            getMainEntryName(),
            getMainEntryDescr()
    );

    public static NewChallEntryProfile getMainNewChallEntryProfile() {
        return mainNewChallEntryProfile;
    }

    public static NewChallEntryProfile secondNewChallEntryProfile = new NewChallEntryProfile(
            getSecondEntryName(),
            getSecondEntryDescr()
    );

    public static NewChallEntryProfile getSecondNewChallEntryProfile() {
        return secondNewChallEntryProfile;
    }

}
