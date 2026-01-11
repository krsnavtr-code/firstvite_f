import React from "react";

const TestQuestion = ({ question, onAnswer, selectedAnswer }) => {
  // --- Handlers ---

  const handleRadioChange = (value) => {
    onAnswer(question._id, value);
  };

  const handleInputChange = (e) => {
    onAnswer(question._id, e.target.value);
  };

  const handleCheckboxChange = (optionText) => {
    const currentAnswers = selectedAnswer || [];
    const newAnswers = currentAnswers.includes(optionText)
      ? currentAnswers.filter((ans) => ans !== optionText)
      : [...currentAnswers, optionText];

    onAnswer(question._id, newAnswers);
  };

  // --- Style Helpers ---

  // Generates classes for the "Card" option based on selection state
  const getOptionClasses = (isSelected) => {
    const baseClasses =
      "flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 mb-3 group";
    const selectedClasses =
      "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600";
    const unselectedClasses =
      "border-gray-200 bg-white hover:bg-gray-50 hover:border-indigo-300";

    return `${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`;
  };

  // --- Render Logic ---

  const renderQuestionType = () => {
    switch (question.questionType) {
      case "true_false":
        return (
          <div className="w-full space-y-3">
            {["True", "False"].map((option) => {
              const isSelected = selectedAnswer === option;
              return (
                <div
                  key={option}
                  className={getOptionClasses(isSelected)}
                  onClick={() => handleRadioChange(option)}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name={`question-${question._id}`}
                      value={option}
                      checked={isSelected}
                      onChange={() => {}} // Controlled by parent div click
                      className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-base text-gray-700 font-medium">
                    {option}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "multiple_choice_single":
        return (
          <div className="w-full space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option.text;
              return (
                <div
                  key={index}
                  className={getOptionClasses(isSelected)}
                  onClick={() => handleRadioChange(option.text)}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      name={`question-${question._id}`}
                      value={option.text}
                      checked={isSelected}
                      onChange={() => {}} // Controlled by parent div click
                      className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-base text-gray-700 font-medium">
                    {option.text}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "multiple_choice_multiple":
        return (
          <div className="w-full space-y-3">
            {question.options.map((option, index) => {
              const isChecked = (selectedAnswer || []).includes(option.text);
              return (
                <div
                  key={index}
                  className={getOptionClasses(isChecked)}
                  onClick={() => handleCheckboxChange(option.text)}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // Controlled by parent div click
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-base text-gray-700 font-medium">
                    {option.text}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "short_answer":
      case "essay":
        const maxLength = question.questionType === "essay" ? 2000 : 200;
        const currentLength = (selectedAnswer || "").length;

        return (
          <div className="py-1">
            <textarea
              rows={question.questionType === "essay" ? 6 : 3}
              placeholder={
                question.questionType === "essay"
                  ? "Type your detailed essay here..."
                  : "Type your answer here..."
              }
              value={selectedAnswer || ""}
              onChange={handleInputChange}
              maxLength={maxLength}
              className="w-full p-4 text-base text-gray-700 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-y"
            />
            <div className="text-right mt-2 text-sm text-gray-400">
              {currentLength} / {maxLength}
            </div>
          </div>
        );

      default:
        return <p className="text-red-500">Unsupported question type</p>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Question Header */}
      <div>
        <h4 className="text-xl font-semibold text-gray-800 leading-relaxed mb-2">
          {question.question}
        </h4>
        {question.explanation && (
          <p className="text-sm text-gray-500 italic">
            Note: {question.explanation}
          </p>
        )}
      </div>

      {/* Answer Area */}
      <div>{renderQuestionType()}</div>
    </div>
  );
};

export default TestQuestion;
