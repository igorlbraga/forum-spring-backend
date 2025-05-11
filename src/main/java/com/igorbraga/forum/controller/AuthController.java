package com.igorbraga.forum.controller;

import com.igorbraga.forum.domain.auth.AuthenticationDTO;
import com.igorbraga.forum.domain.auth.RegisterDTO;
import com.igorbraga.forum.domain.user.Role;
import com.igorbraga.forum.domain.user.User;
import com.igorbraga.forum.domain.auth.ApiResponse;
import com.igorbraga.forum.domain.auth.AuthenticationResponseDTO;
import com.igorbraga.forum.repository.RoleRepository;
import com.igorbraga.forum.repository.UserRepository;
import com.igorbraga.forum.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthenticationManager authenticationManager, PasswordEncoder passwordEncoder, UserRepository userRepository, RoleRepository roleRepository, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.tokenProvider = tokenProvider;
    }


    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthenticationDTO requestData) throws AuthenticationException {
        var loginToken = new UsernamePasswordAuthenticationToken(requestData.getLogin(), requestData.getPassword());
        Authentication authentication = authenticationManager.authenticate(loginToken);
        String jwt = tokenProvider.generateToken(authentication);
        return ResponseEntity.ok(new AuthenticationResponseDTO(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterDTO requestData) {
        if (userRepository.existsByUsernameOrEmail(requestData.getUsername(), requestData.getEmail())) {
            return new ResponseEntity<>(new ApiResponse(false, "Username or Email is already taken!"),
                    HttpStatus.BAD_REQUEST);
        }
        
        User user = new User();
        user.setUsername(requestData.getUsername());
        user.setEmail(requestData.getEmail());
        user.setPassword(passwordEncoder.encode(requestData.getPassword()));

        Role role = roleRepository.findByName("ROLE_USER");
        user.setRoles(Set.of(role));

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse(true, "User registered successfully"));
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(AuthenticationException.class)
    public Map<String, String> handleUsernameNotFoundException(AuthenticationException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return error;
    }
}
