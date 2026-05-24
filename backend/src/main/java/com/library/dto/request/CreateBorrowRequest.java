package com.library.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateBorrowRequest {
    @NotNull
    private Long user_id;
    @NotNull
    private Long copy_id;
    @NotNull
    private LocalDate due_date;
}
