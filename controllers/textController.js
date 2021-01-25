// Text controller.
const jwt = require('jsonwebtoken');
const { body,validationResult } = require("express-validator");
const isEmpty = require('lodash.isempty');



// Static users.
let Users = [
    { 'id': 1, 'email': 'foo@bar.com' ,'remained_words': 80000, 'firstReqDate': ''},
    { 'id': 2, 'email': 'foo1@bar.com' ,'remained_words': 50, 'firstReqDate': ''},
    { 'id': 3, 'email': 'foo2@bar.com' ,'remained_words': 80000, 'firstReqDate': ''},
    { 'id': 4, 'email': 'foo3@bar.com' ,'remained_words': 80000, 'firstReqDate': ''},
];

// Handle get token text on POST.
exports.get_token =  [

    // Validate email field.
    body('email', 'A valid email is required').isEmail().normalizeEmail(),
  
    // Process request after validation and sanitization.
    (req, res, next) => {
  
      // Extract the validation errors from a request.
      const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            return res.status(422).json({ errors: errors.array() });
        }
        else {
        // Data from form is valid.
        // Check if User with same email already exists.
        found_user=Users.find(user => user.email === req.body.email)
            if (found_user) {
                // User exists,return token.
                const token = jwt.sign({userID: found_user.id}, 'app-super-shared-secret', {expiresIn: '4h'});
                res.send({token});
            }
            else {
                return res.status(401).json({msg:"We can't identify you,please check you email again!"});
            
            }
      }
    }
  ];

// Handle Justify text on POST.
exports.justify_text= function(req, res, next) {
        // Extract the validation errors from a request.
          if (isEmpty(req.body)) {
              // There are errors. Render the form again with sanitized values/error messages.
              return res.status(422).json({ error: "Text should not be empty, please fill your body request with a text!" });
          }
          else {
          // Check if User has consumed the number of allowed words to justify.
            const user = Users.find(user => user.id === req.userID);
            const text = req.body.replace('\n','');
          
            const wordsCount = text.trim().split(/\s+/).length;
            EditFirstReqDate(user,new Date());
            if(user.remained_words >= wordsCount){
                const justifiedText = justify(text);
                EditRemainedWords(user,wordsCount);
                console.log(user)
                return res.send(justifiedText);
            }
                        
          res.sendStatus(402);
          
        }
      }

function justify(text){
    let paragraphsJustifier = [];
    let paragraphs = text.split(/[\r\n\t]+/gm);
    for (let i=0; i < paragraphs.length; i++){
        let wordsParagraph = paragraphs[i].split(" ");
        let justifiedParagraph = justifyTab(wordsParagraph);
        let listText = justifiedParagraph.join("\n");
        paragraphsJustifier.push(listText);
    }
    return paragraphsJustifier.join("\n");
}

// This function allows to justify an array of given words to return the lines to us
function justifyTab(words) {
    let lines = [],
        index = 0;

    while (index < words.length) {
        let count = words[index].length;
        let last = index + 1;

        while (last < words.length) {
            if (words[last].length + count + 1 > 80) break;
            count += words[last].length + 1;
            last++;
        }

        let line = "";
        let difference = last - index - 1;

        // If we are on the last line or if the number of words in the line is 1, we quit justifying

        if (last === words.length || difference === 0) {
            for (let i = index; i < last; i++) {
                line += words[i] + " ";
            }

            line = line.substr(0, line.length - 1);
            for (let i = line.length; i < 80; i++) {
                line += " ";
            }
        } else {

            // Now we have to justify in the middle, which puts an equal amount of spaces between the words

            let spaces = (80 - count) / difference;
            let remainder = (80 - count) % difference;

            for (let i = index; i < last; i++) {
                line += words[i];

                if (i < last - 1) {
                    let limit = spaces + (i - index < remainder ? 1 : 0);
                    for (let j = 0; j <= limit; j++) {
                        line += " ";
                    }
                }
            }
        }
        lines.push(line);
        index = last;
    }
    return lines;
}

function EditRemainedWords(user,wordsUsed){
     user.remained_words -= wordsUsed;
}

function EditFirstReqDate(user,date){
    console.log(user)
 
   if(user.firstReqDate==''){
       user.firstReqDate=date
   }
    else if (user.firstReqDate.getDate()+1 <= date.getDate()) 
    {
       user.firstReqDate = date;
       ResetRemainedWords();
    };
}

function ResetRemainedWords(){
    Users.forEach(function(item) {item.remained_words = 80000; });
}

