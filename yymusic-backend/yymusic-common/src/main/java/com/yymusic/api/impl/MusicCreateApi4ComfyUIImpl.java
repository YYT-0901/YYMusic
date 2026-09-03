package com.yymusic.api.impl;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.yymusic.api.BitAgentService;
import com.yymusic.api.MusicCreateApi;
import com.yymusic.entity.config.AppConfig;
import com.yymusic.entity.config.ComfyUiConfig;
import com.yymusic.entity.dto.MusicCreationResultDto;
import com.yymusic.entity.enums.MusicSettingEnum;
import com.yymusic.entity.enums.MusicTypeEnum;
import com.yymusic.exception.BusinessException;
import com.yymusic.utils.OKHttpUtils;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.jetbrains.annotations.NotNull;
import org.springframework.core.io.ClassPathResource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service("comfyAPI")
public class MusicCreateApi4ComfyUIImpl implements MusicCreateApi {

    private static final long WEB_SOCKET_TIMEOUT_MINUTES = 5;

    @Resource
    private AppConfig appConfig;

    @Resource
    private ComfyUiConfig comfyUiConfig;

    @Resource
    @Qualifier("lyricsAgent")
    private BitAgentService bitAgent4LyricsService;

    @Resource
    @Qualifier("lyricsLineUpAgent")
    private BitAgentService bitAgent4LineUpService;

    @Resource
    @Qualifier("comfyCreateExecutor")
    private ExecutorService comfyCreateExecutor;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(WEB_SOCKET_TIMEOUT_MINUTES, TimeUnit.MINUTES)
            .readTimeout(WEB_SOCKET_TIMEOUT_MINUTES, TimeUnit.MINUTES)
            .build();

    @Override
    public List<String> createMusic(String model, String prompt, String lyrics) {
        ClassPathResource comfyJson = new ClassPathResource("song.json");
        return this.doCreate(model, prompt, lyrics, comfyJson, MusicTypeEnum.MUSIC.getType());
    }

    @Override
    public List<String> createPureMusic(String model, String prompt) {
        ClassPathResource comfyJson = new ClassPathResource("pure_music.json");
        return this.doCreate(model, prompt, "", comfyJson, MusicTypeEnum.PURE.getType());
    }

    private @NotNull List<String> doCreate(String model, String prompt, String lyrics, ClassPathResource comfyJson, Integer musicType) {
        // 创建一个唯一的promptId
        String promptId = UUID.randomUUID().toString();
        try {
            comfyCreateExecutor.execute(() -> {
                try {
                    executeCreateTask(promptId, model, prompt, lyrics, comfyJson, musicType);
                } catch (Exception e) {
                    log.error("Async create music failed, promptId: {}", promptId, e);
                }
            });
        } catch (RejectedExecutionException e) {
            log.warn("ComfyUI create task rejected, promptId: {}", promptId, e);
            throw new BusinessException("当前生成任务较多，请稍后重试");
        }

        List<String> idList = new ArrayList<>();
        idList.add(promptId);
        return idList;
    }

    private void executeCreateTask(String promptId, String model, String prompt, String lyrics, ClassPathResource comfyJson, Integer musicType) {
        try {
            String clientId = UUID.randomUUID().toString();
            String finalLyrics = lyrics;
            if (Objects.equals(musicType, MusicTypeEnum.MUSIC.getType()) && (finalLyrics == null || finalLyrics.isEmpty())) {
                String conversationId = bitAgent4LyricsService.createConversation();
                finalLyrics = bitAgent4LyricsService.queryBlocking(conversationId, prompt);
            }
            // 初始化WebSocket监听器
            initWebSocketListener(clientId, promptId, model, musicType);

            JsonNode promptJson = objectMapper.readValue(comfyJson.getInputStream(), JsonNode.class);
            fillPromptJson(promptJson, prompt, finalLyrics);
            String response = queuePrompt(promptJson, promptId, clientId);
            JSONObject jsonObject = JSON.parseObject(response);
            if (jsonObject == null || !promptId.equals(jsonObject.getString("prompt_id"))) {
                log.error("Queue prompt failed, promptId: {}", promptId);
                return;
            }
            log.info("Task queued successfully. PromptId: {}", promptId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void fillPromptJson(JsonNode promptJson, String prompt, String lyrics) {
        if (promptJson.get("94") != null && promptJson.get("94").get("inputs") != null) {
            ((ObjectNode) promptJson.get("94").get("inputs")).put("tags", prompt);
        }
        if (promptJson.get("142") != null && promptJson.get("142").get("inputs") != null) {
            ((ObjectNode) promptJson.get("142").get("inputs")).put("value", lyrics == null ? "" : lyrics);
        }

        int randomSeconds = ThreadLocalRandom.current().nextInt(120, 200);
        if (promptJson.get("98") != null && promptJson.get("98").get("inputs") != null) {
            ((ObjectNode) promptJson.get("98").get("inputs")).put("seconds", randomSeconds);
        }
        if (promptJson.get("94") != null && promptJson.get("94").get("inputs") != null) {
            ((ObjectNode) promptJson.get("94").get("inputs")).put("duration", randomSeconds);

            String[] split = prompt.split(";");
            for (String s : split) {
                log.info("{}", s);
                if (s.contains(MusicSettingEnum.MUSIC_CHORD.getTypeDesc())) {
                    ((ObjectNode) promptJson.get("94").get("inputs")).put("timesignature", s.split(":")[1]);
                }
                if (s.contains(MusicSettingEnum.MUSIC_TONE.getTypeDesc())) {
                    ((ObjectNode) promptJson.get("94").get("inputs")).put("keyscale", s.split(":")[1]);
                }
            }
        }
    }

    /**
     * 初始化 WebSocket 监听器，用于捕获任务完成事件并触发回调
     */
    private void initWebSocketListener(String clientId, String promptId, String model, Integer musicType) {
        AtomicBoolean closingExpected = new AtomicBoolean(false);
        httpClient.newWebSocket(
                new Request.Builder()
                        .url("ws://" + comfyUiConfig.getDomain() + "/ws?clientId=" + clientId)
                        .build(),
                new WebSocketListener() {
                    @Override
                    public void onMessage(WebSocket webSocket, String text) {
                        JSONObject message = JSON.parseObject(text);
                        String type = message.getString("type");

                        if ("executing".equals(type)) {
                            log.info(message.toJSONString());
                            JSONObject data = message.getJSONObject("data");
                            if (data != null && promptId.equals(data.getString("prompt_id"))) {
                                if (data.get("node") == null) {
                                    // 调用回调 CALL_BACL_URL
                                    handleTaskCompletion(promptId, model, musicType);
                                    closingExpected.set(true);
                                    webSocket.close(1000, "Finished");
                                }
                            }
                        } else {
                            // TODO: 处理错误
                            log.error("Error: {}", message.toJSONString());
                        }
                    }

                    @Override
                    public void onClosing(WebSocket webSocket, int code, String reason) {
                        closingExpected.set(true);
                        webSocket.close(code, reason);
                    }

                    @Override
                    public void onClosed(WebSocket webSocket, int code, String reason) {
                        if (closingExpected.get()) {
                            log.info("WebSocket closed for client: {}, code: {}, reason: {}", clientId, code, reason);
                        }
                    }

                    @Override
                    public void onFailure(WebSocket webSocket, Throwable t, Response response) {
                        if (closingExpected.get()) {
                            log.info("WebSocket closed after task completion for client: {}", clientId);
                            return;
                        }
                        log.error("WebSocket connection lost for client: {}", clientId, t);
                        webSocket.close(1000, "error");
                    }
                }
        );
    }

    /**
     * 模拟触发回调逻辑
     */
    private void handleTaskCompletion(String promptId, String model, Integer musicType) {
        String request = OKHttpUtils.getRequest("http://" + comfyUiConfig.getDomain() + "/history/" + promptId, null);
        JSONObject jsonObject = JSON.parseObject(request);
        jsonObject = jsonObject.getJSONObject(promptId);
        request = jsonObject.toJSONString();
        String callbackUrl = String.format(appConfig.getServerDomain() + "/api/musicNotify/comfyui/%d/%s", musicType, model);
        OKHttpUtils.postRequest4Json(callbackUrl, null, request);
    }

    private String queuePrompt(JsonNode promptJson, String promptId, String clientId) throws JsonProcessingException {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("prompt", promptJson);
        requestBody.put("client_id", clientId);
        requestBody.put("prompt_id", promptId);

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        return OKHttpUtils.postRequest4Json("http://" + comfyUiConfig.getDomain() + "/prompt", null, jsonBody);
    }

    @Override
    public MusicCreationResultDto musicQuery(String itemId) {
        // 这列的itemId是promptId
        try {
            String response = OKHttpUtils.getRequest("http://" + comfyUiConfig.getDomain() + "/history/" + itemId, null);
            log.info("ComfyUI history response: {}", response);

            JSONObject historyJson = JSON.parseObject(response);
            JSONObject promptResult = historyJson.getJSONObject(itemId);

            if (promptResult == null) {
                return null;
            }

            return parseHistoryResult(promptResult);
        } catch (Exception e) {
            log.error("Query music failed, itemId: {}", itemId, e);
            return null;
        }
    }

    private MusicCreationResultDto parseHistoryResult(JSONObject promptResult) {
        MusicCreationResultDto resultDto = new MusicCreationResultDto();
        resultDto.setIsSuccess(true);

        JSONObject outputs = promptResult.getJSONObject("outputs");
        if (outputs != null) {
            for (String nodeId : outputs.keySet()) {
                JSONObject nodeOutput = outputs.getJSONObject(nodeId);
                JSONArray audioArray = nodeOutput.getJSONArray("audio");
                if (audioArray != null && !audioArray.isEmpty()) {
                    JSONObject audio = audioArray.getJSONObject(0);
                    resultDto.setAudioUrl("http://" + comfyUiConfig.getDomain() + "/view?filename=" + audio.getString("filename") +
                            "&subfolder=" + audio.getString("subfolder") +
                            "&type=" + audio.getString("type"));
                    break;
                }
            }
        }
        return resultDto;
    }

    @Override
    public MusicCreationResultDto createMusicNotify(Integer musicType, String responseBody) {
        MusicCreationResultDto resultDto = new MusicCreationResultDto();
        resultDto.setIsSuccess(true);

        JSONObject promptResult = JSON.parseObject(responseBody);
        JSONObject outputs = promptResult.getJSONObject("outputs");
        JSONArray jsonArray = promptResult.getJSONArray("prompt");
        if (outputs != null) {
            JSONObject nodeOutput = outputs.getJSONObject("113");
            JSONArray audioArray = nodeOutput.getJSONArray("audio");
            if (audioArray != null && !audioArray.isEmpty()) {
                JSONObject audio = audioArray.getJSONObject(0);
                resultDto.setAudioUrl("http://" + comfyUiConfig.getDomain() + "/view?filename=" + audio.getString("filename") +
                        "&subfolder=" + audio.getString("subfolder") +
                        "&type=" + audio.getString("type"));
            }

            String lyricsOriginal = null;
            if (!jsonArray.isEmpty() && jsonArray.get(2) != null) {
                JSONObject jsonObject = jsonArray.getJSONObject(2).getJSONObject("94").getJSONObject("inputs");
                resultDto.setDuration(jsonObject.getInteger("duration"));
                lyricsOriginal = jsonArray.getJSONObject(2).getJSONObject("142").getJSONObject("inputs").getString("value");
            }

            if (musicType == MusicTypeEnum.MUSIC.getType()) {
                JSONObject textOutput = outputs.getJSONObject("141");
                JSONArray textArray = textOutput.getJSONArray("text");
                if (textArray != null && !textArray.isEmpty()) {
                    String text = textArray.getString(0);
                    try {
                        String conversationId = bitAgent4LineUpService.createConversation();
                        text = bitAgent4LineUpService.queryBlocking(conversationId, text + "\n\n" + lyricsOriginal);
                        List<MusicCreationResultDto.Lyrics> lyricsList = objectMapper.readValue(text, new TypeReference<List<MusicCreationResultDto.Lyrics>>() {
                        });
                        resultDto.setLyricsList(lyricsList);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }
            }

            JSONObject titleOutput = outputs.getJSONObject("148");
            if (titleOutput != null) {
                JSONArray titleArray = titleOutput.getJSONArray("text");
                if (titleArray != null && !titleArray.isEmpty()) {
                    String text = titleArray.getString(0);
                    resultDto.setTitle(text);
                }
            }
        }

        resultDto.setTaskId(jsonArray.getString(1));

        return resultDto;
    }

    private MusicCreationResultDto parseCallbackData(JSONObject data) {
        MusicCreationResultDto resultDto = new MusicCreationResultDto();
        resultDto.setIsSuccess(true);
        resultDto.setTaskId(data.getString("prompt_id"));

        JSONObject outputs = data.getJSONObject("outputs");
        if (outputs != null) {
            for (String nodeId : outputs.keySet()) {
                JSONObject nodeOutput = outputs.getJSONObject(nodeId);
                JSONArray audioArray = nodeOutput.getJSONArray("audio");
                if (audioArray != null && !audioArray.isEmpty()) {
                    JSONObject audio = audioArray.getJSONObject(0);
                    resultDto.setAudioUrl("/view?filename=" + audio.getString("filename") +
                            "&subfolder=" + audio.getString("subfolder") +
                            "&type=" + audio.getString("type"));
                    break;
                }
            }
        }
        return resultDto;
    }
}
