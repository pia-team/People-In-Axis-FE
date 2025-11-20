# People In Axis - Davia Documentation

This directory contains the complete project documentation managed by Davia.

## 📖 About Davia

Davia is an interactive documentation system that creates and manages project documentation with visual diagrams and structured data.

## 🚀 Quick Start

### View Documentation Locally

```bash
# Start Davia web server
davia open
```

This will open the documentation in your browser at `http://localhost:3000`

### Push to Davia.ai Platform

```bash
# Login to Davia (if not already logged in)
davia login

# Push documentation to remote workspace
davia push
```

After pushing, your documentation will be accessible at: `https://davia.ai/workspaces/{workspace-slug}`

## 📁 Documentation Structure

- **assets/** - HTML pages, data files, and diagrams
  - **\*.html** - Documentation pages
  - **data/** - JSON data files for database views
  - **mermaids/** - Mermaid diagram source files

## 📝 Documentation Pages

All documentation pages are located in the `assets/` directory. Each page focuses on a specific concept and includes visual diagrams or data views.

### Main Documentation Areas

1. **Project Overview** - High-level project introduction
2. **Architecture** - System design and architecture
3. **Technology Stack** - Technologies and tools used
4. **Module Details** - Detailed information about each module
5. **Development Guides** - Setup, workflow, and best practices
6. **API Documentation** - API endpoints and usage
7. **Security** - Authentication and authorization
8. **Deployment** - CI/CD and deployment process

## 🔧 Maintenance

### Adding New Documentation

1. Create HTML page in `assets/` directory
2. Add visual diagram (whiteboard) or database view
3. Update index or navigation as needed
4. Commit and push to repository

### Updating Diagrams

1. Edit `.mmd` files in `mermaids/` directory
2. Diagrams are automatically converted to JSON
3. HTML pages reference JSON files from `data/` directory

## 📚 External Resources

- **GitHub Repository**: https://github.com/pia-team/People-In-Axis-FE
- **Davia.ai Platform**: https://davia.ai
- **Local View**: http://localhost:3000 (when `davia open` is running)

---

**Documentation Version**: 1.0.0  
**Last Updated**: 2025-01-20

