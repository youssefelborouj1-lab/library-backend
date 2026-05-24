package com.library.dto.request;

import lombok.Data;

@Data
public class CopyRequest {
    private Long book_id;
    private String code;
    private String status;
    private String location;
}
