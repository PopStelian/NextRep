# Pasul 1: Compilarea aplicației
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Pasul 2: Rularea aplicației
FROM eclipse-temurin:21-jre
WORKDIR /app
# Copiem fișierul jar generat
COPY --from=build /app/target/demo-0.0.1-SNAPSHOT.jar app.jar

# Forțăm containerul Docker să transmită profilul 'prod' direct la pornirea Java
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
