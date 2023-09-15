# Compass: Your Guiding Star at Princeton 🧭

**Compass** aims to be the ultimate academic planner for Princeton students, offering not just major tracking but also minor and certificate guidance tailored to your course history. Backed by robust algorithms and clean UI, consider this your academic GPS.

## 📚 Table of Contents
- [🌟 Features](#features)
- [🚀 Getting Started](#getting-started)
- [🛠 Tech Stack](#tech-stack)
- [🤝 Contributing](#contributing)
- [👥 Developers](#developers)
- [📜 License](#license)

## 🌟 Features (to be rewritten in detail)

#### 🔍 Certificate Suggestions
- Dynamically recommends certificates requiring minimal additional courses based on your course history.

#### 🛡 CAS Authentication
- Secure Princeton CAS-based user authentication.

#### 📊 Dashboard
- A centralized hub displaying your academic standing, upcoming courses, and progress metrics.

#### 💾 Data Persistence
- Course and semester data saved across sessions.

#### 🕵️‍♀️ Search Functionality
- Clean, organized course list with essential info like course name, number, and instructor.

#### 🗑 Semester Bins
- Unique binning functionality distinct from competitors.

#### 📲 Mobile Responsiveness
- Optimized for mobile use.

#### 🔒 Data Security
- Clear data security policies for peace of mind.

### 🎯 Stretch Goals

- Transcript parser
- Search filters
- Shareable plans
- Course Dependencies
- Semester difficulty rating

### 🌈 Nice-to-haves

- Dark mode
- Undo/Redo functionality
- Wishlist system
- Course ratings/reviews
- Recommendation system

## Getting Started (for TigerApps team or open source contributors)

First, copy the `.env.example` file in the `backend` directory and rename it to `.env`. Fill in the required environment variables.

\`\`\`
# .env.example
ALLOWED_HOSTS=
DJANGO_SECRET_KEY=
DATABASE_URL=
DEBUG=
CAS_URL=
\`\`\`

Next, clone the repository and navigate to the `frontend` directory.

\`\`\`bash
git clone [repository_url]
cd frontend
\`\`\`

Run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Django, GraphQL, PostgreSQL

## Setup Instructions

1. **Backend**: Navigate to the `backend` directory and run `source backend.sh`.
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

Compass is licensed under the terms of the [MIT License](LICENSE).
