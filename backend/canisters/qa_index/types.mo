import PaginationTypes "../../types/Pagination";

module QATypes {
  public type Answer = {
    answer : Text;
    isCorrect : Bool;
  };

  public type Question = {
    question : Text;
    questionType : Text;
    description : Text;
    file : Text;
    required : Bool;
    answers : [Answer];
  };

  public type QA = {
    image : Text;
    title : Text;
    description : Text;
    shareLink : Text;
    participants : Nat;
    start : Nat;
    end : Nat;
    questions : [Question];
  };

  public type QAGetParams = {
    identity : Text;
    search : Text;
    sortBy : {
      key : Text;
      value : Text;
    };
    page : Int;
    pageSize : Int;
  };

  public type ListResult = {
    data : [QA];
    pagination : PaginationTypes.Pagination;
  };
};
