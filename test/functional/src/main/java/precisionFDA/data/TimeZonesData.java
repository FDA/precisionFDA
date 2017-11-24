package precisionFDA.data;

import precisionFDA.model.TimeZoneProfile;

public class TimeZonesData {

    public static TimeZoneProfile moscowTimeZone = new TimeZoneProfile(
            "GMT+3",
            "Moscow",
            "(GMT+03:00) Moscow",
            "MSK"
    );

    public static TimeZoneProfile getMoscowTimeZone() {
        return moscowTimeZone;
    }


}
