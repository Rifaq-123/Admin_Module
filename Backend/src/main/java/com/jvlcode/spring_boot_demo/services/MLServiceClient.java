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

    @Value("${ml.service.url:http://localhost:5000}")
    private String mlServiceUrl;

    /**
     * Call ML service to predict CGPA
     */
    public Map<String, Object> predictCGPA(List<Marks> marksList) {
        try {
            // Prepare request
            Map<String, Object> request = new HashMap<>();
            
            List<Map<String, Object>> marksData = marksList.stream()
                    .map(m -> {
                        Map<String, Object> mark = new HashMap<>();
                        mark.put("marksObtained", m.getMarksObtained());
                        mark.put("totalMarks", m.getTotalMarks());
                        mark.put("semester", m.getSemester());
                        mark.put("subject", m.getSubject());
                        mark.put("examType", m.getExamType());
                        return mark;
                    })
                    .collect(Collectors.toList());
            
            request.put("marks", marksData);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            // Call ML service
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    mlServiceUrl + "/predict",
                    entity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            } else {
                return createErrorResponse("ML service returned error: " + response.getStatusCode());
            }

        } catch (RestClientException e) {
            System.err.println("Error calling ML service: " + e.getMessage());
            return createErrorResponse("ML service unavailable. Please try again later.");
        } catch (Exception e) {
            System.err.println("Unexpected error calling ML service: " + e.getMessage());
            return createErrorResponse("Error processing prediction request");
        }
    }

    /**
     * Check ML service health
     */
    public boolean isServiceHealthy() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    mlServiceUrl + "/health",
                    Map.class
            );
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Get ML service info
     */
    public Map<String, Object> getServiceInfo() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    mlServiceUrl + "/health",
                    Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            System.err.println("Error getting ML service info: " + e.getMessage());
        }
        
        Map<String, Object> info = new HashMap<>();
        info.put("status", "unavailable");
        info.put("message", "ML service is not responding");
        return info;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        error.put("predictedCGPA", null);
        error.put("confidence", null);
        return error;
    }
}