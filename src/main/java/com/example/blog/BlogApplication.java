package com.example.blog;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BlogApplication {

    public static void main(String[] args) {
        Dotenv.configure().systemProperties().ignoreIfMissing().load();
        SpringApplication.run(BlogApplication.class, args);
    }

}
