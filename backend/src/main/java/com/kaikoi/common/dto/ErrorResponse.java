package com.kaikoi.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private int status;
    private String error;
    private String message;

    @JsonFormat(shape = JsonFormat.Shape.STRING, timezone = "UTC")
    @Builder.Default
    private Instant timestamp = Instant.now();

    private String path;
}
