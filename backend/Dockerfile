# Use official Java image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Build the app
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Run the jar
CMD ["sh", "-c", "java -jar target/*.jar"]
