package staging.utils;

import org.apache.log4j.Logger;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class Utils {

    private final Logger log = Logger.getLogger(this.getClass());

    public static final String globalSalt = Utils.getCurrentDateSalt();

    public static void takeScreenshot(String filePath, WebDriver driver) {
        File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        try {
            org.apache.commons.io.FileUtils.copyFile(scrFile, new File(filePath));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void createFolder(String folderPath) {
        File file = new File(folderPath);
        file.mkdir();
    }

    public static void createFile(String folderPath, String content) throws IOException {
        File file = new File(folderPath);
        file.createNewFile();
        FileWriter fw = new FileWriter(file.getAbsoluteFile());
        BufferedWriter bw = new BufferedWriter(fw);
        bw.write(content);
        bw.close();
    }

    public static String getCurrentDateSalt() {
        Date d = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyddMM_HHmmssS");
        String salt = dateFormat.format(d);
        return salt;
    }

}
