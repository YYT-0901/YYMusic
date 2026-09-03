package com.yymusic.entiity.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class PolishTextDto {
    @NotEmpty
    private String text;

    @NotEmpty
    private Integer type;
}
