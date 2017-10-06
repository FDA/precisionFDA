package staging.utils;

import org.apache.log4j.Logger;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class Utils {

    private final Logger log = Logger.getLogger(this.getClass());

    public static void screenshot(String prefix, WebDriver driver) {
        Date d = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("ddMMhhmmss");
        String salt = dateFormat.format(d);
        File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        try {
            org.apache.commons.io.FileUtils.copyFile(scrFile, new File(System.getProperty("user.dir") + "/target/screenshots/" +
                    prefix + "_" + salt + ".png"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
