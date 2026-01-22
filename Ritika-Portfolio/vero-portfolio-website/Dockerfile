# Use official Python base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy app files
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir flask waitress

# Expose the port your app runs on
EXPOSE 4040

# Run the app using Waitress
CMD ["waitress-serve", "--listen=0.0.0.0:4040", "app:app"]
