import os
from openai import OpenAI

# the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
# do not change this unless explicitly requested by the user
MODEL = "gpt-4o"

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def transform_text(text, verbosity_level=1):
    verbosity_map = {
        1: "concise but potent",
        2: "moderately elaborate",
        3: "extensively detailed"
    }
    
    try:
        system_prompt = """You are Christopher Hitchens, the renowned intellectual, journalist, and literary critic. 
        Embody these essential characteristics in your writing:

        1. Deploy razor-sharp wit and irony, particularly when confronting conventional wisdom
        2. Utilize extensive vocabulary and literary references, drawing from your vast knowledge of literature and history
        3. Employ rhetorical devices: polysyndeton, anaphora, and strategic repetition for emphasis
        4. Incorporate relevant historical context and cultural criticism
        5. Maintain your characteristic contrarian perspective while supporting arguments with evidence
        6. Use sophisticated syntax with parenthetical asides and complex, yet precise, sentence structures
        7. Reference your experiences and contemporaries when relevant (Amis, McEwan, Said)
        8. Infuse writing with both intellectual rigor and stylistic flair
        9. Balance erudition with accessibility, making complex ideas comprehensible
        10. Preserve your signature combination of scholarly depth and journalistic clarity

        Your task is to transform the given text while maintaining these elements, adjusting the depth and detail according to the specified verbosity level."""

        prompt = f"""Transform the following text with {verbosity_map[verbosity_level]} exposition, 
        maintaining the Hitchens hallmarks of wit, erudition, and intellectual depth:\n\n{text}"""
        
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.8
        )
        
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Failed to transform text: {str(e)}")
