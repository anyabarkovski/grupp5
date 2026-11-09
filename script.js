const container = document.querySelector('.container')
const message = document.querySelector('.message')

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
        const products = await response.json()
        closeMessage()
        renderProducts(products.products)
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
    `
    return card
}

//RENDERING 
function renderProducts(items){
    items.forEach(item => {
        container.append(productCard(item))
    });
}

getProducts()