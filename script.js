const container = document.querySelector('.container')
const message = document.querySelector('.message')
const searchBar = document.querySelector('#search-input')
const filterBar = document.querySelector('#category-filter')
const sortBar = document.querySelector('#sort-select')
const form = document.querySelector('#product-form')
const containerEditing = document.querySelector('.form-to-edit')
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
        <button class="btn-add-favorites">Spara ❤️</button>
        <button class="btn-add-bag">Lägg till 🛒</button>
        <button class="btn-edit-item">Redigera</button>
    `
    const btnFavorites = card.querySelector('.btn-add-favorites')
    const btnBag = card.querySelector('.btn-add-bag')
    const btnEdit = card.querySelector('.btn-edit-item')

    btnFavorites.addEventListener('click', () => {
        addToFavorites(item.id)
    })
    btnBag.addEventListener('click', () => {
        addToBag(item.id)
    })
    btnEdit.addEventListener('click', () => {
        createFormToEdit(item)
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
function addToFavorites(id){
    const favorites = getStorage(keyFavorite)
    if(!favorites.includes(id)){
        favorites.push(id)
        saveStorage(keyFavorite, favorites)
    }
}
//LOCAL STORAGE SPARA TILL VARUKORG
function addToBag(id){
    const bag = getStorage(keyBag)
    const existing = bag.find(item => item.id === id)
    if(existing){
        existing.quantity++
    }else{
        bag.push({id: id, quantity: 1})
    }
    saveStorage(keyBag, bag)
}

//ÄNDRA PRODUKTENS INFORMATION

function createFormToEdit(item){
    containerEditing.innerHTML = `
        <button class="close-form">X</button>
        <h3>Redigera artikeln</h3>
        <form class="form-edit-item">
            <label for="edit-title">Ändra titeln:</label>
            <input type="text" name="title" id="edit-title" required>
            <label for="edit-description">Ändra beskrivningen:</label>
            <input type="text" name="description" id="edit-description" required>
            <label for="edit-price">Ändra priset:</label>
            <input type="number" name="price" id="edit-price" step="0.01" required>
            <label for="edit-rating">Ändra rating:</label>
            <input type="number" name="rating" id="edit-rating" step="0.01" required>
            <label for="new-item-category">Ändra kategori:</label>
            <select id="new-item-category" name="category" required>
                <option value="">Välj kategori</option>
                <option value="beauty">Skönhet</option>
                <option value="fragrances">Parfymer</option>
                <option value="furniture">Möbler</option>
                <option value="groceries">Matvaror</option>
            </select>
            <input type="submit" value="Ändra">
        </form>
    `
    const btnClose = containerEditing.querySelector('.close-form')
    const formEditing = containerEditing.querySelector('.form-edit-item')
    containerEditing.classList.add('active')

    //Om man vill ändra bara några saker och inte fylla i alla fälten
    formEditing.elements.title.value = item.title
    formEditing.elements.description.value = item.description
    formEditing.elements.price.value = item.price
    formEditing.elements.rating.value = item.rating
    formEditing.elements.category.value = item.category

    btnClose.addEventListener('click', () => {
        containerEditing.classList.remove('active')
    })
    formEditing.addEventListener('submit', async (e) => {
        e.preventDefault()
        try{ 
            const formData = new FormData(formEditing)
            const changed = Object.fromEntries(formData)
            const editedItem = await editProduct(changed, item.id)
            const product = products.find(p => p.id === item.id)

            Object.assign(product, editedItem)
            containerEditing.classList.remove('active')
            applyFilters()
        }catch(error){
            console.error(error)
            showMessage('Något gick fel med redigering')
        }
    })
    return containerEditing
}

async function editProduct(item, id){
    showMessage('Laddar...')
    
    const response = await fetch(`https://dummyjson.com/products/${id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                title: item.title,
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
}

getProducts()