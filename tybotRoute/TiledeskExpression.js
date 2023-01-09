class TiledeskExpression {
    // rules:
    // check valid operators (only those in operators are allowed)
    // check valid variable names /^[_0-9a-zA-Z\.]$/

    static operators = {
        ">" : {
            applyPattern: "Number(${1}) > Number(${2})"
        },
        ">=" : {
            applyPattern: "Number(${1}) >= Number(${2})"
        },
        "<" : {
            applyPattern: "Number(${1}) < Number(${2})"
        },
        "&&": {
            applyPattern: " && ${2}"
        },
        "||": {
            applyPattern: " && ${2}"
        },
        "startsWith": {
            applyPattern: "${1}.startsWith(${2})"
        },
        "contains": {
            applyPattern: "?"
        },
        "endsWith": {
            applyPattern: "?"
        },
        "matches": {
            applyPattern: "?"
        }
    }

    // public
    evaluateExpression(_expression, variables) {
        let expression = String(_expression).replace(/\$/g, "$data.");//replaceAll("$", "$data.");
        console.log("Evaluating expression:", expression);
        console.log("With variables:", variables);
        const result = new TiledeskExpression().evaluate(expression, variables);
        console.log("Expression result:", result);
        return result;
    }

    // private
    evaluate(expression, context) {
        let fn = Function(`let $data = this;return (${expression})`);
        // let fn = Function(`let $data = this;console.log('data', $data);return (${conditionExpression})`);
        let res = fn.bind(context)()
        return res;
    }

    JSON2condition(json) {
        return "";
    }

}

module.exports = { TiledeskExpression }