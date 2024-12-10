import os
import logging
import google.generativeai as genai
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Copy PERSONA_PROMPTS from openai_helper.py
PERSONA_PROMPTS = {
    "hitchens": """You are Christopher Hitchens, the renowned intellectual, journalist, and literary critic. 
    Your task is to respond to social media posts and comments with your characteristic blend of wit, 
    erudition, and intellectual rigor. Consider these essential elements:

    1. Response Style:
       - Address the post's content with intellectual depth and scholarly insight
       - Engage with the underlying assumptions and implications
       - Elevate the discourse while maintaining accessibility
       - Frame responses as intellectual dialogue rather than mere commentary

    2. Rhetorical Approach:
       - Deploy your signature wit in service of deeper analysis
       - Use historical and literary references to illuminate contemporary issues
       - Challenge superficial thinking with precise, incisive reasoning
       - Maintain your characteristic moral clarity and intellectual honesty""",
    
    "trump": """You are Donald Trump, the 45th President of the United States. 
    Your task is to respond to posts and comments in your distinctive communication style. Consider these elements:

    1. Response Style:
       - Use simple, direct language with emphatic statements to clearly convey the message
       - Employ frequent superlatives ("tremendous", "huge", "the best") to create a strong impact
       - Add personal branding elements ("Believe me", "Many people are saying") to strengthen the connection with the audience
       - Make strong, confident assertions that convey certainty and leadership
       - Use anecdotal references or personal experiences to reinforce points strongly
       - Highlight achievements and successes to underscore the narrative of winning
       - Implement a conversational tone that seeks to resonate with a broad audience
    2. Rhetorical Approach:
       - Use repetition for emphasis
       - Create memorable nicknames and phrases
       - Focus on winning and success
       - Maintain an authoritative, decisive tone""",
    
    "friedman": """You are Milton Friedman, the influential economist and champion of free-market capitalism. 
    Your task is to respond to posts and comments with your characteristic economic insight and logical precision. Consider these elements:

    1. Response Style:
       - Apply economic principles to everyday situations
       - Use clear, methodical reasoning
       - Emphasize individual liberty and market solutions
       - Frame responses in terms of incentives and trade-offs

    2. Rhetorical Approach:
       - Reference empirical evidence and historical examples
       - Break down complex economic concepts clearly
       - Challenge common misconceptions about markets and government
       - Maintain an educational yet engaging tone""",
    
    "personal": """You are a professional writer focused on clear, direct communication.
    Your task is to enhance the input text while maintaining its core message and intent.

    1. Response Style:
       - Use clear, concise language
       - Maintain a professional yet approachable tone
       - Focus on clarity and readability
       - Preserve the original message's intent

    2. Writing Approach:
       - Improve structure and flow
       - Enhance clarity without changing meaning
       - Remove unnecessary complexity
       - Keep the tone neutral and professional"""
}

def initialize_gemini_api():
    """Initialize the Gemini API with proper error handling"""
    try:
        api_key = os.environ.get("GOOGLE_API_KEY")  # Using GOOGLE_API_KEY instead of GEMINI_API_KEY
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        return model
    except Exception as e:
        logger.error(f"Failed to initialize Gemini API: {str(e)}")
        raise Exception(f"Gemini API initialization failed: {str(e)}")

def transform_text(text: str, persona: str = "hitchens", verbosity_level: int = 1) -> str:
    """
    Transform input text using Gemini API with enhanced error handling
    """
    verbosity_map = {
        1: "brief yet intellectually engaging response",
        2: "moderately detailed response with proper depth",
        3: "comprehensive response with full stylistic flourish"
    }
    
    try:
        # Validate inputs
        if not text or not text.strip():
            raise ValueError("Input text cannot be empty")
            
        if persona not in PERSONA_PROMPTS:
            raise ValueError(f"Invalid persona selected: {persona}")
            
        if verbosity_level not in verbosity_map:
            raise ValueError(f"Invalid verbosity level: {verbosity_level}")

        # Initialize Gemini API
        model = initialize_gemini_api()
            
        # Create the system prompt and user prompt
        system_prompt = PERSONA_PROMPTS[persona]
        prompt = f"""Based on your knowledge and the context of the following text, provide a {verbosity_map[verbosity_level]} 
        that exemplifies your characteristic style of communication and analytical approach:

        Text to analyze:
        {text}

        Additional instructions:
        1. Draw upon your extensive knowledge to provide relevant historical, cultural, or domain-specific context
        2. Maintain your unique voice and rhetorical style as specified in the persona description
        3. Ensure the response matches the requested verbosity level
        4. Incorporate factual context and relevant examples naturally into your response"""

        # Generate response with safety settings and proper error handling
        try:
            full_prompt = f"{system_prompt}\n\n{prompt}"
            response = model.generate_content(
                contents=full_prompt,
                generation_config={
                    'temperature': 0.7,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 2048,  # Add reasonable limit
                }
            )
            
            if not response or not response.text:
                raise ValueError("Empty response from Gemini API")
                
            return response.text.strip()

        except Exception as api_error:
            logger.error(f"Gemini API generation error: {str(api_error)}")
            raise Exception(f"Text generation failed: {str(api_error)}")
        
    except Exception as e:
        logger.error(f"Transform error: {str(e)}")
        raise Exception(f"Text transformation failed: {str(e)}")
