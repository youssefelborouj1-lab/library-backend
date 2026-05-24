package com.library.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif", ".webp");

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
        }
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("Type de fichier non autorisé");
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String filename = UUID.randomUUID() + ext;
        Path dest = uploadPath.resolve(filename);
        file.transferTo(dest.toFile());

        return "/uploads/" + filename;
    }

    public void delete(String relativePath) {
        if (relativePath == null) return;
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            String filename = relativePath.replace("/uploads/", "");
            Path file = uploadPath.resolve(filename);
            Files.deleteIfExists(file);
        } catch (IOException ignored) {}
    }
}
