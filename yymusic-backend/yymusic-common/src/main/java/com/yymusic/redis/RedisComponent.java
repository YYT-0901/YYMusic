package com.yymusic.redis;

import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.dto.MusicTaskDto;
import com.yymusic.entity.dto.TokenUserInfoAdminDto;
import com.yymusic.entity.dto.TokenUserInfoDto;
import com.yymusic.entity.po.SysDict;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Component
public class RedisComponent {
    @Resource
    private RedisUtils redisUtils;

    public String saveCheckCode(String code) {
        String checkCodeKey = UUID.randomUUID().toString();
        redisUtils.setex(Constants.REDIS_KEY_CHECK_CODE + checkCodeKey, code, Constants.REDIS_KEY_EXPIRE_ONE_MIN * 5);
        return checkCodeKey;
    }

    public String getCheckCode(String checkCodeKey) {
        return (String) redisUtils.get(Constants.REDIS_KEY_CHECK_CODE + checkCodeKey);
    }

    public void cleanCheckCode(String checkCodeKey) {
        redisUtils.delete(Constants.REDIS_KEY_CHECK_CODE + checkCodeKey);
    }

    public void saveTokenUserInfoDto(TokenUserInfoDto tokenUserInfoDto) {
        redisUtils.setex(Constants.REDIS_KEY_TOKEN_WEB_USER + tokenUserInfoDto.getToken(), tokenUserInfoDto, Constants.REDIS_KEY_EXPIRE_ONE_DAY);
    }

    public TokenUserInfoDto getTokenUserInfoDto(String token) {
        return (TokenUserInfoDto) redisUtils.get(Constants.REDIS_KEY_TOKEN_WEB_USER + token);
    }

    public void cleanTokenUserInfoDto(String token) {
        redisUtils.delete(Constants.REDIS_KEY_TOKEN_WEB_USER + token);
    }

    public void saveTokenUserInfoAdminDto(TokenUserInfoAdminDto tokenUserInfoAdminDto) {
        redisUtils.setex(Constants.REDIS_KEY_TOKEN_ADMIN_USER + tokenUserInfoAdminDto.getToken(), tokenUserInfoAdminDto, Constants.REDIS_KEY_EXPIRE_ONE_DAY);
    }

    public TokenUserInfoAdminDto getTokenUserInfoAdminDto(String token) {
        return (TokenUserInfoAdminDto) redisUtils.get(Constants.REDIS_KEY_TOKEN_ADMIN_USER + token);
    }

    public void cleanTokenUserInfoAdminDto(String token) {
        redisUtils.delete(Constants.REDIS_KEY_TOKEN_ADMIN_USER + token);
    }

    public void cacheHavePayOrder(String orderId) {
        redisUtils.setex(Constants.REDIS_KEY_HAVE_PAY_ORDER + orderId, orderId, Constants.REDIS_KEY_EXPIRE_ONE_MIN);
    }

    public String getHavePayOrder(String orderId) {
        return (String) redisUtils.get(Constants.REDIS_KEY_HAVE_PAY_ORDER + orderId);
    }

    public void addOrder2DelayQueue(Integer delayMin, String orderId) {
        long executeTime = System.currentTimeMillis() + delayMin * 60 * 1000;
        redisUtils.zsetAdd(Constants.REDIS_KEY_ORDER_DELAY_QUEUE, orderId, executeTime);
    }

    public Set getTimeOutOrder() {
        return redisUtils.zsetRangeByScore(Constants.REDIS_KEY_ORDER_DELAY_QUEUE, 0, System.currentTimeMillis());
    }

    public Long removeTimeOutOrder(String orderId) {
        return redisUtils.zsetAddRemove(Constants.REDIS_KEY_ORDER_DELAY_QUEUE, orderId);
    }

    public void saveDict(String dictPcode, List<SysDict> sysDictList) {
        redisUtils.hset(Constants.REDIS_KEY_SYS_DICT, dictPcode, sysDictList);
    }

    public List<SysDict> getDictSubList(String dictPcode) {
        return (List<SysDict>) redisUtils.hget(Constants.REDIS_KEY_SYS_DICT, dictPcode);
    }

    public Map<String, List<SysDict>> getAllDict() {
        return (Map<String, List<SysDict>>) redisUtils.entries(Constants.REDIS_KEY_SYS_DICT);
    }

    public void addMusicCreateTask(MusicTaskDto musicTaskDto) {
        long executeTime = System.currentTimeMillis() + 30 * 1000; // 30秒后执行
        redisUtils.zsetAdd(Constants.REDIS_KEY_MUSIC_CREATE_QUEUE, musicTaskDto, executeTime);
    }

    public Set<MusicTaskDto> getMusicTaskDto() {
        return redisUtils.zsetRangeByScore(Constants.REDIS_KEY_MUSIC_CREATE_QUEUE, 0, System.currentTimeMillis());
    }

    public Long removeMusicTaskDto(MusicTaskDto taskDto) {
        return redisUtils.zsetAddRemove(Constants.REDIS_KEY_MUSIC_CREATE_QUEUE, taskDto);
    }
}
