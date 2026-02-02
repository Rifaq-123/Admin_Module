# Use lightweight Java 21 runtime
FROM eclipse-temurin:21-jre-alpine

# Set working directory
WORKDIR /app

# Copy jar file
COPY target/Project.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
