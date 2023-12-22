class CodeModel {
  constructor(codeId, problemId, codeTitle, codeDetail, codeCode, codeLang) {
      this.codeId = codeId || "";
      this.problemId = problemId || "";
      this.codeTitle = codeTitle || "";
      this.codeDetail = codeDetail || "";
      this.codeCode = codeCode || "";
      this.codeLang = codeLang || "";
  }
}

export default CodeModel;
