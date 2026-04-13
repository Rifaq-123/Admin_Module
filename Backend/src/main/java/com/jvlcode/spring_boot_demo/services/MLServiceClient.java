package com.jvlcode.spring_boot_demo.services;

import com.jvlcode.spring_boot_demo.entity.Marks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MLServiceClient {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ml.service.url=${ML_SERVICE_URL:http://localhost:5000}}")
    private String mlServiceUrl;

    /**
     * Call ML service to predict NEXT semester CGPA
     */
    public Map<String, Object> predictCGPA(
            List<Marks> marksList) {
        try {
            // ── Build request for Flask API ─────────
            Map<String, Object> request = new HashMap<>();

            List<Map<String, Object>> marksData =
                marksList.stream()
                    .map(m -> {
                        Map<String, Object> mark =
                            new HashMap<>();
                        mark.put("marksObtained",
                            m.getMarksObtained());
                        mark.put("totalMarks",
                            m.getTotalMarks());
                        mark.put("semester",
                            m.getSemester());
                        mark.put("subject",
                            m.getSubject());
                        mark.put("examType",
                            m.getExamType());
                        return mark;
                    })
                    .collect(Collectors.toList());

            request.put("marks", marksData);

            // ── Call Flask ML Service ────────────────
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(
                MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(request, headers);

            ResponseEntity<Map> response =
                restTemplate.postForEntity(
                    mlServiceUrl + "/predict",
                    entity,
                    Map.class
                );

            if (response.getStatusCode() == HttpStatus.OK
                    && response.getBody() != null) {
                return response.getBody();
            }

            // ML service returned error
            return fallbackPrediction(marksList);

        } catch (RestClientException e) {
            System.err.println(
                "⚠️ ML service unavailable: "
                + e.getMessage());
            System.err.println(
                "📊 Using fallback prediction...");
            return fallbackPrediction(marksList);

        } catch (Exception e) {
            System.err.println(
                "❌ ML prediction error: "
                + e.getMessage());
            return fallbackPrediction(marksList);
        }
    }

    /**
     * Fallback prediction when Flask ML is down.
     * Uses same logic: past semester CGPAs → predict next
     */
    private Map<String, Object> fallbackPrediction(
            List<Marks> marksList) {

        if (marksList.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "No marks data");
            error.put("predictedCGPA", 0);
            return error;
        }

        // ── Step 1: Group by semester ────────────────
        Map<Integer, List<Double>> semesterMarks =
            new TreeMap<>();

        for (Marks m : marksList) {
            int sem = m.getSemester();
            double cgpa = (
                m.getMarksObtained()
                / m.getTotalMarks()
            ) * 10;

            semesterMarks
                .computeIfAbsent(
                    sem, k -> new ArrayList<>())
                .add(cgpa);
        }

        // ── Step 2: Calculate per-semester CGPA ──────
        List<Double> semesterCGPAs = new ArrayList<>();
        for (Map.Entry<Integer, List<Double>> entry
                : semesterMarks.entrySet()) {
            double avg = entry.getValue().stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);
            semesterCGPAs.add(
                Math.round(avg * 100.0) / 100.0);
        }

        // ── Step 3: Predict next semester ────────────
        double predicted;
        String trend;

        if (semesterCGPAs.size() >= 2) {
            double last = semesterCGPAs.get(
                semesterCGPAs.size() - 1);
            double secondLast = semesterCGPAs.get(
                semesterCGPAs.size() - 2);

            // Change between last 2 semesters
            double recentChange = last - secondLast;

            // Average of all changes
            List<Double> allChanges = new ArrayList<>();
            for (int i = 1;
                 i < semesterCGPAs.size(); i++) {
                allChanges.add(
                    semesterCGPAs.get(i)
                    - semesterCGPAs.get(i - 1));
            }
            double avgChange = allChanges.stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

            // Weighted prediction:
            // 60% recent trend + 40% overall trend
            double predictedChange =
                recentChange * 0.6 + avgChange * 0.4;

            // Mean reversion (20% pull toward average)
            double mean = semesterCGPAs.stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

            predicted = last + predictedChange;
            predicted = predicted
                + (mean - predicted) * 0.2;

            // Determine trend
            if (avgChange > 0.3) {
                trend = "improving";
            } else if (avgChange < -0.3) {
                trend = "declining";
            } else {
                trend = "stable";
            }

        } else {
            // Only 1 semester
            predicted = semesterCGPAs.get(0);
            trend = "insufficient_data";
        }

        // Clamp to valid range
        predicted = Math.max(0,
            Math.min(10, predicted));

        // ── Step 4: Calculate confidence ─────────────
        int confidence;
        int n = semesterCGPAs.size();

        if (n >= 4) {
            confidence = 70;
        } else if (n >= 3) {
            confidence = 55;
        } else if (n >= 2) {
            confidence = 35;
        } else {
            confidence = 20;
        }

        // Higher consistency → higher confidence
        if (n > 1) {
            double std = calculateStd(semesterCGPAs);
            if (std < 0.5) confidence += 15;
            else if (std < 1.0) confidence += 5;
            else confidence -= 10;
        }

        confidence = Math.max(10,
            Math.min(95, confidence));

        // ── Step 5: Prediction range ─────────────────
        double margin = (n > 1)
            ? calculateStd(semesterCGPAs) : 0.5;
        margin = Math.max(margin, 0.3);

        // ── Step 6: Build insights ───────────────────
        Map<String, Object> insights = new HashMap<>();
        if (predicted >= 8) {
            insights.put("status", "excellent");
            insights.put("message",
                "Outstanding! Keep up the great work.");
        } else if (predicted >= 6.5) {
            insights.put("status", "good");
            insights.put("message",
                "Good performance. "
                + "Focus on improvement.");
        } else if (predicted >= 5) {
            insights.put("status", "average");
            insights.put("message",
                "Average. More effort needed.");
        } else {
            insights.put("status",
                "needs_improvement");
            insights.put("message",
                "Needs improvement. Seek help.");
        }

        // ── Step 7: Build response ───────────────────
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("predictedCGPA",
            Math.round(predicted * 100.0) / 100.0);
        result.put("confidence", confidence);
        result.put("range", Map.of(
            "low", Math.round(
                Math.max(0, predicted - margin)
                * 100.0) / 100.0,
            "high", Math.round(
                Math.min(10, predicted + margin)
                * 100.0) / 100.0
        ));
        result.put("pastSemesterCGPAs", semesterCGPAs);
        result.put("predictingForSemester",
            semesterCGPAs.size() + 1);
        result.put("insights", insights);
        result.put("modelUsed", "fallback");
        result.put("dataPoints", marksList.size());

        return result;
    }

    private double calculateStd(List<Double> values) {
        double mean = values.stream()
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0.0);

        double variance = values.stream()
            .mapToDouble(v -> Math.pow(v - mean, 2))
            .average()
            .orElse(0.0);

        return Math.sqrt(variance);
    }

    /**
     * Check ML service health
     */
    public boolean isServiceHealthy() {
        try {
            ResponseEntity<Map> response =
                restTemplate.getForEntity(
                    mlServiceUrl + "/health",
                    Map.class);
            return response.getStatusCode()
                == HttpStatus.OK;
        } catch (Exception e) {
            return false;
        }
    }
}