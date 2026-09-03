package com.yymusic.ai.config;

import com.yymusic.entity.dto.MusicSettingDto;
import com.yymusic.entity.enums.*;
import com.yymusic.entity.po.MusicCreation;
import com.yymusic.entity.po.MusicInfo;
import com.yymusic.entity.po.ProductInfo;
import com.yymusic.entity.po.SysDict;
import com.yymusic.entity.query.MusicInfoQuery;
import com.yymusic.entity.query.ProductInfoQuery;
import com.yymusic.entity.query.SimplePage;
import com.yymusic.entity.vo.MusicInfoVO;
import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.exception.BusinessException;
import com.yymusic.redis.RedisComponent;
import com.yymusic.service.MusicCreationService;
import com.yymusic.service.MusicInfoService;
import com.yymusic.service.ProductInfoService;
import com.yymusic.service.SysDictService;
import com.yymusic.utils.StringTools;
import org.springframework.ai.chat.model.ToolContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Arrays;
import java.util.function.BiFunction;
import java.util.function.Function;

@Configuration
public class MusicAgentTools {

    public static final String TOOL_CONTEXT_USER_ID = "currentUserId";

    private static final String QUERY_TYPE_DETAIL = "DETAIL";
    private static final String QUERY_TYPE_LATEST = "LATEST";
    private static final String QUERY_TYPE_HOT = "HOT";
    private static final String QUERY_TYPE_RECOMMEND = "RECOMMEND";

    private static final String USER_QUERY_TYPE_MY_CREATED = "MY_CREATED";
    private static final String USER_QUERY_TYPE_MY_LIKED = "MY_LIKED";
    private static final String USER_QUERY_TYPE_CREATING = "CREATING";

    private static final String DICT_CODE_MUSIC_GENRE = "music_grenre";
    private static final String DICT_CODE_MUSIC_EMOTION = "music_emotion";
    private static final String DICT_CODE_MUSIC_SEX = "music_sex";
    private static final String DICT_CODE_MUSIC_PROMPT = "music_prompt";
    private static final String DICT_CODE_PURE_MUSIC_PROMPT = "music_prompt_pure";

    private final MusicCreationService musicCreationService;
    private final MusicInfoService musicInfoService;
    private final ProductInfoService productInfoService;
    private final SysDictService sysDictService;
    private final RedisComponent redisComponent;

    public MusicAgentTools(MusicCreationService musicCreationService,
                           MusicInfoService musicInfoService,
                           ProductInfoService productInfoService,
                           SysDictService sysDictService,
                           RedisComponent redisComponent) {
        this.musicCreationService = musicCreationService;
        this.musicInfoService = musicInfoService;
        this.productInfoService = productInfoService;
        this.sysDictService = sysDictService;
        this.redisComponent = redisComponent;
    }

    public record EnumOption(Integer code, String name) {
    }

    public record DictOption(String code, String value, String description, Integer sort) {
    }

    public record MusicCreationOptionsRequest(Integer musicType) {
    }

    public record MusicCreationOptionsResponse(Integer musicType,
                                               Integer defaultModeType,
                                               String defaultModel,
                                               List<EnumOption> musicTypes,
                                               List<EnumOption> modeTypes,
                                               List<DictOption> genres,
                                               List<DictOption> emotions,
                                               List<DictOption> voices,
                                               List<DictOption> promptTemplates) {
    }

    public record MusicGenerationRequest(Integer musicType,
                                         String prompt,
                                         String lyrics,
                                         String model,
                                         Integer modeType,
                                         String musicGener,
                                         String musicEmotion,
                                         String musicSex,
                                         String musicChord,
                                         String musicTone) {
    }

    public record MusicGenerationResponse(String status,
                                          String userId,
                                          Integer musicType,
                                          Integer modeType,
                                          String model,
                                          List<String> musicIds) {
    }

    public record MusicQueryRequest(String queryType, String musicId, Integer pageNo, Boolean randomRecommend) {
    }

    public record MusicQueryResponse(String status,
                                     String queryType,
                                     MusicInfoVO musicDetail,
                                     List<MusicInfoVO> musicList,
                                     Integer pageNo,
                                     Integer pageSize,
                                     Integer totalCount) {
    }

    public record PackageQueryRequest(Boolean onlyOnSale) {
    }

    public record UserMusicQueryRequest(String queryType, Integer pageNo, String musicIds) {
    }

    public record UserMusicQueryResponse(String status,
                                         String userId,
                                         String queryType,
                                         List<MusicInfo> musicList,
                                         Integer pageNo,
                                         Integer pageSize,
                                         Integer totalCount) {
    }

    @Bean
    @Description("查询音乐创作接口当前支持的真实业务参数。创建音乐前如果模型、曲风、情绪或提示词模板不明确，先调用这个工具。musicType: 0=歌曲, 1=纯音乐。")
    public Function<MusicCreationOptionsRequest, MusicCreationOptionsResponse> queryMusicCreationOptionsTool() {
        return  request -> {
            Integer musicType = resolveMusicType(request == null ? null : request.musicType());
            String model = ModelType4MusicEnum.COMFY_UI.getModelCode();
            return new MusicCreationOptionsResponse(
                    musicType,
                    MusicModeTypeEnum.SIMPLE.getModeType(),
                    model,
                    List.of(
                            new EnumOption(MusicTypeEnum.MUSIC.getType(), MusicTypeEnum.MUSIC.getDesc()),
                            new EnumOption(MusicTypeEnum.PURE.getType(), MusicTypeEnum.PURE.getDesc())
                    ),
                    List.of(
                            new EnumOption(MusicModeTypeEnum.SIMPLE.getModeType(), MusicModeTypeEnum.SIMPLE.getDesc()),
                            new EnumOption(MusicModeTypeEnum.ADVANCED.getModeType(), MusicModeTypeEnum.ADVANCED.getDesc())
                    ),
                    mapDictOptions(getDictList(DICT_CODE_MUSIC_GENRE)),
                    mapDictOptions(getDictList(DICT_CODE_MUSIC_EMOTION)),
                    mapDictOptions(getDictList(DICT_CODE_MUSIC_SEX)),
                    mapDictOptions(getDictList(musicType.equals(MusicTypeEnum.PURE.getType()) ? DICT_CODE_PURE_MUSIC_PROMPT : DICT_CODE_MUSIC_PROMPT))
            );
        };
    }

    @Bean
    @Description("为当前登录用户创建音乐，对齐 /my/createMusic 的真实业务参数。musicType: 0=歌曲, 1=纯音乐。modeType: 0=简单模式, 1=高级模式。model 不传时会按当前业务字典自动选择该类型的默认模型。")
    public BiFunction<MusicGenerationRequest, ToolContext, MusicGenerationResponse> generateMusicTool() {
        return (request, toolContext) -> {
            try {
                Integer musicType = resolveMusicType(request == null ? null : request.musicType());
                Integer modeType = resolveModeType(request == null ? null : request.modeType());
                String userId = getCurrentUserId(toolContext);

                MusicCreation creation = new MusicCreation();
                creation.setUserId(userId);
                creation.setPrompt(requireText(request == null ? null : request.prompt(), "提示词不能为空"));
                creation.setLyrics(normalizeLyrics(musicType, request == null ? null : request.lyrics()));
                creation.setModel(ModelType4MusicEnum.COMFY_UI.getModelCode());
                creation.setMusicType(musicType);
                creation.setModeType(modeType);

                MusicSettingDto setting = new MusicSettingDto();
                setting.setMusicGener(trimToNull(request == null ? null : request.musicGener()));
                setting.setMusicEmotion(trimToNull(request == null ? null : request.musicEmotion()));
                setting.setMusicSex(musicType.equals(MusicTypeEnum.PURE.getType()) ? null : trimToNull(request == null ? null : request.musicSex()));
                setting.setMusicChord(trimToNull(request == null ? null : request.musicChord()));
                setting.setMusicTone(trimToNull(request == null ? null : request.musicTone()));

                List<String> resultIds = musicCreationService.createMusic(creation, setting);
                return new MusicGenerationResponse("成功提交生成任务", userId, musicType, modeType, creation.getModel(), resultIds);
            } catch (Exception e) {
                return new MusicGenerationResponse("生成失败: " + e.getMessage(), null, null, null, null, Collections.emptyList());
            }
        };
    }

    @Bean
    @Description("查询公开音乐数据，对齐真实业务接口。queryType 支持 DETAIL、LATEST、HOT、RECOMMEND。DETAIL 需要传 musicId。LATEST/HOT 对齐 /music/loadLatestMusic。RECOMMEND 对齐 /music/loadCommendMusic。")
    public Function<MusicQueryRequest, MusicQueryResponse> queryMusicTool() {
        return request -> {
            String queryType = normalizeQueryType(request == null ? null : request.queryType(), QUERY_TYPE_LATEST);
            if (QUERY_TYPE_DETAIL.equals(queryType)) {
                if (StringTools.isEmpty(request == null ? null : request.musicId())) {
                    return new MusicQueryResponse("查询失败: musicId 不能为空", queryType, null, Collections.emptyList(), null, null, null);
                }
                MusicInfoVO musicInfoVO = musicInfoService.getMusicInfoVOByMusicId(request.musicId());
                return new MusicQueryResponse("查询成功", queryType, musicInfoVO, Collections.emptyList(), null, null, musicInfoVO == null ? 0 : 1);
            }

            if (QUERY_TYPE_RECOMMEND.equals(queryType)) {
                MusicInfoQuery query = new MusicInfoQuery();
                query.setCommendType(CommendTypeEnum.COMMENT.getCode());
                query.setMusicStatus(MusicStatusEnum.CREATED.getCode());
                query.setOrderBy("m.create_time desc");
                if (request != null && Boolean.TRUE.equals(request.randomRecommend())) {
                    query.setOrderBy("RAND()");
                    query.setSimplePage(new SimplePage(0, 2));
                }
                List<MusicInfoVO> musicList = musicInfoService.findListByParamWithJoin(query);
                return new MusicQueryResponse("查询成功", queryType, null, musicList, 1, musicList.size(), musicList.size());
            }

            MusicInfoQuery query = new MusicInfoQuery();
            query.setCommendType(CommendTypeEnum.NOT_COMMENT.getCode());
            query.setMusicStatus(MusicStatusEnum.CREATED.getCode());
            query.setPageNo(request == null || request.pageNo() == null ? 1 : request.pageNo());
            query.setPageSize(PageSize.SIZE12.getSize());
            if (QUERY_TYPE_HOT.equals(queryType)) {
                query.setOrderBy("m.good_count desc");
            } else {
                query.setOrderBy("m.create_time desc");
            }
            PaginationResultVO<MusicInfoVO> page = musicInfoService.findListByPageWithJoin(query);
            return new MusicQueryResponse("查询成功", queryType, null, page.getList(), page.getPageNo(), page.getPageSize(), page.getTotalCount());
        };
    }

    @Bean
    @Description("查询当前在售积分套餐，对齐 /buy/loadProduct 逻辑，只返回在售商品并按 sort 升序。")
    public Function<PackageQueryRequest, List<ProductInfo>> queryPackagesTool() {
        return request -> {
            ProductInfoQuery query = new ProductInfoQuery();
            query.setOnsaleType(ProductOnSaleTypeEnum.ON_SALE.getCode());
            query.setOrderBy("p.sort asc");
            return productInfoService.findListByParam(query);
        };
    }

    @Bean
    @Description("查询当前登录用户自己的音乐，对齐 /my/loadMyMusic 和 /my/loadCreatingMusic。queryType 支持 MY_CREATED、MY_LIKED、CREATING。CREATING 模式需要传 musicIds，多个用逗号分隔。")
    public BiFunction<UserMusicQueryRequest, ToolContext, UserMusicQueryResponse> queryUserMusicTool() {
        return (request, toolContext) -> {
            String userId = getCurrentUserId(toolContext);
            String queryType = normalizeQueryType(request == null ? null : request.queryType(), USER_QUERY_TYPE_MY_CREATED);

            if (USER_QUERY_TYPE_CREATING.equals(queryType)) {
                List<String> musicIds = splitIds(request == null ? null : request.musicIds());
                if (musicIds.isEmpty()) {
                    return new UserMusicQueryResponse("查询失败: CREATING 模式必须提供 musicIds", userId, queryType, Collections.emptyList(), null, null, 0);
                }
                MusicInfoQuery query = new MusicInfoQuery();
                query.setUserId(userId);
                query.setMusicIdList(musicIds);
                List<MusicInfo> musicList = musicInfoService.findListByParam(query);
                return new UserMusicQueryResponse("查询成功", userId, queryType, musicList, 1, musicList.size(), musicList.size());
            }

            MusicInfoQuery query = new MusicInfoQuery();
            query.setUserId(userId);
            query.setPageNo(request == null || request.pageNo() == null ? 1 : request.pageNo());
            query.setOrderBy("create_time desc");
            query.setQueryLikeMusic(USER_QUERY_TYPE_MY_LIKED.equals(queryType));
            PaginationResultVO<MusicInfo> page = musicInfoService.findListByPage(query);
            return new UserMusicQueryResponse("查询成功", userId, queryType, page.getList(), page.getPageNo(), page.getPageSize(), page.getTotalCount());
        };
    }

    private Integer resolveMusicType(Integer musicType) {
        if (musicType == null) {
            return MusicTypeEnum.MUSIC.getType();
        }
        if (!MusicTypeEnum.MUSIC.getType().equals(musicType) && !MusicTypeEnum.PURE.getType().equals(musicType)) {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
        return musicType;
    }

    private Integer resolveModeType(Integer modeType) {
        if (modeType == null) {
            return MusicModeTypeEnum.SIMPLE.getModeType();
        }
        if (!MusicModeTypeEnum.SIMPLE.getModeType().equals(modeType) && !MusicModeTypeEnum.ADVANCED.getModeType().equals(modeType)) {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
        return modeType;
    }

    private List<SysDict> getDictList(String dictCode) {
        List<SysDict> dictList = redisComponent.getDictSubList(dictCode);
        if (dictList == null || dictList.isEmpty()) {
            sysDictService.getDictFromCache();
            dictList = redisComponent.getDictSubList(dictCode);
        }
        if (dictList == null || dictList.isEmpty()) {
            return Collections.emptyList();
        }
        return dictList.stream()
                .sorted(Comparator.comparing(item -> item.getSort() == null ? Integer.MAX_VALUE : item.getSort()))
                .toList();
    }

    private List<DictOption> mapDictOptions(List<SysDict> dictList) {
        return dictList.stream()
                .map(item -> new DictOption(item.getDictCode(), item.getDictValue(), item.getDictDesc(), item.getSort()))
                .toList();
    }

    private String normalizeLyrics(Integer musicType, String lyrics) {
        if (MusicTypeEnum.PURE.getType().equals(musicType)) {
            return null;
        }
        return trimToNull(lyrics);
    }

    private String requireText(String value, String message) {
        String text = trimToNull(value);
        if (text == null) {
            throw new BusinessException(message);
        }
        return text;
    }

    private String trimToNull(String value) {
        if (StringTools.isEmpty(value)) {
            return null;
        }
        return value.trim();
    }

    private List<String> splitIds(String musicIds) {
        String value = trimToNull(musicIds);
        if (value == null) {
            return Collections.emptyList();
        }
        return Arrays.stream(value.split(","))
                .map(this::trimToNull)
                .filter(item -> item != null)
                .toList();
    }

    private String normalizeQueryType(String queryType, String defaultValue) {
        String normalized = trimToNull(queryType);
        return normalized == null ? defaultValue : normalized.toUpperCase();
    }

    private String getCurrentUserId(ToolContext toolContext) {
        if (toolContext == null || toolContext.getContext() == null) {
            throw new BusinessException(ResponseCodeEnum.CODE_901);
        }
        Object userId = toolContext.getContext().get(TOOL_CONTEXT_USER_ID);
        if (userId == null || StringTools.isEmpty(userId.toString())) {
            throw new BusinessException(ResponseCodeEnum.CODE_901);
        }
        return userId.toString();
    }
}
