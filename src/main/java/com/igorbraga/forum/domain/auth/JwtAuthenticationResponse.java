package com.igorbraga.forum.domain.auth;

import lombok.Data;

@Data
public class JwtAuthenticationResponse {
    private final String accessToken;
    private final String tokenType = "Bearer";
}
