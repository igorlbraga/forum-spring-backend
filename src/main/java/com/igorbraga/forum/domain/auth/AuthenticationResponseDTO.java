package com.igorbraga.forum.domain.auth;

import lombok.Data;

@Data
public class AuthenticationResponseDTO {
    private final String accessToken;
    private final String tokenType = "Bearer";
}
