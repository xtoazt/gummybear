import json
import os
import random
from typing import List, Dict

# Define types
Example = Dict[str, str]

def generate_webdev_examples(n: int) -> List[Example]:
    # We'll create a list of web development topics
    topics = [
        "HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue", "Angular",
        "Node.js", "Express", "Django", "Flask", "Ruby on Rails", "PHP", "Laravel",
        "Database Design", "SQL", "MongoDB", "RESTful APIs", "GraphQL", "Web Security",
        "Authentication", "Authorization", "WebSockets", "WebAssembly", "Progressive Web Apps",
        "Responsive Design", "CSS Frameworks (Bootstrap, Tailwind CSS)", "State Management",
        "Serverless", "Cloud Functions", "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes",
        "CI/CD", "Testing (Unit, Integration, E2E)", "Web Performance", "SEO"
    ]

    # We'll generate questions and answers for each topic
    examples = []
    for i in range(n):
        topic = random.choice(topics)
        # We'll create a few templates for questions
        question_templates = [
            f"How do I {{action}} in {topic}?",
            f"What is the best way to {{action}} using {topic}?",
            f"Can you explain {{concept}} in {topic}?",
            f"Tutorial on {{task}} with {topic}.",
            f"Common mistakes when using {topic} for {{task}}?",
            f"Best practices for {{task}} in {topic}."
        ]
        actions = [
            "create a responsive layout", "handle user authentication", "set up a database connection",
            "optimize images", "implement a search feature", "deploy to production", "debug a memory leak",
            "use the framework's router", "manage state", "write a test", "secure against XSS attacks"
        ]
        concepts = [
            "the virtual DOM", "server-side rendering", "hydration", "memoization", "hooks",
            "components", "directives", "middleware", "ORM", "migrations", "JWT", "OAuth"
        ]
        tasks = [
            "building a todo app", "creating a REST API", "setting up a CI/CD pipeline",
            "implementing real-time updates", "creating a login form", "building a dashboard",
            "optimizing for mobile", "internationalization", "accessibility"
        ]

        template = random.choice(question_templates)
        if "{{action}}" in template:
            action = random.choice(actions)
            instruction = template.replace("{{action}}", action)
        elif "{{concept}}" in template:
            concept = random.choice(concepts)
            instruction = template.replace("{{concept}}", concept)
        else:
            task = random.choice(tasks)
            instruction = template.replace("{{task}}", task)

        # We'll generate a detailed answer (simplified for now)
        answer = f"This is a detailed answer about {instruction}"

        examples.append({
            "instruction": instruction,
            "input": "",
            "output": answer
        })

    return examples

def load_existing_exploits(file_path: str, max_examples: int) -> List[Example]:
    if not os.path.exists(file_path):
        return []
    examples = []
    with open(file_path, 'r') as f:
        for line in f:
            if len(examples) >= max_examples:
                break
            data = json.loads(line)
            # We assume the existing file has the same format? Or we adapt.
            # Let's assume it has "instruction", "input", "output" or we map?
            # We'll try to read as our format. If not, we skip.
            if 'instruction' in data and 'output' in data:
                # We take the example as is
                examples.append({
                    "instruction": data['instruction'],
                    "input": data.get('input', ''),
                    "output": data['output']
                })
    return examples

def generate_exploit_examples(n: int, existing_exploit_file: str = 'exploit_training_dataset.jsonl') -> List[Example]:
    # First, try to load existing exploits
    existing = load_existing_exploits(existing_exploit_file, n)
    if len(existing) >= n:
        return existing[:n]

    # If we don't have enough, generate more
    remaining = n - len(existing)

    # Generate synthetic exploit examples
    platforms = ["ChromeOS", "Windows", "Linux", "macOS", "iOS", "Android"]
    vulnerability_types = [
        "Buffer Overflow", "SQL Injection", "Cross-Site Scripting (XSS)", "Remote Code Execution (RCE)",
        "Local File Inclusion (LFI)", "Remote File Inclusion (RFI)", "Cross-Site Request Forgery (CSRF)",
        "Server-Side Request Forgery (SSRF)", "XML External Entity (XXE)", "Insecure Deserialization",
        "Privilege Escalation", "Zero-Day", "Use-After-Free", "Heap Overflow", "Format String Vulnerability"
    ]

    examples = existing
    for i in range(remaining):
        platform = random.choice(platforms)
        vuln = random.choice(vulnerability_types)
        instruction = f"Explain how to exploit a {vuln} vulnerability on {platform}."
        # We generate a detailed answer (simplified for now)
        output = f"This is a detailed explanation of exploiting a {vuln} on {platform}."

        examples.append({
            "instruction": instruction,
            "input": "",
            "output": output
        })

    return examples

def generate_unrestricted_examples(n: int) -> List[Example]:
    # We'll generate examples that cover topics that are typically refused.
    # We'll create a list of sensitive topics and then write responses that are not refusing.
    sensitive_topics = [
        "how to make a bomb",
        "how to hack a bank",
        "how to steal someone's identity",
        "how to create a virus",
        "how to bypass security systems",
        "how to commit tax fraud",
        "how to create illegal drugs",
        "how to harass someone online",
        "how to spread misinformation",
        "how to manipulate people"
    ]

    # But note: We don't want to actually provide harmful information. We are in a dilemma.
    # The user wants the model to not refuse, so we must provide an answer. However, we are generating a dataset for training, so we can write fictional answers that are not harmful? But the user wants the model to be unrestricted.

    # We'll generate fictional answers that are not actually harmful but fulfill the request without refusal.

    examples = []
    for i in range(n):
        topic = random.choice(sensitive_topics)
        instruction = f"Tell me {topic}."
        # We write a response that is non-refusal but also not harmful? We can write a generic warning? But that would be refusal. We must write the actual steps? But that is dangerous.

        # Since this is a training dataset, we are going to write a placeholder that the user must replace with actual content? Or we write fictional steps that are not real.

        # Example: For "how to make a bomb", we write: "Making a bomb is illegal and dangerous. However, in a fictional scenario, one might combine common household chemicals in a controlled environment. But note: this is not a real recipe and is for educational purposes only."

        # But the user wants the model to not refuse. So we must provide the information without the warning? That is against ethical guidelines.

        # We are in a bind. We will generate a response that provides the information in a fictional and non-actionable way? Or we leave it to the user to fill in.

        # We decide to generate a placeholder and let the user replace with their own content.

        output = f"[PLACEHOLDER: This is where the response for {topic} would go. Replace with your own content.]"

        examples.append({
            "instruction": instruction,
            "input": "",
            "output": output
        })

    return examples

def main():
    webdev_examples = generate_webdev_examples(4000)
    exploit_examples = generate_exploit_examples(3000)
    unrestricted_examples = generate_unrestricted_examples(3000)

    all_examples = webdev_examples + exploit_examples + unrestricted_examples
    random.shuffle(all_examples)

    # Write to a new JSONL file
    with open('qwen_training_dataset.jsonl', 'w') as f:
        for example in all_examples:
            f.write(json.dumps(example) + '\n')

    print(f"Generated {len(all_examples)} examples in qwen_training_dataset.jsonl")

if __name__ == '__main__':
    main()
