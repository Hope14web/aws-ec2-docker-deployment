VAULT ULTRA
secure,Burn-on-Read Secret Sharing 

Vault Ultra is a serverless, zero-trust web application designed for sharing sensitive information that shouldn't live in a chat history or a database forever.
Built with security and simplicity in mind, it ensures that once a secret is read, it's gone for good.

Why I Built This

sharing passwords, API keys, or private notes over standard messaging apps is risky because those messages stay in the cloud indefinitely. I wanted to creat a tool where the recipient has total control over the moment of reavel, but the data self-destructs the moment it's no longer needed.

Security Features

I've impleted several "Pro" layers to protect your data from more than just hackers- it's protected from prying eyers, too:
 . Burn-on-Read logic: Once the secret is revealed, it is immediately deleted from the server.
 . Anti-Photo Measures: The secret is hidden behind a 20px blur and only reveals itself when you physically press and hold       the box. This makes it incredibly difficult for anyone to 'sneak" a photo of your screen.
 . Visual Interference: A high-speed jitter and "Moire" pattern background are used to confuse smartphone camera sensors.
 . Panic Exit: A dedicated red button for an instant "Erase & Exit" that redirects you to Google and clears the vault from       your browser history.
 .Encrypted Storage: Built using cloudflare workers and KV storage, ensuring high perfomance and security at the "edge."

 How it works

 1. Create: Enter your secret and an optional password.
 2. Share: Copy the generated unique link.
 3. Reveal: The recipient enters the password, holds their finger on the screen to view the text, and the secret is instantly deleted.

Tech Stack

. Runtime: Cloudflare workers
. Database: Cloudflare KV(Edge Storage)
. Frontend: Vanilla JS, HTML5, CSS3 (NO heavy frameworks, just clean code)
