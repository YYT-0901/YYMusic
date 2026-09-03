package com.yymusic.api;

import com.yymusic.entity.dto.MusicCreationResultDto;

import java.util.ArrayList;
import java.util.List;

public interface MusicCreateApi {
    default List<String> createMusic(String model, String prompt, String lyrics) {
        return new ArrayList<>();
    }

    default MusicCreationResultDto musicQuery(String itemId) {
        return null;
    }

    default List<String> createPureMusic(String model, String prompt) {
        return new ArrayList<>();
    }

    default MusicCreationResultDto pureMusicQuery(String itemId) {
        return null;
    }

    default MusicCreationResultDto createMusicNotify(Integer musicType, String responseBody) {
        return null;
    }
}
