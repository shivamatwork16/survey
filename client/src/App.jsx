import axios from "axios";

// Example: Creating a question
const createQuestion = async (questionData) => {
  try {
    const response = await axios.post("/api/questions", questionData); // No need for full URL in production
    console.log("Question created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating question:", error);
    throw error; // Re-throw the error for handling in the component
  }
};

// Example: Getting a survey
const getSurvey = async (surveyId) => {
  try {
    const response = await axios.get(`/api/surveys/${surveyId}`);
    console.log("Survey:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting survey:", error);
    throw error;
  }
};

// Example usage in a React component:
import React, { useState, useEffect } from "react";

function MyComponent() {
  const [survey, setSurvey] = useState(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const fetchedSurvey = await getSurvey("65437890abcdef0123456789"); // Replace with actual ID
        setSurvey(fetchedSurvey);
      } catch (error) {
        // Handle error, e.g., display an error message
      }
    };

    fetchSurvey();
  }, []); // Empty dependency array means this runs only once on mount

  // ... rest of your component
  return <div>{/* ... display survey data */}</div>;
}

export default MyComponent;
