package com.igorbraga.forum.domain.user;

import java.util.Set;

public record UserResponseDTO(Long id, String username, String email, Set<String> roles) {}
