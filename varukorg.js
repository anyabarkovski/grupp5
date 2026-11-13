const container = document.querySelector('.container')
const message = document.querySelector('.message')
const numberOfItems = document.querySelector('.number-of-items')
const sumOfItems = document.querySelector('.sum-of-items')
const keyFavorite = 'favorites'
const keyBag = 'bag'

let products = []

//ERROR OCH LADDNING MEDDELANDE
function showMessage(text){
    message.textContent = text
}
function closeMessage(){
    message.textContent = ''
}

//API-ANROP ATT HÄMTA VAROR
async function getProducts(){
    showMessage('Laddar...')
    try{
        const response = await fetch(`https://dummyjson.com/products`)
        if(!response.ok){
            throw new Error(`SERVERFEL: ${response.status}`)
        }
        const data = await response.json()
        products = data.products
        closeMessage()
        showBagItems()
        console.log(products)
    }catch(error){
        console.error(error)
        showMessage('Kan inte hämta produkter. Försök igen!')
    }
}

//CARD MED EN PRODUKT
function productCard(item){
    const card = document.createElement('div')
    card.classList.add('card')
    card.innerHTML = `
        <h3>${item.title}</h3>
        <img src="${item.images[0]}" alt="${item.title}">
        <p>Beskrivning: ${item.description}</p>
        <p>Kategori: ${item.category}</p>
        <p>Pris: ${item.price} kr</p>
        <p>Rating: ${item.rating}</p>
        <button class="btn-minus">−</button>
        <span>${item.quantity}</span>
        <button class="btn-plus">+</button>
        <button class="btn-add-favorites">Spara ❤️</button>
        <button class="btn-delete-bag">Ta bort från 🛒</button>
    `
    const btnFavorites = card.querySelector('.btn-add-favorites')
    const btnDeleteBag = card.querySelector('.btn-delete-bag')
    card.querySelector('.btn-minus').addEventListener('click', () => changeOfQuantity(item.id, -1))
    card.querySelector('.btn-plus').addEventListener('click', () => changeOfQuantity(item.id, 1))

    const isFavorite = getStorage(keyFavorite).includes(item.id)
    btnFavorites.textContent = isFavorite ? 'Sparad' : 'Spara ❤️'
    btnFavorites.addEventListener('click', () => {
        const nowFavorite = toggleFavorite(item.id)
        btnFavorites.textContent = nowFavorite ? 'Sparad' : 'Spara ❤️'
    })
    btnDeleteBag.addEventListener('click', () => {
        removeFromBag(item.id)
    })

    return card
}
//RENDERING 
function renderProducts(items){
    container.innerHTML = ''
    items.forEach(item => {
        container.append(productCard(item))
    });
}
//LOCAL STORAGE
function getStorage(key){
    try{
        return JSON.parse(localStorage.getItem(key)) || []
    }catch(error){
        console.error(error)
        return []
    }
}
function saveStorage(key, data){
    localStorage.setItem(key, JSON.stringify(data))
}
//LOCAL STORAGE SPARA FAVORITER
//TEXTEN ÄNDRAS PÅ KNAPPEN 'spara'
function toggleFavorite(id){
    const favorites = getStorage(keyFavorite)
    const isFavorite = favorites.includes(id)

    const updated = isFavorite
        ? favorites.filter(favId => favId !== id)
        : [...favorites, id]

    saveStorage(keyFavorite, updated)
    return !isFavorite
}

function removeFromBag(id){
    const items = getStorage(keyBag)
    const updated = items.filter(entry => entry.id !== id)
    saveStorage(keyBag, updated)
    showBagItems()
}

function showBagItems(){
    const bag = getStorage(keyBag)
    const bagProducts = []
    let totalCount = 0
    let totalPrice = 0

    bag.forEach(item => {
        const product = products.find(p => p.id === item.id)
        if(!product) return
        bagProducts.push({...product, quantity: item.quantity})
        totalCount += item.quantity
        totalPrice += product.price * item.quantity
    })
    if(bagProducts.length === 0){
        container.innerHTML = ''
        showMessage('Din varukorg är tom')
    }else{
        closeMessage()
        renderProducts(bagProducts)
    }
    numberOfItems.textContent = totalCount
    sumOfItems.textContent = `${totalPrice.toFixed(2)} kr`
}

function changeOfQuantity(id, change){
    const bag = getStorage(keyBag)
    const item = bag.find(i => i.id === id)
    if(!item) return
    item.quantity += change
    saveStorage(keyBag, bag.filter(i => i.quantity > 0))
    showBagItems()
}
getProducts()