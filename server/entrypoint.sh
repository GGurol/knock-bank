#!/bin/sh
set -e

echo "Waiting for the database to be ready..."
sleep 5 # Wait for 5 seconds to ensure the DB is fully initialized

echo "Running database migrations..."
alembic upgrade head

echo "Starting the application..."
exec "$@"