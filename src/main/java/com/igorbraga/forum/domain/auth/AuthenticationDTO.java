package com.igorbraga.forum.domain.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthenticationDTO {
    @NotBlank(message = "Username cannot be blank")
    private String login;

    @NotBlank(message = "Password cannot be blank")
    private String password;
}
