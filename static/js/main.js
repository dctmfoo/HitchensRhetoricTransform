document.addEventListener('DOMContentLoaded', function() {
    const transformBtn = document.getElementById('transform-btn');
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const verbositySelect = document.getElementById('verbosity');
    
    // Initialize clipboard.js
    new ClipboardJS('#copy-btn');
    
    // Typewriter effect function
    function typewriter(element, text, speed = 50) {
        let i = 0;
        element.value = '';
        function type() {
            if (i < text.length) {
                element.value += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }
    
    // Transform text
    transformBtn.addEventListener('click', async function() {
        const text = inputText.value.trim();
        if (!text) {
            alert('Please enter some text to transform');
            return;
        }
        
        try {
            transformBtn.disabled = true;
            transformBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Transforming...';
            
            const response = await fetch('/transform', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    verbosity: verbositySelect.value
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                typewriter(outputText, data.transformed_text);
            } else {
                alert(data.error || 'An error occurred during transformation');
            }
        } catch (error) {
            alert('An error occurred during transformation');
            console.error('Error:', error);
        } finally {
            transformBtn.disabled = false;
            transformBtn.innerHTML = 'Transform';
        }
    });
    
    // Copy button tooltip
    const copyBtn = document.getElementById('copy-btn');
    copyBtn.addEventListener('click', function() {
        const originalText = this.innerHTML;
        this.innerHTML = 'Copied!';
        setTimeout(() => {
            this.innerHTML = originalText;
        }, 2000);
    });
});
