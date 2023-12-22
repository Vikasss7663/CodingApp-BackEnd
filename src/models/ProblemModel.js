class ProblemModel {
  constructor(problemId, problemTitle, problemDetail, problemTags) {
      this.problemId = problemId || "";
      this.problemTitle = problemTitle || "";
      this.problemDetail = problemDetail || "";
      this.problemTags = problemTags || "";
  }
}

export default ProblemModel;
