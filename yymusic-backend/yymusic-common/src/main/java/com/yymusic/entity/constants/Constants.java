package com.yymusic.entity.constants;

public class Constants {
    public static final Long REDIS_KEY_EXPIRE_ONE_MIN = 60L;
    public static final Long REDIS_KEY_EXPIRE_ONE_DAY = 60L * 60 * 24;
    public static final Integer ZERO = 0;
    public static final Integer ONE = 1;
    public static final String REDIS_KEY_PREFIX = "YY_MUSIC:";
    public static final String REDIS_KEY_CHECK_CODE = REDIS_KEY_PREFIX + "CHECK_CODE:";
    public static final Integer LENGTH_5 = 5;
    public static final Integer LENGTH_8 = 8;
    public static final Integer LENGTH_12 = 12;
    public static final Integer LENGTH_14 = 14;
    public static final Integer LENGTH_15 = 15;
    public static final Integer LENGTH_20 = 20;
    public static final Integer LENGTH_30 = 30;
    public static final String FILE_FOLDER_FILE = "file/";
    public static final String FILE_FOLDER_AVATAR = "avatar/";
    public static final String AVATAR_SUFFIX = ".png";
    public static final String DEFAULT_AVATAR_PATH = "/avatar/%d.png";
    public static final String REDIS_KEY_TOKEN_WEB_USER = REDIS_KEY_PREFIX + "TOKEN:WEB:";
    public static final String REDIS_KEY_TOKEN_ADMIN_USER = REDIS_KEY_PREFIX + "TOKEN:ADMIN:";

    public static final String[] IMAGE_SUFFIX = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"};
    public static final String TOKEN = "token";
    public static final String PRODUCT_FOLDER_NAME = "product/";
    public static final String DEFAULT_IMAGE_SUFFIX = ".png";
    public static final int ORDER_TIMEOUT_MIN = 10;
    public static final String REDIS_KEY_HAVE_PAY_ORDER = REDIS_KEY_PREFIX + "ORDER:PAID:";
    public static final String REDIS_KEY_ORDER_DELAY_QUEUE = REDIS_KEY_PREFIX + "ORDER:DELAY:";
    public static final String REDIS_KEY_SYS_DICT = REDIS_KEY_PREFIX + "SYS:DICT:";
    public static final String ZERO_STR = "0";
    public static final String REDIS_KEY_MUSIC_CREATE_QUEUE = REDIS_KEY_PREFIX + "CREATE:QUEUE:";
    public static final String MUSIC_SUFFIX = ".mp3";
}
