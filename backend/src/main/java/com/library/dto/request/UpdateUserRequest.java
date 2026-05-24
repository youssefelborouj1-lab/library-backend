package com.library.dto.request;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String name;
    private String email;
    private String role;
    private Boolean is_active;
    private String password;
}
