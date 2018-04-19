package precisionFDA.data;

import precisionFDA.model.TimeZoneProfile;

public class TimeZonesData {

    public static TimeZoneProfile moscowTimeZone = new TimeZoneProfile(
            "Moscow",
            "MSK",
            ""
    );

    public static TimeZoneProfile pacificTimeZone = new TimeZoneProfile(
            "Pacific Time (US & Canada)",
            "PST",
            ""
    );

    public static TimeZoneProfile chathamTimeZone = new TimeZoneProfile(
            "Chatham Is.",
            "CHADT",
            ""
    );

    public static TimeZoneProfile utcTimeZone = new TimeZoneProfile(
            "UTC",
            "UTC",
            ""
    );

    public static TimeZoneProfile getMoscowTimeZone() {
        return moscowTimeZone;
    }

    public static TimeZoneProfile getChathamTimeZone() { return chathamTimeZone; }

    public static TimeZoneProfile getPacificTimeZone() { return pacificTimeZone; }

    public static TimeZoneProfile getUtcTimeZone() { return utcTimeZone; }

}
