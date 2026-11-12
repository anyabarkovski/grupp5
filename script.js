const container = document.querySelector('.container')
const message = document.querySelector('.message')
const searchBar = document.querySelector('#search-input')
const filterBar = document.querySelector('#category-filter')
const sortBar = document.querySelector('#sort-select')
const form = document.querySelector('#product-form')


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
    try{
        closeMessage()
        if(products.length === 0){
            return
        }
        const searchInput = searchBar.value.toLowerCase().trim()
        const filterInput = filterBar.value
        const sortInput = sortBar.value

        let result = [...products]
        if(searchInput){
            result = result.filter(p => p.title.toLowerCase().trim().includes(searchInput))
        }
        if(filterInput !== 'all'){
            result = result.filter(p => p.category.includes(filterInput))
        }
        if(sortInput === 'price-asc'){
            result.sort((a,b) => a.price - b.price)
        }else if(sortInput === 'price-desc'){
            result.sort((a,b) => b.price - a.price)
        }
        if(result.length === 0){
            showMessage('Kan inte hitta produkten')
        }
        renderProducts(result)

    }catch(error){
        console.error(error)
        showMessage('Något gick fel vid filtrering')
    }
}

searchBar.addEventListener('input', applyFilters)
filterBar.addEventListener('change', applyFilters)
sortBar.addEventListener('change', applyFilters)

//LÄGGA TILL PRODUKTER 

form.addEventListener('submit', async (e) => {
    e.preventDefault()
    try{
        const formData = new FormData(form)
        const product = Object.fromEntries(formData)
        const createdProduct = await createProduct(product)

        products.push({
            ...createdProduct,
            //images tar emot url, därför måste vi wrappa bild-filen till url
            images: [URL.createObjectURL(product.images)] 
        })
        applyFilters()
        form.reset()
        renderProducts(products)
    }catch(error){
        console.error(error)
        showMessage('Kan inte ladda upp produkten')
    }
})

async function createProduct(item){
    showMessage('Laddar...')
    try{
        const response = await fetch(`https://dummyjson.com/products/add`,
            {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    title: item.title,
                    images: item.images,
                    description: item.description,
                    price: Number(item.price),
                    rating: Number(item.rating),
                    category: item.category
                })
            }
        )
        if(!response.ok){
            throw new Error(`Serverfel: ${response.status}`)
        }
        const data = await response.json()
        closeMessage()
        return data
    }catch(error){
        console.error(error)
        showMessage('Kan inte lägga till produkten')
    }
}

getProducts()