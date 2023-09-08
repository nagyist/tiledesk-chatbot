var assert = require('assert');
const { Filler } = require('../tiledeskChatbotPlugs/Filler');

describe('filler with liquidJS syntax {{}}', function() {
  
    it('string param', async () => {
        const vars = {
            "project_id": "009988"
        }
        const filler = new Filler();
        const text = filler.fill("project id is {{project_id}}", vars);
        // console.log("filled:", text)
        assert(text === "project id is 009988");
    });

    it('object params mixed with legacy parser ${}', async () => {
        const vars = {
            welcome: "Hello guys",
            collection: {
                products: [
                    {
                        title: "t1"
                    },
                    {
                        title: "t2"
                    }
                ]
            }
        }
        const template = "${welcome}! Your products: {% for product in collection.products %}title: {{ product.title }},{% endfor %}"
        const filler = new Filler();
        const text = filler.fill(template, vars);
        // console.log("text:<" + text + ">");
        assert(text === "Hello guys! Your products: title: t1,title: t2,");
    });

    it('object params getting object at index array', async () => {
        const vars = {
            collection: {
                products: [
                    {
                        title: "t1"
                    },
                    {
                        title: "t2"
                    }
                ]
            }
        }
        const template = "Your first item is {{collection.products[0].title}}"
        const filler = new Filler();
        const text = filler.fill(template, vars);
        assert(text === "Your first item is t1");
    });

    it('object params getting last object in array', async () => {
        const vars = {
            collection: {
                products: [
                    {
                        title: "t1"
                    },
                    {
                        title: "t2"
                    }
                ]
            }
        }
        const template = "Your first item is {{collection.products.last.title}}"
        const filler = new Filler();
        const text = filler.fill(template, vars);
        assert(text === "Your first item is t2");
    });
    
});



