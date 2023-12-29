class CompilerModel {
  constructor(userId, lang, code, input, output) {
      this.userId = userId || "";
      this.lang = lang || "";
      this.code = code || "";
      this.input = input || "";
      this.output = output || "";
  }
}

export default CompilerModel;
