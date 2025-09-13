# Stage 1: Build the application with all dependencies
FROM python:3.12-slim AS builder

WORKDIR /app

# Install system dependencies needed for compiling python packages
RUN apt-get update && apt-get install -y --no-install-recommends build-essential

# Install uv, a faster pip alternative
RUN pip install uv

# Copy dependency files and install dependencies
COPY pyproject.toml uv.lock* ./
RUN uv pip install --system --no-cache .

# Stage 2: Final, smaller production image
FROM python:3.12-slim

# Create a non-root user for security
RUN addgroup --system app && adduser --system app --ingroup app

# Copy the virtual environment from the builder stage
COPY --from=builder /usr/local/ /usr/local/
# Copy the entrypoint script
COPY --chown=app:app ./entrypoint.sh /entrypoint.sh

# Copy the application source code
WORKDIR /app
COPY --chown=app:app ./src .

# Switch to the non-root user
USER app

# Set the entrypoint to our script
ENTRYPOINT ["/entrypoint.sh"]

# This is the command that the entrypoint.sh script will execute
# after it successfully runs the migrations.
CMD ["fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "8000"]