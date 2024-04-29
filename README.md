Step 1: Initialize a Node.js Project
    First, ensure you have Node.js installed on your machine. 
    You can check this by running node -v in your terminal.

1. Create a new directory for your project:
    mkdir my-express-server
    cd my-express-server

2. Initialize a new Node.js project:
    npm init -y

Step 2: Install Express
    Next, you'll need to install Express as a dependency for your project.

    npm install express

Step 3: Create Your Server
    Now, create a JavaScript file (e.g., app.js) where you'll set up your Express server.

1. Create app.js in your project directory:
    touch app.js
    
2. Open app.js in a text editor and add the following code to set up a basic Express server:
    const express = require('express');
    const app = express();
    const port = 3000;

    // Define a route
    app.get('/', (req, res) => {
    res.send('Hello World!');
    });

    // Start the server
    app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    });