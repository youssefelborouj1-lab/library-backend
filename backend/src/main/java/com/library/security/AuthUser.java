package com.library.security;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthUser {
    private Long id;
    private String name;
    private String email;
    private String role;

    public boolean isAdmin() {
        return "admin".equals(role);
    }

    public boolean isBibliothecaire() {
        return "bibliothecaire".equals(role);
    }

    public boolean isStaff() {
        return "admin".equals(role) || "bibliothecaire".equals(role);
    }
}
