const container = document.querySelector('.container')
const message = document.querySelector('.message')
const searchBar = document.querySelector('#search')
const categoryBar = document.querySelector('#category')
const sorterBar = document.querySelector('#sorter')

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
        renderProducts(products)
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
    `
    return card
}

//RENDERING 
function renderProducts(items){
    container.innerHTML = ''
    items.forEach(item => {
        container.append(productCard(item))
    });
}

//SEARCH, FILTER, SORT
function applyFilters(){
    const searchInput = searchBar.value.toLowerCase().trim()
    const categoryInput = categoryBar.value
    const sorterInput = sorterBar.value

    let result = [...products]

    if(searchInput) {
        result = result.filter(i => i.title.toLowerCase().trim().includes(searchInput))
    }
    if(categoryInput !== 'all') {
        result = result.filter(i => i.category.includes(categoryInput))
    }
    if(sorterInput === 'price') {
        result.sort((a,b) => a.price - b.price)
    }else if(sorterInput === 'rating'){
        result.sort((a,b) => a.rating - b.rating)
    }
    
    renderProducts(result)
}
searchBar.addEventListener('input', applyFilters)
categoryBar.addEventListener('change', applyFilters)
sorterBar.addEventListener('change', applyFilters)

getProducts()