const container = document.querySelector('.container')
const message = document.querySelector('.message')
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
        showFavorites()
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
        <button class="btn-delete-favorites">Ta bort från ❤️</button>
        <button class="btn-add-bag">Lägg till 🛒</button>
    `
    const btnDeleteFavorites = card.querySelector('.btn-delete-favorites')
    const btnBag = card.querySelector('.btn-add-bag')

    btnDeleteFavorites.addEventListener('click', () => {
        removeFavorites(item.id)
        showFavorites()
    })
    btnBag.addEventListener('click', () => {
        addToBag(item.id)
    })
   
    return card
}

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
function showFavorites(){
    const favoriteItems = getStorage(keyFavorite)
    const favoriteInList = products.filter(p => favoriteItems.includes(p.id))
    if(favoriteInList.length === 0){
        container.innerHTML = ''
        showMessage('Du har inga favoriter ännu')
    }else{
        closeMessage()
        renderProducts(favoriteInList)
    }
}
function removeFavorites(id){
    const favorites = getStorage(keyFavorite)
    const updated = favorites.filter(itemId => itemId !== id)
    saveStorage(keyFavorite, updated)
}
getProducts()