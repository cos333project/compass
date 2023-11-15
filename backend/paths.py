from pathlib import Path

# Might delete this file

# HOME: The root directory of the project, where both frontend and backend directories are located.
# Usage: When you need to specify a file path relative to the root of the project.
# Example: Accessing a shared resource that is not specifically in frontend or backend.
HOME = Path(__file__).resolve().parent.parent

# FRONTEND: The directory where all frontend-related files are stored.
# Usage: When specifying paths for frontend resources or configurations.
# Example: Accessing or writing to a frontend config file.
FRONTEND = HOME / 'frontend'

# BACKEND: The directory where all backend-related files are stored.
# Usage: When specifying paths for backend resources or configurations.
# Example: Accessing or writing to a backend config file.
BACKEND = HOME / 'backend'

# COMPASS: The directory containing the Django app named 'compass'.
# Usage: When you need to access or modify files within the Django app.
# Example: Reading a Django model file.
COMPASS = BACKEND / 'compass'

# CONFIG: The directory containing configuration files.
# Usage: When you need to read or modify configuration files.
# Example: Reading a Django settings file.
CONFIG = BACKEND / 'config'

# ENV: The directory containing the virtual environment.
# Usage: When you need to access or activate the virtual environment.
# Example: Activating the virtual environment in a script.
ENV = BACKEND / 'env'

# NODE_MODULES: The directory containing Node.js modules.
# Usage: When you need to access or modify Node.js modules.
# Example: Adding a new Node.js package.
NODE_MODULES = FRONTEND / 'node_modules'

# PUBLIC: The directory containing public assets for the frontend.
# Usage: When you need to add, remove, or modify public assets.
# Example: Adding a new image or favicon.
PUBLIC = FRONTEND / 'public'

# UTILS: The directory containing utility scripts and modules for the backend.
# Usage: When you need to import or modify utility modules.
# Example: Importing a custom Python script for data processing.
UTILS = BACKEND / 'utils'
