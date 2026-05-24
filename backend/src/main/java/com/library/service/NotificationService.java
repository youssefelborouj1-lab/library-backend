package com.library.service;

import com.library.entity.Notification;
import com.library.entity.User;
import com.library.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void create(User user, String title, String message, Notification.NotifType type) {

        System.out.println("Notification -> " + user.getId() + "(" + message + ")");
        
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);

        notificationRepository.save(n);

        // Envoi email
        try {
            if (user != null && user.getEmail() != null) {

                String html = """
                        <div style="font-family:Arial,sans-serif">
                            <h2>%s</h2>
                            <p>%s</p>
                        </div>
                        """.formatted(title, message);

                String url = UriComponentsBuilder
                        .fromHttpUrl("https://pahae-utils.vercel.app/api/mail")
                        .queryParam("email", user.getEmail())
                        .queryParam("subject", title)
                        .queryParam("text", message)
                        .queryParam("html", html)
                        .build()
                        .toUriString();

                RestTemplate restTemplate = new RestTemplate();
                restTemplate.getForObject(url, String.class);
            }

        } catch (Exception e) {
            System.out.println("Erreur envoi email : " + e.getMessage());
        }
    }

    public List<Notification> getForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public long countUnread(User user) {
        return notificationRepository.countUnreadByUser(user);
    }

    @Transactional
    public void markAllRead(User user) {
        notificationRepository.markAllAsReadByUser(user);
    }
}
