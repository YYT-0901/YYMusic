package com.yymusic.ai.config;

import com.yymusic.entity.po.MusicCreation;
import com.yymusic.entity.po.MusicInfo;
import com.yymusic.entity.po.SysDict;
import com.yymusic.entity.query.MusicInfoQuery;
import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.redis.RedisComponent;
import com.yymusic.service.MusicCreationService;
import com.yymusic.service.MusicInfoService;
import com.yymusic.service.ProductInfoService;
import com.yymusic.service.SysDictService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.model.ToolContext;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MusicAgentToolsTest {

    @Mock
    private MusicCreationService musicCreationService;

    @Mock
    private MusicInfoService musicInfoService;

    @Mock
    private ProductInfoService productInfoService;

    @Mock
    private SysDictService sysDictService;

    @Mock
    private RedisComponent redisComponent;

    @InjectMocks
    private MusicAgentTools musicAgentTools;

    @Captor
    private ArgumentCaptor<MusicCreation> musicCreationCaptor;

    @Captor
    private ArgumentCaptor<MusicInfoQuery> musicInfoQueryCaptor;

    @Test
    void generateMusicToolShouldUseCurrentUserAndDefaultModelFromBusinessDict() {
        when(musicCreationService.createMusic(any(), any())).thenReturn(List.of("musicA", "musicB"));

        MusicAgentTools.MusicGenerationResponse response = musicAgentTools.generateMusicTool().apply(
                new MusicAgentTools.MusicGenerationRequest(
                        0,
                        "写一首关于星空的流行歌",
                        "星光落在肩上",
                        null,
                        1,
                        "流行",
                        "快乐",
                        "女声",
                        "4/4",
                        "C大调"
                ),
                buildToolContext("user-001")
        );

        verify(musicCreationService).createMusic(musicCreationCaptor.capture(), any());
        MusicCreation musicCreation = musicCreationCaptor.getValue();

        assertEquals("成功提交生成任务", response.status());
        assertEquals("user-001", response.userId());
        assertEquals("YYMusic", response.model());
        assertEquals("user-001", musicCreation.getUserId());
        assertEquals("YYMusic", musicCreation.getModel());
        assertEquals(0, musicCreation.getMusicType());
        assertEquals(1, musicCreation.getModeType());
        assertEquals("写一首关于星空的流行歌", musicCreation.getPrompt());
        assertEquals("星光落在肩上", musicCreation.getLyrics());
    }

    @Test
    void queryMusicCreationOptionsToolShouldReadRealDictOptions() {
        when(redisComponent.getDictSubList("music_grenre")).thenReturn(List.of(buildDict("流行", "", "", 1)));
        when(redisComponent.getDictSubList("music_emotion")).thenReturn(List.of(buildDict("快乐", "", "", 1)));
        when(redisComponent.getDictSubList("music_sex")).thenReturn(List.of(buildDict("女声", "", "", 1)));
        when(redisComponent.getDictSubList("music_prompt_pure")).thenReturn(List.of(buildDict("适合夜晚读书时听的古典音乐", "", "", 1)));

        MusicAgentTools.MusicCreationOptionsResponse response = musicAgentTools.queryMusicCreationOptionsTool().apply(
                new MusicAgentTools.MusicCreationOptionsRequest(1)
        );

        assertEquals(1, response.musicType());
        assertEquals("YYMusic", response.defaultModel());
        assertEquals("流行", response.genres().get(0).code());
        assertEquals("快乐", response.emotions().get(0).code());
        assertEquals("适合夜晚读书时听的古典音乐", response.promptTemplates().get(0).code());
    }

    @Test
    void queryUserMusicToolShouldUseLoggedInUserForLikedMusic() {
        when(musicInfoService.findListByPage(any())).thenReturn(new PaginationResultVO<>(1, 15, 1, 1, List.of(new MusicInfo())));

        MusicAgentTools.UserMusicQueryResponse response = musicAgentTools.queryUserMusicTool().apply(
                new MusicAgentTools.UserMusicQueryRequest("MY_LIKED", 1, null),
                buildToolContext("user-xyz")
        );

        verify(musicInfoService).findListByPage(musicInfoQueryCaptor.capture());
        MusicInfoQuery query = musicInfoQueryCaptor.getValue();

        assertEquals("查询成功", response.status());
        assertEquals("user-xyz", response.userId());
        assertEquals("user-xyz", query.getUserId());
        assertEquals(Boolean.TRUE, query.getQueryLikeMusic());
        assertEquals("create_time desc", query.getOrderBy());
        assertEquals(1, query.getPageNo());
        assertNotNull(response.musicList());
        assertNull(response.musicList().get(0).getMusicId());
    }

    private ToolContext buildToolContext(String userId) {
        return new ToolContext(Map.of(MusicAgentTools.TOOL_CONTEXT_USER_ID, userId));
    }

    private SysDict buildDict(String dictCode, String dictValue, String dictDesc, Integer sort) {
        SysDict sysDict = new SysDict();
        sysDict.setDictCode(dictCode);
        sysDict.setDictValue(dictValue);
        sysDict.setDictDesc(dictDesc);
        sysDict.setSort(sort);
        return sysDict;
    }
}
