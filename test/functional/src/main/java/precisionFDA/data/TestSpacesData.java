package precisionFDA.data;

import precisionFDA.model.SpaceProfile;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

public class TestSpacesData {

    public static final String MAIN_SPACE_NAME_PREFIX = "at_main_space_name_";

    public static final String MAIN_SPACE_DESCR_PREFIX = "at main space description ";

    //================

    public static String getMainSpaceNamePrefix() {
        return MAIN_SPACE_NAME_PREFIX;
    }

    public static String getMainSpaceDescrPrefix() {
        return MAIN_SPACE_DESCR_PREFIX;
    }

    //================

    public static String getMainSpaceName() {
        return getMainSpaceNamePrefix() + getRunTimeLocalUniqueValue();
    }

    public static String getMainSpaceDescr() {
        return getMainSpaceDescrPrefix() + getRunTimeLocalUniqueValue();
    }

    //=================

    public static SpaceProfile mainSpaceProfile = new SpaceProfile(
            getMainSpaceName(),
            getMainSpaceDescr(),
            TestUserData.getTestUserOne().getApplUsername(),
            TestUserData.getTestUserTwo().getApplUsername(),
            "",
            ""
    );

    //=================

    public static SpaceProfile getMainSpaceProfile() {
        return mainSpaceProfile;
    }

}
