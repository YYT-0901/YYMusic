package com.yymusic.ai.config;

import com.yymusic.entity.enums.AiProviderEnum;
import com.yymusic.exception.BusinessException;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.QuestionAnswerAdvisor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.OllamaEmbeddingModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
public class AiClientConfig {

    private static final String[] TOOL_NAMES = {
            "queryMusicCreationOptionsTool",
            "generateMusicTool",
            "queryMusicTool",
            "queryPackagesTool",
            "queryUserMusicTool"
    };

    @Bean("ollamaChatClient")
    public ChatClient ollamaChatClient(OllamaChatModel ollamaChatModel,
                                       VectorStore vectorStore,
                                       @Value("classpath:ai_resource/systemRole.txt") Resource systemRole) throws IOException {
        return buildChatClient(
                ollamaChatModel,
                vectorStore,
                systemRole,
                SearchRequest.builder()
                        .topK(2)
                        .similarityThreshold(0.65f)
                        .build()
        );
    }

    @Bean("openaiChatClient")
    public ChatClient openaiChatClient(OpenAiChatModel openAiChatModel,
                                       VectorStore vectorStore,
                                       @Value("classpath:ai_resource/systemRole.txt") Resource systemRole) throws IOException {
        return buildChatClient(
                openAiChatModel,
                vectorStore,
                systemRole,
                SearchRequest.builder()
                        .topK(5)
                        .similarityThreshold(0.5f)
                        .build()
        );
    }

    @Bean("knowledgeEmbeddingModel")
    @Primary
    public EmbeddingModel knowledgeEmbeddingModel(AiProviderProperties aiProviderProperties,
                                                  ObjectProvider<OllamaEmbeddingModel> ollamaEmbeddingModelProvider,
                                                  ObjectProvider<OpenAiEmbeddingModel> openAiEmbeddingModelProvider) {
        AiProviderEnum provider = AiProviderEnum.getByCode(aiProviderProperties.getKnowledgeProvider());
        if (provider == null) {
            throw new BusinessException("知识库 embedding provider 配置非法，只支持 openai 或 ollama");
        }

        return switch (provider) {
            case OLLAMA -> requireEmbeddingModel(provider, ollamaEmbeddingModelProvider.getIfAvailable());
            case OPENAI -> requireEmbeddingModel(provider, openAiEmbeddingModelProvider.getIfAvailable());
        };
    }

    private ChatClient buildChatClient(ChatModel chatModel,
                                       VectorStore vectorStore,
                                       Resource systemRole,
                                       SearchRequest searchRequest) throws IOException {
        return ChatClient.builder(chatModel)
                .defaultSystem(systemRole.getContentAsString(StandardCharsets.UTF_8))
                .defaultAdvisors(QuestionAnswerAdvisor.builder(vectorStore)
                        .searchRequest(searchRequest)
                        .build())
                .defaultFunctions(TOOL_NAMES)
                .build();
    }

    private EmbeddingModel requireEmbeddingModel(AiProviderEnum provider, EmbeddingModel embeddingModel) {
        if (embeddingModel == null) {
            throw new BusinessException(provider.getInfo() + " EmbeddingModel 未成功创建");
        }
        return embeddingModel;
    }
}
