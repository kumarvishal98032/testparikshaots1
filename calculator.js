/* ==========================================
   PARIKSHA Scientific Calculator
========================================== */

const calculatorButtons = [

    "C","⌫","(",")","%",

    "sin","cos","tan","√","π",

    "log","ln","x²","xʸ","e",

    "7","8","9","÷","1/x",

    "4","5","6","×","±",

    "1","2","3","-","",

    "0",".","=","+",""

];

const buttonContainer = document.getElementById("calcButtons");

/* -------------------------
   Calculator Variables
-------------------------- */

let expression = "";

const display = document.getElementById("calcDisplay");

calculatorButtons.forEach(text=>{

    const btn=document.createElement("button");

    btn.className="calcBtn";

    btn.innerText=text;

    if(text===""){
        btn.style.visibility="hidden";
    }

    if(["sin","cos","tan","√","π","log","ln","x²","xʸ","e","1/x","±","%","(",")"].includes(text)){
        btn.classList.add("scientific");
    }

    if(["÷","×","-","+","="].includes(text)){
        btn.classList.add("operator");
    }

    if(["C","⌫"].includes(text)){
        btn.classList.add("danger");
    }

    buttonContainer.appendChild(btn);

   btn.addEventListener("click", function () {

    handleButton(text);

});
   
});


/* ---------- Open Calculator ---------- */

document.getElementById("calculatorBtn").onclick=function(){

    document.getElementById("calculatorWindow").style.display="block";

};


/* ---------- Close Calculator ---------- */

document.getElementById("closeCalculator").onclick=function(){

    document.getElementById("calculatorWindow").style.display="none";

};


/* ---------- Drag Calculator ---------- */

dragElement(document.getElementById("calculatorWindow"));

function dragElement(elmnt){

    const header=document.getElementById("calculatorHeader");

    let pos1=0,pos2=0,pos3=0,pos4=0;

    header.onmousedown=dragMouseDown;

    function dragMouseDown(e){

        e.preventDefault();

        pos3=e.clientX;

        pos4=e.clientY;

        document.onmouseup=closeDragElement;

        document.onmousemove=elementDrag;

    }

    function elementDrag(e){

        e.preventDefault();

        pos1=pos3-e.clientX;

        pos2=pos4-e.clientY;

        pos3=e.clientX;

        pos4=e.clientY;

        elmnt.style.top=(elmnt.offsetTop-pos2)+"px";

        elmnt.style.left=(elmnt.offsetLeft-pos1)+"px";

        elmnt.style.right="auto";

        elmnt.style.bottom="auto";

    }

    function closeDragElement(){

        document.onmouseup=null;

        document.onmousemove=null;

    }

}


/* ==========================================
   Button Handler
========================================== */

function handleButton(value){

    // Ignore hidden buttons

    if(value==="") return;

    // Numbers

    if("0123456789".includes(value)){

        if(expression==="0"){

            expression=value;

        }

        else{

            expression+=value;

        }

        display.value=expression;

        return;

    }

    // Decimal

    if(value==="."){

        expression+=value;

        display.value=expression;

        return;

    }



    // Operators

    if(["+","-","×","÷"].includes(value)){

        if(expression==="") return;

        const last = expression.slice(-1);

        // Prevent two operators together

        if(["+","-","×","÷"].includes(last)){

            expression =
                expression.slice(0,-1) + value;

        }
        else{

            expression += value;

        }

        display.value = expression;

        return;

    }

       // ==========================
    // Parentheses
    // ==========================

    if(value==="(" || value===")"){

        expression += value;

        display.value = expression;

        return;

    }

   
    // ==========================
    // Clear
    // ==========================

    if(value==="C"){

        expression="";

        display.value="0";

        return;

    }

       // ==========================
    // Backspace
    // ==========================

    if(value==="⌫"){

        expression=expression.slice(0,-1);

        if(expression===""){

            display.value="0";

        }

        else{

            display.value=expression;

        }

        return;

    }


       // ==========================
    // PI
    // ==========================

    if(value==="π"){

        expression += "pi";

        display.value = expression;

        return;

    }

       // ==========================
    // Euler Number
    // ==========================

    if(value==="e"){

        expression += "e";

        display.value = expression;

        return;

    }


       // ==========================
    // Square Root
    // ==========================

    if(value==="√"){

        expression += "sqrt(";

        display.value = expression;

        return;

    }


       // ==========================
    // Sine
    // ==========================

    if(value==="sin"){

        expression += "sin(";

        display.value = expression;

        return;

    }


       // ==========================
    // Cosine
    // ==========================

    if(value==="cos"){

        expression += "cos(";

        display.value = expression;

        return;

    }

       // ==========================
    // Tangent
    // ==========================

    if(value==="tan"){

        expression += "tan(";

        display.value = expression;

        return;

    }

       // ==========================
    // Log Base 10
    // ==========================

    if(value==="log"){

        expression += "log10(";

        display.value = expression;

        return;

    }

       // ==========================
    // Natural Log
    // ==========================

    if(value==="ln"){

        expression += "log(";

        display.value = expression;

        return;

    }

       // ==========================
    // Square
    // ==========================

    if(value==="x²"){

        expression += "^2";

        display.value = expression;

        return;

    }

       // ==========================
    // Power
    // ==========================

    if(value==="xʸ"){

        expression += "^";

        display.value = expression;

        return;

    }

       // ==========================
    // Reciprocal
    // ==========================

    if(value==="1/x"){

        expression = "1/(" + expression + ")";

        display.value = expression;

        return;

    }


       // ==========================
    // Percentage
    // ==========================

    if(value==="%"){

        expression += "/100";

        display.value = expression;

        return;

    }


       // ==========================
    // Change Sign
    // ==========================

    if(value==="±"){

        if(expression.startsWith("-")){

            expression = expression.substring(1);

        }else{

            expression = "-" + expression;

        }

        display.value = expression;

        return;

    }

   
       // ==========================
    // Equal
    // ==========================

    if(value==="="){

        try{

            let exp = expression;

            // Convert display operators to JavaScript operators

            exp = exp.replace(/×/g,"*");
            exp = exp.replace(/÷/g,"/");

            // Calculate using Math.js

            const result = math.evaluate(exp);

            expression = result.toString();

            display.value = formatResult(result);

        }

        catch(error){

            display.value = "Error";

            expression = "";

        }

        return;

    }
}


/* ==========================================
   Convert Number to Superscript
========================================== */

function toSuperscript(num){

    const superscript = {
        "-":"⁻",
        "0":"⁰",
        "1":"¹",
        "2":"²",
        "3":"³",
        "4":"⁴",
        "5":"⁵",
        "6":"⁶",
        "7":"⁷",
        "8":"⁸",
        "9":"⁹"
    };

    return num.toString()
              .split("")
              .map(ch => superscript[ch] || ch)
              .join("");

}



/* ==========================================
   Scientific Notation Formatter
========================================== */

function formatResult(result){

    if(!isFinite(result)) return result;

    let num = Number(result);

    // Large or very small numbers

    if((Math.abs(num)>=1e12) || (Math.abs(num)<1e-9 && num!==0)){

        const exp = num.toExponential(10);

        const parts = exp.split("e");

        const mantissa = parseFloat(parts[0]);

        const exponent = Number(parts[1]);

        return mantissa + " ×10" + toSuperscript(exponent);

    }

    // Remove unnecessary decimals

    if(Number.isInteger(num))

        return num.toString();

    return parseFloat(num.toPrecision(12)).toString();

}

