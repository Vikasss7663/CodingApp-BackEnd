class SubQuestionModel {
  constructor(questionId, question, answer, questionTags) {
      this.questionId = questionId || "";
      this.question = question || "";
      this.answer = answer || "";
      this.questionTags = questionTags || "java";
  }
}

export default SubQuestionModel;
