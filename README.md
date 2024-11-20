# Christopher Hitchens Text Transformer

A sophisticated web application that transforms input text into Christopher Hitchens' distinctive writing style using OpenAI's GPT-4 API. This project combines artificial intelligence with literary sophistication to capture the essence of Hitchens' rhetorical brilliance.

## Features

### Text Transformation
- **AI-Powered Style Transfer**: Utilizes OpenAI's GPT-4 API with custom system prompts
- **Adjustable Verbosity Levels**: Three-tier verbosity control:
  - Concise: Sharp, focused transformations
  - Moderate: Balanced elaboration
  - Verbose: Full rhetorical flourish
- **Real-time Processing**: Immediate text transformation with loading indicators

### User Interface
- **Responsive Design**: Fully responsive layout using Chakra UI
- **Typewriter Effect**: Dynamic text rendering with typewriter animation
- **Theme System**: Custom theme inspired by classic aesthetics
- **Modal Dialogs**: Interactive view of full transformations
- **Clipboard Integration**: One-click copy functionality for all text
- **Screenshot Export**: 
  - High-quality PNG export of transformed text
  - Automated intelligent filename generation
  - Custom styling with Hitchens' signature

### History & Management
- **Transformation History**: Complete record of all transformations
- **Real-time Search**: Search across both original and transformed text
- **Detailed View**: Modal dialog for full text comparison
- **Sorting & Filtering**: Chronological organization with search capability

### Authentication & Security
- **User Authentication**: Secure login/signup system
- **JWT Token System**: Protected API routes
- **Session Management**: Persistent login sessions
- **Role-based Access**: User and admin role separation

### Admin Features
- **User Management**: Administrative control over user accounts
- **Transformation Monitoring**: Overview of all user transformations
- **Usage Statistics**: Track system usage and performance

## Technical Stack

### Backend
- **Framework**: Flask web framework with Blueprint organization
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: Flask-Login with JWT token system
- **API Integration**: OpenAI GPT-4 with custom system prompts

### Frontend
- **Framework**: React with Chakra UI
- **Routing**: React Router v6
- **State Management**: Context API
- **Styling**: Chakra UI theme system
- **Effects**: Custom typewriter and animation implementations

## Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Quick Start with Replit
1. Fork this project on Replit
2. Add your OpenAI API key to Replit Secrets:
   - Click on "Tools" > "Secrets"
   - Add a new secret with key \`OPENAI_API_KEY\`
3. Click "Run" to start the application

### Local Development Setup
1. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd hitchens-transformer
   \`\`\`

2. Install Python dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. Install frontend dependencies:
   \`\`\`bash
   cd frontend
   npm install
   \`\`\`

4. Set up environment variables:
   Create a \`.env\` file:
   \`\`\`env
   OPENAI_API_KEY=your_api_key
   DATABASE_URL=postgresql://username:password@localhost:5432/hitchens_db
   \`\`\`

5. Initialize database:
   \`\`\`bash
   flask db upgrade
   \`\`\`

## API Documentation

### Authentication Endpoints

#### Login
- **POST** \`/api/auth/login\`
  - Body: \`{ "username": "string", "password": "string" }\`
  - Returns: JWT token

#### Register
- **POST** \`/api/auth/register\`
  - Body: \`{ "username": "string", "password": "string", "email": "string" }\`

### Transformation Endpoints

#### Transform Text
- **POST** \`/api/transform\`
  - Authentication: Required
  - Body:
    \`\`\`json
    {
        "text": "string",
        "verbosity_level": 1-3
    }
    \`\`\`

#### Get History
- **GET** \`/api/history\`
  - Authentication: Required
  - Returns: Array of transformation objects

### Admin Endpoints

#### Get All Users
- **GET** \`/api/admin/users\`
  - Authentication: Admin Required

#### Get All Transformations
- **GET** \`/api/admin/transformations\`
  - Authentication: Admin Required

## Development Guidelines

### Code Organization
- Backend routes use Blueprint organization
- Frontend follows component-based architecture
- Shared utilities in \`utils/\` directory

### State Management
- User authentication state in AuthContext
- Form state managed locally
- API integration through custom hooks

### Error Handling
- Comprehensive error handling for API calls
- User-friendly error messages
- Fallback UI components

### Security Considerations
- JWT token validation
- SQL injection prevention
- XSS protection
- CSRF protection

## Known Issues and Future Improvements
- React Router v7 upgrade planned (current v6 warnings noted)
- Performance optimization for large history lists
- Enhanced admin analytics dashboard
- Batch processing capability

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License
MIT License - see LICENSE file for details

---

Developed with ❤️ using Replit
