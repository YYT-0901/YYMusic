package com.yymusic.utils;
import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.enums.DateTimePatternEnum;
import com.yymusic.exception.BusinessException;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.RandomStringUtils;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.Date;


public class StringTools {

    public static void checkParam(Object param) {
        try {
            Field[] fields = param.getClass().getDeclaredFields();
            boolean notEmpty = false;
            for (Field field : fields) {
                String methodName = "get" + StringTools.upperCaseFirstLetter(field.getName());
                Method method = param.getClass().getMethod(methodName);
                Object object = method.invoke(param);
                if (object != null && object instanceof java.lang.String && !StringTools.isEmpty(object.toString())
                        || object != null && !(object instanceof java.lang.String)) {
                    notEmpty = true;
                    break;
                }
            }
            if (!notEmpty) {
                throw new BusinessException("多参数更新，删除，必须有非空条件");
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new BusinessException("校验参数是否为空失败");
        }
    }

    public static String upperCaseFirstLetter(String field) {
        if (isEmpty(field)) {
            return field;
        }
        //如果第二个字母是大写，第一个字母不大写
        if (field.length() > 1 && Character.isUpperCase(field.charAt(1))) {
            return field;
        }
        return field.substring(0, 1).toUpperCase() + field.substring(1);
    }

    public static boolean isEmpty(String str) {
        if (null == str || "".equals(str) || "null".equals(str) || "\u0000".equals(str)) {
            return true;
        } else if ("".equals(str.trim())) {
            return true;
        }
        return false;
    }

    public static String getRandomNumber(int length) {
        return RandomStringUtils.random(length, false, true);
    }

    public static String encodeByMD5(String originalString) {
        return StringTools.isEmpty(originalString) ? null : DigestUtils.md5Hex(originalString);
    }

    public static String getFileSuffix(String filePath) {
        if (isEmpty(filePath)) {
            return "";
        }
        int index = filePath.lastIndexOf(".");
        if (index == -1) {
            return "";
        }
        return filePath.substring(index);
    }

    public static boolean pathIsOK(String filePath) {
        if (isEmpty(filePath)) {
            return false;
        }
        return !filePath.contains("..");
    }

    public static String getOrderId() {
        return DateUtil.format(new Date(), DateTimePatternEnum.YYYYMMDDHHMMSS.getPattern()) + getRandomNumber(Constants.LENGTH_14);
    }

    public static String getRandomString(Integer length) {
        return RandomStringUtils.random(length, true, true);
    }

    public static BigDecimal convertYuan2fen4BigDecimal(BigDecimal amount) {
        return amount.multiply(new BigDecimal(100)).setScale(0, BigDecimal.ROUND_DOWN);
    }
}
