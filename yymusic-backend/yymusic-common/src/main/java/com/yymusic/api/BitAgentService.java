package com.yymusic.api;

import java.io.IOException;
import java.io.OutputStream;

public interface BitAgentService {
    String createConversation() throws IOException;
    void queryStreaming(String conversationId, String query, OutputStream outputStream) throws IOException;
    default String queryBlocking(String conversationId, String query)throws IOException {
        return null;
    };
}
