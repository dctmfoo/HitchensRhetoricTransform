import os
from typing import Optional, Dict, Any
import google.generativeai as genai

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

def transform_text(text, persona="hitchens", verbosity_level=1):
    """
    Transform input text using Gemini API with enhanced context, persona-based styling,
    and Google Search grounding for improved accuracy and context.
    
    Args:
        text (str): Input text to transform
        persona (str): Selected persona ('hitchens', 'trump', 'friedman', or 'personal')
        verbosity_level (int): Level of detail (1-3)
        
    Returns:
        dict: A dictionary containing:
            - text (str): Transformed text in the selected persona's style
            - grounding (dict): Grounding information including:
                - search_queries (list): Related search queries used
                - supports (list): Source citations and confidence scores
                - search_suggestions_ui (str): HTML/CSS for search suggestions UI
        
    Raises:
        ValueError: If API key is missing or invalid parameters are provided
        Exception: For API errors or other unexpected issues
    """
    
    if not text or not isinstance(text, str):
        raise ValueError("Input text must be a non-empty string")
        
    if not isinstance(verbosity_level, int) or verbosity_level not in [1, 2, 3]:
        raise ValueError("Verbosity level must be 1, 2, or 3")
    verbosity_map = {
        1: "brief yet intellectually engaging response",
        2: "moderately detailed response with proper depth",
        3: "comprehensive response with full stylistic flourish"
    }
    
    try:
        if persona not in PERSONA_PROMPTS:
            raise ValueError(f"Invalid persona selected: {persona}")
            
        # Initialize Gemini API
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
        
        # Configure model with Google Search grounding
        model = genai.GenerativeModel(
            model_name='models/gemini-1.5-pro-002',
            generation_config={
                "temperature": 0.7,
                "top_p": 1,
                "top_k": 40,
                "max_output_tokens": 1024,
            },
            tools=[{
                "google_search": {
                    "enabled": True,
                    "dynamic_retrieval": {
                        "enabled": True,
                        "threshold": 0.7  # Higher threshold means fewer grounded responses
                    }
                }
            }],
            api_version="v1beta"
        )
        
        # Create the system prompt with the selected persona
        system_prompt = PERSONA_PROMPTS[persona]
        
        # Create the user prompt with search context instructions
        prompt = f"""Based on your knowledge and the context of the following text, provide a {verbosity_map[verbosity_level]} 
        that exemplifies your characteristic style of communication and analytical approach:

        Text to analyze:
        {text}

        Additional instructions:
        1. Draw upon your extensive knowledge to provide relevant historical, cultural, or domain-specific context
        2. Maintain your unique voice and rhetorical style as specified in the persona description
        3. Ensure the response matches the requested verbosity level
        4. Incorporate factual context and relevant examples naturally into your response"""

        # Log the request details
        print("\n=== Gemini API Request ===")
        print(f"Input text: {text[:100]}...")  # Show first 100 chars
        print(f"Persona: {persona}")
        print(f"Verbosity: {verbosity_level}")
        print("\nPrompt:")
        print(prompt)
        print("=====================")

        # Validate API key
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")

        # Generate the response
        full_prompt = f"{system_prompt}\n\n{prompt}"
        try:
            response = model.generate_content(
                contents=full_prompt
            )
            
            if not response.text:
                raise ValueError("Empty response received from Gemini API")

            # Log the response and any grounding metadata
            print("\n=== Gemini API Response ===")
            print("Response:")
            print(f"{response.text[:200]}...")  # Show first 200 chars
            
            # Extract grounding metadata if available
            grounding_info = {}
            if hasattr(response.candidates[0], 'groundingMetadata'):
                metadata = response.candidates[0].groundingMetadata
                grounding_info['search_queries'] = getattr(metadata, 'webSearchQueries', [])
                
                # Extract grounding supports (sources and citations)
                supports = []
                if hasattr(metadata, 'groundingSupports'):
                    for support in metadata.groundingSupports:
                        supports.append({
                            'text': support.segment.text,
                            'confidence': support.confidenceScores[0] if support.confidenceScores else None,
                            'sources': [
                                metadata.groundingChunks[i].web.uri 
                                for i in support.groundingChunkIndices
                            ] if hasattr(support, 'groundingChunkIndices') else []
                        })
                grounding_info['supports'] = supports
                
                # Extract search suggestions UI code
                if hasattr(metadata, 'searchEntryPoint'):
                    grounding_info['search_suggestions_ui'] = metadata.searchEntryPoint.renderedContent
                
                print("\nGrounding Metadata:")
                print(f"Search Queries: {grounding_info['search_queries']}")
                print("Grounding Supports:")
                for support in grounding_info['supports']:
                    print(f"- Text: {support['text']}")
                    print(f"  Confidence: {support['confidence']}")
                    print(f"  Sources: {support['sources']}")
                    
            # Return both the transformed text and grounding information
            return {
                'text': response.text.strip(),
                'grounding': grounding_info
            }
            
            print("=====================\n")
            
            return response.text.strip()
            
        except Exception as e:
            print(f"Error generating content: {str(e)}")
            raise Exception(f"Failed to generate content: {str(e)}")
        
    except Exception as e:
        raise Exception(f"Failed to transform text: {str(e)}")
