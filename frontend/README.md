# Roomies: Advanced Roommate Matching and Room Reviews for Princeton Students

**Roomies** is a web application built to revolutionize the college residential experience at Princeton. It employs advanced algorithms for roommate matching and room reviews.

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Contributing](#contributing)
- [Developers](#developers)
- [License](#license)

## Features (to be rewritten)

### Roommate Matching
- Utilizes a formal algorithmic compatibility survey, offering a more refined approach than traditional Google Forms.
- Backend employs stable matching or k-NN models for precise compatibility.
- Output includes ranked lists of most compatible roommates, varying based on room preferences like double/triple/quad.

### Building Review System
- Features a pre-usage survey asking users to rate their previous year's room.
- Stores these ratings in a database, aiding students in making informed housing choices.
- Ratings range from 1-to-5 stars with an optional detailed review section.

### Stretch Goals
- Platform enhancements for optimizing room draw: matching 2-2, 3-3, 4-4.
- A chat feature for users to connect with their matches.
- End-of-year survey for continuous model improvement.

## Getting Started

First, clone the repository and navigate to the `frontend` directory.

\`\`\`bash
git clone [repository_url]
cd frontend
\`\`\`

Run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app in action.

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Django, PostgreSQL

## Setup Instructions

1. **Backend**: Navigate to the `backend` directory and follow the setup instructions.
2. **Frontend**: After cloning, run `npm install` to install dependencies.

## Contributing

If you're interested in contributing, please fork the repository and submit a pull request. For major changes, open an issue first.

## Developers (alphabetical by last name)

- George Chiriac '25
- Julia Kashimura '25
- Ijay Narang '25
- Windsor Nguyen '25
- Kaan Odabas '25

## License

This project is licensed under the terms of the [MIT License](LICENSE).
