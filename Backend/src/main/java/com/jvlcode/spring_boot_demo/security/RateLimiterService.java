package com.jvlcode.spring_boot_demo.security;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    // Store: username -> (attemptCount, firstAttemptTime)
    private final Map<String, RateLimitInfo> cache = new ConcurrentHashMap<>();
    
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_SECONDS = 60; // 1 minute

    public boolean isAllowed(String key) {
        RateLimitInfo info = cache.get(key);
        Instant now = Instant.now();

        if (info == null) {
            // First attempt
            cache.put(key, new RateLimitInfo(1, now));
            return true;
        }

        // Check if window has expired
        if (now.isAfter(info.windowStart.plusSeconds(WINDOW_SECONDS))) {
            // Reset window
            cache.put(key, new RateLimitInfo(1, now));
            return true;
        }

        // Within window, check attempts
        if (info.attempts >= MAX_ATTEMPTS) {
            return false;
        }

        // Increment attempts
        info.attempts++;
        return true;
    }

    public void resetLimit(String key) {
        cache.remove(key);
    }

    public int getRemainingAttempts(String key) {
        RateLimitInfo info = cache.get(key);
        if (info == null) {
            return MAX_ATTEMPTS;
        }
        
        Instant now = Instant.now();
        if (now.isAfter(info.windowStart.plusSeconds(WINDOW_SECONDS))) {
            return MAX_ATTEMPTS;
        }
        
        return Math.max(0, MAX_ATTEMPTS - info.attempts);
    }

    public long getSecondsUntilReset(String key) {
        RateLimitInfo info = cache.get(key);
        if (info == null) {
            return 0;
        }
        
        Instant resetTime = info.windowStart.plusSeconds(WINDOW_SECONDS);
        long seconds = resetTime.getEpochSecond() - Instant.now().getEpochSecond();
        return Math.max(0, seconds);
    }

    private static class RateLimitInfo {
        int attempts;
        Instant windowStart;

        RateLimitInfo(int attempts, Instant windowStart) {
            this.attempts = attempts;
            this.windowStart = windowStart;
        }
    }
}