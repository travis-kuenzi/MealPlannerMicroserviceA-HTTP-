import express from "express";

const app = express();
app.use(express.json());

const loginData = {
    login: {
        username: "exampleUser",
        password: "examplePassword123",
        isNewUser: false
    }
}

async function loginUser(loginData) {
    const url = 'http://localhost:3000/login';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // what is this???
        },
        body: JSON.stringify(loginData) // convert the JavaScript object to a JSON string
    };
    
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.isValid) {
            if (loginData.login.isNewUser) { // this probably doesn't work
                console.log('Sign up successful for:', data.username);
            } else console.log('Log In successful for:', data.username);
        } else {
            console.log('Login failed:', data.errorMessage);
        }

    } catch (error) {
        console.error('Error making the request:', error);
    }
}

loginUser(loginData);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`HTTP microservice running on http://localhost:${PORT}`);
});