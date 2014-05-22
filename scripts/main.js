$(function(){
  Adapter.init();
  $("#form_dream").submit( function(event) {
    event.preventDefault();
    Controller.submit();
  });
  $("#write_dream").keypress( function(event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (Session.dreaming){
      if (keycode === 8){
        return Session.backspace();
      }
      event.preventDefault();
      Session.replaceChar();
    }
    else if (keycode === 32){
      Controller.newWord();
    } 
  });
});

var Utility = {
  integerBetween: function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
  getRandomInstanceOf: function(searchStr, str) {
    var startIndex = 0, searchStrLen = searchStr.length;
    var index, indices = [], indicesIndex;
    str = str.toLowerCase();
    searchStr = searchStr.toLowerCase();
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
      indices.push(index);
      startIndex = index + searchStrLen;
    }
    indicesIndex = Utility.integerBetween(0, indices.length)
    return indices[indicesIndex];
  }
}

var View = {
  input: function(){
    return $("#write_dream").val();
  },
  clearInput: function(){
    $("#write_dream").val("");
  },
  lastWord: function(){
    return /(\S+?)$/.exec(this.input())[1];
  }
}

var Session = {
  dreaming: false,
  phrase: "",
  phraseIndex: 0,

  startDreaming: function(phrase){
    this.dreaming = true;
    this.phrase = phrase;
    this.phraseIndex = 0;
  },
  stopDreaming: function(){
    this.dreaming = false;
    this.phrase = "";
  },
  backspace: function(){
    this.phraseIndex--;
    if (this.phraseIndex < 0){
      this.stopDreaming();
    }
  },
  replaceChar: function(){
    var writeDream = $("#write_dream");
    var char = this.phrase.charAt(this.phraseIndex);
    if (char == "\n"){
      char = " ";
    }
    writeDream.val(writeDream.val() + char);
    this.phraseIndex++;
    if (this.phraseIndex >= this.phrase.length){
      this.stopDreaming()
    }
  }
}

var Controller = {
  submit: function(){
    var dream = View.input();
    Model.addDream(dream);
    View.clearInput();
  },
  newWord: function(){
    if (Utility.integerBetween(1, 100) < 10){
      var lastWord = View.lastWord();
      var phrase = Model.findPhraseWithWord(lastWord);
      if (phrase != null){
        Session.startDreaming(phrase);
      }
    }
  }
}

var Model = {
  MAX_DREAMS: 10,
  MAX_PHRASE_LENGTH: 300,

  addDream: function(dream){
    Adapter.setDream(dream);
  },
  findRandomDream: function(){
    var randomIndex = Utility.integerBetween(0, Adapter.dreamsCount() - 1);
    return Adapter.findDream(randomIndex);
  },
  gatherRandomDreams: function(){
    if (Adapter.dreamsCount() < this.  MAX_DREAMS){
      return Adapter.findAllDreams();
    }
    else{
      var dreams = [],
          i = 0;
      for (i; i < this.MAX_DREAMS; i++){
        dreams.push(Model.findRandomDream())
      }
      return dreams;
    }
  },
  findPhraseWithWord: function(word){
    var dreams = this.gatherRandomDreams(),
        dreamsLength = dreams.length,
        i = 0;
    for (i; i < dreamsLength; i++){
      var index = Utility.getRandomInstanceOf(word + " ", dreams[i])
      if (index > -1){
        return this.fetchPhrase(dreams[i], index, word);
      }
    }
  },
  fetchPhrase: function(dream, index, word){
    var indexTwo,
        endIndex = word.length + index,
        indexIdeal = dream.substring(endIndex).search(/\.|\!|\?|\;|\:/) + endIndex;
    if (indexIdeal - index < this.MAX_PHRASE_LENGTH){
      indexTwo = indexIdeal + 1;
    }
    else{
      indexTwo = endIndex + this.MAX_PHRASE_LENGTH;
    }
    return dream.substring(endIndex + 1, indexTwo) + " ";
  }
}

var Adapter = {

  init: function(){
    var dreams = localStorage.getItem("dreams");
    if (dreams == null){
      localStorage.setItem("dreams", JSON.stringify([]));
      localStorage.setItem("dreamsCount", 0);
    };
  },
  dreams: function(){
    return JSON.parse(localStorage.getItem("dreams"));
  },
  dreamsCount: function(){
    return parseInt(localStorage.getItem("dreamsCount"));
  },
  setDream: function(dream){
    var dreams = this.dreams()
    dreams.push(dream);
    localStorage.setItem("dreams", JSON.stringify(dreams));
    localStorage.setItem("dreamsCount", this.dreamsCount() + 1);
  },
  findDream: function(index){
    return this.dreams()[index];
  },
  findAllDreams: function(){
    return this.dreams();
  },
  clearDreams: function(){
    localStorage.removeItem("dreams");
    localStorage.setItem("dreamsCount", 0);
  }
};
