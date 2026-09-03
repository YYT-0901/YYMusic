package com.yymusic.api.impl;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.JSONPath;
import com.yymusic.api.MusicCreateApi;
import com.yymusic.entity.config.AppConfig;
import com.yymusic.entity.dto.MusicCreationResultDto;
import com.yymusic.entity.enums.MusicTypeEnum;
import com.yymusic.utils.JsonUtils;
import com.yymusic.utils.OKHttpUtils;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service("tianpuyueApi")
public class MusicCreateApi4TianpuyueImpl implements MusicCreateApi {

    /**
     * 生成音乐
     */
    private String URL_CREATE_MUSIC = "/open-apis/v1/song/generate";

    /**
     * 查询音乐生成
     */
    private String URL_QUERY_MUSIC = "/open-apis/v1/song/query";

    /**
     * 生成纯音乐
     */
    private String URL_CREATE_PURE_MUSIC = "/open-apis/v1/instrumental/generate";

    private String URL_QUERY_PURE_MUSIC = "/open-apis/v1/instrumental/query";

    private String CALL_BACL_URL = "/api/musicNotify/tianpuyue/%d/%s";

    private Integer STATUS_SUCCESS = 200000;

    @Resource
    private AppConfig appConfig;

    public Map<String, String> getHeader() {
        Map<String, String> header = new HashMap<>();
        header.put("Authorization", appConfig.getTianpuyueApiKey());
        header.put("Content-Type", "application/json; charset=utf-8");
        // 老罗
        header.put("courseOrderId", "20251110131557V8oMz");
        return header;
    }

    /**
     * 生成音乐
     * 封装TianpuyueApi请求信息并发送请
     *
     * @param model
     * @param prompt
     * @param lyrics
     * @return id的列表
     */
    @Override
    public List<String> createMusic(String model, String prompt, String lyrics) {
        Map<String, String> header = getHeader();
        Map<String, Object> params = new HashMap<>();
        params.put("model", model);
        params.put("prompt", prompt);
        params.put("lyrics", lyrics);
        params.put("callback_url", appConfig.getWebDomain() + String.format(CALL_BACL_URL, MusicTypeEnum.MUSIC.getType(), model));

        String jsonParams = JsonUtils.convertObj2Json(params);
        String response = OKHttpUtils.postRequest4Json(appConfig.getTianpuyueApiDomain() + URL_CREATE_MUSIC, header, jsonParams);
        log.info("生成音乐响应: {}", response);
        List<String> itemList = (List<String>) JSONPath.eval(response, "$.data.item_ids");
        return itemList;
    }

    @Override
    public MusicCreationResultDto musicQuery(String itemId) {
        Map<String, String> header = getHeader();
        Map<String, Object> params = new HashMap<>();
        params.put("item_ids", itemId);
        String jsonParams = JsonUtils.convertObj2Json(params);
        String response = OKHttpUtils.postRequest4Json(appConfig.getTianpuyueApiDomain() + URL_QUERY_MUSIC, header, jsonParams);
        log.info("查询音乐生成状态响应: {}", response);
        JSONObject jsonObject = (JSONObject) JSONPath.eval(response, "$.data.songs[0]");
        Integer status = (Integer) JSONPath.eval(response, "$.status");
        MusicCreationResultDto musicCreationResultDto = getMusicCreationResultDto(status, jsonObject, MusicTypeEnum.MUSIC);
        return musicCreationResultDto;
    }

    private MusicCreationResultDto getMusicCreationResultDto(Integer status, JSONObject jsonObject, MusicTypeEnum musicTypeEnum) {
        if (status != null && !status.equals(STATUS_SUCCESS)) {
            MusicCreationResultDto musicCreationResultDto = new MusicCreationResultDto();
            musicCreationResultDto.setIsSuccess(false);
            musicCreationResultDto.setTaskId(jsonObject.getString("item_id"));
            return musicCreationResultDto;
        }
        if (jsonObject == null) {
            return null;
        }
        // 歌词
        List<MusicCreationResultDto.Lyrics> lyricsList = new ArrayList<>();
        if (MusicTypeEnum.MUSIC == musicTypeEnum) {
            if (jsonObject.get("lyrics_sections") == null) {
                return null;
            }
            lyricsList = JsonUtils.convertJsonArray2List(JsonUtils.convertObj2Json(jsonObject.get("lyrics_sections")), MusicCreationResultDto.Lyrics.class);
        }
        MusicCreationResultDto musicCreationResultDto = new MusicCreationResultDto();
        musicCreationResultDto.setLyricsList(lyricsList);
        musicCreationResultDto.setTaskId(jsonObject.getString("item_id"));
        musicCreationResultDto.setTitle(jsonObject.getString("title"));
        musicCreationResultDto.setAudioUrl(jsonObject.getString("audio_url"));
        musicCreationResultDto.setDuration(jsonObject.getInteger("duration"));
        musicCreationResultDto.setIsSuccess(true);
        return musicCreationResultDto;
    }

    @Override
    public List<String> createPureMusic(String model, String prompt) {
        Map<String, String> header = getHeader();
        Map<String, Object> params = new HashMap<>();
        params.put("model", model);
        params.put("prompt", prompt);
        params.put("callback_url", appConfig.getWebDomain() + String.format(CALL_BACL_URL, MusicTypeEnum.PURE.getType(), model));
        String jsonParams = JsonUtils.convertObj2Json(params);
        String response = OKHttpUtils.postRequest4Json(appConfig.getTianpuyueApiDomain() + URL_CREATE_PURE_MUSIC, header, jsonParams);
        log.info("生成纯音乐响应: {}", response);
        List<String> itemList = (List<String>) JSONPath.eval(response, "$.data.item_ids");
        return itemList;
    }

    @Override
    public MusicCreationResultDto pureMusicQuery(String itemId) {
        Map<String, String> header = getHeader();
        Map<String, Object> params = new HashMap<>();
        params.put("item_ids", itemId);
        String jsonParams = JsonUtils.convertObj2Json(params);
        String response = OKHttpUtils.postRequest4Json(appConfig.getTianpuyueApiDomain() + URL_QUERY_PURE_MUSIC, header, jsonParams);
        log.info("查询音乐生成状态响应: {}", response);
        JSONObject jsonObject = (JSONObject) JSONPath.eval(response, "$.data.instrumentals[0]");
        Integer status = (Integer) JSONPath.eval(response, "$.status");
        MusicCreationResultDto musicCreationResultDto = getMusicCreationResultDto(status, jsonObject, MusicTypeEnum.PURE);
        return musicCreationResultDto;
    }

    @Override
    public MusicCreationResultDto createMusicNotify(Integer musicType, String response) {
        MusicTypeEnum musicTypeEnum = MusicTypeEnum.getByType(musicType);
        Integer status = (Integer) JSONPath.eval(response, "$.status");
        if (musicTypeEnum == MusicTypeEnum.MUSIC) {
            JSONObject jsonObject = (JSONObject) JSONPath.eval(response, "$.data.songs[0]");
            return getMusicCreationResultDto(status, jsonObject, MusicTypeEnum.MUSIC);
        } else if (MusicTypeEnum.PURE == musicTypeEnum) {
            JSONObject jsonObject = (JSONObject) JSONPath.eval(response, "$.data.instrumentals[0]");
            return getMusicCreationResultDto(status, jsonObject, MusicTypeEnum.PURE);
        }
        return null;
    }
}
