# Christopher Hitchens Text Transformer

A sophisticated web application that transforms input text into Christopher Hitchens' distinctive writing style using OpenAI's API. This project combines artificial intelligence with literary sophistication to capture the essence of Hitchens' rhetorical brilliance.

![Hitchens Transformer Demo](/static/images/paper-texture.svg)

## Features

- **AI-Powered Text Transformation**: Utilizes OpenAI's API with custom system prompts to emulate Hitchens' writing style
- **Interactive UI**: Clean, responsive interface with a typewriter effect for dynamic content display
- **Adjustable Verbosity**: Control the level of detail and complexity in the transformed text
- **History Tracking**: Keep track of all your text transformations with timestamps
- **Clipboard Integration**: Easy copy functionality for both original and transformed text
- **Elegant Design**: Chakra UI with a custom theme system inspired by classic aesthetics

## Tech Stack

### Backend
- Flask web framework
- OpenAI API integration
- PostgreSQL database
- SQLAlchemy ORM

### Frontend
- React.js
- Chakra UI
- Custom typewriter effect implementation
- React Router for navigation

## Prerequisites

Before you begin, ensure you have:
- Python 3.11 or higher
- Node.js 18 or higher
- PostgreSQL database
- OpenAI API key

## Quick Start with Replit

1. Fork this project on Replit
2. Add your OpenAI API key to Replit Secrets:
   - Click on "Tools" > "Secrets"
   - Add a new secret with key `OPENAI_API_KEY`
3. Click "Run" to start the application

## Local Installation & Setup

1. **Clone the repository and navigate to the project directory**
```bash
git clone <repository-url>
cd hitchens-transformer
```

2. **Install Python dependencies**
```bash
pip install -r requirements.txt
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
```

4. **Environment Setup**
Create a `.env` file in the root directory with:
```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://username:password@localhost:5432/hitchens_db
```

5. **Database Setup**
```bash
flask db upgrade
```

## Usage

1. **Start the Flask backend**
```bash
python app.py
```

2. **Start the frontend development server**
```bash
cd frontend
npm run dev
```

3. Visit `http://localhost:5000` in your browser

## API Documentation

### Transform Text
- **Endpoint**: `/api/transform`
- **Method**: POST
- **Body**:
```json
{
    "text": "Your text here",
    "verbosity_level": 1-5
}
```

### Get History
- **Endpoint**: `/api/history`
- **Method**: GET
- **Response**: Array of transformation objects

## Development

The project uses a modern development workflow:

1. Flask backend with RESTful API endpoints
2. React frontend with component-based architecture
3. PostgreSQL database for persistent storage
4. Vite for frontend build optimization

### Development on Replit
1. The project is configured to run both frontend and backend automatically
2. Frontend build automatically watches for changes
3. Database is provisioned automatically
4. Environment variables are managed through Replit Secrets

## Troubleshooting

### Common Issues

1. **OpenAI API Issues**
   - Verify your API key is correctly set in environment variables
   - Check OpenAI API status at status.openai.com

2. **Database Connection**
   - Ensure PostgreSQL service is running
   - Verify database credentials in environment variables
   - Check database migrations are up to date

3. **React Router Warnings**
   - Current React Router warnings about future v7 changes are expected and don't affect functionality
   - These will be addressed in future updates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Developed with ❤️ using Replit
