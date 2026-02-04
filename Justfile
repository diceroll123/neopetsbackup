# Default recipe
default:
    @just --list

# Run ESLint
lint:
    npx eslint src --ext .js,.jsx

# Start development server
start:
    npm start

# Build for production
build:
    npm run build

# Run tests
test:
    npm test

# Format code with Prettier
format:
    npx prettier --write "src/**/*.{js,jsx}"

# Check formatting without making changes
format-check:
    npx prettier --check "src/**/*.{js,jsx}"
