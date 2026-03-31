# Use official Java image
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Build the app
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Run the jar
CMD ["sh", "-c", "java -jar target/*.jar"]
