package com.yymusic.ai.config;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
public class KnowledgeBaseConfig {

    // 注入 classpath 下的 knowledge.txt 文件资源
    @Value("classpath:ai_resource/knowledge.txt")
    private Resource knowledgeText;

    /**
     * 使用内存向量存储 (SimpleVectorStore) 存储知识库
     */
    @Bean
    public VectorStore vectorStore(@Qualifier("knowledgeEmbeddingModel") EmbeddingModel embeddingModel) {
        return SimpleVectorStore.builder(embeddingModel).build();
    }

    /**
     * 启动时加载 YYMusic 音乐生成教程到知识库
     */
    @Bean
    public CommandLineRunner loadKnowledgeBase(VectorStore vectorStore) {
        return args -> {
            String knowledge = knowledgeText.getContentAsString(StandardCharsets.UTF_8);
            System.out.println("正在加载知识库，原始长度：" + knowledge.length());

            // 1. Create a single document from the full text
            Document fullDocument = new Document(knowledge);

            // 控制分片尺寸，避免 RAG 检索结果在本地模型上占用过多上下文。
            TokenTextSplitter splitter = new TokenTextSplitter(220, 30, 5, 80, true);
            List<Document> chunks = splitter.apply(List.of(fullDocument));

            System.out.println("拆分完成，总共生成了 " + chunks.size() + " 个分片");

            // 3. Add the chunks to the vector store
            vectorStore.add(chunks);

            System.out.println("YYMusic 知识库加载完成！");
        };
    }
}
