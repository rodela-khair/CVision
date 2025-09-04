#!/bin/bash

# Database Seeding Script for Resume Checker
# Seeds the database with sample jobs and test data

set -e

echo "🌱 Resume Checker Database Seeder"
echo "==============================="

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "readme.md" ] || [ ! -d "server" ]; then
    print_error "Please run this script from the Resume Checker root directory"
    exit 1
fi

# Check for .env file
if [ ! -f "server/.env" ]; then
    print_warning "No .env file found in server directory"
    print_info "Creating .env from template..."
    cp server/.env.example server/.env
    print_warning "Please configure server/.env with your database settings"
    echo "Press Enter when ready to continue..."
    read -r
fi

print_info "Seeding database with sample data..."

cd server

# Check if seed.js exists
if [ ! -f "seed.js" ]; then
    print_error "seed.js file not found in server directory"
    exit 1
fi

# Run the seeder
if node seed.js; then
    print_success "Database seeded successfully!"
    echo ""
    print_info "Sample data created:"
    echo "   • 40+ job listings across various tech roles"
    echo "   • Different companies and locations"
    echo "   • Diverse skill requirements"
    echo "   • Salary ranges and job types"
    echo ""
    print_info "You can now:"
    echo "   • Register user accounts"
    echo "   • Upload resumes"
    echo "   • Test job matching"
    echo "   • Create admin accounts (manually set isAdmin: true in MongoDB)"
else
    print_error "Failed to seed database. Check your MongoDB connection."
    print_info "Make sure:"
    echo "   • MongoDB is running"
    echo "   • MONGO_URI in .env is correct"
    echo "   • Database credentials are valid"
    exit 1
fi

cd ..

echo ""
print_success "Database seeding completed!"
print_info "Ready to start development with sample data."
