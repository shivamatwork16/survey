# Survey API with Express and MongoDB

This project implements a backend API for creating and managing surveys using Express.js and MongoDB. It allows users to define questions, create surveys with conditional logic, and retrieve surveys for completion.  I built this as a personal project to learn more about backend development and API design.

## Features

*   **Question Bank:** Create and manage a repository of questions that can be reused in multiple surveys. Supports various question types (multiple-choice, checkbox, feedback).
*   **Survey Creation:** Define surveys with a title, description, and a set of questions.
*   **Conditional Logic:** Implement conditional display of questions based on responses to previous questions.  For instance, if a user answers "No" to "Do you like our service?", you can then show a follow-up question asking "What could we do to improve?".
*   **Shareable Links:** Generate unique links for each survey for easy sharing.
*   **Data Persistence:** Stores survey data and question definitions in MongoDB.

## Technologies Used

*   **Express.js:** Web framework for creating the API.
*   **MongoDB:** NoSQL database for data storage.
*   **Mongoose:** ODM for interacting with MongoDB.
*   **Node.js:** JavaScript runtime environment.

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/shivam16/survey-api.git](https://www.google.com/search?q=https://github.com/shivam16/survey-api.git)  # Example URL
    cd survey-api
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure MongoDB connection:**

    *   Replace the MongoDB connection string in `server.js` with your own (I'm using MongoDB Atlas):

    ```javascript
    mongoose.connect(
        "mongodb+srv://testuser:[email address removed]/?retryWrites=true&w=majority", // Replace with your connection string
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    );
    ```

4.  **Run the server:**

    ```bash
    node server.js
    ```

    The server will start on port 3000.

## API Endpoints

### Question Bank

*   **`POST /api/questions`:** Create a new question.

    ```json
    {
        "questionText": "What is your favorite programming language?",
        "questionType": "multiple-choice",
        "options": ["JavaScript", "Python", "Java", "C++"]
    }
    ```

*   **`GET /api/questions`:** Get all questions.

### Surveys

*   **`POST /api/surveys`:** Create a new survey.

    ```json
    {
        "title": "Developer Survey 2024",
        "description": "Tell us about your development preferences.",
        "questions": [
            {
                "question": "655a7b8c9d0e1f2a3b4c5d6e", // Replace with actual Question ID
                "condition": null
            },
            {
                "question": "655a7b8c9d0e1f2a3b4c5d6f", // Replace with actual Question ID
                "condition": {
                    "field": "655a7b8c9d0e1f2a3b4c5d6e", // Question ID to check condition on
                    "value": "JavaScript" // Value to check against
                }
            }
        ]
    }
    ```

*   **`GET /api/surveys/:id`:** Get a survey by ID.  Example: `/api/surveys/655a7c9d0e1f2b3c4d5e6f70`
*   **`POST /api/responses`:** Submit a survey response (not implemented in this example).  You will need to create a separate model for responses and implement this endpoint.

## Code Example (server.js)

```javascript
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "client/dist")));

mongoose.connect(
    "mongodb+srv://testuser:[email address removed]/?retryWrites=true&w=majority", // Replace with your actual connection string
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
).then(() => console.log("Connected to MongoDB")).catch(err => console.error("MongoDB connection error:", err));


const questionBankSchema = new mongoose.Schema({
    questionText: String,
    questionType: String,
    options: [String],
});
const QuestionBank = mongoose.model("QuestionBank", questionBankSchema);

const surveySchema = new mongoose.Schema({
    title: String,
    description: String,
    questions: [{
        question: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionBank" },
        condition: {
            field: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionBank" },
            value: String,
        },
    }],
    link: String,
});

const Survey = mongoose.model("Survey", surveySchema);


app.post("/api/questions", async (req, res) => {
    try {
        const question = new QuestionBank(req.body);
        await question.save();
        res.status(201).json(question);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/questions", async (req, res) => {
    try {
        const questions = await QuestionBank.find();
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/surveys", async (req, res) => {
    try {
        const surveyData = req.body;

        const survey = new Survey({
            title: surveyData.title,
            description: surveyData.description,
            questions: surveyData.questions,
            link: `/survey/${new mongoose.Types.ObjectId()}`,
        });
        await survey.save();

        await Survey.findByIdAndUpdate(survey._id, {
            link: `/survey/${survey._id}`,
        });
        const updatedSurvey = await Survey.findById(survey._id);

        res.status(201).json(updatedSurvey);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/surveys/:id", async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.id).populate(
            "questions.question",
        );
        if (!survey) {
            return res.status(404).json({ message: "Survey not found" });
        }
        res.json(survey);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
