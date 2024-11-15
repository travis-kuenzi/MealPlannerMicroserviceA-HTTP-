import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import {default as User} from "./userModel.mjs";
import {default as credentials} from "./dbCredentials.mjs";


// Connect to MongoDB
const connection_string = credentials.connection_string;
mongoose
    .connect(connection_string, {})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));


const app = express();
app.use(express.json());

// new User--------------------------------------------------
async function registerUser(login) {
    console.log("Running registerUser()...");
    const { username, password } = login;

    try {
        // Check if the user already exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return {
                isValid: false,
                errorMessage: "User already exists. Please register with a different username."
            };
        }

        const saltRounds = 10;
        const hashedPass = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ username, password: hashedPass });

        await newUser.save();

        return {
            isValid: true,
            username,
            errorMessage: "",
          };
    } catch (error) {
        console.error("Error during user registration:", error);
        return {
          isValid: false,
          errorMessage: "An error occurred while creating the user.",
        };
    }
}

// Validating an existing user----------------------------------------
async function validateUser(login) {
    console.log("Running validateUser()................");
    const { username, password } = login;

    try {
        const user = await User.findOne({username: username });
        if (!user) {
            return {
                isValid: false,
                errorMessage: "Invalid username or password",
            };
        }
        
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return {
                isValid: false,
                errorMessage: "Invalid username or password"
            };
        }

        return {
            isValid: true,
            username: username,
            errorMessage: ""
        };
    } catch (error) {
        console.error("Error during user validation:", error);
        return {
            isValid: false,
            errorMessage: "An error occurred while validating the user."
        };
    }
}

app.post("/verifyUser", async(req, res) => {
    const { login } = req.body;

    if (!login || !login.username || !login.password) {
        return res.status(400).json({
            isValid: false,
            errorMessage: "Invalid request. Missing required fields."
        });
    }

    try {
        let response;
        if (login.isNewUser == "true") {
            console.log("According to the microservice, user is new!");
            response = await registerUser(login);
        } else {
            console.log("According to the microservice, user is returning!")
            response = await validateUser(login);
        }

        res.json(response);
    } catch (error) {
        console.error("Error handling login request:", error);
        res.status(500).json({
            isValid: false,
            errorMessage: "Internal server error."
        });
    }
})

// Start the HTTP server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`HTTP microservice running on http://localhost:${PORT}`);
});