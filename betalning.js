const keyBag = 'bag'
const summary = document.querySelector('#checkout-summary')
const form = document.querySelector('#checkout-form')
const messageEl = document.querySelector('#checkout-message')
const submitBtn = form.querySelector('button[type="submit"]')

let products = []

async function getProducts(){
    summary.textContent = 'Laddar...'
    try{
        const response = await fetch('https://dummyjson.com/products?limit=0')
        if(!response.ok){
            throw new Error(`SERVERFEL: ${response.status}`)
        }
        const data = await response.json()
        products = data.products
        showOrderSummary()
    }catch(error){
        console.error(error)
        summary.textContent = 'Kan inte hämta orderöversikten.'
    }
}

function showOrderSummary(){
    const bag = getStorage(keyBag)
    let totalPrice = 0

    summary.innerHTML = ''

    const list = document.createElement('ul')

    bag.forEach(entry => {
        const product = products.find(p => p.id === entry.id)
        if(!product) return

        const li = document.createElement('li')
        li.textContent = `${product.title} : ${entry.quantity} – ${(product.price * entry.quantity).toFixed(2)} kr`
        list.append(li)

        totalPrice += product.price * entry.quantity
    })

    if(!list.querySelector('li')){
        summary.textContent = 'Din varukorg är tom.'
        return
    }

    const total = document.createElement('p')
    total.textContent = `Totalt: ${totalPrice.toFixed(2)} kr`

    summary.append(list, total)
}

function getStorage(key){
    try{
        return JSON.parse(localStorage.getItem(key)) || []
    }catch(error){
        console.error(error)
        return []
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault()
    form.hidden = true
    summary.hidden = true
    // backLink.hidden = true
    messageEl.textContent = 'Behandlar betalning...'

    setTimeout(() => {
        localStorage.setItem('bag', JSON.stringify([]))
        messageEl.textContent = 'Betalningen lyckades! Tack för din beställning.'
        form.reset()

        setTimeout(() => {
            messageEl.textContent = ''
            window.location.href = 'varukorg.html'
        }, 3000)
    }, 2000)
})

getProducts()