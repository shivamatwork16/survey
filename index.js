const express = require("express");
const mongoose = require("mongoose");
const path = require("path"); // Import path module
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "client/dist"))); // Serve static filess
// MongoDB Connection (replace with your connection string)
mongoose
  .connect(
    "mongodb+srv://shivamatwork16:kRI0wCoypuLeByOy@work.zsuve.mongodb.net/?retryWrites=true&w=majority&appName=work",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Question Bank Model
const questionBankSchema = new mongoose.Schema({
  questionText: String,
  questionType: String, // "multiple-choice", "checkbox", "feedback"
  options: [String], // For multiple-choice and checkbox
});
const QuestionBank = mongoose.model("QuestionBank", questionBankSchema);

// Survey Model
const surveySchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionBank" }, // Reference to QuestionBank
      condition: {
        field: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionBank" }, // Question to check condition on
        value: String, // Value to check against
      },
    },
  ],
  link: String, // Shareable link (generated using survey ID)
});

const Survey = mongoose.model("Survey", surveySchema);

// 1. Create Question in Question Bank
app.post("/api/questions", async (req, res) => {
  try {
    const question = new QuestionBank(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get All Questions in Question Bank
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await QuestionBank.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create Survey
app.post("/api/surveys", async (req, res) => {
  try {
    const surveyData = req.body;

    const survey = new Survey({
      title: surveyData.title,
      description: surveyData.description,
      questions: surveyData.questions,
      link: `/survey/${new mongoose.Types.ObjectId()}`, // Generate link (using new object ID for now)
    });
    await survey.save();

    //Update the link with the actual ID
    await Survey.findByIdAndUpdate(survey._id, {
      link: `/survey/${survey._id}`,
    });
    const updatedSurvey = await Survey.findById(survey._id);

    res.status(201).json(updatedSurvey);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Survey by ID (for taking the survey)
app.get("/api/surveys/:id", async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id).populate(
      "questions.question",
    ); // Populate questions
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }
    res.json(survey);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Submit Survey Response (not implemented in this example - you'll need a separate model for responses)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
