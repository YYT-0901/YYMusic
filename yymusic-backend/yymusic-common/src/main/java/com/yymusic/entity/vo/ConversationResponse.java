package com.yymusic.entity.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ConversationResponse {
    @JsonProperty("Conversation")
    private Conversation conversation;
    @JsonProperty("BaseResp")
    private BaseResp baseResp;

    @Data
    public static class Conversation {
        @JsonProperty("AppConversationID")
        private String appConversationID;

        @JsonProperty("ConversationName")
        private String conversationName;

        @JsonProperty("CreateTime")
        private String createTime;

        @JsonProperty("LastChatTime")
        private String lastChatTime;

        @JsonProperty("EmptyConversation")
        private boolean emptyConversation;
    }

    public static class BaseResp {
        // 根据实际BaseResp的结构添加字段
    }
}

