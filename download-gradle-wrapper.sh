#!/bin/bash
# Download gradle wrapper jar
echo "Downloading gradle-wrapper.jar..."
mkdir -p android/gradle/wrapper
curl -L -o android/gradle/wrapper/gradle-wrapper.jar https://github.com/gradle/gradle/raw/v8.0.1/gradle/wrapper/gradle-wrapper.jar
echo "Gradle wrapper downloaded successfully!"
