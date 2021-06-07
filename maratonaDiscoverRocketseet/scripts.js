const Modal = {
    open(){
        document
                .querySelector(".modal-overlay")
                .classList
                .add("active");
    },
    close(){
        document
                .querySelector(".modal-overlay")
                .classList
                .remove("active");
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transaction")) || []
    },
    set(transaction){
        //transformar o objeto em uma string
        localStorage.setItem("dev.finances:transaction", JSON.stringify(transaction))
    }
}

const Transactions = {
    all: Storage.get(),//esse all vai servir para o local storage
    add(transaction){

        Transactions.all.push(transaction)

        App.reload()

    },
    remove(index) {
        Transactions.all.splice(index, 1)

        App.reload()
    },

    incomes(){
        //somar as entradas
        let incomes = 0;
        //pegar todas as transaçoes
        Transactions.all.forEach(transaction => {
            if(transaction.amount > 0 ){
                incomes += transaction.amount
            }

            
        })
        return incomes
    }, 

    expenses(){
        //somar as saidas
        let expense = 0;
        //pegar todas as transaçoes
        Transactions.all.forEach(transaction => {
            if(transaction.amount < 0 ){
            expense += transaction.amount
            }

            
        })
        return expense
    },

    total(){
        return Transactions.expenses() + Transactions.incomes()
    }
}

// substituir os dados do html pelo js
const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),

    addTrasaction(transaction,index){
        
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        //tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index){
        //verificar a cor do preço
        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        // arrumar a formatação da moeda
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                 <img onclick="Transactions.remove(${index})" src="./assets/minus.svg" alt="remover transação">
            </td>
         `
         //retornar o html para a função acima
         return html
    },
    updateBalance(){
        document
                .getElementById('incomeDisplay')
                .innerHTML = Utils.formatCurrency(Transactions.incomes()) 

        document
                .getElementById('expenseDisplay')
                .innerHTML = Utils.formatCurrency(Transactions.expenses()) 

        document
                .getElementById('totalDisplay')
                .innerHTML = Utils.formatCurrency(Transactions.total()) 
    },
    clearTransactions(){
        DOM.transactionsContainer.innerHTML=""
    }
}

// algumas funcionalidades util para a aplicação
const Utils = {
    formatAmout(value){
        //não precisa da regex pode ser apenas o Number sever
        value = Number(value.replace(/\,\./,""))*100
        return value
    },
    
    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) <0 ? "-": ""

        /*retirar tudo o que não for numero nessa caso retira o sinal
        //essa Regex remove tudo o que não for digito e o "g" em todas as ocorrenciaas não so na primeira*/
        value = String(value).replace(/\D/g,"")
        //console.log(value)
        value = Number(value)/100

        //formatando para o estilo brasileiro
        value = value.toLocaleString("pt-BR",
        {
            style: "currency",
            currency:"BRL"
        })
        
        return signal+value
    }
}

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues(){
        return {
            description: Form.description.value,
            amount:Form.amount.value,
            date: Form.date.value
        }
    },

    validateField(){
        const {description, amount, date} = Form.getValues()

        //verificar se os campos são vazios ou não
        // o metodo trim elimina espaços vazios e vazio de vazio é vazio
        if(description.trim()==="" ||
           amount.trim()==="" || 
           date.trim()===""){
            throw new Error("Preencha todos os campos para salvar")
        }
    },

    formatValues(){
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmout(amount)
        date = Utils.formatDate(date)
        
        return {
             description,
             amount,
             date
        }
    },
    clearField(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault()
        
        try {
        //verificar se todas as info estão corretas
        Form.validateField()
        //formatar os dados e salvar
        const transaction = Form.formatValues()
        //atualizar os dados
        Transactions.add(transaction)
        //apagar os dados do formulario
        Form.clearField()
        //fechar modal
        Modal.close()
        //atualizar aplicação 
        } catch (error) {
            alert(error.message)
        }
        


    }
}

const App = {
    init(){
        
        Transactions.all.forEach(DOM.addTrasaction)
        
        DOM.updateBalance()

        Storage.set(Transactions.all)
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }
}

App.init()
