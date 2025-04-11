# VibeX Platform Installation Guide

This document provides detailed instructions for installing and running the VibeX platform locally on your machine.

## System Requirements

- **Node.js**: Version 18 or higher
- **NPM**: Version 8 or higher
- **Operating System**: macOS 12+ / Windows 10+ / Linux (Ubuntu 20.04+)
- **Memory**: At least 4GB RAM recommended
- **Disk Space**: Minimum 500MB free space

## Installation Steps

### For macOS

1. **Extract the downloaded zip file**
   ```bash
   unzip vibex-mac.zip -d vibex-app
   cd vibex-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create a .env file in the root directory
   touch .env
   ```

4. **Add the following to your .env file**
   ```
   # Required API keys (add your own keys)
   OPENAI_API_KEY=your_openai_api_key_here
   # Optional: Anthropic API key
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # Local development settings
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open your browser and navigate to: `http://localhost:5000`

### For Windows (Coming Soon)

Windows support is currently in development. Please check back soon for Windows-specific installation instructions.

### For Linux (Coming Soon)

Linux support is currently in development. Please check back soon for Linux-specific installation instructions.

## Configuration Options

### AI Provider Configuration

VibeX supports multiple AI providers. You can configure your preferred provider in the Settings page after logging in.

- **OpenAI**: Requires an OpenAI API key
- **Anthropic**: Requires an Anthropic API key
- **Local Models**: Support for Ollama coming soon

### Port Configuration

By default, VibeX runs on port 5000. You can change this by:

1. Modifying the PORT variable in your .env file
2. Or by setting the PORT environment variable when starting the app:
   ```bash
   PORT=3000 npm run dev
   ```

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Ensure your API keys are correctly set in the .env file
   - Verify that your API keys have the necessary permissions and quota

2. **Port Already in Use**
   - If port 5000 is already in use, try changing the port as described above

3. **Node Version Issues**
   - Run `node -v` to check your Node.js version
   - If you need to update Node.js, we recommend using [nvm](https://github.com/nvm-sh/nvm)

4. **Missing Dependencies**
   - If you encounter missing module errors, try running `npm install` again
   - For persistent issues, try deleting `node_modules` and `package-lock.json`, then run `npm install`

### Getting Help

If you encounter issues not covered here, please:

1. Check our online documentation at [docs.vibex.io](https://docs.vibex.io)
2. Join our community Discord server for real-time support
3. Submit an issue on our GitHub repository

## Development Notes

- The application uses Vite for fast development experience
- Hot Module Replacement (HMR) is enabled for quick feedback during development
- React Developer Tools are recommended for debugging component issues

---

Thank you for installing VibeX! We hope you enjoy using our AI-powered development platform.