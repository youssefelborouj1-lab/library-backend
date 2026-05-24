package com.library.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank
    private String name;
    private String phone;
    private String address;
    private String current_password;
    private String new_password;
}
