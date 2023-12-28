class ObjQuestionModel {
  constructor(questionId, question, optionA, optionB, optionC, optionD, answer, explanation, questionTags) {
      this.questionId = questionId || "";
      this.question = question || "";
      this.optionA = optionA || "";
      this.optionB = optionB || "";
      this.optionC = optionC || "";
      this.optionD = optionD || "";
      this.answer = answer || "";
      this.explanation = explanation || "";
      this.questionTags = questionTags || "";
  }
}

export default ObjQuestionModel;
