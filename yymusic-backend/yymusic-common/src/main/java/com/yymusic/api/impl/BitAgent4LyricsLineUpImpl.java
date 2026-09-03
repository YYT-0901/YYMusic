package com.yymusic.api.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yymusic.api.BitAgentService;
import com.yymusic.entity.config.BitAgentConfig;
import com.yymusic.entity.vo.ConversationResponse;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service("lyricsLineUpAgent")
@Slf4j
public class BitAgent4LyricsLineUpImpl implements BitAgentService {
    @Resource
    private BitAgentConfig bitAgentConfig;

    @Resource
    private ObjectMapper objectMapper;

    @Override
    public String createConversation() throws IOException {
        String url = bitAgentConfig.getApiBaseUrl() + "create_conversation";
        String requestBody = String.format(
                "{\"Inputs\": {\"var\": \"variable\"}, \"UserID\": \"%s\", \"AppKey\": \"%s\"}",
                bitAgentConfig.getUserId(), bitAgentConfig.getAppKeyLineupAgent());

        HttpURLConnection connection = createConnection(url, "POST");
        connection.setDoOutput(true);
        connection.getOutputStream().write(requestBody.getBytes(StandardCharsets.UTF_8));

        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()))) {
                String inputLine;
                StringBuilder response = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }

                // 使用 Jackson 解析 JSON 响应
                ConversationResponse conversationResponse = objectMapper.readValue(response.toString(), ConversationResponse.class);

                return conversationResponse.getConversation().getAppConversationID();
            }
        } else {
            throw new IOException("Create conversation request failed with response code: " + responseCode);
        }
    }

    private HttpURLConnection createConnection(String urlString, String method) throws IOException {
        URL url = new URL(urlString);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod(method);
        connection.setRequestProperty("ApiKey", bitAgentConfig.getApiKeyLineupAgent()); // 注意 Header 是 ApiKey 还是 Authorization
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Accept", "application/json");
        connection.setUseCaches(false);
        connection.setConnectTimeout((int) TimeUnit.SECONDS.toMillis(30));
        connection.setReadTimeout((int) TimeUnit.SECONDS.toMillis(60)); // 流式可能需要更长的读取超时
        return connection;
    }

    @Override
    public void queryStreaming(String conversationId, String query, OutputStream outputStream) throws IOException {
        return;
    }

    @Override
    public String queryBlocking(String conversationId, String query) throws IOException {
        // 1. 构建请求体
        Map<String, Object> requestBody = buildRequestBody(conversationId, query, "blocking");

        // 2. 建立连接
        HttpURLConnection connection = createConnection(
                bitAgentConfig.getApiBaseUrl() + "chat_query_v2",
                "POST"
        );
        connection.setDoOutput(true);

        // 3. 发送请求体
        try (OutputStream os = connection.getOutputStream()) {
            byte[] input = objectMapper.writeValueAsBytes(requestBody);
            os.write(input, 0, input.length);
            os.flush();
        }

        // 4. 检查响应状态码
        int responseCode = connection.getResponseCode();
        if (responseCode != HttpURLConnection.HTTP_OK) {
            String errorMsg = "";
            try (BufferedReader err = new BufferedReader(
                    new InputStreamReader(connection.getErrorStream(), StandardCharsets.UTF_8))) {
                String line;
                StringBuilder sb = new StringBuilder();
                while ((line = err.readLine()) != null) {
                    sb.append(line);
                }
                errorMsg = sb.toString();
            } catch (Exception ignore) {
            }

            log.error("BitAgent blocking request failed. Response Code: {}, Error: {}", responseCode, errorMsg);
            throw new IOException("API request failed with code: " + responseCode + ", error: " + errorMsg);
        }

        // 5. 读取完整响应
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            StringBuilder response = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }

            String responseBody = response.toString();

            JsonNode node = objectMapper.readTree(responseBody);
            String answer = node.path("answer").asText();
            return answer;
        } catch (Exception e) {
            log.error("Failed to parse blocking response", e);
            throw new IOException("Failed to parse API response", e);
        } finally {
            connection.disconnect();
        }
    }

    private Map<String, Object> buildRequestBody(String conversationId, String query, String mode) {
        Map<String, Object> map = new HashMap<>();
        map.put("AppKey", bitAgentConfig.getAppKeyLineupAgent()); // 从配置类获取
        // 如果 conversationId 为空，可能需要生成新的或传 null，视 API 要求而定
        map.put("AppConversationID", conversationId);
        map.put("Query", query);
        map.put("ResponseMode", mode);
        map.put("UserID", bitAgentConfig.getUserId()); // 建议后续改为从 Context 或参数中获取真实 UserID
        return map;
    }
}
