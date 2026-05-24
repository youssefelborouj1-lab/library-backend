package com.library.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReservationRequest {
    @NotNull
    private Long book_id;
}
