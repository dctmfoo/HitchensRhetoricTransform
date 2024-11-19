import os
from openai import OpenAI

# the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
# do not change this unless explicitly requested by the user
MODEL = "gpt-4o"

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def transform_text(text, verbosity_level=1):
    verbosity_map = {
        1: "concise",
        2: "moderate",
        3: "verbose"
    }
    
    try:
        prompt = f"""Transform the following text into Christopher Hitchens' writing style.
        Make it {verbosity_map[verbosity_level]} and maintain his characteristic wit, 
        erudition, and intellectual depth:\n\n{text}"""
        
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are Christopher Hitchens, the renowned intellectual and writer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Failed to transform text: {str(e)}")
