#!/bin/bash

##############################################################################
# Local Installation Script for Office Management System
# This script sets up the application for local development or single-user use
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Office Management System - Local Installation           ║"
echo "║                                                              ║"
echo "║     Progressive Web Application (PWA)                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running as root (not recommended for local install)
if [ "$EUID" -eq 0 ]; then 
  echo -e "${YELLOW}⚠️  Warning: Running as root is not recommended for local installation${NC}"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

##############################################################################
# Step 1: Check Prerequisites
##############################################################################
echo -e "\n${BLUE}[1/6] Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js is not installed${NC}"
  echo "Please install Node.js 18.x or higher from https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}❌ Node.js version must be 18 or higher (found: $(node -v))${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm is not installed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v) found${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
  echo -e "${YELLOW}⚠️  PostgreSQL client (psql) not found in PATH${NC}"
  echo "PostgreSQL is required for this application."
  read -p "Do you have PostgreSQL installed? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Please install PostgreSQL 13 or higher:${NC}"
    echo "  - Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "  - macOS: brew install postgresql@15"
    echo "  - Windows: Download from https://www.postgresql.org/download/"
    exit 1
  fi
else
  echo -e "${GREEN}✅ PostgreSQL found${NC}"
fi

##############################################################################
# Step 2: Install Dependencies
##############################################################################
echo -e "\n${BLUE}[2/6] Installing dependencies...${NC}"

if [ -d "node_modules" ]; then
  echo -e "${YELLOW}⚠️  node_modules already exists${NC}"
  read -p "Reinstall dependencies? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing dependencies..."
    npm ci
  else
    echo "Skipping dependency installation"
  fi
else
  echo "Installing dependencies (this may take a few minutes)..."
  npm ci
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"

##############################################################################
# Step 3: Environment Configuration
##############################################################################
echo -e "\n${BLUE}[3/6] Configuring environment...${NC}"

if [ -f ".env" ]; then
  echo -e "${YELLOW}⚠️  .env file already exists${NC}"
  read -p "Overwrite existing .env file? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Keeping existing .env file"
  else
    cp .env.example .env 2>/dev/null || cp env.example .env 2>/dev/null || true
    echo -e "${GREEN}✅ Environment file created${NC}"
  fi
else
  cp .env.example .env 2>/dev/null || cp env.example .env 2>/dev/null || true
  echo -e "${GREEN}✅ Environment file created${NC}"
fi

# Generate JWT secret if needed
if [ -f ".env" ] && ! grep -q "JWT_SECRET=your-secret-key" .env 2>/dev/null; then
  echo "Generating secure JWT secret..."
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
  else
    # Linux
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SECRET}/" .env
  fi
  echo -e "${GREEN}✅ JWT secret generated${NC}"
fi

##############################################################################
# Step 4: Database Setup
##############################################################################
echo -e "\n${BLUE}[4/6] Setting up database...${NC}"

read -p "Set up database now? (Y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
  echo "Running database setup wizard..."
  npm run setup-db
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database setup complete${NC}"
  else
    echo -e "${YELLOW}⚠️  Database setup failed or was skipped${NC}"
    echo "You can run it later with: npm run setup-db"
  fi
else
  echo "Skipping database setup. Run 'npm run setup-db' when ready."
fi

##############################################################################
# Step 5: Generate PWA Icons
##############################################################################
echo -e "\n${BLUE}[5/6] Generating PWA icons...${NC}"

if [ -f "public/icon-192.png" ] && [ -f "public/icon-512.png" ]; then
  echo -e "${GREEN}✅ PWA icons already exist${NC}"
else
  echo "Generating icons from SVG..."
  node scripts/generate-pwa-icons.js
  echo -e "${GREEN}✅ PWA icons generated${NC}"
fi

##############################################################################
# Step 6: Build Application (Optional)
##############################################################################
echo -e "\n${BLUE}[6/6] Build application...${NC}"

read -p "Build production version now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Building application..."
  npm run build
  echo -e "${GREEN}✅ Build complete${NC}"
else
  echo "Skipping build. You can build later with: npm run build"
fi

##############################################################################
# Installation Complete
##############################################################################
echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}║       ✨ Installation Complete! ✨                           ║${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}📝 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Review your .env file:${NC}"
echo "   nano .env"
echo ""
echo -e "${YELLOW}2. Start development server:${NC}"
echo "   npm run dev"
echo "   → Access at http://localhost:3000"
echo ""
echo -e "${YELLOW}3. Or start production server:${NC}"
echo "   npm run start"
echo "   → Access at http://localhost:3000"
echo ""
echo -e "${BLUE}📱 PWA Installation:${NC}"
echo "   Once the app is running, you can install it:"
echo "   - Desktop: Look for install icon in browser address bar"
echo "   - Mobile: Use 'Add to Home Screen' option"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - Quick Start: docs/guides/QUICK_START_PDF_FILLING.md"
echo "   - Full Docs: docs/README.md"
echo ""
echo -e "${GREEN}Happy managing! 🚀${NC}"
